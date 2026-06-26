import { DatabaseSync } from "node:sqlite";

export class QuestionDatabase {
  /**
   * @param {string} dbPath - Path to the SQLite question database
   */
  constructor(dbPath) {
    this.db = new DatabaseSync(dbPath, { open: true, readOnly: true });
    this.db.exec("PRAGMA journal_mode=OFF");
    this.db.exec("PRAGMA cache_size=-32000");
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

  // `prefix` (e.g. "t.") qualifies column names so the WHERE can be reused in a
  // JOIN where a column name exists in more than one table (FTS searches).
  // `opts.isBonus` skips tossup-only clauses (bonuses have no question_sanitized
  // and no powermarks).
  _buildWhere(filters = {}, prefix = "", opts = {}) {
    const clauses = [];
    const params = {};
    const col = (name) => prefix + name;

    if (filters.categories && filters.categories.length > 0) {
      const placeholders = filters.categories.map((_, i) => `:cat${i}`);
      clauses.push(`${col("category")} IN (${placeholders.join(",")})`);
      filters.categories.forEach((c, i) => {
        params[`cat${i}`] = c;
      });
    }

    // Subcategories and alternate-subcategories are a UNION: a question matches
    // if its subcategory is selected OR its alternate_subcategory is selected.
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

    if (filters.setNames && filters.setNames.length > 0) {
      const placeholders = filters.setNames.map((_, i) => `:set${i}`);
      clauses.push(`${col("set_name")} IN (${placeholders.join(",")})`);
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

    const orderBy = filters.random ? "ORDER BY RANDOM()" : "ORDER BY set_year DESC, set_name, question_number";

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

    const orderBy = filters.random ? "ORDER BY RANDOM()" : "ORDER BY set_year DESC, set_name, question_number";

    const countSql = `SELECT COUNT(*) as count FROM bonuses ${where}`;
    const countRow = this.db.prepare(countSql).get(params);
    const total = countRow ? countRow.count : 0;

    const sql = `SELECT * FROM bonuses ${where} ${orderBy} LIMIT :limit OFFSET :offset`;
    const rows = this.db.prepare(sql).all({ ...params, limit, offset });

    return { rows, total };
  }

  getRandomTossup(filters = {}) {
    const { where, params } = this._buildWhere(filters);
    if (!where) {
      const maxRow = this.db.prepare("SELECT MAX(rowid) as max FROM tossups").get();
      if (!maxRow || !maxRow.max) return undefined;
      const randomId = Math.floor(Math.random() * maxRow.max) + 1;
      return this.db.prepare("SELECT * FROM tossups WHERE rowid >= ? LIMIT 1").get(randomId);
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
    if (!where) {
      const maxRow = this.db.prepare("SELECT MAX(rowid) as max FROM bonuses").get();
      if (!maxRow || !maxRow.max) return undefined;
      const randomId = Math.floor(Math.random() * maxRow.max) + 1;
      return this.db.prepare("SELECT * FROM bonuses WHERE rowid >= ? LIMIT 1").get(randomId);
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
    // Qualify filter columns with "t." so they don't collide with the FTS table
    // (which also has category/subcategory/set_name columns).
    const { where, params } = this._buildWhere(filters, "t.");

    const fullWhere = where
      ? `tossups_fts MATCH :query AND ${where.substring(6)}`
      : "tossups_fts MATCH :query";

    const countSql = `
      SELECT COUNT(*) as count FROM tossups t
      JOIN tossups_fts ON t.rowid = tossups_fts.rowid
      WHERE ${fullWhere}`;
    const countRow = this.db.prepare(countSql).get({ ...params, query });
    const total = countRow ? countRow.count : 0;

    const sql = `
      SELECT t.* FROM tossups t
      JOIN tossups_fts ON t.rowid = tossups_fts.rowid
      WHERE ${fullWhere}
      ORDER BY rank
      LIMIT :limit OFFSET :offset
    `;
    const rows = this.db.prepare(sql).all({ ...params, query, limit, offset });

    return { rows, total };
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
    const countRow = this.db.prepare(countSql).get({ ...params, query });
    const total = countRow ? countRow.count : 0;

    const sql = `
      SELECT b.* FROM bonuses b
      JOIN bonuses_fts ON b.rowid = bonuses_fts.rowid
      WHERE ${fullWhere}
      ORDER BY rank
      LIMIT :limit OFFSET :offset
    `;
    const rows = this.db.prepare(sql).all({ ...params, query, limit, offset });

    return { rows, total };
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
    return this.db.prepare("SELECT * FROM sets ORDER BY year DESC, name").all();
  }

  getSetById(id) {
    return this.db.prepare("SELECT * FROM sets WHERE id = ?").get(id);
  }

  // Packets in a set (by name), for the Database set browser.
  getPacketsForSet(setName) {
    return this.db
      .prepare("SELECT DISTINCT packet_number, packet_name FROM tossups WHERE set_name = :s AND packet_number > 0 ORDER BY packet_number")
      .all({ s: setName });
  }

  // All tossups + bonuses in a specific packet of a set, in question order.
  getPacketContent(setName, packetNumber) {
    const tossups = this.db
      .prepare("SELECT * FROM tossups WHERE set_name = :s AND packet_number = :p ORDER BY question_number")
      .all({ s: setName, p: packetNumber });
    const bonuses = this.db
      .prepare("SELECT * FROM bonuses WHERE set_name = :s AND packet_number = :p ORDER BY question_number")
      .all({ s: setName, p: packetNumber });
    return { tossups, bonuses };
  }

  // Raw answer lines for a category/subcategory/alternate (for frequency, which
  // parses every acceptable answer out of each line).
  getAnswerLinesForFreq(category, subcategory, alternateSubcategory) {
    const params = {};
    let where = "WHERE answer_sanitized != ''";
    if (category) { where += " AND category = :cat"; params.cat = category; }
    if (subcategory) { where += " AND subcategory = :sub"; params.sub = subcategory; }
    if (alternateSubcategory) { where += " AND alternate_subcategory = :alt"; params.alt = alternateSubcategory; }
    return this.db.prepare(`SELECT answer, answer_sanitized FROM tossups ${where}`).all(params);
  }

  // Bonus answer lines (JSON arrays of 3 per row) for the frequency list.
  getBonusAnswerLinesForFreq(category, subcategory, alternateSubcategory) {
    const params = {};
    let where = "WHERE answers_sanitized != '' AND answers_sanitized != '[]'";
    if (category) { where += " AND category = :cat"; params.cat = category; }
    if (subcategory) { where += " AND subcategory = :sub"; params.sub = subcategory; }
    if (alternateSubcategory) { where += " AND alternate_subcategory = :alt"; params.alt = alternateSubcategory; }
    return this.db.prepare(`SELECT answers, answers_sanitized FROM bonuses ${where}`).all(params);
  }

  // Distinct packet numbers present for a set (by name), sorted ascending.
  getSetPacketNumbers(setName) {
    const rows = this.db
      .prepare("SELECT DISTINCT packet_number FROM tossups WHERE set_name = :s AND packet_number > 0 ORDER BY packet_number")
      .all({ s: setName });
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
