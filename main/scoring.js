export const POWER_POINTS = 15;
export const CORRECT_POINTS = 10;
export const NEG_POINTS = -5;

export function findPowerMark(questionText) {
  const idx = questionText.indexOf("(*)");
  if (idx !== -1) return idx;

  const htmlIdx = questionText.indexOf("<b>(*)</b>");
  if (htmlIdx !== -1) return htmlIdx;

  return -1;
}

export function calculateCelerity(buzzCharIndex, totalQuestionLength) {
  if (totalQuestionLength <= 0) return 1.0;
  const ratio = Math.max(0, Math.min(1, buzzCharIndex / totalQuestionLength));
  return Math.round(ratio * 1000) / 1000;
}

// (15.125) the power lasts until the first word after the mark starts: a buzz with "(*)" read but nothing of the next
// word (only the space after it, or an opening quote) is still a power. The index of that word's first letter or
// digit (the text's length when nothing follows), -1 without a mark. Positions count question_sanitized as stored,
// "(*)" included: a buzz at n has read the n characters before it.
export function powerLimit(questionText, markIdx) {
  const text = String(questionText || ""), i = markIdx == null ? findPowerMark(text) : markIdx;
  if (i < 0) return -1;
  const m = /[\p{L}\p{N}]/u.exec(text.slice(i + 3));
  return m ? i + 3 + m.index : text.length;
}

export function isPowerBuzz(buzzCharIndex, questionText) {
  const powerMarkIdx = findPowerMark(questionText);
  const isPower = powerMarkIdx >= 0 && buzzCharIndex <= powerLimit(questionText, powerMarkIdx);
  return { isPower, powerPosition: powerMarkIdx };
}

export function scoreTossup(params, checkerFn) {
  const { userAnswer, answerline, sanitizedAnswer, buzzCharIndex, questionText, fullyRead } = params;

  const result = checkerFn(userAnswer, answerline, sanitizedAnswer);
  const totalLength = questionText ? questionText.length : 1;

  if (!result.correct) {
    // A neg (-5) is only for interrupting before the question finishes. If the
    // question was fully read (no interrupt), a wrong/blank answer is just 0.
    return {
      points: fullyRead ? 0 : NEG_POINTS,
      isCorrect: false,
      isPower: false,
      celerity: calculateCelerity(buzzCharIndex, totalLength),
      buzzPosition: buzzCharIndex,
    };
  }

  const { isPower } = isPowerBuzz(buzzCharIndex, questionText);
  const celerity = calculateCelerity(buzzCharIndex, totalLength);

  return {
    points: isPower ? POWER_POINTS : CORRECT_POINTS,
    isCorrect: true,
    isPower,
    celerity,
    buzzPosition: buzzCharIndex,
  };
}

export function scoreBonus(partResults) {
  let totalPoints = 0;
  let partsCorrect = 0;
  const points = [];

  for (const part of partResults) {
    const earned = part.correct ? (part.points || 10) : 0;
    points.push(earned);
    totalPoints += earned;
    if (part.correct) partsCorrect++;
  }

  return { totalPoints, partsCorrect, points };
}
