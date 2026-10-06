import { DatabaseSync } from "node:sqlite";

// Whitelisted ORDER BY for Database browse/search. `sort` is user input: never
// interpolate it, and Object.hasOwn keeps "constructor"/"__proto__" from
// reaching Object.prototype (that would yield a bare "ORDER BY " -> 500).
// Absent/unknown sort = the exact legacy SQL (plugins page with offsets).
const SORT_SQL = {
  newest: (p) => `${p}set_year DESC, ${p}set_name, ${p}packet_number, ${p}question_number, ${p}id`,
  oldest: (p) => `${p}set_year ASC, ${p}set_name, ${p}packet_number, ${p}question_number, ${p}id`,
  // difficulty 0 = unrated / pop culture: last, not "easiest"
  easiest: (p) => `(${p}difficulty = 0), ${p}difficulty ASC, ${p}set_year DESC, ${p}set_name, ${p}packet_number, ${p}question_number, ${p}id`,
  hardest: (p) => `${p}difficulty DESC, ${p}set_year DESC, ${p}set_name, ${p}packet_number, ${p}question_number, ${p}id`,
};
const sortSql = (s, p) => (typeof s === "string" && Object.hasOwn(SORT_SQL, s) ? SORT_SQL[s](p) : null);

function sanitizeFtsFallback(query) {
  const toks = String(query == null ? "" : query).match(/[\p{L}\p{N}]+/gu) || [];
  return toks.map((t) => `"${t}"`).join(" ");
}
// Exclude words as an FTS expression built ONLY from [\p{L}\p{N}]+ fragments (one
// quoted phrase per whitespace word), so no input can produce a syntax error.
// FTS cannot run a pure NOT, so the caller applies it as rowid NOT IN (...),
// which also works with no search text at all.
function ftsExcludeExpr(words, field, isBonus) {
  const phrases = String(words == null ? "" : words).split(/\s+/)
    .map((w) => (w.match(/[\p{L}\p{N}]+/gu) || []).join(" ")).filter(Boolean).slice(0, 20);
  if (!phrases.length) return null;
  const expr = phrases.map((p) => `"${p}"`).join(" OR ");
  const col = field === "answer" ? (isBonus ? "answers_sanitized" : "answer_sanitized")
    : field === "question" ? (isBonus ? "{leadin_sanitized parts_sanitized}" : "question_sanitized") : null;
  return col ? `${col} : (${expr})` : expr;
}
function isFtsSyntaxError(e) {
  return e && /fts5|syntax error|malformed|\bMATCH\b|no such column|unterminated|unknown special|expected/i.test(String(e.message || e));
}

// A category-tree node id: "n" + 10 hex (tree v3.x), or "v1:<path>" for the
// tree synthesized from an older QBReader-format file.
export const isNodeId = (v) => typeof v === "string" && (/^n[0-9a-f]{10}$/.test(v) || v.startsWith("v1:"));

export class QuestionDatabase {
  


  constructor(dbPath) {
    this.db = new DatabaseSync(dbPath, { open: true, readOnly: true });
    this.db.exec("PRAGMA journal_mode=OFF");
    this.db.exec("PRAGMA cache_size=-32000");
    // Schema 2 = the new question database (category tree, flags, playable). An
    // older QBReader-format file still works: the tree is synthesized from the
    // category / subcategory / alternate_subcategory names (ids "v1:…").
    this.v2 = this._hasColumn("tossups", "category_ord");
    this._tree = null;
    this._treeCounts = {};
  }

