import { DatabaseSync } from "node:sqlite";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Question tags (schema 2, the `tags` JSON column). Families a filter may name;
// "subject" is matched as a category-tree node (its id), never as text.
export const TAG_FAMILIES = ["era", "place", "theme", "form", "answer_type", "format"];
const TAG_FAMILY_SET = new Set(TAG_FAMILIES);
// 14.97: "Science and Math" and "Pop Culture Sports" were split into four top-level categories; their
// children kept their ids. An old id saved somewhere (a filter, a preset, a plugin, a room) means both halves.
export const SPLIT_ROOTS = { n5c3932cefa: ["nc7da6ff213", "nf9d9ab0a2a"], n2bf00654e4: ["n9b8235c01e", "nc647c3608a"] };
const TAG_FAMILY_SQL = "(" + TAG_FAMILIES.map((f) => `'${f}'`).join(",") + ")";
// composition values (brief §4.3): which of a question's other categories a category filter takes it by (_catRidsSql)
const CROSS = "Hybrid - Cross Category", SAME = "Hybrid - Same Category";
// Normalize a tag filter list (from the query string or IPC): at most 12
// entries of { f, v, x, id }.
export function normalizeTagFilters(raw) {
  let list = raw;
  if (typeof list === "string") { try { list = JSON.parse(list); } catch { return []; } }
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const t of list.slice(0, 12)) {
    if (!t || typeof t !== "object") continue;
    const f = String(t.f ?? t.fam ?? "");
    const v = String(t.v ?? t.val ?? "").slice(0, 200);
    const x = !!(t.x ?? t.ex);
    if (f === "subject" && typeof t.id === "string" && t.id) out.push({ f, v, x, id: t.id.slice(0, 200) });
    else if (TAG_FAMILY_SET.has(f) && v) out.push({ f, v, x });
  }
  return out;
}

