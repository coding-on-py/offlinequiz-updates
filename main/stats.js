export function computeStats(entries) {
  if (!entries || entries.length === 0) {
    return emptyStats();
  }

  const tossups = entries.filter((e) => e.type === "tossup");
  const bonuses = entries.filter((e) => e.type === "bonus");

  const stats = {
    totalQuestions: entries.length,
    tossupsAttempted: tossups.length,
    bonusesAttempted: bonuses.length,
    tossupAccuracy: 0,
    tossupTotalPoints: 0,
    tossupPowers: 0,
    tossupNegs: 0,
    tossupAvgCelerity: 0,
    totalTossupPoints: 0,
    bonusTotalPoints: 0,
    bonusPartsCorrect: 0,
    bonusPartsTotal: bonuses.length * 3,
    bonusConversion: 0,
    totalBonusPoints: 0,
    totalPoints: 0,
    averagePointsPerQuestion: 0,
    byCategory: {},
    byDifficulty: {},
    celerityDistribution: { power: [], early: [], mid: [], late: [], end: [] },
    questionsByDate: {},
    powerRate: 0,
    negRate: 0,
  };

  let tossupCorrect = 0;
  let totalCelerity = 0;
  let celerityCount = 0;

  for (const t of tossups) {
    if (t.correct) {
      tossupCorrect++;
      if (t.points === 15) {
        stats.tossupPowers++;
      }
    } else if (t.points < 0) {
      stats.tossupNegs++;
    }
    stats.totalTossupPoints += t.points;

    if (t.celerity !== null && t.celerity !== undefined) {
      totalCelerity += t.celerity;
      celerityCount++;

      if (t.celerity <= 0.2) stats.celerityDistribution.power.push(t);
      else if (t.celerity <= 0.4) stats.celerityDistribution.early.push(t);
      else if (t.celerity <= 0.6) stats.celerityDistribution.mid.push(t);
      else if (t.celerity <= 0.8) stats.celerityDistribution.late.push(t);
      else stats.celerityDistribution.end.push(t);
    }

    addToCategoryStats(stats.byCategory, t, "tossup");
    addToDifficultyStats(stats.byDifficulty, t, "tossup");
    addToDateStats(stats.questionsByDate, t);
  }

  let bonusTotalPts = 0;
  for (const b of bonuses) {
    bonusTotalPts += b.points;
    stats.bonusPartsCorrect += (b.bonus_parts_correct ?? b.bonusPartsCorrect) || 0;
    stats.totalBonusPoints += b.points;

    addToCategoryStats(stats.byCategory, b, "bonus");
    addToDifficultyStats(stats.byDifficulty, b, "bonus");
    addToDateStats(stats.questionsByDate, b);
  }

  stats.tossupAccuracy = tossups.length > 0 ? tossupCorrect / tossups.length : 0;
  stats.tossupsCorrect = tossupCorrect;
  stats.tossupTotalPoints = stats.totalTossupPoints;

  stats.bonusConversion = bonuses.length > 0 ? bonusTotalPts / bonuses.length : 0;
  stats.bonusTotalPoints = stats.totalBonusPoints;

  stats.totalPoints = stats.totalTossupPoints + stats.totalBonusPoints;
  stats.averagePointsPerQuestion =
    entries.length > 0 ? stats.totalPoints / entries.length : 0;

  stats.powerRate = tossups.length > 0 ? stats.tossupPowers / tossups.length : 0;
  stats.negRate = tossups.length > 0 ? stats.tossupNegs / tossups.length : 0;

  if (celerityCount > 0) {
    stats.tossupAvgCelerity = totalCelerity / celerityCount;
  }

  return stats;
}

function addToCategoryStats(byCategory, entry, type) {
  const cat = entry.category || "Unknown";
  if (!byCategory[cat]) {
    byCategory[cat] = {
      category: cat,
      tossupsAttempted: 0,
      tossupsCorrect: 0,
      tossupPoints: 0,
      tossupPowers: 0,
      tossupNegs: 0,
      celeritySum: 0,
      celerityCount: 0,
      bonusesAttempted: 0,
      bonusPoints: 0,
      bonusPartsCorrect: 0,
      totalQuestions: 0,
      totalPoints: 0,
    };
  }

  const c = byCategory[cat];
  if (type === "tossup") {
    c.tossupsAttempted++;
    c.totalQuestions++;
    if (entry.correct) c.tossupsCorrect++;
    if (entry.points === 15) c.tossupPowers++;
    if (entry.points < 0) c.tossupNegs++;
    if (entry.celerity != null) { c.celeritySum += entry.celerity; c.celerityCount++; }
    c.tossupPoints += entry.points;
    c.totalPoints += entry.points;
  } else {
    c.bonusesAttempted++;
    c.totalQuestions++;
    c.bonusPoints += entry.points;
    c.bonusPartsCorrect += (entry.bonus_parts_correct ?? entry.bonusPartsCorrect) || 0;
    c.totalPoints += entry.points;
  }
}