  _hasColumn(table, column) {
    try { return this.db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === column); }
    catch { return false; }
  }

  // ── Category tree ───────────────────────────────────────────────────────
  // Nodes in preorder: { id, name, path, label, parent_id, depth, ord, ord_end,
  // leaf, naqt, definition }. A node's subtree is the ord range [ord, ord_end],
  // and every record stores its home node's ord (category_ord), so a subtree
  // filter is one indexed BETWEEN.
  _loadTree() {
    if (this._tree) return this._tree;
    let nodes;
    if (this.v2) {
      nodes = this.db.prepare("SELECT * FROM category_tree ORDER BY ord").all();
    } else {
      nodes = this._synthesizeV1Tree();
    }
    const byId = new Map(nodes.map((n) => [n.id, n]));
    this._tree = { nodes, byId };
    return this._tree;
  }

  _synthesizeV1Tree() {
    const rows = [];
    for (const t of ["tossups", "bonuses"]) {
      try {
        rows.push(...this.db.prepare(`SELECT DISTINCT category, subcategory, alternate_subcategory FROM ${t}`).all());
      } catch { /* empty fixture */ }
    }
    const root = new Map();
    for (const r of rows) {
      const names = [r.category, r.subcategory, r.alternate_subcategory].filter((x) => x);
      let level = root;
      for (const nm of names) {
        if (!level.has(nm)) level.set(nm, new Map());
        level = level.get(nm);
      }
    }
    const nodes = [];
    let ord = 0;
    const walk = (map, parentPath, parentId, depth) => {
      for (const name of [...map.keys()].sort()) {
        const path = parentPath ? parentPath + " > " + name : name;
        const node = { id: "v1:" + path, name, path, label: name, parent_id: parentId, depth, ord: ord++, leaf: map.get(name).size ? 0 : 1, naqt: 0, definition: "" };
        nodes.push(node);
        walk(map.get(name), path, node.id, depth + 1);
        node.ord_end = ord - 1;
      }
    };
    walk(root, "", null, 1);
    return nodes;
  }

  // Nested tree with question counts (playable questions; subtree totals) for
  // the category GUI. Counts are cached per type: the file is read-only.
  getCategoryTree(type = "tossups") {
    const table = type === "bonuses" ? "bonuses" : "tossups";
    const { nodes } = this._loadTree();
    if (!this._treeCounts[table]) {
      if (this.v2 && nodes.length && nodes[0].n_tossups !== undefined) {
        // precomputed at build time (subtree totals of playable questions)
        this._treeCounts[table] = nodes.map((n) => (table === "bonuses" ? n.n_bonuses : n.n_tossups) || 0);
      } else {
        // older file: one grouped count, summed up the synthesized/real tree by path
        const byPath = new Map();
        const grp = this.v2
          ? `SELECT category_path AS p, COUNT(*) AS n FROM ${table} WHERE playable = 1 AND category_path IS NOT NULL GROUP BY category_path`
          : `SELECT category || COALESCE(' > ' || NULLIF(subcategory, ''), '') || COALESCE(' > ' || NULLIF(alternate_subcategory, ''), '') AS p, COUNT(*) AS n FROM ${table} GROUP BY p`;
        try { for (const r of this.db.prepare(grp).all()) byPath.set(r.p, r.n); } catch { /* empty fixture */ }
        this._treeCounts[table] = nodes.map((n) => {
          let total = 0;
          for (const [p, c] of byPath) if (p === n.path || p.startsWith(n.path + " > ")) total += c;
          return total;
        });
      }
    }
    const totals = this._treeCounts[table];
    const out = [];
    const stack = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const item = { id: n.id, name: n.name, path: n.path, label: n.label, depth: n.depth, leaf: !!n.leaf, count: totals[i] || 0, definition: n.definition || "", children: [] };
      while (stack.length && stack[stack.length - 1].depth >= n.depth) stack.pop();
      if (stack.length) stack[stack.length - 1].item.children.push(item); else out.push(item);
      stack.push({ depth: n.depth, item });
    }
    return out;
  }

  // Current category labels for many question ids at once (stats, review,
  // achievements resolve recorded answers through this, so history always
  // reads in the CURRENT tree without rewriting user data).
  getCategoryInfo(table, ids) {
    const out = new Map();
    const t = table === "bonuses" ? "bonuses" : "tossups";
    const cols = (this.v2 ? "id, category, subcategory, alternate_subcategory, category_path, category_id" : "id, category, subcategory, alternate_subcategory")
      + (t === "bonuses" ? (this.v2 ? ", part_count" : ", parts") : "");
    const list = [...new Set(ids)].filter(Boolean);
    for (let i = 0; i < list.length; i += 500) {
      const chunk = list.slice(i, i + 500);
      try {
        for (const r of this.db.prepare(`SELECT ${cols} FROM ${t} WHERE id IN (${chunk.map(() => "?").join(",")})`).all(...chunk)) out.set(r.id, r);
      } catch { /* empty fixture */ }
    }
    return out;
  }

  getCategoryNode(id) {
    return this._loadTree().byId.get(id) || null;
  }

  // Judge-only: never route this to display code, IPC payloads for display,
  // multiplayer state or exports (brief §7).
  getHiddenAnswers(id) {
    if (!this.v2) return null;
    try {
      const r = this.db.prepare("SELECT data FROM hidden_answers WHERE id = ?").get(id);
      return r ? JSON.parse(r.data) : null;
    } catch { return null; }
  }

  // A set name as the user may have saved it before 151 sets were renamed.
  resolveSetName(name) {
    if (!name || !this.v2) return name;
    try {
      if (this.db.prepare("SELECT 1 FROM sets WHERE name = ? LIMIT 1").get(name)) return name;
      const r = this.db.prepare("SELECT s.name FROM set_aliases a JOIN sets s ON s.id = a.set_id WHERE a.old_name = ? LIMIT 1").get(name);
      return r ? r.name : name;
    } catch { return name; }
  }

  close() {
    this.db.close();
  }

  getTossup(id) {
    const stmt = this.db.prepare("SELECT * FROM tossups WHERE id = ?");
    return stmt.get(id);
  }

  getBonus(id) {
    const stmt = this.db.prepare("SELECT * FROM bonuses WHERE id = ?");
    return stmt.get(id);
  }

  _buildWhere(filters = {}, prefix = "", opts = {}) {
    const clauses = [];
    const params = {};
    const col = (name) => prefix + name;

    // `categories` may carry tree node ids ("n" + 10 hex, or "v1:Path" on an
    // older file) as well as plain level-1 names: plugins forward that key
    // verbatim, so practice filters put node ids there and old plugin code keeps
    // working. Ids join categoryIds; names stay a level-1 name match.
    if (filters.categories && filters.categories.length > 0) {
      const ids = filters.categories.filter(isNodeId);
      if (ids.length) {
        // mixed with plain names: a name that is a top-level node becomes that
        // node, so the whole list stays one union
        const roots = new Map(this._loadTree().nodes.filter((n) => n.depth === 1).map((n) => [n.name, n.id]));
        const names = filters.categories.filter((c) => !isNodeId(c));
        const asIds = names.filter((n) => roots.has(n)).map((n) => roots.get(n));
        filters = { ...filters, categories: names.filter((n) => !roots.has(n)), categoryIds: [...(filters.categoryIds || []), ...ids, ...asIds] };
      }
    }

    // Tree nodes (any depth): each id = its whole subtree. Unknown ids (a tree
    // version change) are ignored rather than matching nothing.
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const ors = [];
      const names = ["category", "subcategory", "alternate_subcategory"];
      filters.categoryIds.forEach((id, i) => {
        const n = this.getCategoryNode(id);
        if (!n) return;
        if (this.v2) {
          ors.push(`${col("category_ord")} BETWEEN :cord${i} AND :cend${i}`);
          params[`cord${i}`] = n.ord; params[`cend${i}`] = n.ord_end;
        } else {
          const parts = n.path.split(" > ");
          ors.push("(" + parts.map((p, k) => { params[`cv${i}_${k}`] = p; return `${col(names[k])} = :cv${i}_${k}`; }).join(" AND ") + ")");
        }
      });
      if (ors.length) clauses.push(ors.length > 1 ? `(${ors.join(" OR ")})` : ors[0]);
    }

    // Unplayable records (empty / truncated / merged …, brief §6) never reach
    // practice. Database search opts in to show them.
    if (this.v2 && !filters.includeUnplayable) clauses.push(`${col("playable")} = 1`);
    if (this.v2 && filters.cleanOnly) clauses.push(`${col("warn")} = 0`);

    if (filters.categories && filters.categories.length > 0) {
      const placeholders = filters.categories.map((_, i) => `:cat${i}`);
      clauses.push(`${col("category")} IN (${placeholders.join(",")})`);
      filters.categories.forEach((c, i) => {
        params[`cat${i}`] = c;
      });
    }

    {
      const subs = filters.subcategories || [];
      const alts = filters.alternateSubcategories || [];
      const ors = [];
      if (subs.length > 0) {
        const ph = subs.map((_, i) => `:subcat${i}`);
        ors.push(`${col("subcategory")} IN (${ph.join(",")})`);
        subs.forEach((s, i) => { params[`subcat${i}`] = s; });
      }
      if (alts.length > 0) {
        const ph = alts.map((_, i) => `:altsub${i}`);
        ors.push(`${col("alternate_subcategory")} IN (${ph.join(",")})`);
        alts.forEach((a, i) => { params[`altsub${i}`] = a; });
      }
      if (ors.length > 0) clauses.push(ors.length > 1 ? `(${ors.join(" OR ")})` : ors[0]);
    }

    if (filters.difficulties && filters.difficulties.length > 0) {
      const placeholders = filters.difficulties.map((_, i) => `:diff${i}`);
      clauses.push(`${col("difficulty")} IN (${placeholders.join(",")})`);
      filters.difficulties.forEach((d, i) => {
        params[`diff${i}`] = d;
      });
    }

    // setIds win: names are comma-split on both transports, so a set name with
    // commas ("2023 Planes, Trains, and Automobiles") cannot travel as setNames.
    if (filters.setNames && filters.setNames.length > 0 && !(filters.setIds && filters.setIds.length > 0)) {
      const placeholders = filters.setNames.map((_, i) => `:set${i}`);
      // old (pre-rename) names still select their set
      clauses.push(this.v2
        ? `(${col("set_name")} IN (${placeholders.join(",")}) OR ${col("set_id")} IN (SELECT set_id FROM set_aliases WHERE old_name IN (${placeholders.join(",")})))`
        : `${col("set_name")} IN (${placeholders.join(",")})`);
      filters.setNames.forEach((s, i) => {
        params[`set${i}`] = s;
      });
    }

    if (filters.setIds && filters.setIds.length > 0) {
      const placeholders = filters.setIds.map((_, i) => `:setid${i}`);
      clauses.push(`${col("set_id")} IN (${placeholders.join(",")})`);
      filters.setIds.forEach((s, i) => {
        params[`setid${i}`] = s;
      });
    }

    if (filters.packetNumbers && filters.packetNumbers.length > 0) {
      const placeholders = filters.packetNumbers.map((_, i) => `:pkt${i}`);
      clauses.push(`${col("packet_number")} IN (${placeholders.join(",")})`);
      filters.packetNumbers.forEach((n, i) => { params[`pkt${i}`] = n; });
    }

    if (filters.ids && filters.ids.length > 0) {
      const placeholders = filters.ids.map((_, i) => `:id${i}`);
      clauses.push(`${col("id")} IN (${placeholders.join(",")})`);
      filters.ids.forEach((id, i) => {
        params[`id${i}`] = id;
      });
    }

    if (filters.standard !== undefined && filters.standard !== null) {
      clauses.push(`${col("standard")} = :standard`);
      params["standard"] = filters.standard ? 1 : 0;
    }

    {
      const ex = ftsExcludeExpr(filters.exclude, filters.excludeIn, opts.isBonus);
      if (ex) {
        const fts = opts.isBonus ? "bonuses_fts" : "tossups_fts";
        clauses.push(`${col("rowid")} NOT IN (SELECT rowid FROM ${fts} WHERE ${fts} MATCH :excludeExpr)`);
        params["excludeExpr"] = ex;
      }
    }

    if (filters.powermarkOnly && !opts.isBonus) {
      clauses.push(`${col("question_sanitized")} LIKE '%(*)%'`);
    }

    if (filters.yearMin !== undefined) {
      clauses.push(`${col("set_year")} >= :yearMin`);
      params["yearMin"] = filters.yearMin;
    }

    if (filters.yearMax !== undefined) {
      clauses.push(`${col("set_year")} <= :yearMax`);
      params["yearMax"] = filters.yearMax;
    }

    return { where: clauses.length > 0 ? "WHERE " + clauses.join(" AND ") : "", params };
  }

  queryTossups(filters = {}) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const { where, params } = this._buildWhere(filters);

    const orderBy = filters.random ? "ORDER BY RANDOM()" : (sortSql(filters.sort, "") ? "ORDER BY " + sortSql(filters.sort, "") : "ORDER BY set_year DESC, set_name, question_number");

    const countSql = `SELECT COUNT(*) as count FROM tossups ${where}`;
    const countRow = this.db.prepare(countSql).get(params);
    const total = countRow ? countRow.count : 0;

    const sql = `SELECT * FROM tossups ${where} ${orderBy} LIMIT :limit OFFSET :offset`;
    const rows = this.db.prepare(sql).all({ ...params, limit, offset });

    return { rows, total };
  }

  queryBonuses(filters = {}) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const { where, params } = this._buildWhere(filters, "", { isBonus: true });

    const orderBy = filters.random ? "ORDER BY RANDOM()" : (sortSql(filters.sort, "") ? "ORDER BY " + sortSql(filters.sort, "") : "ORDER BY set_year DESC, set_name, question_number");

    const countSql = `SELECT COUNT(*) as count FROM bonuses ${where}`;
    const countRow = this.db.prepare(countSql).get(params);
    const total = countRow ? countRow.count : 0;

    const sql = `SELECT * FROM bonuses ${where} ${orderBy} LIMIT :limit OFFSET :offset`;
    const rows = this.db.prepare(sql).all({ ...params, limit, offset });

    return { rows, total };
  }

  getRandomTossup(filters = {}) {
    const { where, params } = this._buildWhere(filters);
    // No filters (or only the always-on playable one): jump to a random rowid.
    const bare = !where || where === "WHERE playable = 1";
    if (bare) {
      const maxRow = this.db.prepare("SELECT MAX(rowid) as max FROM tossups").get();
      if (!maxRow || !maxRow.max) return undefined;
      const randomId = Math.floor(Math.random() * maxRow.max) + 1;
      return this.db.prepare(`SELECT * FROM tossups WHERE rowid >= ? ${where ? "AND playable = 1" : ""} LIMIT 1`).get(randomId)
        || this.db.prepare(`SELECT * FROM tossups ${where} LIMIT 1`).get();
    }
    const countSql = `SELECT COUNT(*) as count FROM tossups ${where}`;
    const countRow = this.db.prepare(countSql).get(params);
    const total = countRow ? countRow.count : 0;
    if (total === 0) return undefined;
    const randomOffset = Math.floor(Math.random() * total);
    const sql = `SELECT * FROM tossups ${where} LIMIT 1 OFFSET :__offset`;
    return this.db.prepare(sql).get({ ...params, __offset: randomOffset });
  }

  getRandomBonus(filters = {}) {
    const { where, params } = this._buildWhere(filters, "", { isBonus: true });
    // No filters (or only the always-on playable one): jump to a random rowid.
    const bare = !where || where === "WHERE playable = 1";
    if (bare) {
      const maxRow = this.db.prepare("SELECT MAX(rowid) as max FROM bonuses").get();
      if (!maxRow || !maxRow.max) return undefined;
      const randomId = Math.floor(Math.random() * maxRow.max) + 1;
      return this.db.prepare(`SELECT * FROM bonuses WHERE rowid >= ? ${where ? "AND playable = 1" : ""} LIMIT 1`).get(randomId)
        || this.db.prepare(`SELECT * FROM bonuses ${where} LIMIT 1`).get();
    }
    const countSql = `SELECT COUNT(*) as count FROM bonuses ${where}`;
    const countRow = this.db.prepare(countSql).get(params);
    const total = countRow ? countRow.count : 0;
    if (total === 0) return undefined;
    const randomOffset = Math.floor(Math.random() * total);
    const sql = `SELECT * FROM bonuses ${where} LIMIT 1 OFFSET :__offset`;
    return this.db.prepare(sql).get({ ...params, __offset: randomOffset });
  }

  searchTossups(query, filters = {}) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const { where, params } = this._buildWhere(filters, "t.");

    const fullWhere = where
      ? `tossups_fts MATCH :query AND ${where.substring(6)}`
      : "tossups_fts MATCH :query";

    const countSql = `
      SELECT COUNT(*) as count FROM tossups t
      JOIN tossups_fts ON t.rowid = tossups_fts.rowid
      WHERE ${fullWhere}`;
    const sql = `
      SELECT t.* FROM tossups t
      JOIN tossups_fts ON t.rowid = tossups_fts.rowid
      WHERE ${fullWhere}
      ORDER BY ${sortSql(filters.sort, "t.") || "rank"}
      LIMIT :limit OFFSET :offset
    `;
    const run = (q) => {
      const countRow = this.db.prepare(countSql).get({ ...params, query: q });
      const rows = this.db.prepare(sql).all({ ...params, query: q, limit, offset });
      return { rows, total: countRow ? countRow.count : 0 };
    };
    try { return run(query); }
    catch (e) {
      if (!isFtsSyntaxError(e)) throw e;
      const safe = sanitizeFtsFallback(query);
      if (safe && safe !== query) { try { return run(safe); } catch (e2) {  } }
      return { rows: [], total: 0 };
    }
  }

  searchBonuses(query, filters = {}) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const { where, params } = this._buildWhere(filters, "b.", { isBonus: true });

    const fullWhere = where
      ? `bonuses_fts MATCH :query AND ${where.substring(6)}`
      : "bonuses_fts MATCH :query";

    const countSql = `
      SELECT COUNT(*) as count FROM bonuses b
      JOIN bonuses_fts ON b.rowid = bonuses_fts.rowid
      WHERE ${fullWhere}`;
    const sql = `
      SELECT b.* FROM bonuses b
      JOIN bonuses_fts ON b.rowid = bonuses_fts.rowid
      WHERE ${fullWhere}
      ORDER BY ${sortSql(filters.sort, "b.") || "rank"}
      LIMIT :limit OFFSET :offset
    `;
    const run = (q) => {
      const countRow = this.db.prepare(countSql).get({ ...params, query: q });
      const rows = this.db.prepare(sql).all({ ...params, query: q, limit, offset });
      return { rows, total: countRow ? countRow.count : 0 };
    };
    try { return run(query); }
    catch (e) {
      if (!isFtsSyntaxError(e)) throw e;
      const safe = sanitizeFtsFallback(query);
      if (safe && safe !== query) { try { return run(safe); } catch (e2) {  } }
      return { rows: [], total: 0 };
    }
  }

  getTossupCount(filters = {}) {
    const { where, params } = this._buildWhere(filters);
    const row = this.db.prepare(`SELECT COUNT(*) as count FROM tossups ${where}`).get(params);
    return row ? row.count : 0;
  }

  getBonusCount(filters = {}) {
    const { where, params } = this._buildWhere(filters, "", { isBonus: true });
    const row = this.db.prepare(`SELECT COUNT(*) as count FROM bonuses ${where}`).get(params);
    return row ? row.count : 0;
  }

  getSets() {
    if (!this.v2) return this.db.prepare("SELECT * FROM sets ORDER BY year DESC, name").all();
    // old_names: the set's names before the rename (saved set-mode picks)
    return this.db.prepare("SELECT s.*, (SELECT group_concat(a.old_name, char(31)) FROM set_aliases a WHERE a.set_id = s.id) AS old_names FROM sets s ORDER BY s.year DESC, s.name").all()
      .map((r) => ({ ...r, old_names: r.old_names ? r.old_names.split("\u001f") : [] }));
  }

  getSetById(id) {
    return this.db.prepare("SELECT * FROM sets WHERE id = ?").get(id);
  }

  getPacketsForSet(setName) {
    return this.db
      .prepare("SELECT DISTINCT packet_number, packet_name FROM tossups WHERE set_name = :s AND packet_number > 0 ORDER BY packet_number")
      .all({ s: this.resolveSetName(setName) });
  }

  getPacketContent(setName, packetNumber) {
    const play = this.v2 ? " AND playable = 1" : "";
    const s = this.resolveSetName(setName);
    const tossups = this.db
      .prepare(`SELECT * FROM tossups WHERE set_name = :s AND packet_number = :p${play} ORDER BY question_number`)
      .all({ s, p: packetNumber });
    const bonuses = this.db
      .prepare(`SELECT * FROM bonuses WHERE set_name = :s AND packet_number = :p${play} ORDER BY question_number`)
      .all({ s, p: packetNumber });
    return { tossups, bonuses };
  }

  // nodeId (any tree depth) wins over the three level names.
  _freqNode(where, params, nodeId) {
    const n = nodeId ? this.getCategoryNode(nodeId) : null;
    if (!n) return where;
    if (this.v2) { params.co = n.ord; params.ce = n.ord_end; return where + " AND category_ord BETWEEN :co AND :ce"; }
    const cols = ["category", "subcategory", "alternate_subcategory"];
    n.path.split(" > ").forEach((p, k) => { params["v" + k] = p; where += ` AND ${cols[k]} = :v${k}`; });
    return where;
  }

  getAnswerLinesForFreq(category, subcategory, alternateSubcategory, nodeId) {
    const params = {};
    let where = "WHERE answer_sanitized != ''";
    if (this.v2) where += " AND playable = 1";
    where = this._freqNode(where, params, nodeId);
    if (category) { where += " AND category = :cat"; params.cat = category; }
    if (subcategory) { where += " AND subcategory = :sub"; params.sub = subcategory; }
    if (alternateSubcategory) { where += " AND alternate_subcategory = :alt"; params.alt = alternateSubcategory; }
    return this.db.prepare(`SELECT answer, answer_sanitized FROM tossups ${where}`).all(params);
  }

  getBonusAnswerLinesForFreq(category, subcategory, alternateSubcategory, nodeId) {
    const params = {};
    let where = "WHERE answers_sanitized != '' AND answers_sanitized != '[]'";
    if (this.v2) where += " AND playable = 1";
    where = this._freqNode(where, params, nodeId);
    if (category) { where += " AND category = :cat"; params.cat = category; }
    if (subcategory) { where += " AND subcategory = :sub"; params.sub = subcategory; }
    if (alternateSubcategory) { where += " AND alternate_subcategory = :alt"; params.alt = alternateSubcategory; }
    return this.db.prepare(`SELECT answers, answers_sanitized FROM bonuses ${where}`).all(params);
  }

  getSetPacketNumbers(setName) {
    const rows = this.db
      .prepare("SELECT DISTINCT packet_number FROM tossups WHERE set_name = :s AND packet_number > 0 ORDER BY packet_number")
      .all({ s: this.resolveSetName(setName) });
    return rows.map((r) => r.packet_number);
  }

  getCategories(type = "tossups") {
    const table = type === "tossups" ? "tossups" : "bonuses";
    return this.db
      .prepare(`SELECT DISTINCT category, COUNT(*) as count FROM ${table} GROUP BY category ORDER BY count DESC`)
      .all();
  }

  getSubcategories(type = "tossups", category = null) {
    const table = type === "tossups" ? "tossups" : "bonuses";
    if (category) {
      return this.db
        .prepare(
          `SELECT DISTINCT subcategory, COUNT(*) as count FROM ${table} WHERE category = :cat GROUP BY subcategory ORDER BY count DESC`
        )
        .all({ cat: category });
    }
    return this.db
      .prepare(
        `SELECT DISTINCT subcategory, COUNT(*) as count FROM ${table} GROUP BY subcategory ORDER BY count DESC`
      )
      .all();
  }

  getMeta(key) {
    try {
      const row = this.db.prepare("SELECT value FROM meta WHERE key = ?").get(key);
      return row ? row.value : null;
    } catch { return null; } // older DBs have no meta table
  }

  getAlternateSubcategories(type = "tossups", category = null, subcategory = null) {
    const table = type === "tossups" ? "tossups" : "bonuses";
    const params = {};
    let where = "WHERE alternate_subcategory IS NOT NULL AND alternate_subcategory != ''";
    if (category) { where += " AND category = :cat"; params.cat = category; }
    if (subcategory) { where += " AND subcategory = :sub"; params.sub = subcategory; }
    // Drop mis-tagged noise. The dump contains a handful of nonsense pairings
    // (2 "Poetry" tossups inside Geography/Geography, out of 6,182), and those
    // were filling the alternate-subcategory picker with options that belong to
    // other categories. Genuine alternates are a large share of their pair —
    // 11-36% in Science/Literature/Fine Arts — while the noise is under 0.03%,
    // so a 1% share with a small absolute floor separates them cleanly.
    const rows = this.db
      .prepare(`SELECT alternate_subcategory, COUNT(*) as count FROM ${table} ${where} GROUP BY alternate_subcategory ORDER BY count DESC`)
      .all(params);
    if (!rows.length) return [];
    // Share is measured against the whole (category, subcategory) pair, not just
    // the rows that happen to carry an alternate.
    let total = rows.reduce((a, r) => a + r.count, 0);
    if (category || subcategory) {
      const pw = [];
      const pp = {};
      if (category) { pw.push("category = :cat"); pp.cat = category; }
      if (subcategory) { pw.push("subcategory = :sub"); pp.sub = subcategory; }
      try {
        const t = this.db.prepare(`SELECT COUNT(*) as n FROM ${table} WHERE ${pw.join(" AND ")}`).get(pp);
        if (t && t.n) total = t.n;
      } catch { /* fall back to the summed count */ }
    }
    return rows
      .filter((r) => r.count >= 5 && r.count / total >= 0.01)
      .map((r) => r.alternate_subcategory);
  }

  getDifficultyRange(type = "tossups") {
    const table = type === "tossups" ? "tossups" : "bonuses";
    return this.db
      .prepare(`SELECT MIN(difficulty) as min, MAX(difficulty) as max FROM ${table}`)
      .get();
  }

  getPacketQuestions(packetId, type = "tossups") {
    const table = type === "tossups" ? "tossups" : "bonuses";
    return this.db
      .prepare(
        `SELECT * FROM ${table} WHERE packet_id = :pid ORDER BY question_number`
      )
      .all({ pid: packetId });
  }

  getSetStats(setId) {
    const tossupCount = this.db
      .prepare(
        `SELECT category, difficulty, COUNT(*) as count FROM tossups WHERE set_id = :sid GROUP BY category, difficulty`
      )
      .all({ sid: setId });

    const bonusCount = this.db
      .prepare(
        `SELECT category, difficulty, COUNT(*) as count FROM bonuses WHERE set_id = :sid GROUP BY category, difficulty`
      )
      .all({ sid: setId });

    return { tossupCount, bonusCount };
  }
}