// ── Topic tags (the 2026-10-28 build, brief §5.1) ──
// Canon tiers as stored (tossups.canon, bonuses.part_canon / canon_mask): 1 core … 5 unique.
export const CANON_TIERS = ["core", "common", "uncommon", "rare", "unique"];
// qtags.src bits (scripts/build-db.py): mentioned in a clue, named in an "about" clue, about_tags, themes, the answer
const SRC = { mention: 1, aboutClue: 2, about: 4, theme: 8, answer: 16 };
// a topic-tag filter's role -> the src bits that count
const ROLE_MASK = { any: 31, about: SRC.aboutClue | SRC.about | SRC.answer, answer: SRC.answer, theme: SRC.theme, mention: SRC.mention | SRC.aboutClue };
export const isTopicTagId = (v) => typeof v === "string" && /^t[0-9a-f]{12}$/.test(v);
// A topic-tag filter list (query string JSON or IPC array): at most 8 of { id, r: any|about|answer|theme|mention, x }.
export function normalizeTopicFilters(raw) {
  let list = raw;
  if (typeof list === "string") { try { list = JSON.parse(list); } catch { return []; } }
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const t of list.slice(0, 8)) {
    if (!t || typeof t !== "object" || !isTopicTagId(t.id)) continue;
    out.push({ id: t.id, r: Object.hasOwn(ROLE_MASK, t.r) ? t.r : "any", x: !!t.x });
  }
  return out;
}
// canon tiers from a list or "core,common": the tier names, known ones only
export function normalizeCanon(raw) {
  const list = Array.isArray(raw) ? raw : String(raw || "").split(",");
  return [...new Set(list.map((x) => String(x).trim().toLowerCase()).filter((x) => CANON_TIERS.includes(x)))];
}
// A question's clues as the tagger numbered them (taxonomy_work/tags2/prompts.py clues_of): a tossup's plain text
// split into sentences; a bonus's lead-in, then each part.
const plainOf = (h) => String(h || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
export function cluesOf(row, isBonus) {
  if (!row) return [];
  if (!isBonus) return plainOf(row.question).split(/(?<=[.!?])\s+(?=[A-Z"\u201c(])/).map((c) => c.trim()).filter(Boolean);
  let parts = [];
  try { parts = JSON.parse(row.parts || "[]"); } catch { parts = []; }
  return [plainOf(row.leadin), ...parts.map(plainOf)];
}
// The tagger's split cuts at an abbreviation or an initial ("During World War II, Edwin J." | "Cohn fractionated…"):
// clue k as shown runs from the sentence's start to its real end (its numbering stays the tagger's).
const SENT_ABBR = /(?:\b(?:St|Ste|Mt|Mts|Dr|Mr|Mrs|Ms|Messrs|Mme|Mlle|Prof|Sr|Jr|Rev|Fr|Gen|Col|Capt|Lt|Sgt|Maj|Adm|Hon|Pres|Gov|Sen|Rep|Supt|Msgr|vs|etc|cf|ca|al|Inc|Co|Corp|Ltd|Bros|approx|No|Nos|Op|op|no|Vol|vol|Ch|ch|Fig|fig|Ft|Pt|pt|Rte|Ave|Blvd|[A-Za-z])\.["\u201d\u2019']?)$/;
export function wholeClue(clues, k) {
  if (!clues[k]) return "";
  let a = k, b = k;
  while (a > 0 && SENT_ABBR.test(clues[a - 1])) a--;
  while (b + 1 < clues.length && SENT_ABBR.test(clues[b])) b++;
  return clues.slice(a, b + 1).join(" ");
}

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
// Browse pages from this offset on come from the cached rowid order (_orderedPage).
const DEEP_PAGE_OFFSET = 1000;
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
    this.hasTags = this._hasColumn("tossups", "tags") && this._hasColumn("bonuses", "tags");
    // the 2026-10-28 build: every category a question covers, and the topic tags
    this.hasMultiCats = this._hasTable("qcats") && this._hasColumn("tossups", "cats_lo");
    this.hasTopics = this._hasTable("tag_vocab") && this._hasTable("qtags") && this._hasColumn("tossups", "canon") && this._hasColumn("tossups", "m_lo");
    this._vocab = null;
    this._tree = null;
    this._treeCounts = {};
  }

  _hasTable(name) {
    try { return !!this.db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name); }
    catch { return false; }
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
  getCategoryTree(type = "tossups", cacheFile = null) {
    const table = type === "bonuses" ? "bonuses" : "tossups";
    const { nodes } = this._loadTree();
    if (!this._treeCounts[table]) {
      if (this.hasMultiCats) {
        this._treeCounts[table] = this._ruleCounts(table, cacheFile);
      } else if (this.v2 && nodes.length && nodes[0].n_tossups !== undefined) {
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
      + (t === "bonuses" ? (this.v2 ? ", part_count" : ", parts") : ", length(question_sanitized) AS qlen");   // qlen: index.js tells an older skip from a dead question
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
  // ids -> ids, an old split root standing for its halves (only where the tree no longer has it)
  expandCategoryIds(ids) {
    const byId = this._loadTree().byId;
    return (ids || []).flatMap((id) => (!byId.has(id) && SPLIT_ROOTS[id] ? SPLIT_ROOTS[id].filter((k) => byId.has(k)) : [id]));
  }
  // The rowids (of qt's table) that some category ranges ("ord BETWEEN …") hold: a question's home, and the other
  // categories it really mixes (brief §4.3): every one of a "Hybrid - Cross Category" question's, a "Same Category"
  // one's inside its home's top category. The rest are incidental (the answer's own subject, a setting, a clue or two:
  // a myth tossup on stars, a novel set in Russia), so a Pure question stays in its home alone (15.35).
  _catRidsSql(qt, ranges) {
    const table = qt ? "bonuses" : "tossups";
    return `SELECT rid FROM qcats WHERE qt = ${qt} AND (${ranges.join(" OR ")}) AND (main = 1 OR EXISTS (SELECT 1 FROM ${table} h WHERE h.rowid = qcats.rid AND (h.composition = '${CROSS}' OR (h.composition = '${SAME}' AND ${this._rootSql("h.category_ord")} = ${this._rootSql("qcats.ord")}))))`;
  }
  // the top category an ord sits under, as SQL (a CASE over the roots' ranges) and as a lookup
  _rootSql(x) {
    const roots = this._loadTree().nodes.filter((n) => n.depth === 1);
    return `(CASE ${roots.map((r, i) => `WHEN ${x} BETWEEN ${r.ord} AND ${r.ord_end} THEN ${i}`).join(" ")} END)`;
  }
  // Subtree totals of playable questions by that rule: the file's own when it counted that way (meta cat_counts "3"),
  // else counted here (~0.3 s; homes by one grouped count, then each hybrid's other categories, a node once per
  // question) and kept in cacheFile for this build.
  _ruleCounts(table, cacheFile) {
    const { nodes, byId } = this._loadTree();
    if (this.getMeta("cat_counts") === "3" && nodes[0] && nodes[0].n_tossups !== undefined) return nodes.map((n) => (table === "bonuses" ? n.n_bonuses : n.n_tossups) || 0);
    const built = String(this.getMeta("built_at") || "0");
    if (cacheFile) {
      try {
        const c = existsSync(cacheFile) && JSON.parse(readFileSync(cacheFile, "utf8"));
        if (c && c.built === built && c.rule === 3 && Array.isArray(c[table]) && c[table].length === nodes.length) return c[table];
      } catch { /* count again */ }
    }
    const out = this._countByRule(table, nodes, byId);
    if (cacheFile) {
      let c = null;
      try { c = existsSync(cacheFile) && JSON.parse(readFileSync(cacheFile, "utf8")); } catch { c = null; }
      if (!c || c.built !== built || c.rule !== 3) c = { built, rule: 3 };
      c[table] = out;
      try { writeFileSync(cacheFile, JSON.stringify(c)); } catch { /* read-only location */ }
    }
    return out;
  }
  _countByRule(table, nodes, byId) {
    const qt = table === "bonuses" ? 1 : 0;
    const per = new Map(this.db.prepare(`SELECT category_ord AS o, COUNT(*) AS n FROM ${table} WHERE playable = 1 AND category_ord IS NOT NULL GROUP BY category_ord`).all().map((r) => [r.o, r.n]));
    const pre = [0];
    for (let i = 0; i < nodes.length; i++) pre.push(pre[i] + (per.get(i) || 0));
    const out = nodes.map((n) => pre[n.ord_end + 1] - pre[n.ord]);
    const up = nodes.map((n) => { const p = n.parent_id && byId.get(n.parent_id); return p ? p.ord : -1; });
    const root = nodes.map((n) => n.ord);
    for (let i = 0; i < nodes.length; i++) if (up[i] >= 0) root[i] = root[up[i]];   // preorder: a parent comes first
    let rid = null, seen = null;
    for (const r of this.db.prepare(`SELECT q.rid AS rid, q.ord AS ord, t.category_ord AS home, t.composition AS comp FROM qcats q JOIN ${table} t ON t.rowid = q.rid
      WHERE q.qt = ${qt} AND q.main = 0 AND t.playable = 1 AND t.composition IN ('${CROSS}', '${SAME}') ORDER BY q.rid`).all()) {
      if (r.comp === SAME && (r.home == null || root[r.ord] !== root[r.home])) continue;
      if (r.rid !== rid) { rid = r.rid; seen = new Set(); for (let o = r.home; o != null && o >= 0; o = up[o]) seen.add(o); }
      for (let o = r.ord; o != null && o >= 0 && !seen.has(o); o = up[o]) { seen.add(o); out[o]++; }
    }
    return out;
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

  // Answer lines (tossups, and bonus parts) that hold every given phrase, for the answer checker's otherName:
  // [{ id, part, answer, sanitized }] (part null for a tossup). Phrases are plain words.
  answerLinesWith(phrases, limit = 300) {
    const ph = (phrases || []).map((x) => String(x || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()).filter(Boolean);
    if (!ph.length) return [];
    const out = [];
    try {
      const q = ph.map((x) => '"' + x + '"').join(" AND ");
      for (const r of this.db.prepare("SELECT t.id, t.answer, t.answer_sanitized FROM tossups_fts f JOIN tossups t ON t.rowid = f.rowid WHERE tossups_fts MATCH ? AND t.playable = 1 LIMIT ?").all("answer_sanitized : (" + q + ")", limit)) {
        out.push({ id: r.id, part: null, answer: r.answer || "", sanitized: r.answer_sanitized || "" });
      }
      for (const r of this.db.prepare("SELECT b.id, b.answers, b.answers_sanitized FROM bonuses_fts f JOIN bonuses b ON b.rowid = f.rowid WHERE bonuses_fts MATCH ? AND b.playable = 1 LIMIT ?").all("answers_sanitized : (" + q + ")", limit)) {
        let a = [], z = [];
        try { a = JSON.parse(r.answers || "[]"); z = JSON.parse(r.answers_sanitized || "[]"); } catch { continue; }
        z.forEach((t, i) => out.push({ id: r.id, part: i, answer: a[i] || "", sanitized: t || "" }));   // the caller picks the part
      }
    } catch { /* no FTS on this database */ }
    return out;
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
    // version change) are ignored rather than matching nothing. Since the 2026-10-28
    // build a question matches when ANY of its categories is in the subtree (brief §4.4:
    // the qcats table; a Pure question only by its home, see _catRidsSql); catMode "pure" wants
    // every one of them inside (cats_lo / cats_hi, a trial), "home" only its main category (a
    // team diagnostic's quotas).
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const ors = [];
      const names = ["category", "subcategory", "alternate_subcategory"];
      const mode = filters.catMode === "pure" || filters.catMode === "home" ? filters.catMode : "any";
      const anyRanges = [];
      this.expandCategoryIds(filters.categoryIds).forEach((id, i) => {
        const n = this.getCategoryNode(id);
        if (!n) return;
        if (this.v2) {
          params[`cord${i}`] = n.ord; params[`cend${i}`] = n.ord_end;
          if (mode === "any" && this.hasMultiCats) anyRanges.push(`ord BETWEEN :cord${i} AND :cend${i}`);
          else if (mode === "pure" && this.hasMultiCats) ors.push(`(${col("cats_lo")} >= :cord${i} AND ${col("cats_hi")} <= :cend${i})`);
          else if (mode === "pure") ors.push(`(${col("category_ord")} BETWEEN :cord${i} AND :cend${i} AND COALESCE(${col("composition")}, '') != 'Hybrid - Cross Category')`);
          else ors.push(`${col("category_ord")} BETWEEN :cord${i} AND :cend${i}`);
        } else {
          const parts = n.path.split(" > ");
          ors.push("(" + parts.map((p, k) => { params[`cv${i}_${k}`] = p; return `${col(names[k])} = :cv${i}_${k}`; }).join(" AND ") + ")");
        }
      });
      if (anyRanges.length) ors.push(`${col("rowid")} IN (${this._catRidsSql(opts.isBonus ? 1 : 0, anyRanges)})`);
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

    // a team diagnostic's packet (14.77): no question spanning two categories, no stale current event
    if (filters.noCrossCategory && this.v2) clauses.push(`COALESCE(${col("composition")}, '') != 'Hybrid - Cross Category'`);
    if (filters.notStale && this.v2) clauses.push(`instr(COALESCE(${col("tags")}, ''), '"Stale Current Events"') = 0`);

    // the standard bonus: three parts, ten points each (a team diagnostic's packet)
    if (filters.threeParts && opts.isBonus && this.v2) {
      clauses.push(`${col("part_count")} = 3 AND replace(${col("point_values")}, ' ', '') = '[10,10,10]'`);
    }

    // none of these flag codes (flag_codes is " A B ", so a code is matched whole)
    if (this.v2 && Array.isArray(filters.excludeFlags)) {
      filters.excludeFlags.filter((f) => /^[A-Z_]+$/.test(String(f))).forEach((f, i) => {
        clauses.push(`instr(COALESCE(${col("flag_codes")}, ''), :xflag${i}) = 0`);
        params[`xflag${i}`] = " " + f + " ";
      });
    }

    if (filters.yearMin !== undefined) {
      clauses.push(`${col("set_year")} >= :yearMin`);
      params["yearMin"] = filters.yearMin;
    }

    if (filters.yearMax !== undefined) {
      clauses.push(`${col("set_year")} <= :yearMax`);
      params["yearMax"] = filters.yearMax;
    }

    // Tags: every listed tag is required ("x" = must NOT have it). A subject
    // tag is a category-tree node (its whole subtree); the other families are
    // matched in the record's tags JSON. instr() on the JSON-quoted value is a
    // cheap prefilter (ASCII values only — the stored JSON escapes the rest),
    // json_each confirms the family. NULL tags never match, so an excluded tag
    // keeps untagged records.
    if (this.hasTags && filters.tags && filters.tags.length) {
      normalizeTagFilters(filters.tags).forEach((t, i) => {
        if (t.f === "subject") {
          const n = this.v2 ? this.getCategoryNode(t.id) : null;
          if (!n) return;
          clauses.push(this.hasMultiCats
            ? `${col("rowid")} ${t.x ? "NOT " : ""}IN (SELECT rid FROM qcats WHERE qt = ${opts.isBonus ? 1 : 0} AND ord BETWEEN :tso${i} AND :tse${i})`
            : `${t.x ? "NOT " : ""}(${col("category_ord")} BETWEEN :tso${i} AND :tse${i})`);
          params[`tso${i}`] = n.ord; params[`tse${i}`] = n.ord_end;
          return;
        }
        const exists = `EXISTS (SELECT 1 FROM json_each(${col("tags")}, '$.${t.f}') WHERE value = :tagv${i})`;
        const ascii = /^[\x20-\x7e]+$/.test(t.v) && !/["\\]/.test(t.v);
        const cond = ascii ? `(instr(COALESCE(${col("tags")}, ''), :tagq${i}) > 0 AND ${exists})` : exists;
        clauses.push(t.x ? `NOT ${cond}` : cond);
        params[`tagv${i}`] = t.v;
        if (ascii) params[`tagq${i}`] = JSON.stringify(t.v);
      });
    }

    // Canon tiers (brief §5.1): a tossup's answer tier; a bonus with any part of those tiers
    if (this.hasTopics && filters.canon && filters.canon.length) {
      const tiers = normalizeCanon(filters.canon).map((t) => CANON_TIERS.indexOf(t) + 1);
      if (tiers.length && tiers.length < CANON_TIERS.length) {
        if (opts.isBonus) { clauses.push(`(COALESCE(${col("canon_mask")}, 0) & :canonMask) != 0`); params.canonMask = tiers.reduce((m, t) => m | (1 << (t - 1)), 0); }
        else clauses.push(`${col("canon")} IN (${tiers.join(",")})`);
      }
    }

    // Topic tags: every listed tag is required (x = must not have it), as mentioned, about, the answer or a theme
    if (this.hasTopics && filters.etags && filters.etags.length) {
      normalizeTopicFilters(filters.etags).forEach((t, i) => {
        const tid = this._tidOf(t.id);
        if (!tid) { if (!t.x) clauses.push("0"); return; }
        const mask = ROLE_MASK[t.r];
        clauses.push(`${col("rowid")} ${t.x ? "NOT " : ""}IN (SELECT rid FROM qtags WHERE tid = :et${i} AND qt = ${opts.isBonus ? 1 : 0}${mask !== 31 ? ` AND (src & ${mask}) != 0` : ""})`);
        params[`et${i}`] = tid;
      });
    }

    return { where: clauses.length > 0 ? "WHERE " + clauses.join(" AND ") : "", params };
  }

  // ── Topic tags (brief §5.1): names come from tag_vocab; records hold only ids ──
  _tidOf(id) {
    if (!this.hasTopics || !isTopicTagId(id)) return 0;
    const c = this._tidCache || (this._tidCache = new Map());
    if (c.has(id)) return c.get(id);
    let tid = 0;
    try { const r = this.db.prepare("SELECT tid FROM tag_vocab WHERE id = ?").get(id); tid = r ? r.tid : 0; } catch { tid = 0; }
    if (c.size > 20000) c.clear();
    c.set(id, tid);
    return tid;
  }
  // tids -> { id, name, kind, group } (one query per batch)
  _tagsByTid(tids) {
    const out = new Map(), list = [...new Set(tids)].filter((x) => Number.isInteger(x) && x > 0);
    for (let i = 0; i < list.length; i += 500) {
      const chunk = list.slice(i, i + 500);
      for (const r of this.db.prepare(`SELECT tid, id, name, kind, grp FROM tag_vocab WHERE tid IN (${chunk.join(",")})`).all()) out.set(r.tid, { id: r.id, name: r.name, kind: r.kind, group: r.grp });
    }
    return out;
  }
  _tagsById(ids) {
    const out = new Map(), list = [...new Set(ids)].filter(isTopicTagId);
    for (let i = 0; i < list.length; i += 500) {
      const chunk = list.slice(i, i + 500);
      for (const r of this.db.prepare(`SELECT tid, id, name, kind, grp FROM tag_vocab WHERE id IN (${chunk.map(() => "?").join(",")})`).all(...chunk)) out.set(r.id, { id: r.id, name: r.name, kind: r.kind, group: r.grp, tid: r.tid });
    }
    return out;
  }

  // Tags whose name or alias starts with the typed words (aliases are for finding, never for judging):
  // most-used first, a whole-name match on top. kinds: a list of kind values to keep.
  searchTopicTags(query, { kinds = null, limit = 30, offset = 0 } = {}) {
    if (!this.hasTopics) return { tags: [], total: 0 };
    const lim = Math.max(1, Math.min(100, limit | 0 || 30)), off = Math.max(0, offset | 0);
    const words = (String(query || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).slice(0, 8);
    const kindList = Array.isArray(kinds) ? kinds.filter((k) => /^[a-z ]{2,20}$/.test(k)).slice(0, 12) : [];
    const kindSql = kindList.length ? ` AND v.kind IN (${kindList.map((k) => `'${k}'`).join(",")})` : "";
    // a tag that is only ever the answer has question_count 0 in the release (44,598 of them): its answers are its questions
    const QN = "(CASE WHEN v.qn > 0 THEN v.qn ELSE v.ansn END)";
    const cols = `v.id, v.name, v.kind, v.grp AS "group", v.aliases, ${QN} AS qn, v.mn, v.an, v.ansn`;
    let rows, total;
    if (!words.length) {
      total = this.db.prepare(`SELECT COUNT(*) AS n FROM tag_vocab v WHERE 1${kindSql}`).get().n;
      rows = this.db.prepare(`SELECT ${cols} FROM tag_vocab v WHERE 1${kindSql} ORDER BY ${QN} DESC LIMIT ${lim} OFFSET ${off}`).all();
    } else {
      const match = words.map((w) => `"${w}"*`).join(" ");
      const exact = words.join(" ");
      total = this.db.prepare(`SELECT COUNT(*) AS n FROM tag_fts f JOIN tag_vocab v ON v.tid = f.rowid WHERE tag_fts MATCH ?${kindSql}`).get(match).n;
      rows = this.db.prepare(`SELECT ${cols} FROM tag_fts f JOIN tag_vocab v ON v.tid = f.rowid WHERE tag_fts MATCH ?${kindSql}
        ORDER BY (lower(v.name) = ?) DESC, ${QN} DESC LIMIT ${lim} OFFSET ${off}`).all(match, exact);
    }
    return { total, tags: rows.map((r) => {
      let aliases = []; try { aliases = JSON.parse(r.aliases || "[]"); } catch { aliases = []; }
      return { id: r.id, name: r.name, kind: r.kind, group: r.group, aliases: aliases.slice(0, 6), questions: r.qn, mentions: r.mn, about: r.an, answers: r.ansn };
    }) };
  }

  // One tag in full: its names, where it appears, its counts, and the tags most often in the same questions.
  getTopicTag(id) {
    const tid = this._tidOf(id); if (!tid) return null;
    const v = this.db.prepare("SELECT * FROM tag_vocab WHERE tid = ?").get(tid);
    const parse = (x) => { try { return JSON.parse(x || "[]"); } catch { return []; } };
    // every count of one type in one pass over the tag's own links (the unplayable few left out by rowid)
    const per = (qt) => this.db.prepare(`SELECT COUNT(*) AS n, SUM((src & ${ROLE_MASK.about}) != 0) AS ab, SUM((src & ${SRC.answer}) != 0) AS an, SUM((src & ${SRC.theme}) != 0) AS th
      FROM qtags WHERE tid = ? AND qt = ${qt} AND rid NOT IN (SELECT rowid FROM ${qt ? "bonuses" : "tossups"} WHERE playable = 0)`).get(tid);
    const t = per(0), b = per(1);
    const counts = { tossups: t.n || 0, bonuses: b.n || 0, aboutTossups: t.ab || 0, aboutBonuses: b.ab || 0, answerTossups: t.an || 0, answerBonuses: b.an || 0, themeQuestions: (t.th || 0) + (b.th || 0) };
    // the same questions' other tags (a big tag's first 3,000 questions are enough to rank them)
    const rel = this.db.prepare(`WITH q AS (SELECT qt, rid FROM qtags WHERE tid = ? LIMIT 3000)
      SELECT g.tid, COUNT(*) AS n FROM q JOIN qtags g ON g.qt = q.qt AND g.rid = q.rid WHERE g.tid != ? GROUP BY g.tid ORDER BY n DESC LIMIT 24`).all(tid, tid);
    const names = this._tagsByTid(rel.map((r) => r.tid));
    return { id: v.id, name: v.name, kind: v.kind, group: v.grp, aliases: parse(v.aliases), categories: parse(v.cats),
      questions: v.qn > 0 ? v.qn : v.ansn, mentions: v.mn, about: v.an, answers: v.ansn, counts,   // (an answer-only tag: searchTopicTags)
      related: rel.map((r) => ({ ...names.get(r.tid), shared: r.n })).filter((x) => x.id) };
  }

  // Questions' topics, for display once a question is over: { [id]: { about, themes, answer | parts, mentions,
  // categories } }; a mention without a tag (a name in only one question) keeps its words only.
  topicTagsFor(type, ids) {
    const isBonus = type === "bonus" || type === "bonuses", table = isBonus ? "bonuses" : "tossups";
    const out = {};
    if (!this.hasTopics) return out;
    const list = [...new Set((ids || []).map(String))].slice(0, 200);
    if (!list.length) return out;
    const cols = isBonus ? "rowid AS rid, id, cats, about_tags, themes, m_lo, m_hi, part_answer_entities AS ents, part_answer_frequencies AS freqs, part_canon AS tiers"
      : "rowid AS rid, id, cats, about_tags, themes, m_lo, m_hi, answer_entity AS ent, answer_frequency AS freq, canon AS tier";
    const rows = this.db.prepare(`SELECT ${cols} FROM ${table} WHERE id IN (${list.map(() => "?").join(",")})`).all(...list);
    if (!rows.length) return out;
    const parse = (x) => { try { return JSON.parse(x || "[]") || []; } catch { return []; } };
    const byRid = new Map(rows.map((r) => [r.rid, r]));
    // a record's mentions are one rowid range (m_lo..m_hi, scripts/build-db.py): one range lookup each
    const byRange = this.db.prepare("SELECT rid, tid, role, clue, part, surface, type FROM mentions WHERE rowid BETWEEN ? AND ? ORDER BY rowid");
    const ments = rows.filter((r) => r.m_lo != null).flatMap((r) => byRange.all(r.m_lo, r.m_hi));
    const idsNeeded = [];
    for (const r of rows) { idsNeeded.push(...parse(r.about_tags), ...parse(r.themes)); if (isBonus) idsNeeded.push(...parse(r.ents).filter(Boolean)); else if (r.ent) idsNeeded.push(r.ent); }
    const byId = this._tagsById(idsNeeded), byTid = this._tagsByTid(ments.map((m) => m.tid).filter(Boolean));
    const tag = (id) => { const t = byId.get(id); return t ? { id: t.id, name: t.name, kind: t.kind, group: t.group } : null; };
    const tier = (n) => (n >= 1 && n <= 5 ? CANON_TIERS[n - 1] : null);
    for (const r of rows) {
      const o = { about: parse(r.about_tags).map(tag).filter(Boolean), themes: parse(r.themes).map(tag).filter(Boolean), mentions: [], categories: parse(r.cats) };
      if (isBonus) {
        const ents = parse(r.ents), freqs = parse(r.freqs), tiers = parse(r.tiers);
        o.parts = ents.map((e, i) => ({ answer: e ? tag(e) : null, frequency: freqs[i] ?? null, tier: tier(tiers[i]) }));
      } else o.answer = { tag: r.ent ? tag(r.ent) : null, frequency: r.freq ?? null, tier: tier(r.tier) };
      out[r.id] = o;
    }
    for (const m of ments) {
      const r = byRid.get(m.rid); if (!r) continue;
      const t = m.tid ? byTid.get(m.tid) : null;
      out[r.id].mentions.push({ ...(t ? { id: t.id, name: t.name, kind: t.kind } : { type: m.type || null }), surface: m.surface, role: m.role ? "about" : "mentioned", clue: m.clue, part: m.part });
    }
    return out;
  }

  // "Every clue about X": the clues that name a tag, each with its question (newest sets first).
  topicTagClues(id, { qtype = "tossup", role = "any", offset = 0, limit = 25 } = {}) {
    const tid = this._tidOf(id); if (!tid) return { clues: [], total: 0 };
    const isBonus = qtype === "bonus", table = isBonus ? "bonuses" : "tossups";
    const roleSql = role === "about" ? " AND m.role = 1" : role === "mention" ? " AND m.role = 0" : "";
    const where = `m.tid = ? AND m.qt = ${isBonus ? 1 : 0} AND q.playable = 1${roleSql}`;
    const total = this.db.prepare(`SELECT COUNT(*) AS n FROM mentions m JOIN ${table} q ON q.rowid = m.rid WHERE ${where}`).get(tid).n;
    const cols = isBonus ? "q.id, q.leadin, q.parts, q.answers_sanitized AS ans, q.set_name, q.set_year, q.packet_number, q.question_number, q.category_path, q.difficulty"
      : "q.id, q.question, q.answer_sanitized AS ans, q.set_name, q.set_year, q.packet_number, q.question_number, q.category_path, q.difficulty, q.canon";
    const rows = this.db.prepare(`SELECT m.clue, m.part, m.role, m.surface, ${cols} FROM mentions m JOIN ${table} q ON q.rowid = m.rid WHERE ${where}
      ORDER BY q.set_year DESC, q.set_name, q.question_number, m.clue LIMIT ? OFFSET ?`).all(tid, Math.max(1, Math.min(100, limit | 0 || 25)), Math.max(0, offset | 0));
    return { total, clues: rows.map((r) => {
      const clues = cluesOf(r, isBonus);
      let answer = r.ans || "";
      if (isBonus) { try { const a = JSON.parse(r.ans || "[]"); answer = r.part != null ? a[r.part] || "" : a.join(" / "); } catch { answer = ""; } }
      return { id: r.id, type: isBonus ? "bonus" : "tossup", clue: r.clue, part: r.part, role: r.role ? "about" : "mentioned", surface: r.surface,
        text: isBonus ? clues[r.clue] || "" : wholeClue(clues, r.clue), answer, set_name: r.set_name, set_year: r.set_year, packet_number: r.packet_number, question_number: r.question_number,
        category_path: r.category_path, difficulty: r.difficulty, ...(isBonus ? {} : { canon: r.canon ? CANON_TIERS[r.canon - 1] : null }) };
    }) };
  }

  // The tags most questions carry inside some categories (any of a question's categories, like every filter):
  // [{ id, name, kind, group, count }], most first. role: any / about / answer / theme / mention; kinds: keep only these.
  topicTagCounts({ qtype = "tossup", nodeIds = [], role = "any", kinds = null, limit = 2000 } = {}) {
    if (!this.hasTopics) return [];
    const lim = Math.max(1, Math.min(5000, limit | 0 || 2000));
    if (qtype === "both") {
      // tossups and bonuses together: each tag's two counts summed
      const sum = new Map();
      for (const t of ["tossup", "bonus"]) for (const r of this.topicTagCounts({ qtype: t, nodeIds, role, kinds, limit: 5000 })) { const o = sum.get(r.id); if (o) o.count += r.count; else sum.set(r.id, { ...r }); }
      return [...sum.values()].sort((a, b) => b.count - a.count).slice(0, lim);
    }
    const qt = qtype === "bonus" ? 1 : 0, table = qt ? "bonuses" : "tossups";
    const mask = ROLE_MASK[role] || 31;
    const nodes = this.expandCategoryIds((nodeIds || []).filter(Boolean)).map((id) => this.getCategoryNode(id)).filter(Boolean);
    const kindList = Array.isArray(kinds) ? kinds.filter((k) => /^[a-z ]{2,20}$/.test(k)).slice(0, 12) : [];
    const named = (rows) => { const names = this._tagsByTid(rows.map((r) => r.tid)); return rows.map((r) => ({ ...names.get(r.tid), count: r.n })).filter((x) => x.id); };
    // counted from the tag links alone (no lookup of each question's row; the few unplayable ones left out by rowid),
    // inside some categories when asked (any of a question's categories, like every filter)
    // kept for the open database (Both reuses each type's list; a page back is instant)
    const memo = this._topicCounts || (this._topicCounts = new Map()), key = [qt, role, nodes.map((n) => n.id).sort().join(","), kindList.join(",")].join("|");
    if (memo.has(key)) return memo.get(key).slice(0, lim);
    const params = [];
    let inCats = "";
    if (nodes.length && this.hasMultiCats) {
      inCats = ` AND g.rid IN (${this._catRidsSql(qt, nodes.map(() => "ord BETWEEN ? AND ?"))})`;
      for (const n of nodes) params.push(n.ord, n.ord_end);
    } else if (nodes.length) {
      inCats = ` AND g.rid IN (SELECT rowid FROM ${table} WHERE ${nodes.map(() => "category_ord BETWEEN ? AND ?").join(" OR ")})`;
      for (const n of nodes) params.push(n.ord, n.ord_end);
    }
    const rows = this.db.prepare(`SELECT g.tid, COUNT(*) AS n FROM qtags g
      WHERE g.qt = ${qt} AND g.rid NOT IN (SELECT rowid FROM ${table} WHERE playable = 0)${mask !== 31 ? ` AND (g.src & ${mask}) != 0` : ""}${inCats}
      ${kindList.length ? ` AND g.tid IN (SELECT tid FROM tag_vocab WHERE kind IN (${kindList.map((k) => `'${k}'`).join(",")}))` : ""}
      GROUP BY g.tid ORDER BY n DESC LIMIT 5000`).all(...params);
    const out = named(rows);
    memo.set(key, out);
    while (memo.size > 32) memo.delete(memo.keys().next().value);
    return out.slice(0, lim);
  }

  // tossup id -> its answer's canon tier name
  topicCanonOf(ids) {
    const out = new Map(), list = [...new Set((ids || []).map(String))];
    if (!this.hasTopics) return out;
    for (let i = 0; i < list.length; i += 500) {
      const chunk = list.slice(i, i + 500);
      for (const r of this.db.prepare(`SELECT id, canon FROM tossups WHERE id IN (${chunk.map(() => "?").join(",")}) AND canon IS NOT NULL`).all(...chunk)) out.set(r.id, CANON_TIERS[r.canon - 1]);
    }
    return out;
  }

  // (tossup or bonus id) pairs -> the tags of the given roles each carries: for a player's stats
  topicPairs(type, ids, role = "about") {
    if (!this.hasTopics) return [];
    const isBonus = type === "bonus", table = isBonus ? "bonuses" : "tossups", mask = ROLE_MASK[role] || 31;
    const out = [], list = [...new Set((ids || []).map(String))];
    for (let i = 0; i < list.length; i += 500) {
      const chunk = list.slice(i, i + 500);
      for (const r of this.db.prepare(`SELECT q.id, g.tid FROM ${table} q JOIN qtags g ON g.qt = ${isBonus ? 1 : 0} AND g.rid = q.rowid WHERE q.id IN (${chunk.map(() => "?").join(",")}) AND (g.src & ${mask}) != 0`).all(...chunk)) out.push([r.id, r.tid]);
    }
    return out;
  }

  // Every matching tossup's text and answer, one row at a time (Buzzwords' scan, index.js
  // buzzwordsApi): just the columns it reads, no sorting.
  iterateTossupText(filters = {}) {
    const { where, params } = this._buildWhere(filters);
    return this.db.prepare(`SELECT id, question, question_sanitized, answer_sanitized, tags FROM tossups ${where}`).iterate(params);
  }

  queryTossups(filters = {}) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const { where, params } = this._buildWhere(filters);

    const orderBy = filters.random ? "ORDER BY RANDOM()" : (sortSql(filters.sort, "") ? "ORDER BY " + sortSql(filters.sort, "") : "ORDER BY set_year DESC, set_name, question_number, rowid");

    // browsing: the whole ordered id list once (one sort; the count is its length), then
    // every page is a lookup — a separate COUNT plus an OFFSET query re-sorted everything
    // for each page (3–4 s a page on the website's server)
    if (!filters.random) return this._orderedPage("tossups", where, params, orderBy, offset, limit);
    if (filters.random) return this._randomRows("tossups", where, params, limit);

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

    const orderBy = filters.random ? "ORDER BY RANDOM()" : (sortSql(filters.sort, "") ? "ORDER BY " + sortSql(filters.sort, "") : "ORDER BY set_year DESC, set_name, question_number, rowid");

    if (!filters.random) return this._orderedPage("bonuses", where, params, orderBy, offset, limit);
    if (filters.random) return this._randomRows("bonuses", where, params, limit);

    const countSql = `SELECT COUNT(*) as count FROM bonuses ${where}`;
    const countRow = this.db.prepare(countSql).get(params);
    const total = countRow ? countRow.count : 0;

    const sql = `SELECT * FROM bonuses ${where} ${orderBy} LIMIT :limit OFFSET :offset`;
    const rows = this.db.prepare(sql).all({ ...params, limit, offset });

    return { rows, total };
  }

  // A random row from a FILTERED set. The matching rowids are listed once per
  // filter and kept (one scan: ~0.5 s on the website's server for powermarked
  // difficulty 2–5 since 2010, since that filter reads every question's text);
  // every later pick is a rowid lookup. The file is read-only, so a list never
  // goes stale. Uniform over the matching rows, like the COUNT + OFFSET it replaces.
  _randomIds(table, where, params) {
    const key = table + "|" + where + "|" + JSON.stringify(params);
    const cache = this._randCache || (this._randCache = new Map());
    let ids = cache.get(key);
    if (ids) { cache.delete(key); cache.set(key, ids); }
    else {
      ids = Int32Array.from(this.db.prepare(`SELECT rowid AS r FROM ${table} ${where}`).all(params), (x) => x.r);
      cache.set(key, ids);
      // (the game server's 15 official rooms keep a list each, besides what other rooms ask for)
      while (cache.size > 64) cache.delete(cache.keys().next().value);
    }
    return ids;
  }
  _randomRow(table, where, params) {
    const ids = this._randomIds(table, where, params);
    if (!ids.length) return undefined;
    return this.db.prepare(`SELECT * FROM ${table} WHERE rowid = ?`).get(ids[Math.floor(Math.random() * ids.length)]);
  }
  // `limit` distinct random rows (query?random=1, e.g. the home background), in random order.
  _randomRows(table, where, params, limit) {
    const ids = this._randomIds(table, where, params);
    const n = Math.min(limit, ids.length), pick = new Set();
    while (pick.size < n) pick.add(ids[Math.floor(Math.random() * ids.length)]);
    const order = [...pick];
    const rows = order.length ? this.db.prepare(`SELECT rowid AS __rid, * FROM ${table} WHERE rowid IN (${order.join(",")})`).all() : [];
    const byId = new Map(rows.map((r) => [r.__rid, r]));
    return { rows: order.map((id) => { const r = byId.get(id); if (r) delete r.__rid; return r; }).filter(Boolean), total: ids.length };
  }

  // Deep pages of a browse (no search text) re-sorted the whole table on every
  // request (~2.7 s at page 3000 without an index on the browse order). Past
  // the first pages the ordered rowids are computed once per filter and kept
  // (the file is read-only, so they never go stale); each page is then a
  // rowid lookup. Built databases also carry idx_*_browse, which makes the
  // first build cheap too.
  _orderedKey(table, where, params, orderBy) { return table + "|" + where + "|" + orderBy + "|" + JSON.stringify(params); }
  _hasOrderedIds(table, where, params, orderBy) { return !!(this._idCache && this._idCache.has(this._orderedKey(table, where, params, orderBy))); }
  _orderedPage(table, where, params, orderBy, offset, limit) {
    const key = this._orderedKey(table, where, params, orderBy);
    const cache = this._idCache || (this._idCache = new Map());
    let ids = cache.get(key);
    if (ids) { cache.delete(key); cache.set(key, ids); }
    else {
      ids = Int32Array.from(this.db.prepare(`SELECT rowid AS r FROM ${table} ${where} ${orderBy}`).all(params), (x) => x.r);
      cache.set(key, ids);
      while (cache.size > 6) cache.delete(cache.keys().next().value);
    }
    const slice = Array.from(ids.subarray(offset, offset + limit));
    if (!slice.length) return { rows: [], total: ids.length };
    const got = this.db.prepare(`SELECT rowid AS __rid, * FROM ${table} WHERE rowid IN (${slice.join(",")})`).all();
    const byId = new Map(got.map((r) => [r.__rid, r]));
    const rows = [];
    for (const id of slice) { const r = byId.get(id); if (r) { delete r.__rid; rows.push(r); } }
    return { rows, total: ids.length };
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
    return this._randomRow("tossups", where, params);
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
    return this._randomRow("bonuses", where, params);
  }

  searchTossups(query, filters = {}) { return this._ftsSearch("tossups", "t", query, filters); }

  searchBonuses(query, filters = {}) { return this._ftsSearch("bonuses", "b", query, filters, { isBonus: true }); }

  // Full-text search. A word in a big share of the questions ("the" is in ~186,000
  // tossups) used to read every matching row from the big table — to check the
  // filters and to rank — which took ~10 s on the website's small server (it can't
  // keep the 1.6 GB file in memory). Past FTS_MANY matches, best-match ranks inside
  // the FTS index alone and the filters come from the table's covering indexes
  // (playable / difficulty / year / category …: `rowid IN (SELECT rowid FROM t WHERE …)`),
  // so only the page's own rows are read. Fewer matches (most searches) keep the plain
  // join — cheaper there. Other sort orders join (they sort by the table's columns).
  _ftsSearch(table, alias, query, filters, opts) {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    const fts = table + "_fts";
    const FTS_MANY = 4000, FTS_HUGE = 40000;
    const { where, params } = this._buildWhere(filters, alias + ".", opts);
    const fullWhere = where ? `${fts} MATCH :query AND ${where.substring(6)}` : `${fts} MATCH :query`;
    const order = sortSql(filters.sort, alias + ".");
    const joinCount = `SELECT COUNT(*) AS count FROM ${table} ${alias} JOIN ${fts} ON ${alias}.rowid = ${fts}.rowid WHERE ${fullWhere}`;
    const joinRows = `SELECT ${alias}.* FROM ${table} ${alias} JOIN ${fts} ON ${alias}.rowid = ${fts}.rowid WHERE ${fullWhere}
      ORDER BY ${order || "rank"} LIMIT :limit OFFSET :offset`;
    const run = (q) => {
      const many = this.db.prepare(`SELECT COUNT(*) AS n FROM ${fts} WHERE ${fts} MATCH :query`).get({ query: q }).n > FTS_MANY;
      let countRow, rows;
      if (many) {
        const plain = this._buildWhere(filters, "", opts);
        const inSet = plain.where ? `WHERE rid IN (SELECT rowid FROM ${table} ${plain.where})` : "";
        countRow = this.db.prepare(`WITH m AS MATERIALIZED (SELECT rowid AS rid FROM ${fts} WHERE ${fts} MATCH :query) SELECT COUNT(*) AS count FROM m ${inSet}`).get({ ...plain.params, query: q });
        // a word in a huge share of the questions ("of", "points"): best match means nothing
        // there and ranking it all is the slow part — question order instead, which stops
        // after the page's rows
        const huge = !order && countRow && countRow.count > FTS_HUGE;
        rows = huge
          ? this.db.prepare(`SELECT ${alias}.* FROM ${table} ${alias} WHERE ${alias}.rowid IN (SELECT rowid FROM ${fts} WHERE ${fts} MATCH :query)${where ? " AND " + where.substring(6) : ""}
              ORDER BY ${alias}.rowid DESC LIMIT :limit OFFSET :offset`).all({ ...params, query: q, limit, offset })
          : order
          ? this.db.prepare(joinRows).all({ ...params, query: q, limit, offset })
          : this.db.prepare(`WITH m AS MATERIALIZED (SELECT rowid AS rid, rank AS rk FROM ${fts} WHERE ${fts} MATCH :query)
              SELECT ${alias}.* FROM (SELECT rid, rk FROM m ${inSet} ORDER BY rk LIMIT :limit OFFSET :offset) x
              JOIN ${table} ${alias} ON ${alias}.rowid = x.rid ORDER BY x.rk`).all({ ...plain.params, query: q, limit, offset });
      } else {
        countRow = this.db.prepare(joinCount).get({ ...params, query: q });
        rows = this.db.prepare(joinRows).all({ ...params, query: q, limit, offset });
      }
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
  // One node id or several (comma list / array): the union of their subtrees.
  _freqNode(where, params, nodeIds, qt = 0) {
    const ids = Array.isArray(nodeIds) ? nodeIds : String(nodeIds || "").split(",");
    const nodes = this.expandCategoryIds(ids.filter(Boolean)).map((id) => this.getCategoryNode(id)).filter(Boolean);
    if (!nodes.length) return where;
    if (this.v2) {
      const parts = nodes.map((n, i) => { params["co" + i] = n.ord; params["ce" + i] = n.ord_end; return `${this.hasMultiCats ? "ord" : "category_ord"} BETWEEN :co${i} AND :ce${i}`; });
      // (any of a question's categories, like every other filter; the caller says which table via qt)
      if (this.hasMultiCats) return where + ` AND rowid IN (${this._catRidsSql(qt, parts)})`;
      return where + " AND (" + parts.join(" OR ") + ")";
    }
    const cols = ["category", "subcategory", "alternate_subcategory"];
    const parts = nodes.map((n, i) => "(" + n.path.split(" > ").slice(0, 3).map((p, k) => { params[`v${i}_${k}`] = p; return `${cols[k]} = :v${i}_${k}`; }).join(" AND ") + ")");
    return where + " AND (" + parts.join(" OR ") + ")";
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
    where = this._freqNode(where, params, nodeId, 1);
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

  // Every tag value per family with its count of playable questions:
  // { built, tags: { era: [[value, tossups, bonuses], …], … } }, most common
  // first. One full JSON pass over both tables (a few seconds), so it is kept
  // in memory and on disk next to the user database, keyed by the build stamp.
  getTagVocab(cacheFile) {
    if (this._vocab) return this._vocab;
    const built = String(this.getMeta("built_at") || "0");
    if (!this.hasTags) return (this._vocab = { built, tags: {} });
    if (cacheFile) {
      try {
        if (existsSync(cacheFile)) {
          const c = JSON.parse(readFileSync(cacheFile, "utf8"));
          if (c && c.built === built && c.tags) return (this._vocab = c);
        }
      } catch { /* rebuild */ }
    }
    const acc = {};
    [["tossups", 1], ["bonuses", 2]].forEach(([table, slot]) => {
      let rows = [];
      try {
        rows = this.db.prepare(`SELECT f.key AS fam, v.value AS val, COUNT(*) AS n FROM ${table} t, json_each(t.tags) f, json_each(f.value) v WHERE ${this.v2 ? "t.playable = 1 AND " : ""}f.key IN ${TAG_FAMILY_SQL} AND v.type = 'text' GROUP BY 1, 2`).all();
      } catch { rows = []; }
      for (const r of rows) {
        const m = acc[r.fam] || (acc[r.fam] = new Map());
        const e = m.get(r.val) || [r.val, 0, 0];
        e[slot] += r.n;
        m.set(r.val, e);
      }
    });
    const tags = {};
    for (const f of TAG_FAMILIES) tags[f] = [...(acc[f] || new Map()).values()].sort((a, b) => (b[1] + b[2]) - (a[1] + a[2]));
    this._vocab = { built, tags };
    if (cacheFile) { try { writeFileSync(cacheFile, JSON.stringify(this._vocab)); } catch { /* read-only location */ } }
    return this._vocab;
  }

  // The most common tags among the records a search/filter matches ("Narrow
  // by"). Counted over at most FACET_SAMPLE matching records: `exact` says
  // whether that covered all of them (otherwise the counts are a ranking only).
  getTagFacets(type, query, filters = {}) {
    const isBonus = type === "bonuses" || type === "bonus";
    if (!this.hasTags) return { facets: [], exact: true, sampled: 0 };
    const table = isBonus ? "bonuses" : "tossups";
    const fts = isBonus ? "bonuses_fts" : "tossups_fts";
    const a = isBonus ? "b" : "t";
    const { where, params } = this._buildWhere(filters, a + ".", { isBonus });
    const FACET_SAMPLE = 25000;
    const base = query
      ? `SELECT ${a}.rowid AS rid FROM ${table} ${a} JOIN ${fts} ON ${a}.rowid = ${fts}.rowid WHERE ${fts} MATCH :query${where ? " AND " + where.substring(6) : ""}`
      : `SELECT ${a}.rowid AS rid FROM ${table} ${a} ${where}`;
    const run = (q) => {
      const p = q ? { ...params, query: q } : params;
      const n = this.db.prepare(`SELECT COUNT(*) AS n FROM (${base} LIMIT ${FACET_SAMPLE + 1})`).get(p).n;
      const rows = n ? this.db.prepare(
        `SELECT f.key AS fam, v.value AS val, COUNT(*) AS n FROM (${base} LIMIT ${FACET_SAMPLE}) s ` +
        `JOIN ${table} q ON q.rowid = s.rid, json_each(q.tags) f, json_each(f.value) v ` +
        `WHERE f.key IN ${TAG_FAMILY_SQL} AND v.type = 'text' GROUP BY 1, 2 ORDER BY n DESC LIMIT 30`).all(p) : [];
      return { facets: rows.map((r) => ({ fam: r.fam, val: r.val, n: r.n })), exact: n <= FACET_SAMPLE, sampled: Math.min(n, FACET_SAMPLE) };
    };
    try { return run(query || ""); }
    catch (e) {
      if (!query || !isFtsSyntaxError(e)) return { facets: [], exact: true, sampled: 0 };
      const safe = sanitizeFtsFallback(query);
      try { return safe ? run(safe) : { facets: [], exact: true, sampled: 0 }; } catch { return { facets: [], exact: true, sampled: 0 }; }
    }
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