function addToDifficultyStats(byDifficulty, entry, type) {
  const diff = String(entry.difficulty || "?");
  if (!byDifficulty[diff]) {
    byDifficulty[diff] = {
      difficulty: diff,
      tossupsAttempted: 0,
      tossupsCorrect: 0,
      tossupPoints: 0,
      bonusesAttempted: 0,
      bonusPoints: 0,
      bonusPartsCorrect: 0,
      totalQuestions: 0,
      totalPoints: 0,
    };
  }

  const d = byDifficulty[diff];
  if (type === "tossup") {
    d.tossupsAttempted++;
    d.totalQuestions++;
    if (entry.correct) d.tossupsCorrect++;
    d.tossupPoints += entry.points;
    d.totalPoints += entry.points;
  } else {
    d.bonusesAttempted++;
    d.totalQuestions++;
    d.bonusPoints += entry.points;
    d.bonusPartsCorrect += (entry.bonus_parts_correct ?? entry.bonusPartsCorrect) || 0;
    d.totalPoints += entry.points;
  }
}

function addToDateStats(byDate, entry) {
  const date = new Date(entry.timestamp).toISOString().split("T")[0];
  if (!byDate[date]) {
    byDate[date] = { date, questions: 0, points: 0 };
  }
  byDate[date].questions++;
  byDate[date].points += entry.points;
}

export function emptyStats() {
  return {
    totalQuestions: 0,
    tossupsAttempted: 0,
    bonusesAttempted: 0,
    tossupsCorrect: 0,
    tossupAccuracy: 0,
    tossupTotalPoints: 0,
    tossupPowers: 0,
    tossupNegs: 0,
    tossupAvgCelerity: 0,
    totalTossupPoints: 0,
    bonusTotalPoints: 0,
    bonusPartsCorrect: 0,
    bonusPartsTotal: 0,
    bonusConversion: 0,
    totalBonusPoints: 0,
    totalPoints: 0,
    averagePointsPerQuestion: 0,
    byCategory: {},
    byDifficulty: {},
    celerityDistribution: { power: [], early: [], mid: [], late: [], end: [] },
    questionsByDate: {},
    powerRate: 0,
    negRate: 0,
  };
}






export function computeSessionBreakdown(sessionList, allEntries, filters = {}) {
  if (!sessionList || !allEntries) return [];

  const catFilter = filters.category || "";
  const diffFilter = filters.difficulty != null && filters.difficulty !== "" ? String(filters.difficulty) : "";
  const filtering = !!(catFilter || diffFilter);
  const matches = (e) =>
    (!catFilter || e.category === catFilter) &&
    (!diffFilter || String(e.difficulty) === diffFilter);

  const entryMap = {};
  for (const e of allEntries) {
    if (filtering && !matches(e)) continue;
    if (!entryMap[e.session_id]) entryMap[e.session_id] = [];
    entryMap[e.session_id].push(e);
  }

  const rows = sessionList.map(s => {
    const entries = entryMap[s.session_id] || [];
    const tossups = entries.filter(e => e.type === "tossup");
    let powers = 0, tens = 0, deads = 0, negs = 0, totalTUPts = 0;
    let correctCeleritySum = 0, correctCelerityCount = 0;
    let negCeleritySum = 0, negCelerityCount = 0;
    let buzzSum = 0;

    for (const t of tossups) {
      if (t.points === 15) { powers++; correctCeleritySum += t.celerity || 0; correctCelerityCount++; }
      else if (t.points === 10) { tens++; correctCeleritySum += t.celerity || 0; correctCelerityCount++; }
      else if (t.points === 0) { deads++; }
      else if (t.points < 0) { negs++; negCeleritySum += t.celerity || 0; negCelerityCount++; }
      totalTUPts += t.points;
      if (t.buzz_position != null) buzzSum += t.buzz_position;
    }

    const totalTU = tossups.length;
    const totalPoints = filtering ? entries.reduce((a, e) => a + (e.points || 0), 0) : s.total_points;
    const questionCount = filtering ? entries.length : s.question_count;
    return {
      sessionId: s.session_id,
      startedAt: s.started_at,
      questionCount,
      totalPoints,
      totalTU,
      powers,
      tens,
      deads,
      negs,
      powerRate: totalTU > 0 ? powers / totalTU : 0,
      negRate: totalTU > 0 ? negs / totalTU : 0,
      avgCorrectCelerity: correctCelerityCount > 0 ? correctCeleritySum / correctCelerityCount : 0,
      avgNegCelerity: negCelerityCount > 0 ? negCeleritySum / negCelerityCount : 0,
      avgBuzzPosition: totalTU > 0 ? buzzSum / totalTU : 0,
      pointsPerTU: totalTU > 0 ? totalTUPts / totalTU : 0,
      totalTUPts,
      entryCount: entries.length,
    };
  });

  return filtering ? rows.filter((r) => r.entryCount > 0) : rows;
}
