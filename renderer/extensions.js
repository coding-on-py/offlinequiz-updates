
;/* ── achievement-icons.js (bundled by build-update) ── */
/**
 * Achievement icons — the app's default: a minimal line icon drawn for every
 * achievement (a whale for Moby Dick, a raven for Poe, a crown for the House of
 * Capet …). This used to be the "Achievement Icons" plugin; it is built in now.
 * The original Chinese-character marks (each achievement's `icon`) became the
 * optional "Achievement Glyphs" plugin. A plugin's registerAchievementIcons()
 * still wins over these (app.js resolveAchievementIcon).
 */
(function () {
    var ICONS = {
    "q100": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M7 3H19.5v18H7A2.5 2.5 0 0 1 4.5 18.5v-13A2.5 2.5 0 0 1 7 3Z\"/><path d=\"M4.5 18.5A2.5 2.5 0 0 1 7 16H19.5\"/></svg>",
    "q300": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 6C10 4.2 7 3.5 4 3.5v14c3 0 6 0.7 8 2.5c2-1.8 5-2.5 8-2.5v-14c-3 0-6 0.7-8 2.5Z\"/><line x1=\"12\" y1=\"6\" x2=\"12\" y2=\"20\"/></svg>",
    "q500": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5.5\" y=\"5.5\" width=\"11.5\" height=\"4.5\" rx=\"1\"/><rect x=\"6.5\" y=\"10\" width=\"12.5\" height=\"4.5\" rx=\"1\"/><rect x=\"4.5\" y=\"14.5\" width=\"15\" height=\"4.5\" rx=\"1\"/></svg>",
    "q1000": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"4\" y=\"3.5\" width=\"16\" height=\"17\" rx=\"1.5\"/><line x1=\"4\" y1=\"12\" x2=\"20\" y2=\"12\"/><path d=\"M7.5 12V7.5M11 12V7M14.5 12V8M8.5 20.5V16M12 20.5v-5M15.5 20.5v-4.2\"/></svg>",
    "q2000": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"12 4 21 8.5 12 13 3 8.5\"/><path d=\"M7 11v3.8c0 1.6 2.2 2.9 5 2.9s5-1.3 5-2.9V11\"/><line x1=\"21\" y1=\"8.5\" x2=\"21\" y2=\"13.8\"/><circle cx=\"21\" cy=\"15\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "q3000": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M8 4h8v5.5a4 4 0 0 1-8 0V4Z\"/><path d=\"M8 5.5H5.4a2.1 2.1 0 0 0 0 4.2H8M16 5.5h2.6a2.1 2.1 0 0 1 0 4.2H16\"/><line x1=\"12\" y1=\"13.5\" x2=\"12\" y2=\"17.5\"/><path d=\"M9 17.5h6l1.2 3H7.8Z\"/></svg>",
    "q5000": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 20L9.5 8.5l3 5.5L16.5 6 21 20Z\"/><line x1=\"16.5\" y1=\"6\" x2=\"16.5\" y2=\"2.5\"/><polygon points=\"16.5 2.5 20 3.6 16.5 4.7\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "q10000": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"8.5\" r=\"3.5\"/><path d=\"M12 2.5v2M7.4 3.9l1.3 1.3M16.6 3.9l-1.3 1.3M5.5 8.5h2M18.5 8.5h-2M7.4 13.1l1.3-1.3M16.6 13.1l-1.3-1.3\"/><line x1=\"4\" y1=\"20\" x2=\"20\" y2=\"20\"/></svg>",
    "pwr50": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"12.8,2.5 4.5,13.5 11,13.5 10.2,21.5 19.5,10.5 12,10.5\"/></svg>",
    "pwr100": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"8,3 4,10.5 7.2,10.5 6.2,17 12,9.5 8.6,9.5\"/><polygon points=\"17.5,7.5 13.5,15 16.7,15 15.7,21.5 21.5,14 18.1,14\"/></svg>",
    "pwr250": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18.6 15.4 A4.5 4.5 0 0 0 17.4 6.6 H16.2 A7 7 0 1 0 6 14.6\"/><polyline points=\"12.5,10.5 9,16 14,16 11,21.5\"/></svg>",
    "pwr500": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"2.5\" y=\"8\" width=\"16\" height=\"8\" rx=\"2\"/><line x1=\"21\" y1=\"10.6\" x2=\"21\" y2=\"13.4\"/><polygon points=\"11.6,9.4 8.9,12.6 10.9,12.6 10.3,14.7 13.3,11.6 11.6,11.6\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "pwr999": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"16\" r=\"3.4\"/><path d=\"M12.2 12.2 L20.6 3.8 M9.4 10.2 L14.8 4.8 M14.6 15.4 L20.2 9.8\"/><circle cx=\"8\" cy=\"16\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "neg100": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"8\" width=\"18\" height=\"8\" rx=\"4\"/><path d=\"M9 8 V16 M15 8 V16\"/><circle cx=\"10.9\" cy=\"12\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"13.1\" cy=\"12\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "neg300": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3.5 C8.2 3.5 5.5 8.8 5.5 13.3 C5.5 17.4 8.4 20.5 12 20.5 C15.6 20.5 18.5 17.4 18.5 13.3 C18.5 8.8 15.8 3.5 12 3.5 Z\"/><polyline points=\"5.8 11.6 9 12.9 11.3 10.3 13.6 12.9 15.9 10.6 18.2 11.6\"/></svg>",
    "neg500": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 16 A8 8 0 0 1 16.6 9.4 L15 11.9 L18.1 10.9 A8 8 0 0 1 20 16 M12 8 V6\"/><circle cx=\"12\" cy=\"4.8\" r=\"1.2\"/><line x1=\"3\" y1=\"16\" x2=\"21\" y2=\"16\"/><path d=\"M18.8 7 L20 5.6 M20.8 10 L21.9 9.5\"/></svg>",
    "neg1000": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 14 C10.2 11 10 8 10.4 4.6 L13.6 4.6 C14 8 13.8 11 12 14 Z\"/><path d=\"M12 14 C8.5 11.5 4.8 13 3 18.5 C6.8 17.8 9.8 16.8 12 14 Z\"/><path d=\"M12 14 C15.5 11.5 19.2 13 21 18.5 C17.2 17.8 14.2 16.8 12 14 Z\"/></svg>",
    "cat100": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"10.5\" cy=\"10.5\" r=\"7\"/><line x1=\"15.5\" y1=\"15.5\" x2=\"20.5\" y2=\"20.5\"/></svg>",
    "cat300": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"11\" cy=\"13\" r=\"8\"/><circle cx=\"11\" cy=\"13\" r=\"4\"/><path d=\"M21 3 11 13M14.2 12.1 11 13 11.9 9.8\"/></svg>",
    "cat500": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9 3h4v6l-1 2h-2l-1-2z\"/><path d=\"M14 21a6.5 6.5 0 1 0 0-13h-1\"/><line x1=\"6\" y1=\"15\" x2=\"13\" y2=\"15\"/><line x1=\"4\" y1=\"21\" x2=\"16\" y2=\"21\"/></svg>",
    "cat1000": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M8 6A8 8 0 0 1 20 14A20 20 0 0 0 8 6Z\"/><line x1=\"15\" y1=\"8.5\" x2=\"4\" y2=\"19.5\"/></svg>",
    "day25": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"/><path d=\"M7.5 18a4.5 4.5 0 0 1 9 0\"/><path d=\"M12 5v3.5M4.6 10.6l2.5 2.5M19.4 10.6l-2.5 2.5\"/></svg>",
    "day50": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5.5 9.5h10v6.5a4 4 0 0 1-4 4h-2a4 4 0 0 1-4-4z\"/><path d=\"M15.5 11h1.7a2.6 2.6 0 0 1 0 5.2h-1.7\"/><path d=\"M8.5 6.5c-.6-1 .6-1.5 0-2.7M12.5 6.5c-.6-1 .6-1.5 0-2.7\"/></svg>",
    "day100": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><polyline points=\"12 7.5 12 12 15.5 14\"/><circle cx=\"12\" cy=\"12\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "day200": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"4\" y=\"5\" width=\"16\" height=\"16\" rx=\"2\"/><line x1=\"4\" y1=\"9.5\" x2=\"20\" y2=\"9.5\"/><path d=\"M8 3v3.5M16 3v3.5\"/><polygon points=\"12 12.5 12.7 14.4 14.8 14.5 13.2 15.8 13.7 17.8 12 16.7 10.3 17.8 10.8 15.8 9.2 14.5 11.3 14.4\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "day300": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><line x1=\"6\" y1=\"3\" x2=\"18\" y2=\"3\"/><line x1=\"6\" y1=\"21\" x2=\"18\" y2=\"21\"/><path d=\"M7.5 3v3.2l4.5 5.8 4.5-5.8V3M7.5 21v-3.2l4.5-5.8 4.5 5.8V21\"/><polygon points=\"12 16.8 14.6 20.2 9.4 20.2\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "day500": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M7 3.5l1 2.8a8 8 0 1 0 8 0l1-2.8q-5 2.4-10 0z\"/><path d=\"M11.3 10a2.1 2.1 0 1 0-4.2 0 2.1 2.1 0 0 0 4.2 0M16.9 10a2.1 2.1 0 1 0-4.2 0 2.1 2.1 0 0 0 4.2 0M10.9 13l1.1 1.4 1.1-1.4\"/><circle cx=\"9.2\" cy=\"10\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.8\" cy=\"10\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "streak3": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M13.5 4.5 C13.7 6.8 14.8 8.4 15.8 10.2 C16.3 11.2 16.5 12.6 16.5 14.5 a4.5 4.5 0 0 1 -9 0 C7.5 10.5 11 8 13.5 4.5 Z\"/><circle cx=\"12\" cy=\"15\" r=\"1.4\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "streak7": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 2.5 C9.8 6.5 6 9.5 6 14 a6 6 0 0 0 12 0 C18 9.5 14.2 6.5 12 2.5 Z\"/><path d=\"M12 10.5 C10.8 12.2 9.2 13.6 9.2 15.2 a2.8 2.8 0 0 0 5.6 0 C14.8 13.6 13.2 12.2 12 10.5 Z\"/></svg>",
    "streak14": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"2.5\" y=\"6\" width=\"12\" height=\"8\" rx=\"4\"/><rect x=\"9.5\" y=\"10\" width=\"12\" height=\"8\" rx=\"4\"/></svg>",
    "streak30": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"8.5\" rx=\"2\"/><path d=\"M8.5 11 V8 a3.5 3.5 0 0 1 7 0 V11\"/><circle cx=\"12\" cy=\"15.2\" r=\"1.5\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "cat3333_History": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M19 17V6a2 2 0 0 0-2-2H6\"/><path d=\"M6 17V6a2 2 0 1 0-4 0v1\"/><path d=\"M6 17v1a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1h-8\"/></svg>",
    "cat3333_Literature": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 6C10 4.4 7 4 4 4v14c3 0 6 .4 8 2 2-1.6 5-2 8-2V4c-3 0-6 .4-8 2z\"/><line x1=\"12\" y1=\"6\" x2=\"12\" y2=\"20\"/></svg>",
    "cat3333_Science": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 3v6.5a2 2 0 0 1-.2.9l-4.8 9.6a1 1 0 0 0 .9 1.5h12.2a1 1 0 0 0 .9-1.5l-4.8-9.6a2 2 0 0 1-.2-.9V3\"/><line x1=\"8.5\" y1=\"3\" x2=\"15.5\" y2=\"3\"/><line x1=\"7.5\" y1=\"15.5\" x2=\"16.5\" y2=\"15.5\"/><circle cx=\"12\" cy=\"18.5\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "cat3333_Fine Arts": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 21.5a9.5 9.5 0 1 1 9.5-9.5c0 2.5-2 4.5-4.5 4.5h-2a1.6 1.6 0 0 0-1.2 2.7c.4.5.2 2.3-.8 2.3z\"/><circle cx=\"7.5\" cy=\"9.5\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"13\" cy=\"6.5\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "cat3333_Religion": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4.5 18.5H12a8 8 0 0 0 8-8V8a4 4 0 0 0-7.3-2.2L4.5 18.5z\"/><path d=\"M20 7.2l2 .6-2 .6\"/><path d=\"M7.5 18.5a6 6 0 0 0 3.8-10.6\"/><circle cx=\"16.4\" cy=\"7.4\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "cat3333_Mythology": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M7 4.5V11a5 5 0 0 0 10 0V4.5\"/><path d=\"M7 4.5C5.6 4 5.6 2.6 6.8 2.2M17 4.5c1.4-.5 1.4-1.9.2-2.3\"/><path d=\"M7 7h10M9.8 12.3h4.4\"/><path d=\"M10.3 7v5.3M13.7 7v5.3\"/></svg>",
    "cat3333_Philosophy": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 8.5L12 3l8.5 5.5z\"/><line x1=\"4.5\" y1=\"11.5\" x2=\"19.5\" y2=\"11.5\"/><path d=\"M6.5 11.5v6.5M10.3 11.5v6.5M13.7 11.5v6.5M17.5 11.5v6.5\"/><path d=\"M4 20.5h16\"/></svg>",
    "cat3333_Current Events": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4.5 21.5H19a2.5 2.5 0 0 0 2.5-2.5V5A2.5 2.5 0 0 0 19 2.5H9A2.5 2.5 0 0 0 6.5 5v14.5a2 2 0 1 1-4 0V15h4\"/><rect x=\"10\" y=\"6.5\" width=\"8\" height=\"4.5\" rx=\"1\"/><path d=\"M10 14.5h8M10 18h5\"/></svg>",
    "cat3333_Geography": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><ellipse cx=\"12\" cy=\"12\" rx=\"4\" ry=\"9\"/><line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"/></svg>",
    "cat3333_Math": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"6\" y=\"2.5\" width=\"12\" height=\"19\" rx=\"2\"/><rect x=\"9\" y=\"5.5\" width=\"6\" height=\"3.5\" rx=\"0.8\"/><path d=\"M9.5 12.5h.01M14.5 12.5h.01M9.5 15.5h.01M14.5 15.5h.01M9.5 18.5h.01M14.5 18.5h.01\"/></svg>",
    "cat3333_Computer Science": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"4.5\" width=\"18\" height=\"15\" rx=\"2\"/><polyline points=\"7,9.5 10.5,12 7,14.5\"/><line x1=\"12.5\" y1=\"15\" x2=\"16.5\" y2=\"15\"/></svg>",
    "cat3333_Trash": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"7.5\" width=\"18\" height=\"9.5\" rx=\"4.75\"/><path d=\"M8.2 10.2v4.6M5.9 12.5h4.6\"/><circle cx=\"15.3\" cy=\"11\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"17.7\" cy=\"14\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-lit-mobydih": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 12.5C3 8.5 6.5 6.5 10.5 6.5s7 2.5 7 5.5c0 3-2.5 5-6.5 5H6.5C4.3 17 3 15.2 3 12.5Z\"/><polyline points=\"21.5 8.5 17.5 12 21.5 15.5\"/><circle cx=\"6.8\" cy=\"11\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-lit-hope": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M19.5 12.5a6 6 0 0 0-8.5-8.5L6 9.5V17.5h8z\"/><line x1=\"16\" y1=\"8\" x2=\"3.5\" y2=\"20.5\"/><line x1=\"17\" y1=\"15\" x2=\"9.5\" y2=\"15\"/></svg>",
    "ap-lit-raven": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4.5 8.5 8 6.4C10.4 5 13 6.4 13 9c0 2 1.4 3.4 3.4 4.6l3.4 2-6.4.1c-3.4 0-5.4-2-5.4-5V9Z\"/><path d=\"M3 18.5h18M11 14.8v3.7M13.5 15.5v3\"/><circle cx=\"9.3\" cy=\"8.2\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-lit-shore": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"13\" rx=\"4.6\" ry=\"6\"/><line x1=\"12\" y1=\"7\" x2=\"12\" y2=\"19\"/><path d=\"M7.8 10.6 4.6 8.9M7.4 13.5H4M8.2 16.6 5.2 18.6M16.2 10.6l3.2-1.7M16.6 13.5H20M15.8 16.6l3 2M10.4 7.5 8.8 4.6M13.6 7.5l1.6-2.9\"/></svg>",
    "ap-lit-pewpew": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 7.5h18v4h-8.5l-2 6H4l2.8-6H3z\"/><path d=\"M13.2 11.5v1.7c0 1.2 1 2.1 2.1 2.1h.9v-3.8\"/></svg>",
    "ap-lit-pottery": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><line x1=\"7.5\" y1=\"4.5\" x2=\"16.5\" y2=\"4.5\"/><path d=\"M9 4.5c1 3.5-3 4.5-3 8.5 0 3.5 2.6 6 6 6s6-2.5 6-6c0-4-4-5-3-8.5\"/><path d=\"M8.7 6.5C5.8 6.8 5 9.4 6.6 11M15.3 6.5c2.9.3 3.7 2.9 2.1 4.5\"/><line x1=\"8.5\" y1=\"20.5\" x2=\"15.5\" y2=\"20.5\"/></svg>",
    "ap-lit-inimitable": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5.5 14.5h13M7.5 14.5l1 5h7l1-5\"/><path d=\"M20.5 3.5c-5 .4-8 3.4-9.2 8.1M20.5 3.5c-.4 5-3.4 8-8.1 9.2M11.3 11.6 10 14.5\"/></svg>",
    "ap-lit-dear": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4.5 15a7.5 7.5 0 0 1 15 0\"/><path d=\"M3 15.2c3 1.6 15 1.6 18 0\"/><path d=\"M6 12.6c3.6 1.7 8.4 1.7 12 0M17 16.3c.6 1.6.8 3 .5 4.2M19.8 16c.6 1.5.7 3 .3 4.3\"/></svg>",
    "ap-lit-bronte": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"4\" y=\"4.5\" width=\"7\" height=\"15\" rx=\"1\"/><rect x=\"13\" y=\"4.5\" width=\"7\" height=\"15\" rx=\"1\"/><path d=\"M6.8 4.5v15M15.8 4.5v15\"/></svg>",
    "ap-lit-beowulf": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 13h18c-1 3.6-4.5 6-9 6s-8-2.4-9-6z\"/><path d=\"M3.5 12.5C2.6 8.6 4.4 5.4 8 4.4C6 6 5.4 8.4 6.9 10.1\"/><rect x=\"10.8\" y=\"3.5\" width=\"8\" height=\"6.5\"/><line x1=\"14.8\" y1=\"10\" x2=\"14.8\" y2=\"13\"/></svg>",
    "ap-lit-magical": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"13.2\" rx=\"1.3\" ry=\"4.2\"/><path d=\"M10.8 11.2C8.4 6.8 4 5.8 3.2 8.2c-.7 2.2 2 4.1 5.3 4.5-3 .6-4.9 2.6-4 4.7 1 2.3 4.6 1 6.3-2.4\"/><path d=\"M13.2 11.2C15.6 6.8 20 5.8 20.8 8.2c.7 2.2-2 4.1-5.3 4.5 3 .6 4.9 2.6 4 4.7-1 2.3-4.6 1-6.3-2.4\"/><path d=\"M11.2 9.4C10.4 7.6 9.4 6.4 8.2 5.6M12.8 9.4c.8-1.8 1.8-3 3-3.8\"/></svg>",
    "ap-lit-norwegian": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"13\" r=\"6.5\"/><path d=\"M7.2 8.6 5.6 3.4 10.6 6.7M16.8 8.6 18.4 3.4 13.4 6.7M2.2 12.2l4 .5M2.2 15.9l4-.5M21.8 12.2l-4 .5M21.8 15.9l-4-.5\"/><circle cx=\"9.5\" cy=\"12.2\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.5\" cy=\"12.2\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-lit-dante": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10.5 12a1.5 1.5 0 0 1 3 0 3 3 0 0 1-6 0 4.5 4.5 0 0 1 9 0 6 6 0 0 1-12 0 7.5 7.5 0 0 1 15 0\"/></svg>",
    "ap-lit-paradise": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 8.2C13.4 6 16.5 5.4 18.5 7.3c.8.8 1.3 1.7 1.5 2.7a2.9 2.9 0 0 0-3.1 2.5 2.9 2.9 0 0 0 2.2 3.2c-.5 1.9-1.6 3.7-3.1 5-1.3 1-2.6 1.2-3.4.5-.3-.3-.7-.3-1 0-.8.7-2.1.5-3.4-.5C5.2 18.9 3.5 15.7 3.5 12.7c0-3.4 2.2-5.9 4.9-5.9 1.5 0 2.7.6 3.6 1.4z\"/><path d=\"M12 8.2C12 6.2 12.6 4.6 13.8 3.4\"/><path d=\"M13.6 5.6c1.3-1.6 3.3-2 4.8-1.2-.7 1.7-2.8 2.3-4.8 1.2z\"/></svg>",
    "ap-lit-twelfth": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 5.5c3-1 6-1 9 0v4c0 3.6-1.5 6.6-4.5 8.2C4.5 16.1 3 13.1 3 9.5z\"/><path d=\"M13.5 7c2.9-1 5.7-1 8.5 0v4c0 3.5-1.4 6.4-4.25 8-2.85-1.6-4.25-4.5-4.25-8z\"/><path d=\"M5.7 8.4h1.4M8.4 8.4h1.4M5.7 10.7c.7 1.7 2.9 1.7 3.6 0M16 9.9h1.3M18.5 9.9h1.3M16 13.8c.65-1.6 2.85-1.6 3.5 0\"/></svg>",
    "ap-hist-wars": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4.5 4.5 19 19M14.5 19.5l5-5\"/><path d=\"M19.5 4.5 5 19M4.5 14.5l5 5\"/></svg>",
    "ap-hist-teto": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"12 2.5 14.9 8.6 21.5 9.2 16.6 13.8 18.1 20.5 12 17 5.9 20.5 7.4 13.8 2.5 9.2 9.1 8.6\"/></svg>",
    "ap-hist-memento": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 11a7 7 0 0 1 14 0v3a3 3 0 0 1-3 3v3H8v-3a3 3 0 0 1-3-3z\"/><circle cx=\"9.4\" cy=\"12.3\" r=\"1.4\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.6\" cy=\"12.3\" r=\"1.4\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-hist-alexander": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 21v-7a6 6 0 0 1 12 0v7\"/><path d=\"M6 21h3.5v-6h5v6H18\"/><path d=\"M8 9.5a4.35 4.35 0 1 1 8 0\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"18.5\"/></svg>",
    "ap-hist-grant": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5.5 14v-2.3C5.5 8.3 8.4 6.2 12 6.2s6.5 2.1 6.5 5.5V14\"/><line x1=\"4\" y1=\"14\" x2=\"20\" y2=\"14\"/><path d=\"M7.5 14c0 2.3 2 3.9 4.5 3.9s4.5-1.6 4.5-3.9\"/><circle cx=\"12\" cy=\"10.5\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-hist-luther": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5.5 21V10a6.5 6.5 0 0 1 13 0v11\"/><line x1=\"4\" y1=\"21\" x2=\"20\" y2=\"21\"/><rect x=\"9.5\" y=\"9.5\" width=\"5\" height=\"6.5\"/><circle cx=\"12\" cy=\"10.7\" r=\"0.8\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-hist-capet": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4.5 18.5 3 8.5l5 4.5 4-7 4 7 5-4.5-1.5 10z\"/><circle cx=\"12\" cy=\"15.5\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-hist-union": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3.5\" y=\"6\" width=\"17\" height=\"12\"/><path d=\"M12 6v12M3.5 12h17\"/><path d=\"M3.5 6l17 12M20.5 6l-17 12\"/></svg>",
    "ap-hist-autumn": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 6h6l-1.5 4 1.5 4-1.5 4H4z\"/><path d=\"M20 6h-6l1.5 4-1.5 4 1.5 4h5z\"/><path d=\"M4 10h3.3M4 14h4.2M16.7 10H20M15 14h5\"/><rect x=\"10.9\" y=\"15.6\" width=\"2.4\" height=\"2.4\"/></svg>",
    "ap-hist-fdj": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"9\" r=\"3.2\"/><line x1=\"9.1\" y1=\"9.8\" x2=\"14.9\" y2=\"9.8\"/><line x1=\"12\" y1=\"5.8\" x2=\"12\" y2=\"2.5\"/><path d=\"M10.6 21 12 12.2l1.4 8.8\"/></svg>",
    "ap-hist-bismarck": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 16c0-6.5 3-10 7-10s7 3.5 7 10\"/><path d=\"M3.5 16c2.5 1.6 14.5 1.6 17 0\"/><line x1=\"12\" y1=\"6\" x2=\"12\" y2=\"3.6\"/><circle cx=\"12\" cy=\"3.2\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-hist-dynasty": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3v2M5 9c2.3-.7 4-4 7-4s4.7 3.3 7 4\"/><path d=\"M9 6.6v5.2M15 6.6v5.2\"/><path d=\"M3.5 15c2.8-.8 5-3.5 8.5-3.5s5.7 2.7 8.5 3.5\"/><path d=\"M8.5 13.2V19M15.5 13.2V19M6 19h12\"/></svg>",
    "ap-hist-treatises": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5.5\" y=\"3\" width=\"13\" height=\"18\" rx=\"1.5\"/><path d=\"M9 7.5h6M9 11h6\"/><circle cx=\"14.5\" cy=\"16.5\" r=\"2.2\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M13.6 18.4 12.8 20.9M15.4 18.4l.8 2.5\"/></svg>",
    "ap-hist-sun": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"8.5\"/><ellipse cx=\"12\" cy=\"12\" rx=\"3.8\" ry=\"8.5\"/><line x1=\"3.5\" y1=\"12\" x2=\"20.5\" y2=\"12\"/></svg>",
    "ap-hist-japan": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 5q8.5 2.5 17 0\"/><line x1=\"5.5\" y1=\"9.8\" x2=\"18.5\" y2=\"9.8\"/><path d=\"M7 5.9V21M17 5.9V21\"/><line x1=\"12\" y1=\"6.3\" x2=\"12\" y2=\"9.8\"/></svg>",
    "ap-hist-mansa": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 19.5h7.5L9.4 15H5.1z\"/><path d=\"M13 19.5h7.5L18.9 15h-4.3z\"/><path d=\"M8.2 14h7.6L14.2 9.5H9.8z\"/><path d=\"M18.5 3.5v4M16.5 5.5h4\"/></svg>",
    "ap-hist-sunking": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"4.6\"/><path d=\"M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.9 1.9M16.6 16.6l1.9 1.9M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9\"/><path d=\"M10.2 11h.01M13.8 11h.01\"/><path d=\"M10.3 13.4c.9 1 2.5 1 3.4 0\"/></svg>",
    "ap-hist-thatcher": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 3h4v3c0 2 2 2.2 2 4.2v9.3a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 8 19.5v-9.3c0-2 2-2.2 2-4.2z\"/><line x1=\"10\" y1=\"5.2\" x2=\"14\" y2=\"5.2\"/><line x1=\"8\" y1=\"12.5\" x2=\"16\" y2=\"12.5\"/></svg>",
    "ap-hist-genghis": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 5.5q11-3 14.5 14.5\"/><line x1=\"4\" y1=\"5.5\" x2=\"18.5\" y2=\"20\"/><path d=\"M9.5 14.5 20.5 3.5m0 0h-3.6m3.6 0v3.6\"/></svg>",
    "ap-hist-workers": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><line x1=\"6\" y1=\"21\" x2=\"6\" y2=\"3\"/><path d=\"M6 4c3-1.5 5.5 1.5 8.5 0 2-1 3.5-.5 4.5.3v8c-1-.8-2.5-1.3-4.5-.3-3 1.5-5.5-1.5-8.5 0z\"/><polygon points=\"12 5.2 12.7 7.1 14.7 7.1 13.1 8.4 13.7 10.3 12 9.1 10.3 10.3 10.9 8.4 9.3 7.1 11.3 7.1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-geo-siberia": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><line x1=\"12\" y1=\"3\" x2=\"12\" y2=\"21\"/><line x1=\"4.2\" y1=\"7.5\" x2=\"19.8\" y2=\"16.5\"/><line x1=\"19.8\" y1=\"7.5\" x2=\"4.2\" y2=\"16.5\"/><path d=\"M9.8 5.6 L12 7.8 L14.2 5.6 M9.8 18.4 L12 16.2 L14.2 18.4\"/></svg>",
    "ap-geo-newfin": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M8.5 16 C8.3 10.5 10 6.5 15.5 4.5 C13.8 8.5 14.4 12.5 16 16\"/><path d=\"M3 16 C4.5 14 6 14 7.5 16 C9 18 10.5 18 12 16 C13.5 14 15 14 16.5 16 C18 18 19.5 18 21 16\"/></svg>",
    "ap-geo-mormon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 20 V10 C6 4.8 18 4.8 18 10 V20\"/><path d=\"M9.7 20 V12.8 C9.7 9.2 14.3 9.2 14.3 12.8 V20\"/><line x1=\"3\" y1=\"20\" x2=\"21\" y2=\"20\"/></svg>",
    "ap-geo-faithful": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6 20 C8 17.5 9.5 16.5 12 16.5 C14.5 16.5 16 17.5 18 20\"/><path d=\"M12 15.5 V4 M10.8 14.5 C9 11 8.3 8 8.2 4.8 M13.2 14.5 C15 11 15.7 8 15.8 4.8\"/><circle cx=\"5.8\" cy=\"7.5\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"18.2\" cy=\"7.5\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-geo-carnival": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"4.2\" r=\"1.6\"/><path d=\"M4.5 10.2 C5 9.4 5.7 9.2 6.6 9.2 L17.4 9.2 C18.3 9.2 19 9.4 19.5 10.2\"/><path d=\"M12 6.6 V16.5 M9.6 16.5 L8.5 21 L15.5 21 L14.4 16.5 Z\"/></svg>",
    "ap-geo-lion": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 5 Q15.8 2.8 16.9 7.1 Q21.2 8.2 19 12 Q21.2 15.8 16.9 16.9 Q15.8 21.2 12 19 Q8.2 21.2 7.1 16.9 Q2.8 15.8 5 12 Q2.8 8.2 7.1 7.1 Q8.2 2.8 12 5 Z\"/><path d=\"M17 12 A5 5 0 1 1 7 12 A5 5 0 1 1 17 12 M11.2 13.6 L12 14.5 L12.8 13.6\"/><circle cx=\"10.2\" cy=\"11.2\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"13.8\" cy=\"11.2\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-geo-harbour": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 15.5 H20.5 L18 19.5 H6 Z\"/><path d=\"M12 15.5 V3 M12 4 C17 5.5 19.5 9.5 18.2 15.5 M12 6 C8.5 7.5 7 10.5 7.5 15.5\"/><path d=\"M12 8.5 L18 10 M12 11.5 L18.1 12.8 M12 9 L8.3 9.6\"/></svg>",
    "ap-geo-capitals": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"8.8\" y=\"7\" width=\"6.4\" height=\"13\"/><path d=\"M8.8 7 L12 2.8 L15.2 7\"/><circle cx=\"12\" cy=\"11.2\" r=\"2.2\"/><path d=\"M10.6 20 V18.8 C10.6 17.5 13.4 17.5 13.4 18.8 V20\"/></svg>",
    "ap-geo-pearl": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 2.8 V6 M12 10 V12.1\"/><circle cx=\"12\" cy=\"8\" r=\"2\"/><circle cx=\"12\" cy=\"15.3\" r=\"3.2\"/><path d=\"M10 17.8 L7.5 21 M14 17.8 L16.5 21 M5.5 21 H18.5\"/></svg>",
    "ap-geo-snow": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polyline points=\"2.5 19 8 8 11.5 14 15.5 4.5 21.5 19\"/><path d=\"M13.4 9.4 L15.5 11.4 L17.6 9.4\"/><circle cx=\"4.5\" cy=\"4.5\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"19\" cy=\"6\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-geo-penguins": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3.5 C8 3.5 6.2 8 6.2 12.8 C6.2 17.8 8.6 20.5 12 20.5 C15.4 20.5 17.8 17.8 17.8 12.8 C17.8 8 16 3.5 12 3.5 Z M5.9 11.5 C4.6 13.4 4.7 15.4 6 17 M18.1 11.5 C19.4 13.4 19.3 15.4 18 17\"/><path d=\"M10.7 8.4 L12 9.8 L13.3 8.4\"/><circle cx=\"10\" cy=\"6.9\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14\" cy=\"6.9\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-geo-arteries": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M7 2.5 C7 7 14.5 7.5 14.5 12 C14.5 16.5 7 17 7 21.5\"/><path d=\"M12.5 2.5 C12.5 6 21 7.5 21 12 C21 16.5 12.5 18 12.5 21.5\"/></svg>",
    "ap-geo-potassium": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5.2 5 C4.2 13.8 11 20.4 19.6 19.2 L20 16.6 C13.4 16.9 8.6 11.6 8.4 4.7 Z\"/><path d=\"M6.9 4.8 L7.3 2.9\"/></svg>",
    "ap-geo-stans": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"9.5\" y=\"3\" width=\"5\" height=\"9.5\" rx=\"2.5\"/><path d=\"M6.5 10 V11.5 C6.5 15.2 8.9 17.2 12 17.2 C15.1 17.2 17.5 15.2 17.5 11.5 V10\"/><line x1=\"12\" y1=\"17.2\" x2=\"12\" y2=\"21\"/><line x1=\"8.5\" y1=\"21\" x2=\"15.5\" y2=\"21\"/></svg>",
    "ap-geo-seas": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 6.5 C4.5 4.5 7.5 4.5 9 6.5 C10.5 8.5 13.5 8.5 15 6.5 C16.5 4.5 19.5 4.5 21 6.5\"/><path d=\"M3 12 C4.5 10 7.5 10 9 12 C10.5 14 13.5 14 15 12 C16.5 10 19.5 10 21 12\"/><path d=\"M3 17.5 C4.5 15.5 7.5 15.5 9 17.5 C10.5 19.5 13.5 19.5 15 17.5 C16.5 15.5 19.5 15.5 21 17.5\"/></svg>",
    "ap-sci-alloys": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"3,20 21,20 19,16 5,16\"/><polygon points=\"6,16 18,16 16,12 8,12\"/><polygon points=\"9,12 15,12 14,8 10,8\"/></svg>",
    "ap-sci-mito": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"12\" rx=\"9\" ry=\"5.5\"/><path d=\"M4.5,12 Q7,8 9.5,12 Q12,16 14.5,12 Q17,8 19.5,12\"/></svg>",
    "ap-sci-blackhole": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"12\" rx=\"9.5\" ry=\"4\"/><circle cx=\"12\" cy=\"12\" r=\"3.2\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-nobel": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9.5,3 L11,9.5 M14.5,3 L13,9.5\"/><circle cx=\"12\" cy=\"14\" r=\"5\"/><circle cx=\"12\" cy=\"14\" r=\"1.4\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-dna": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9,3 C15,7 15,9 9,12 C3,15 3,17 9,21\"/><path d=\"M15,3 C9,7 9,9 15,12 C21,15 21,17 15,21\"/><path d=\"M10,7 L14,7 M9.5,12 L14.5,12 M10,17 L14,17\"/></svg>",
    "ap-sci-gut": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M9,3 C9,6 9,7 11,7 C6,8 4,13 7,16 C10,19 16,18 16,13 C16,11 15,10 13,10.5\"/></svg>",
    "ap-sci-ideal": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"6\" y=\"4\" width=\"12\" height=\"16\" rx=\"1.5\"/><circle cx=\"10\" cy=\"9\" r=\"1.6\"/><circle cx=\"14\" cy=\"14\" r=\"1.6\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"9\" cy=\"15\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-em": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6,5 L6,13 A6,6 0 0 1 18,13 L18,5 L15,5 L15,13 A3,3 0 0 1 9,13 L9,5 Z\"/><rect x=\"6\" y=\"3.5\" width=\"3\" height=\"2\" fill=\"currentColor\" stroke=\"none\"/><rect x=\"15\" y=\"3.5\" width=\"3\" height=\"2\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-schrodinger": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5\" y=\"14\" width=\"14\" height=\"6\" rx=\"1\"/><polyline points=\"8,14 9.5,8 11,11 13,11 14.5,8 16,14\"/><circle cx=\"10.5\" cy=\"12.5\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"13.5\" cy=\"12.5\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-lagrangian": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"3\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/><line x1=\"12\" y1=\"3\" x2=\"16.5\" y2=\"13.8\"/><circle cx=\"16.5\" cy=\"15.5\" r=\"2.3\"/><path d=\"M6,15 Q12,21.5 18,15\"/></svg>",
    "ap-sci-selection": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"16\" rx=\"4.8\" ry=\"3.6\"/><circle cx=\"6.5\" cy=\"11\" r=\"1.7\"/><circle cx=\"12\" cy=\"8.5\" r=\"1.9\"/><circle cx=\"17.5\" cy=\"11\" r=\"1.7\"/></svg>",
    "ap-sci-water": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12,3 C15,8 18,12 18,15 A6,6 0 0 1 6,15 C6,12 9,8 12,3 Z\"/><path d=\"M8.5,14 Q8.5,16.5 10.5,17.5\"/></svg>",
    "ap-sci-standard": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"12\" rx=\"9\" ry=\"3.6\"/><ellipse cx=\"12\" cy=\"12\" rx=\"3.6\" ry=\"9\"/><circle cx=\"12\" cy=\"12\" r=\"1.6\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"12\" cy=\"3.2\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-speciation": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12,21 L12,15 M12,15 L7,5 M12,15 L16,11 M16,11 L14,5 M16,11 L19,6\"/><circle cx=\"7\" cy=\"5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"19\" cy=\"6\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-chloroplast": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12,3 C7,6 4,13 9,20 C15,17 20,9 12,3 Z\"/><path d=\"M10.5,18 Q12,11 13,5\"/></svg>",
    "ap-sci-mendel": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3,12 C6,8 18,8 21,12 C18,16 6,16 3,12 Z\"/><circle cx=\"8\" cy=\"12\" r=\"1.7\"/><circle cx=\"12\" cy=\"12\" r=\"1.7\"/><circle cx=\"16\" cy=\"12\" r=\"1.7\"/></svg>",
    "ap-sci-aero": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4,13 C5,10 9,9.5 13,10 C16.5,10.4 20,11 21,12 C18,12.6 16,13 13,13.4 C9,14 5,15 4,13 Z\"/><path d=\"M3,8 Q12,5.5 21,9 M3,17 Q12,19 21,15\"/></svg>",
    "ap-sci-fibonacci": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M13,12 C13,10.8 11,10.8 11,12.2 C11,14.2 14,14.2 14,11.8 C14,8.5 9,8.5 9,12.5 C9,17 16,17 16,11\"/><circle cx=\"12\" cy=\"12\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-gaussian": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"/><path d=\"M4,18 C8,18 9,7 12,7 C15,7 16,18 20,18\"/></svg>",
    "ap-sci-sort": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3.5\" y=\"13\" width=\"3.5\" height=\"7\"/><rect x=\"10.25\" y=\"9\" width=\"3.5\" height=\"11\"/><rect x=\"17\" y=\"5\" width=\"3.5\" height=\"15\"/></svg>",
    "ap-sci-turing": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"5\" y=\"8\" width=\"14\" height=\"11\" rx=\"2.5\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"4\"/><circle cx=\"9.5\" cy=\"13\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.5\" cy=\"13\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-compiler": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polyline points=\"8,8 4,12 8,16\"/><polyline points=\"16,8 20,12 16,16\"/><line x1=\"13.5\" y1=\"6\" x2=\"10.5\" y2=\"18\"/></svg>",
    "ap-sci-kernels": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"1\"/><rect x=\"9\" y=\"9\" width=\"6\" height=\"6\"/><path d=\"M4,9 L6,9 M4,12 L6,12 M4,15 L6,15 M18,9 L20,9 M18,12 L20,12 M18,15 L20,15 M9,4 L9,6 M12,4 L12,6 M15,4 L15,6 M9,18 L9,20 M12,18 L12,20 M15,18 L15,20\"/></svg>",
    "ap-sci-sun": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"5\"/><path d=\"M12,2 L12,4.5 M12,19.5 L12,22 M2,12 L4.5,12 M19.5,12 L22,12 M4.9,4.9 L6.7,6.7 M17.3,6.7 L19.1,4.9 M4.9,19.1 L6.7,17.3 M17.3,17.3 L19.1,19.1\"/></svg>",
    "ap-sci-v12": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"8\" y=\"2\" width=\"8\" height=\"8\" rx=\"1\"/><rect x=\"8\" y=\"4.5\" width=\"8\" height=\"3\" fill=\"currentColor\" stroke=\"none\"/><line x1=\"12\" y1=\"7.5\" x2=\"12\" y2=\"15\"/><circle cx=\"12\" cy=\"18\" r=\"3\"/></svg>",
    "ap-sci-stress": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polyline points=\"5,3 5,19 21,19\"/><path d=\"M5,19 L9,10 C10,8 11,7 13,7 C15,7.3 16,11 17,14\"/><circle cx=\"17\" cy=\"14\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-hydrology": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6,16 C3,16 3,11 6.5,11 C6,7 12,6 13,10 C17,9 19,13 16,16 Z\"/><path d=\"M8,17.5 L7,20.5 M12,17.5 L11,20.5 M16,17.5 L15,20.5\"/></svg>",
    "ap-sci-periodic": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"1\"/><path d=\"M7.5,6 L7.5,18 M12,6 L12,18 M16.5,6 L16.5,18 M3,10 L21,10 M3,14 L21,14\"/><rect x=\"12\" y=\"10\" width=\"4.5\" height=\"4\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-sci-spectroscopy": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"12,5 19,17 5,17\"/><line x1=\"3\" y1=\"10\" x2=\"10\" y2=\"12.5\"/><path d=\"M13.5,13 L21,9 M13.5,14 L21,12.5 M13.5,15 L21,16\"/></svg>",
    "ap-sci-solvay": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4,20 L5,15 L7,15 L8,20 M9,20 L10,14 L14,14 L15,20 M16,20 L17,15 L19,15 L20,20\"/><circle cx=\"6\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"10.8\" r=\"2.3\"/><circle cx=\"18\" cy=\"12\" r=\"2\"/></svg>",
    "ap-sci-spacerace": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12,3 C14.5,5 15,10 14,17 L10,17 C9,10 9.5,5 12,3 Z\"/><path d=\"M10,14 L7,19 L10,17.5 M14,14 L17,19 L14,17.5\"/><circle cx=\"12\" cy=\"9\" r=\"1.7\"/><path d=\"M10.5,17 Q12,21.5 13.5,17\"/></svg>",
    "ap-myth-lightning": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"13 2.5 4.5 13.5 11 13.5 10.5 21.5 19.5 10.5 12.5 10.5\"/></svg>",
    "ap-myth-freaky": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 3.5 H19 V11 A7 7 0 0 1 5 11 Z\"/><circle cx=\"9\" cy=\"8.5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"15\" cy=\"8.5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M9 15.5 Q12 12.8 15 15.5\"/></svg>",
    "ap-myth-underworld": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M6.5 20.5 L6.5 10 L8 3.5 L10.5 9 L13 3.5 L15 9 L21 13.5 L13.5 15 L13.5 20.5\"/><circle cx=\"11\" cy=\"11.5\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-myth-monkey": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12.5\" r=\"6\"/><path d=\"M6.7 9.6 A3 3 0 0 0 6.7 15.4 M17.3 9.6 A3 3 0 0 1 17.3 15.4 M9.5 15 Q12 17.2 14.5 15\"/><circle cx=\"9.9\" cy=\"11\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.1\" cy=\"11\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-myth-trickster": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 4 L9.5 7 L14.5 7 L19 4 C20.5 9 19 14.5 12 20 C5 14.5 3.5 9 5 4 Z\"/><circle cx=\"9.3\" cy=\"10.8\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.7\" cy=\"10.8\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M10.8 14.3 L12 15.6 L13.2 14.3\"/></svg>",
    "ap-myth-gilgamesh": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 20 L3 16.5 L6.5 16.5 L6.5 11.5 L9.5 11.5 L9.5 6.5 L14.5 6.5 L14.5 11.5 L17.5 11.5 L17.5 16.5 L21 16.5 L21 20 Z\"/><path d=\"M10.4 20 V17.8 A1.6 1.6 0 0 1 13.6 17.8 V20\"/></svg>",
    "ap-myth-ragnarok": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 6.5 C10 4.3 17 6.4 19.8 15.4 L15.7 17.6 C14.6 10.6 9.6 9.4 4.8 10.7 Z\"/><line x1=\"8.7\" y1=\"5.9\" x2=\"8.4\" y2=\"10.2\"/></svg>",
    "ap-myth-shinto": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 4.6 Q12 7.4 21 4.6\"/><line x1=\"5\" y1=\"10.5\" x2=\"19\" y2=\"10.5\"/><line x1=\"7.2\" y1=\"6.4\" x2=\"6.2\" y2=\"20.5\"/><line x1=\"16.8\" y1=\"6.4\" x2=\"17.8\" y2=\"20.5\"/></svg>",
    "ap-myth-morrigan": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 7.5 C5.5 4.5 9 4.6 10.5 6.8 C13.5 9.2 17 11.8 21 13.8 L16.5 15.6 C12.5 15.6 9.5 13.8 7.5 11.4 C5.8 9.4 4 8.2 3 7.5 Z\"/><circle cx=\"7\" cy=\"7\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M11.2 14.8 V18.7 M13.8 15.4 V18.7\"/><line x1=\"4\" y1=\"19\" x2=\"20\" y2=\"19\"/></svg>",
    "ap-myth-genesis": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><ellipse cx=\"12\" cy=\"13\" rx=\"6.5\" ry=\"7.5\"/><polyline points=\"5.6 12.4 8.5 13.6 11 11.4 13.5 14 16 11.9 18.4 13.2\"/><path d=\"M12 4.3 L12 2.4 M7.7 5.3 L6.2 3.6 M16.3 5.3 L17.8 3.6\"/></svg>",
    "ap-myth-quetzal": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M2.5 15.5 C4.5 11.5 7.5 11.5 9.5 15.5 C11.5 19.5 14.5 19.5 16.5 15.5 C17.3 13.9 18.1 12.9 19.2 12.4\"/><path d=\"M19.5 12.2 L21.8 10.8 M19.5 12.2 L21.7 13.5\"/><path d=\"M4.5 11 L3.8 9 M6.3 10.2 L6.3 8 M8.1 11 L9 9.1\"/></svg>",
    "ap-myth-labours": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4.54 18.7 L8.74 12.49 A1 1 0 0 1 9.86 10.83 L13.58 5.34 A2.9 2.9 0 1 1 18.02 9.06 L14.29 12.68 A1 1 0 0 1 12.86 14.08 L6.46 20.3 A1.3 1.3 0 0 1 4.54 18.7 Z\"/></svg>",
    "ap-myth-theogony": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"3 10.3 12 3.2 21 10.3\"/><path d=\"M6 12.2 L6 19.4 M10 12.2 L10 19.4 M14 12.2 L14 19.4 M18 12.2 L18 19.4\"/><line x1=\"3.5\" y1=\"20.6\" x2=\"20.5\" y2=\"20.6\"/></svg>",
    "ap-myth-iliad": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M16.8 20.5 L16.8 10.5 C16.8 6.7 14.4 4.6 11.6 4.6 C8.6 4.6 6.6 7.2 6.6 10.4 L6.6 11.9 L9.6 11.9 L9.6 14.5 L6.8 14.5 L7.6 20.5 L10.6 18.1 C12.6 17.5 15 18.9 16.8 20.5 Z\"/><path d=\"M10.6 4.5 C13.5 2.2 17.5 2.6 19.6 5.4 C20.4 6.6 20.8 8 20.8 9.4\"/></svg>",
    "ap-myth-allfather": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 13 Q12 6.8 20 13 Q12 19.2 4 13 Z\"/><circle cx=\"12\" cy=\"13\" r=\"1.7\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M4.8 5.8 Q6.3 3.4 7.9 5.4 Q9.5 3.4 11 5.8 M13 5.8 Q14.5 3.4 16.1 5.4 Q17.7 3.4 19.2 5.8\"/></svg>",
    "ap-pop-kanye": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"9.5\" y=\"3\" width=\"5\" height=\"9.5\" rx=\"2.5\"/><path d=\"M6 10.5v1a6 6 0 0 0 12 0v-1\"/><line x1=\"12\" y1=\"17.5\" x2=\"12\" y2=\"20.5\"/><line x1=\"8.5\" y1=\"20.5\" x2=\"15.5\" y2=\"20.5\"/></svg>",
    "ap-pop-mj": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 14.5c2.6 2.2 5.7 3.2 9 3.2s6.4-1 9-3.2\"/><path d=\"M7 14.5v-3c0-3.8 2.1-6.5 5-6.5s5 2.7 5 6.5v3\"/><line x1=\"7\" y1=\"11.8\" x2=\"17\" y2=\"11.8\"/></svg>",
    "ap-pop-starwars": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"4 18.6 7.4 15.2 9.8 17.6 6.4 21\"/><line x1=\"8.6\" y1=\"16.4\" x2=\"19.8\" y2=\"5.2\"/><circle cx=\"6.9\" cy=\"18.1\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-pop-minecraft": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"15.5\" width=\"5.5\" height=\"5.5\" rx=\"1\"/><line x1=\"6.8\" y1=\"18.2\" x2=\"15.7\" y2=\"6.1\"/><path d=\"M9 3.5c5 .5 9 3.5 11.5 8.5\"/></svg>",
    "ap-pop-nba": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"12\" r=\"9\"/><line x1=\"3\" y1=\"12\" x2=\"21\" y2=\"12\"/><path d=\"M6 5.3c2.8 3.6 2.8 9.8 0 13.4\"/><path d=\"M18 5.3c-2.8 3.6-2.8 9.8 0 13.4\"/></svg>",
    "ap-pop-lebron": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"3.5 7.5 7.8 11.8 12 5.5 16.2 11.8 20.5 7.5 18.9 18.5 5.1 18.5\"/><circle cx=\"12\" cy=\"14.8\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-pop-zelda": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"12 3.5 21 19.5 3 19.5\"/><polygon points=\"7.5 11.5 16.5 11.5 12 19.5\"/></svg>",
    "ap-pop-fortnite": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 12a9 9 0 0 1 18 0a3 2 0 0 0-6 0a3 2 0 0 0-6 0a3 2 0 0 0-6 0\"/><path d=\"M12 14v5a2 2 0 0 0 4 0v-1\"/></svg>",
    "ap-pop-harry": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"7\" cy=\"14.5\" r=\"3.6\"/><circle cx=\"17\" cy=\"14.5\" r=\"3.6\"/><line x1=\"10.6\" y1=\"14.5\" x2=\"13.4\" y2=\"14.5\"/><polyline points=\"13 3 10.8 6.8 13.2 6.8 11 10.4\"/></svg>",
    "ap-pop-lol": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 14V6l2-3.3L14 6v8\"/><line x1=\"7\" y1=\"14\" x2=\"17\" y2=\"14\"/><line x1=\"12\" y1=\"14\" x2=\"12\" y2=\"18.8\"/><circle cx=\"12\" cy=\"20.4\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-pop-nfl": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 20C4 11.2 11.2 4 20 4C20 12.8 12.8 20 4 20Z\"/><line x1=\"9.2\" y1=\"14.8\" x2=\"14.8\" y2=\"9.2\"/><line x1=\"9.7\" y1=\"12.5\" x2=\"11.5\" y2=\"14.3\"/><line x1=\"12.5\" y1=\"9.7\" x2=\"14.3\" y2=\"11.5\"/></svg>",
    "ap-pop-nintendo": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><rect x=\"3\" y=\"8\" width=\"18\" height=\"9\" rx=\"2\"/><path d=\"M7.6 10.4v4.2M5.5 12.5h4.2\"/><circle cx=\"15.4\" cy=\"13.6\" r=\"1.15\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"18.6\" cy=\"13.6\" r=\"1.15\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-pop-mario": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 13c0-5.2 3.6-9 8-9s8 3.8 8 9z\"/><path d=\"M7.5 13v3.2a2.2 2.2 0 0 0 2.2 2.2h4.6a2.2 2.2 0 0 0 2.2-2.2V13\"/><circle cx=\"8.7\" cy=\"9.2\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"15.3\" cy=\"9.2\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-fa-requiem": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 2.8 C10.3 5 9.9 6.6 12 8.4 C14.1 6.6 13.7 5 12 2.8 Z\"/><line x1=\"12\" y1=\"8.4\" x2=\"12\" y2=\"11\"/><rect x=\"8.5\" y=\"11\" width=\"7\" height=\"9.5\" rx=\"1.2\"/></svg>",
    "ap-fa-messiah": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"3.4\" cy=\"12\" r=\"1.3\"/><path d=\"M4.7 11 H12 C15 11 17.3 9.2 19.4 7.2 A2 4.8 0 0 1 19.4 16.8 C17.3 14.8 15 13 12 13 H4.7 Z\"/><path d=\"M8 10.9 V9 M10 10.9 V9 M12 10.9 V9\"/></svg>",
    "ap-fa-tmnt": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 14.5 A7 7 0 0 1 18 14.5 Z\"/><circle cx=\"19.7\" cy=\"13\" r=\"1.9\"/><path d=\"M7.2 14.5 L6.2 18 M14.8 14.5 L15.8 18\"/><circle cx=\"20.3\" cy=\"12.4\" r=\"0.55\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-fa-wagner": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 16.5 A7 7 0 0 1 19 16.5\"/><line x1=\"3.8\" y1=\"16.5\" x2=\"20.2\" y2=\"16.5\"/><path d=\"M7.5 12.2 C4.2 11.2 3 7.8 5.2 4.2\"/><path d=\"M16.5 12.2 C19.8 11.2 21 7.8 18.8 4.2\"/></svg>",
    "ap-fa-rodin": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"10.2\" cy=\"6.3\" r=\"2.1\"/><path d=\"M12 7.8 C14.2 9.6 14.8 12.2 14.4 14.8 L9.4 14.8 L9.4 19.3\"/><polyline points=\"12.8 9.6 8.8 13.6 10.5 9.3\"/><line x1=\"6.2\" y1=\"19.3\" x2=\"17.7\" y2=\"19.3\"/></svg>",
    "ap-fa-monet": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 4.5 C10.2 7.5 10.2 11.2 12 14.3 C13.8 11.2 13.8 7.5 12 4.5 Z M12 14.3 C9.6 13.7 7.8 11.6 7 8.6 C9.6 9.4 11.4 11.2 12 14.3 Z M12 14.3 C14.4 13.7 16.2 11.6 17 8.6 C14.4 9.4 12.6 11.2 12 14.3 Z\"/><ellipse cx=\"12\" cy=\"16.8\" rx=\"8.5\" ry=\"2.6\"/></svg>",
    "ap-fa-lascala": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M5 4.5 C7.5 5.8 9.6 6.3 12 6.3 C14.4 6.3 16.5 5.8 19 4.5 C19 11.5 17.3 16.8 12 19.6 C6.7 16.8 5 11.5 5 4.5 Z\"/><ellipse cx=\"9.4\" cy=\"10.2\" rx=\"1.4\" ry=\"0.9\" fill=\"currentColor\" stroke=\"none\"/><ellipse cx=\"14.6\" cy=\"10.2\" rx=\"1.4\" ry=\"0.9\" fill=\"currentColor\" stroke=\"none\"/><ellipse cx=\"12\" cy=\"14.6\" rx=\"1.5\" ry=\"2\"/></svg>",
    "ap-fa-ring": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"14.2\" r=\"6.3\"/><polygon points=\"12 2.6 15 5.3 12 8 9 5.3\"/></svg>",
    "ap-fa-debussy": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3 A6 6 0 0 0 21 12 A9 9 0 1 1 12 3 Z\"/><circle cx=\"18.8\" cy=\"4.6\" r=\"0.8\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-fa-vangogh": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><circle cx=\"12\" cy=\"9.6\" r=\"2.9\"/><path d=\"M13 6.6 Q13.3 4.4 12 3 Q10.7 4.4 11 6.6 M14.8 8.2 Q16.6 6.8 16.7 4.9 Q14.8 5 13.4 6.8 M15 10.6 Q17.2 10.9 18.6 9.6 Q17.2 8.3 15 8.6 M14.8 11 Q16.6 12.4 16.7 14.3 Q14.8 14.2 13.4 12.4 M13 12.6 Q13.3 14.8 12 16.2 Q10.7 14.8 11 12.6 M9.2 11 Q7.4 12.4 7.3 14.3 Q9.2 14.2 10.6 12.4 M9 10.6 Q6.8 10.9 5.4 9.6 Q6.8 8.3 9 8.6 M9.2 8.2 Q7.4 6.8 7.3 4.9 Q9.2 5 10.6 6.8\"/><line x1=\"12\" y1=\"16.2\" x2=\"12\" y2=\"21\"/><path d=\"M12 19.2 C10.3 19.2 9 18.1 8.6 16.5 C10.4 16.5 11.7 17.6 12 19.2 Z\"/></svg>",
    "ap-fa-dali": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4.5 10 C4.5 6 7.8 3.5 12 3.5 C16.2 3.5 19.5 6 19.5 10 C19.5 13 17.8 14.6 16.8 17 C16 18.9 16.3 20.4 14.6 20.5 C13.1 20.6 12.9 18.9 13.4 17.2 C13.9 15.5 12.4 14.3 10.2 13.7 C7 12.8 4.5 12.9 4.5 10 Z\"/><path d=\"M11.8 8.8 V5.6 M11.8 8.8 C13.2 9.3 14.1 10.3 14.3 11.9\"/><circle cx=\"11.8\" cy=\"8.8\" r=\"0.7\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-fa-impressionist": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 21.5 C6.8 21.5 2.5 17.2 2.5 12 C2.5 6.8 6.8 2.5 12 2.5 C17.2 2.5 21.5 6.6 21.5 11.4 C21.5 13.5 19.9 14.7 18 14.7 L16.2 14.7 C14.9 14.7 14 15.6 14 16.9 C14 17.7 14.4 18.2 14.7 18.8 C15.2 19.8 14.3 21.5 12 21.5 Z\"/><circle cx=\"8.2\" cy=\"8.2\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"13.8\" cy=\"6.4\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"6.4\" cy=\"12.6\" r=\"1.15\"/></svg>",
    "ap-fa-string": "<svg viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 9 C14.8 9 16.2 10.6 16 12.4 C15.9 13.8 14.6 14.2 14.6 15.2 C14.6 16.2 16.4 16.6 16.4 18.3 C16.4 20.2 14.4 21.2 12 21.2 C9.6 21.2 7.6 20.2 7.6 18.3 C7.6 16.6 9.4 16.2 9.4 15.2 C9.4 14.2 8.1 13.8 8 12.4 C7.8 10.6 9.2 9 12 9 Z\"/><line x1=\"12\" y1=\"4.4\" x2=\"12\" y2=\"16.8\"/><circle cx=\"12\" cy=\"3.3\" r=\"1\"/><line x1=\"4\" y1=\"20.5\" x2=\"20.5\" y2=\"9\"/></svg>",
    "ap-phil-locke": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 4C14.5 4.5 9.5 8.5 7.5 15L6.5 19L10.5 18C16.5 15.5 19.5 10 20 4Z\"/><path d=\"M8 15.5C12 12 15.5 9 18.5 6.5\"/><line x1=\"3.5\" y1=\"21\" x2=\"12\" y2=\"21\"/></svg>",
    "ap-phil-athens": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polygon points=\"12 3 21 8.5 3 8.5\"/><path d=\"M6.5 10.5V18M12 10.5V18M17.5 10.5V18\"/><line x1=\"4\" y1=\"19.5\" x2=\"20\" y2=\"19.5\"/></svg>",
    "ap-phil-cave": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 20V13A8 8 0 0 1 20 13V20\"/><path d=\"M12 10C10.2 12 9.3 13.4 9.3 15A2.7 2.7 0 0 0 14.7 15C14.7 13.4 13.8 12 12 10Z\"/><line x1=\"3\" y1=\"20\" x2=\"21\" y2=\"20\"/></svg>",
    "ap-phil-marx": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M15 4A8 8 0 1 0 15 18L19 21\"/><line x1=\"5\" y1=\"20\" x2=\"13.5\" y2=\"11.5\"/><polygon points=\"18.7 11.7 16.7 13.7 11.3 8.3 13.3 6.3\"/></svg>",
    "ap-phil-nietzsche": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><polyline points=\"3 19 9.5 7 13 13.5 16.5 9 21 19\"/><circle cx=\"18.5\" cy=\"4.8\" r=\"2.4\"/></svg>",
    "ap-phil-hobbes": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 18C5 12.5 8.5 12.5 10 18\"/><path d=\"M11.5 18C12 12 12.5 9.5 15 7.5C16.5 6.3 19 6 20 7.5C20.7 8.6 19.8 10 18.3 9.3\"/><line x1=\"3\" y1=\"18\" x2=\"21\" y2=\"18\"/><circle cx=\"17.6\" cy=\"7.6\" r=\"0.9\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-phil-exist": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><line x1=\"3\" y1=\"20\" x2=\"21\" y2=\"9\"/><circle cx=\"13.2\" cy=\"9.7\" r=\"3.5\"/><line x1=\"7\" y1=\"17.5\" x2=\"9.8\" y2=\"14.2\"/><circle cx=\"10.4\" cy=\"13.35\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-phil-machiavelli": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 17.5L4 9L8.5 12.5L12 5.5L15.5 12.5L20 9L20 17.5Z\"/><circle cx=\"12\" cy=\"14.8\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-phil-kant": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3.5 9.5L6.5 8.3C7.6 6.6 10.2 6.4 11.5 7.9C14.5 8.6 17.5 9.4 20.5 9.8L18.2 12.3C14.5 15.2 8.5 14.3 6.2 10.6Z\"/><path d=\"M10.5 9.3C11.5 11.8 14 12.8 16.8 11.9\"/><circle cx=\"6.7\" cy=\"9.1\" r=\"0.8\" fill=\"currentColor\" stroke=\"none\"/></svg>",
    "ap-phil-enlightened": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3C10.2 5.4 9.3 6.9 9.3 8.5A2.7 2.7 0 0 0 14.7 8.5C14.7 6.9 13.8 5.4 12 3Z\"/><path d=\"M8.5 11H15.5L14.2 14.5H9.8Z\"/><line x1=\"12\" y1=\"14.5\" x2=\"12\" y2=\"21\"/></svg>",
    "ap-phil-school": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 20V11A9 9 0 0 1 21 11V20M6.5 20V12A5.5 5.5 0 0 1 17.5 12V20\"/><path d=\"M9.8 16.2V20M14.2 16.2V20\"/><circle cx=\"9.8\" cy=\"14.2\" r=\"1.15\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.2\" cy=\"14.2\" r=\"1.15\" fill=\"currentColor\" stroke=\"none\"/></svg>"
    };
    function svg(p){ return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'; }
    var TROPHY = svg('<path d="M7 3h10v6a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M12 14v3M8 21h8M9 17h6"/>');
    var FALLBACK = {
      total: svg('<path d="M12 5c-2-1.4-4.5-2-8-2v15c3.5 0 6 .6 8 2 2-1.4 4.5-2 8-2V3c-3.5 0-6 .6-8 2z"/><path d="M12 5v15"/>'),
      powers: svg('<polygon points="13 2 5 14 11 14 10 22 19 9 13 9"/>'),
      negs: svg('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
      cat: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>'),
      cat_specific: TROPHY,
      daily: svg('<circle cx="12" cy="12" r="4.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>'),
      streak: svg('<path d="M12 2c1 3.5-2.5 5-2.5 8a2.5 2.5 0 0 0 5 .3C16.5 12 18 13.5 18 16a6 6 0 0 1-12 0c0-5 4.5-7 6-14z"/>')
    };
    window.QB_ACHIEVEMENT_ICONS = {
      map: ICONS,
      iconFor: function (ach) {
        if (!ach || !ach.id) return null;
        if (ICONS[ach.id]) return ICONS[ach.id];
        if (FALLBACK[ach.type]) return FALLBACK[ach.type];
        return TROPHY;
      },
    };
})();





















(function () {
  "use strict";

  const PLUGINS_KEY = "qb-ext-plugins";
  const THEMES_KEY = "qb-ext-themes";

  const QB = {
    version: "2.0.0",
    _events: {},
    _host: {},
    _plugins: [],
    _themes: [],
    _pendingManifest: null,
    _pendingTheme: null,
    _hotkeyHandlers: {},
    _backHandlers: [],
    _saveActions: [],
    _pages: [],
    _starredProviders: [],
    _starredActions: [],
    _statsProviders: [],
    _textTransforms: [],
    _questionFilters: [],
    _resultPanels: [],
    _answerRules: [],
    _scoringRules: [],
    _settingsSections: [],
    _assets: {},
    _pluginAchievements: [],
    _achievementIcons: {},
    _achievementIconFn: null,
    _achIconContributors: [],
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  QB._registerAssets = (id, map) => { QB._assets[id] = Object.assign(QB._assets[id] || {}, map || {}); };
  function assetUrl(id, name) {
    const m = QB._assets[id]; if (!m || !name) return "";
    return m[name] || m[String(name).split("/").pop()] || "";
  }
  function resolveAssetCss(id, css) {
    if (!css || String(css).indexOf("asset:") < 0) return css;
    return String(css).replace(/asset:([^\s"')]+)/g, (m, name) => assetUrl(id, name.trim()) || m);
  }
  function loadStore(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } }
  function saveStore(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { console.error("[QB] save failed", e); } }
  const persistFields = (x) => ({ id: x.id, name: x.name, version: x.version, author: x.author, description: x.description, filename: x.filename, code: x.code, enabled: x.enabled,
    ...(x.icon ? { icon: x.icon } : {}), ...(x.guide ? { guide: x.guide } : {}) });
  function savePlugins() { saveStore(PLUGINS_KEY, QB._plugins.filter((p) => !p._builtin).map(persistFields)); }
  function saveThemes() { saveStore(THEMES_KEY, QB._themes.map(persistFields)); }
  function findExt(id) { return QB._plugins.find((p) => p.id === id) || QB._themes.find((t) => t.id === id); }

  // ── Plugin data follows the profile (and its account) ──
  // ctx.storage and plugin settings live in the profile's own data (/api/plugin-data →
  // "plug:<profile>:<plugin>:<key>" rows), which the account sync carries between the app and
  // the website — folders, saved words, decks, packets. PD.data holds it in memory as JSON
  // text (loaded before plugins start: QB.boot), so get() stays synchronous and hands out a
  // fresh copy like localStorage did; set() writes through, a beat later. 14.50 and older kept
  // it in this machine's localStorage ("qb-pl-<plugin>-<key>"): that moves into the profile
  // once, then goes. Which store plugins are on rides along too ("_qb" / "plugins").
  const PD = { data: null, timers: {}, applying: false };
  const LIST_ID = "_qb", LIST_KEY = "plugins";
  const legacyKey = (id, k) => "qb-pl-" + id + "-" + k;
  function pdGet(id, k) {
    if (PD.data) {
      const m = PD.data[id], raw = m && Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null;
      try { return raw == null ? null : JSON.parse(raw); } catch { return null; }
    }
    try { return JSON.parse(localStorage.getItem(legacyKey(id, k))); } catch { return null; }
  }
  function pdSend(id, k) {
    delete PD.timers[id + "\u0000" + k];
    const raw = PD.data && PD.data[id] ? PD.data[id][k] : undefined;
    if (raw === undefined) return Promise.resolve();
    let value = null; try { value = JSON.parse(raw); } catch {}
    try { return Promise.resolve(QB._host.api.post("/api/plugin-data", { plugin: id, key: k, value })).catch(() => {}); } catch { return Promise.resolve(); }
  }
  function pdSet(id, k, v) {
    const raw = JSON.stringify(v === undefined ? null : v);
    if (!PD.data) { try { localStorage.setItem(legacyKey(id, k), raw); } catch (e) { console.error("[QB] save failed", e); } return; }
    const m = PD.data[id] = PD.data[id] || {};
    if (m[k] === raw) return;
    m[k] = raw;
    const tk = id + "\u0000" + k;
    clearTimeout(PD.timers[tk]);
    PD.timers[tk] = setTimeout(() => pdSend(id, k), 250);
  }
  // a plugin's data by id and key (another plugin's handoff, tests); null = none
  QB.pluginData = (id, k) => pdGet(String(id), String(k));
  QB.setPluginData = (id, k, v) => pdSet(String(id), String(k), v);
  // anything still waiting goes now (leaving the page, before a reload)
  QB.flushPluginData = () => Promise.all(Object.keys(PD.timers).map((tk) => { clearTimeout(PD.timers[tk]); const [id, k] = tk.split("\u0000"); return pdSend(id, k); }));
  window.addEventListener("pagehide", () => {
    // the website: a beacon still goes out while the page closes (a fetch may not)
    if (WEBSITE && navigator.sendBeacon) {
      for (const tk of Object.keys(PD.timers)) {
        clearTimeout(PD.timers[tk]); delete PD.timers[tk];
        const [id, k] = tk.split("\u0000"), raw = PD.data && PD.data[id] && PD.data[id][k];
        if (raw != null) try { navigator.sendBeacon("/api/plugin-data", new Blob(['{"plugin":' + JSON.stringify(id) + ',"key":' + JSON.stringify(k) + ',"value":' + raw + "}"], { type: "application/json" })); } catch {}
      }
    }
    QB.flushPluginData();
  });
  async function pdLoad() {
    const r = await QB._host.api.get("/api/plugin-data?plugin=*&key=*");
    const all = r && r.value && typeof r.value === "object" ? r.value : null;
    if (!all) throw new Error("no plugin data");
    const data = {};
    for (const [id, m] of Object.entries(all)) { data[id] = {}; for (const [k, v] of Object.entries(m || {})) data[id][k] = JSON.stringify(v); }
    return data;
  }
  // the old machine-wide copies: into the profile (where it has none of its own), then gone
  function pdMigrate() {
    const ids = [...new Set(QB._plugins.map((p) => p.id).concat(Object.keys(PLUGIN_GROUP)))].sort((a, b) => b.length - a.length);
    const gone = [];
    for (let i = 0; i < localStorage.length; i++) {
      const lk = localStorage.key(i);
      if (!lk || !lk.startsWith("qb-pl-")) continue;
      const id = ids.find((x) => lk.startsWith("qb-pl-" + x + "-"));
      if (!id) continue;
      const k = lk.slice(("qb-pl-" + id + "-").length), raw = localStorage.getItem(lk);
      gone.push(lk);
      if (!k || raw == null) continue;
      const m = PD.data[id] = PD.data[id] || {};
      if (Object.prototype.hasOwnProperty.call(m, k)) continue;
      try { JSON.parse(raw); } catch { continue; }
      m[k] = raw;
      pdSend(id, k);
    }
    gone.forEach((lk) => { try { localStorage.removeItem(lk); } catch {} });
  }
  // Which store plugins are on, kept with the profile: turning one on or off here turns it
  // on or off on the account's other devices (a plugin they don't have yet is added there
  // from the Store / the app's update; nothing is ever removed, only turned off).
  const listable = (p) => !!(p && !p._builtin && PLUGIN_GROUP[p.id]);   // the Store's plugins (an imported one of your own stays on this machine)
  function localList() { return QB._plugins.filter((p) => listable(p) && p.enabled).map((p) => p.id).sort(); }
  function pluginListChanged() {
    if (!PD.data || PD.applying) return;
    const cur = pdGet(LIST_ID, LIST_KEY), on = localList();
    if (cur && Array.isArray(cur.on) && cur.on.slice().sort().join() === on.join()) return;
    pdSet(LIST_ID, LIST_KEY, { on });
  }
  async function pluginSource(id) {
    try {
      if (WEBSITE) {
        if (!QB._store.list) { const r = await fetch("/api/plugin-store", { cache: "no-store" }); if (r.ok) QB._store.list = ((await r.json()) || {}).plugins || []; }
        const item = (QB._store.list || []).find((x) => x.id === id); if (!item) return null;
        const z = await fetch("/store/" + encodeURIComponent(item.file)); return z.ok ? new Uint8Array(await z.arrayBuffer()) : null;
      }
      const info = await QB._host.api.get("/api/app-update-plugins");
      const p = ((info && info.plugins) || []).find((x) => x.id === id);
      return p ? Uint8Array.from(atob(p.base64), (c) => c.charCodeAt(0)) : null;
    } catch { return null; }
  }
  async function applyPluginList() {
    const want = pdGet(LIST_ID, LIST_KEY);
    if (!want || !Array.isArray(want.on)) { pluginListChanged(); return false; }
    const on = new Set(want.on.filter((x) => typeof x === "string"));
    let changed = false;
    PD.applying = true;
    try {
      for (const p of QB._plugins.slice()) {
        if (!listable(p)) continue;
        if (on.has(p.id) && !p.enabled) { QB.enablePlugin(p.id); changed = true; }
        else if (!on.has(p.id) && p.enabled) { QB.disablePlugin(p.id); changed = true; }
      }
      for (const id of on) {
        if (QB._plugins.some((p) => p.id === id) || RETIRED_PLUGINS[id]) continue;
        const bytes = await pluginSource(id);
        if (!bytes) continue;
        const p = await QB.installZipBytes(bytes);
        if (p && p.id) { QB.enablePlugin(p.id); changed = true; }
      }
    } finally { PD.applying = false; }
    return changed;
  }
  // (re)load the profile's plugin data: at start, after the account sync brought changes,
  // when the website tab comes back. A plugin page on screen draws itself again.
  QB.reloadPluginData = async () => {
    let data; try { data = await pdLoad(); } catch { return false; }
    // writes still on their way keep their values
    if (PD.data) for (const tk of Object.keys(PD.timers)) { const [id, k] = tk.split("\u0000"); if (PD.data[id] && k in PD.data[id]) (data[id] = data[id] || {})[k] = PD.data[id][k]; }
    const prev = PD.data;
    PD.data = data;
    if (!prev) pdMigrate();   // it couldn't load at start: what was kept meanwhile moves in now
    const ids = Object.keys({ ...(prev || {}), ...data }).filter((id) => JSON.stringify((prev || {})[id] || {}) !== JSON.stringify(data[id] || {}));
    const listChanged = await applyPluginList();
    if (!ids.length && !listChanged) return false;
    // plugins that follow other website tabs listen for "storage" events on their old
    // localStorage keys: each changed key gets one, so they read it again (Folders does)
    for (const id of ids) {
      const a = (prev || {})[id] || {}, b = data[id] || {};
      for (const k of Object.keys({ ...a, ...b })) {
        if (a[k] === b[k]) continue;
        try { window.dispatchEvent(new StorageEvent("storage", { key: legacyKey(id, k), oldValue: a[k] == null ? null : a[k], newValue: b[k] == null ? null : b[k], url: location.href })); } catch {}
      }
    }
    QB._emit("plugin-data:changed", { ids });
    // the plugin page on screen draws itself again — only when its own data changed
    const rec = QB._pages.find((p) => p.screenEl && p.screenEl.classList.contains("active"));
    if (rec && ids.includes(rec.pluginId) && typeof rec.onShow === "function") { try { rec.onShow(rec.body, { back: true, first: false, reload: true }); } catch (e) { console.error(e); } }
    if (document.getElementById("extensions-container")?.offsetParent) QB.renderScreen();
    return true;
  };

  QB.on = (ev, fn) => { (QB._events[ev] = QB._events[ev] || []).push(fn); return () => QB.off(ev, fn); };
  QB.off = (ev, fn) => { if (QB._events[ev]) QB._events[ev] = QB._events[ev].filter((f) => f !== fn); };
  QB._emit = (ev, data) => { (QB._events[ev] || []).forEach((fn) => { try { fn(data); } catch (e) { console.error("[QB] handler", ev, e); } }); };

  QB.connect = (host) => { QB._host = host || {}; };

  // The app has NO popup notifications (the user removed them in 14.28). The
  // toast API stays as a no-op so plugins calling ctx.toast / QB.toast keep
  // working; anything that must be seen is shown inline where it happened.
  QB.toast = () => {};
  // Import failures show as one short red line under the dropzone that was used
  // (renderScreen). installPackage & co. record here instead of toasting.
  QB._importError = null; QB._importZone = null;
  const importFail = (msg) => { QB._importError = msg; };

  // Shared indeterminate loading bar (CSS lives in the base app's style.css).
  QB.loadingBarHtml = (label) => {
    const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    return `<div class="qb-loading"><div class="qb-loadbar"><div class="qb-loadbar-fill"></div></div><span>${esc(label || "Loading…")}</span></div>`;
  };

  // Right-click context menu. items: [{label, onClick, danger, hint}] plus
  // {sep: true} separators; opts.title renders a truncated header. Closes on
  // click-away / Esc. Plugins get it via ctx.contextMenu.
  QB.contextMenu = (x, y, items, opts) => {
    document.getElementById("qb-ctx-menu")?.remove();
    const list = (items || []).filter((it) => it && (it.sep || (it.label && typeof it.onClick === "function")));
    while (list.length && list[0].sep) list.shift();
    while (list.length && list[list.length - 1].sep) list.pop();
    if (!list.filter((it) => !it.sep).length) return;
    const el = document.createElement("div");
    el.id = "qb-ctx-menu";
    el.className = "qb-ctx-menu";
    const close = (ev) => { if (!el.contains(ev.target)) { el.remove(); cleanup(); } };
    const onKey = (ev) => { if (ev.key === "Escape") { el.remove(); cleanup(); ev.stopPropagation(); } };
    const cleanup = () => { document.removeEventListener("mousedown", close, true); document.removeEventListener("keydown", onKey, true); };
    if (opts && opts.title) {
      const h = document.createElement("div");
      h.className = "qb-ctx-title";
      h.textContent = String(opts.title).length > 46 ? String(opts.title).slice(0, 45) + "…" : String(opts.title);
      el.appendChild(h);
    }
    let lastSep = true;
    list.forEach((it) => {
      if (it.sep) {
        if (lastSep) return;
        const s = document.createElement("div");
        s.className = "qb-ctx-sep";
        el.appendChild(s);
        lastSep = true;
        return;
      }
      lastSep = false;
      const b = document.createElement("button");
      b.className = "qb-ctx-item" + (it.danger ? " danger" : "");
      b.textContent = it.label;
      if (it.hint) {
        const sp = document.createElement("span");
        sp.className = "qb-ctx-hint";
        sp.textContent = it.hint;
        b.appendChild(sp);
      }
      b.addEventListener("click", () => { el.remove(); cleanup(); try { it.onClick(); } catch (e) { console.error("[QB] ctx item", e); } });
      el.appendChild(b);
    });
    document.body.appendChild(el);
    const r = el.getBoundingClientRect();
    el.style.left = Math.min(x, window.innerWidth - r.width - 8) + "px";
    el.style.top = Math.min(y, window.innerHeight - r.height - 8) + "px";
    requestAnimationFrame(() => el.classList.add("open"));
    setTimeout(() => { document.addEventListener("mousedown", close, true); document.addEventListener("keydown", onKey, true); }, 0);
  };

  // ── Themed color picker ─────────────────────────────────────────────────
  // Replaces the OS color dialog with an in-app popover that follows the
  // active theme. Every input[type=color] anywhere (app, plugins, themes) is
  // upgraded automatically; add data-native-picker to an input to opt out.
  QB.pickColor = (opts) => {
    opts = opts || {};
    document.getElementById("qb-color-pop")?.remove();
    const hexToRgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h || "").trim()); if (!m) return null; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
    const rgbToHex = (r, g, b) => "#" + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("");
    const rgbToHsv = (r, g, b) => {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      let h = 0;
      if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
      return [h, mx ? d / mx : 0, mx];
    };
    const hsvToRgb = (h, s, v) => {
      const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
      let r = 0, g = 0, b = 0;
      if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; }
      else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
      return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
    };
    let hsv = (() => { const rgb = hexToRgb(opts.value) || [88, 166, 255]; return rgbToHsv(rgb[0], rgb[1], rgb[2]); })();
    const hex = () => { const rgb = hsvToRgb(hsv[0], hsv[1], hsv[2]); return rgbToHex(rgb[0], rgb[1], rgb[2]); };

    const el = document.createElement("div");
    el.id = "qb-color-pop";
    el.className = "qb-color-pop";
    const cs = getComputedStyle(document.documentElement);
    const presets = [...new Set(["--accent", "--green", "--red", "--yellow", "--star", "--text", "--bg-tertiary"]
      .map((v) => (cs.getPropertyValue(v) || "").trim().toLowerCase())
      .filter((v) => hexToRgb(v)).concat(["#ffffff", "#000000"]))].slice(0, 9);
    el.innerHTML =
      '<div class="qb-cp-sv"><div class="qb-cp-sv-white"></div><div class="qb-cp-sv-black"></div><div class="qb-cp-thumb"></div></div>' +
      '<div class="qb-cp-hue"><div class="qb-cp-hue-thumb"></div></div>' +
      '<div class="qb-cp-row"><span class="qb-cp-preview"></span><input class="qb-cp-hex" spellcheck="false" maxlength="7" aria-label="Hex color">' +
      '<button class="qb-cp-done" type="button">Done</button></div>' +
      '<div class="qb-cp-presets">' + presets.map((p) => '<span class="qb-cp-pre" data-c="' + p + '" style="background:' + p + '"></span>').join("") + "</div>";
    document.body.appendChild(el);
    const r = (opts.anchor && opts.anchor.getBoundingClientRect) ? opts.anchor.getBoundingClientRect() : { left: innerWidth / 2 - 110, bottom: innerHeight / 3 };
    const pr = el.getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(r.left, innerWidth - pr.width - 8)) + "px";
    el.style.top = Math.max(8, Math.min(r.bottom + 6, innerHeight - pr.height - 8)) + "px";
    requestAnimationFrame(() => el.classList.add("open"));

    const sv = el.querySelector(".qb-cp-sv"), thumb = el.querySelector(".qb-cp-thumb");
    const hue = el.querySelector(".qb-cp-hue"), hueThumb = el.querySelector(".qb-cp-hue-thumb");
    const prev = el.querySelector(".qb-cp-preview"), hexIn = el.querySelector(".qb-cp-hex");
    const paint = (fire) => {
      sv.style.backgroundColor = "hsl(" + hsv[0] + ",100%,50%)";
      thumb.style.left = (hsv[1] * 100) + "%";
      thumb.style.top = ((1 - hsv[2]) * 100) + "%";
      hueThumb.style.left = (hsv[0] / 360 * 100) + "%";
      const h = hex();
      prev.style.background = h;
      if (document.activeElement !== hexIn) hexIn.value = h;
      if (fire && typeof opts.onChange === "function") { try { opts.onChange(h); } catch (e) {} }
    };
    const drag = (surface, apply) => {
      surface.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        surface.setPointerCapture && surface.setPointerCapture(e.pointerId);
        const move = (ev) => {
          const b = surface.getBoundingClientRect();
          apply(Math.max(0, Math.min(1, (ev.clientX - b.left) / b.width)), Math.max(0, Math.min(1, (ev.clientY - b.top) / b.height)));
          paint(true);
        };
        const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        move(e);
      });
    };
    drag(sv, (x, y) => { hsv[1] = x; hsv[2] = 1 - y; });
    drag(hue, (x) => { hsv[0] = Math.min(359.9, x * 360); });
    hexIn.addEventListener("change", () => { const rgb = hexToRgb(hexIn.value); if (rgb) { hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]); paint(true); } });
    hexIn.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); hexIn.dispatchEvent(new Event("change")); finish(); } e.stopPropagation(); });
    el.querySelectorAll(".qb-cp-pre").forEach((p) => p.addEventListener("click", () => { const rgb = hexToRgb(p.dataset.c); if (rgb) { hsv = rgbToHsv(rgb[0], rgb[1], rgb[2]); paint(true); } }));
    const finish = () => { cleanup(); el.remove(); if (typeof opts.onDone === "function") { try { opts.onDone(hex()); } catch (e) {} } };
    const away = (ev) => { if (!el.contains(ev.target)) finish(); };
    const onKey = (ev) => { if (ev.key === "Escape") { ev.stopPropagation(); finish(); } };
    const cleanup = () => { document.removeEventListener("mousedown", away, true); document.removeEventListener("keydown", onKey, true); };
    setTimeout(() => { document.addEventListener("mousedown", away, true); document.addEventListener("keydown", onKey, true); }, 0);
    el.querySelector(".qb-cp-done").addEventListener("click", finish);
    paint(false);
  };
  document.addEventListener("click", (e) => {
    const inp = e.target && e.target.closest && e.target.closest('input[type="color"]');
    if (!inp || inp.dataset.nativePicker != null || inp.disabled) return;
    e.preventDefault();
    QB.pickColor({
      anchor: inp,
      value: inp.value,
      onChange: (v) => { inp.value = v; inp.dispatchEvent(new Event("input", { bubbles: true })); },
      onDone: (v) => { inp.value = v; inp.dispatchEvent(new Event("change", { bubbles: true })); },
    });
  }, true);

  QB.registerPlugin = (m) => { QB._pendingManifest = m; };
  // Built-in plugins ship with the app (src/renderer/*.js): always enabled,
  // never listed under Manage, never stored in localStorage. A user-installed
  // copy with the same id is dropped at boot.
  QB._builtinManifests = [];
  QB.registerBuiltin = (m) => { if (m && m.id) QB._builtinManifests.push(m); };
  QB.registerTheme = (m) => { QB._pendingTheme = m; };

  function makeCtx(ext) {
    const subs = [];
    return {
      on(ev, fn) { subs.push(QB.on(ev, fn)); },
      off: QB.off,
      emit: QB._emit,
      getState: () => (QB._host.getState ? QB._host.getState() : {}),
      api: QB._host.api,
      host: QB._host,
      showScreen: (name) => QB._host.showScreen && QB._host.showScreen(name),
      toast: QB.toast,
      setVar(name, val) {
        document.documentElement.style.setProperty(name, val);
        this._setVars = this._setVars || new Set();
        if (!this._setVars.has(name)) {
          this._setVars.add(name);
          subs.push(() => document.documentElement.style.removeProperty(name));
        }
      },
      addCSS(css) {
        const st = document.createElement("style");
        st.dataset.ext = ext.id;
        st.textContent = resolveAssetCss(ext.id, css);
        document.head.appendChild(st);
        subs.push(() => st.remove());
        return st;
      },
      asset(name) { return assetUrl(ext.id, name); },
      addStyle(css) { return this.addCSS(css); },
      registerArt(id, art) {
        art = art || {};
        try {
          window.ART = window.ART || {};
          if (art.text) window.ART[id] = art.text;
          let image = art.image || null;
          if (image && /^asset:/.test(image)) image = assetUrl(ext.id, image.slice(6)) || null;
          QB._themeArts = QB._themeArts || {};
          QB._themeArts[id] = { id, name: art.name || id, text: art.text || "", layout: art.layout || "stacked", image };
          QB._activeThemeArt = QB._themeArts[id];
          if (QB._host && QB._host.refreshArt) QB._host.refreshArt();
          subs.push(() => {
            if (QB._activeThemeArt && QB._activeThemeArt.id === id) QB._activeThemeArt = null;
            if (QB._host && QB._host.refreshArt) QB._host.refreshArt();
          });
        } catch (e) {  }
      },
      extendAppearance(opts) {
        try {
          if (QB._host && QB._host.addAppearanceOptions) {
            const remove = QB._host.addAppearanceOptions(opts);
            if (typeof remove === "function") subs.push(remove);
            return remove;
          }
        } catch (e) {}
        return () => {};
      },
      registerSettingsSection(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, location: p.location || "appearance", title: p.title, render: p.render };
        QB._settingsSections.push(rec);
        subs.push(() => { QB._settingsSections = QB._settingsSections.filter((x) => x !== rec); });
        return rec;
      },
      registerAppearancePanel(render, opts) {
        opts = opts || {};
        const rec = { pluginId: ext.id, id: ext.id + "-appearance", location: "appearance", render, _fullAppearance: true };
        if ("title" in opts) rec.title = opts.title;
        QB._settingsSections.push(rec);
        subs.push(() => { QB._settingsSections = QB._settingsSections.filter((x) => x !== rec); });
        QB._emit("theme:change", null);
        return rec;
      },
      mount(el) { document.body.appendChild(el); subs.push(() => el.remove()); return el; },
      // Run fn(el) for every element matching `selector` — the ones on screen
      // now AND any added later. Screens here rebuild by assigning innerHTML,
      // so a one-shot querySelectorAll only ever decorates whatever happened to
      // exist at enable time; this keeps up with rebuilds.
      //
      // It exists because CSS alone cannot add DOM. A theme that needs the
      // structure a component library uses — an indicator span inside a
      // checkbox, a chevron, a spinner — can inject it here, and `undo` puts
      // the element back the way it was found when the theme is disabled.
      //
      // fn may return a cleanup function; each element is only ever decorated
      // once (tracked by a per-registration marker).
      decorate(selector, fn) {
        const seen = new WeakSet();
        const undos = [];
        const apply = (root) => {
          if (!root || root.nodeType !== 1) return;
          let list;
          try { list = root.matches && root.matches(selector) ? [root] : []; } catch { return; }
          try { list = list.concat([...root.querySelectorAll(selector)]); } catch {}
          for (const el of list) {
            if (seen.has(el)) continue;
            seen.add(el);
            try { const u = fn(el); if (typeof u === "function") undos.push(u); } catch (e) { console.error(e); }
          }
        };
        apply(document.body);
        const obs = new MutationObserver((records) => {
          for (const r of records) for (const n of r.addedNodes) apply(n);
        });
        obs.observe(document.body, { childList: true, subtree: true });
        subs.push(() => {
          obs.disconnect();
          for (const u of undos) { try { u(); } catch {} }
        });
        return () => obs.disconnect();
      },
      // the profile's (synced) plugin data — see "Plugin data follows the profile"
      storage: {
        get(k) { return pdGet(ext.id, String(k)); },
        set(k, v) { pdSet(ext.id, String(k), v); },
      },
      getSetting(k) { return QB.getSetting(ext.id, k); },
      setSetting(k, v) { QB.setSetting(ext.id, k, v); },
      onSetting(fn) { subs.push(QB.on("ext:setting", (e) => { if (e.id === ext.id) fn(e.key, e.val); })); },
      onHotkey(id, fn) { const action = ext.id + ":" + id; QB._hotkeyHandlers[action] = fn; subs.push(() => { delete QB._hotkeyHandlers[action]; }); },
      onBack(fn) { const rec = { pluginId: ext.id, fn }; QB._backHandlers.push(rec); subs.push(() => { QB._backHandlers = QB._backHandlers.filter((r) => r !== rec); }); },
      registerSaveAction(fn) {
        const rec = { pluginId: ext.id, fn };
        QB._saveActions.push(rec);
        subs.push(() => { QB._saveActions = QB._saveActions.filter((r) => r !== rec); });
        return rec;
      },
      keyLabel(id) {
        try { return (QB._host.keyDisplay && QB._host.keyDisplay(ext.id + ":" + id)) || "?"; } catch { return "?"; }
      },
      contextMenu(x, y, items, opts) { QB.contextMenu(x, y, items, opts); },
      loadingBarHtml(label) { return QB.loadingBarHtml(label); },
      registerPage(page) { const rec = QB._createPage(ext, page); subs.push(() => QB._removePage(rec)); return rec; },
      registerTextTransform(t) {
        const rec = { pluginId: ext.id, apply: typeof t === "function" ? t : t.apply };
        QB._textTransforms.push(rec);
        subs.push(() => { QB._textTransforms = QB._textTransforms.filter((x) => x !== rec); });
        return rec;
      },
      registerQuestionFilter(fn) {
        const rec = { pluginId: ext.id, fn };
        QB._questionFilters.push(rec);
        subs.push(() => { QB._questionFilters = QB._questionFilters.filter((x) => x !== rec); });
        return rec;
      },
      registerResultPanel(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, render: p.render };
        QB._resultPanels.push(rec);
        subs.push(() => { QB._resultPanels = QB._resultPanels.filter((x) => x !== rec); });
        return rec;
      },
      transformText(text, context) { return QB.applyTextTransforms(text, context); },
      registerAnswerRule(fn) {
        const rec = { pluginId: ext.id, fn };
        rec.remove = () => { QB._answerRules = QB._answerRules.filter((x) => x !== rec); };
        QB._answerRules.push(rec);
        subs.push(rec.remove);
        return rec;
      },
      registerScoringRule(fn) {
        const rec = { pluginId: ext.id, fn };
        rec.remove = () => { QB._scoringRules = QB._scoringRules.filter((x) => x !== rec); };
        QB._scoringRules.push(rec);
        subs.push(rec.remove);
        return rec;
      },
      db: {
        table(name) { return "plug_" + ext.id.replace(/[^a-zA-Z0-9_-]/g, "") + "__" + String(name).replace(/[^a-zA-Z0-9_]/g, ""); },
        async exec(sql, params) {
          const r = await QB._host.api.post("/api/plugin-sql", { plugin: ext.id, sql, params: params || [] });
          if (r && r.error) throw new Error(r.error);
          return r;
        },
      },
      profileStorage: {
        async get(k) {
          try { return (await QB._host.api.get("/api/plugin-data?plugin=" + encodeURIComponent(ext.id) + "&key=" + encodeURIComponent(k))).value; }
          catch { return null; }
        },
        async set(k, v) {
          try { await QB._host.api.post("/api/plugin-data", { plugin: ext.id, key: k, value: v }); } catch {}
        },
      },
      registerStatsProvider(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, title: p.title || ext.name, render: p.render };
        QB._statsProviders.push(rec);
        subs.push(() => { QB._statsProviders = QB._statsProviders.filter((x) => x !== rec); });
        return rec;
      },
      registerStarredProvider(p) {
        const rec = { pluginId: ext.id, id: p.id || ext.id, title: p.title || ext.name, render: p.render };
        QB._starredProviders.push(rec);
        subs.push(() => { QB._starredProviders = QB._starredProviders.filter((x) => x !== rec); });
        return rec;
      },
      registerStarredAction(a) {
        const rec = { pluginId: ext.id, id: a.id || (ext.id + "-act"), label: a.label || ext.name, run: a.run };
        QB._starredActions.push(rec);
        subs.push(() => { QB._starredActions = QB._starredActions.filter((x) => x !== rec); });
        return rec;
      },
      registerAchievements(defs) {
        const list = Array.isArray(defs) ? defs : [defs];
        const recs = [];
        for (const d of list) {
          if (!d || !d.id) continue;
          const rec = Object.assign({ pluginId: ext.id, source: ext.name || ext.id }, d);
          QB._pluginAchievements.push(rec);
          recs.push(rec);
        }
        subs.push(() => { QB._pluginAchievements = QB._pluginAchievements.filter((x) => recs.indexOf(x) === -1); });
        return recs;
      },
      registerAchievementIcons(mapOrFn) {
        if (typeof mapOrFn === "function") {
          const prev = QB._achievementIconFn;
          QB._achievementIconFn = mapOrFn;
          const contrib = { pluginId: ext.id, kind: "fn", value: mapOrFn };
          QB._achIconContributors.push(contrib);
          subs.push(() => {
            QB._achIconContributors = QB._achIconContributors.filter((x) => x !== contrib);
            if (QB._achievementIconFn === mapOrFn) QB._achievementIconFn = prev || null;
          });
          return;
        }
        if (mapOrFn && typeof mapOrFn === "object") {
          const contrib = { pluginId: ext.id, kind: "map", value: Object.assign({}, mapOrFn) };
          QB._achIconContributors.push(contrib);
          Object.assign(QB._achievementIcons, contrib.value);
          subs.push(() => {
            QB._achIconContributors = QB._achIconContributors.filter((x) => x !== contrib);
            const rebuilt = {};
            for (const c of QB._achIconContributors) { if (c.kind === "map") Object.assign(rebuilt, c.value); }
            QB._achievementIcons = rebuilt;
          });
        }
      },
      setBackground(value) {
        try {
          if (!value) { document.body.style.background = ""; return; }
          let css;
          if (/^(https?:|data:image|blob:|\.?\/)/.test(value) || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value)) {
            css = `url("${value}") center/cover no-repeat fixed, var(--bg)`;
          } else {
            css = value;
          }
          document.body.style.background = css;
          if (!ext._bgSubbed) {
            ext._bgSubbed = true;
            subs.push(() => { document.body.style.background = ""; ext._bgSubbed = false; });
          }
        } catch (e) {}
      },
      playSound(name) { try { QB._host.playSound && QB._host.playSound(name); } catch (e) {} },
      launchQuestions(target, ids) { try { return QB._host.launchQuestions ? QB._host.launchQuestions(target, ids) : false; } catch (e) { return false; } },
      goHome() { if (QB._host.goHome) QB._host.goHome(); },
      speak(text, opts) { try { const s = window.speechSynthesis; s.cancel(); const u = new SpeechSynthesisUtterance(text); Object.assign(u, opts || {}); s.speak(u); } catch {} },
      cancelSpeech() { try { window.speechSynthesis.cancel(); } catch {} },
      log: (...a) => console.log("[ext:" + ext.id + "]", ...a),
      _unsub: subs,
    };
  }

  function runEntry(code) {
    QB._pendingManifest = null; QB._pendingTheme = null;
    new Function("QB", code)(QB);
    return { plugin: QB._pendingManifest, theme: QB._pendingTheme };
  }

  function readSettings(id) { const s = pdGet(id, "settings"); return s && typeof s === "object" && !Array.isArray(s) ? s : {}; }
  function writeSettings(id, s) { pdSet(id, "settings", s); }
  function settingDef(id, key) {
    const ext = findExt(id);
    return ((ext && ext._manifest && ext._manifest.settings) || []).find((d) => d.key === key);
  }
  QB.getSetting = (id, key) => {
    const s = readSettings(id);
    if (key in s) return s[key];
    const def = settingDef(id, key);
    return def ? def.default : undefined;
  };
  QB.setSetting = (id, key, val) => { const s = readSettings(id); s[key] = val; writeSettings(id, s); QB._emit("ext:setting", { id, key, val }); };
  QB.getPluginSetting = QB.getSetting;
  QB.setPluginSetting = QB.setSetting;

  // Retired plugins: a stored copy is dropped at boot and the zip is refused on import —
  // either folded into the app itself (it already does what they did) or no longer part of
  // OfflineQuiz (14.50: the plugin list was cut to the nine kept in plugins/).
  const BUILT_IN_PLUGINS = { "achievement-icons": "Achievement Icons" };
  const REMOVED_PLUGINS = {
    "advanced-freq": "Advanced Frequency Lists", "power-facts": "Power Facts", "clue-recall": "Clue Recall",
    "buzz-trainer": "Buzz Trainer", "answer-rules": "Answer Rules", "answerline-lab": "Answerline Lab",
    "achievement-lab": "Achievement Lab", "class-sync": "Class Sync", "class-admin": "Class Admin",
  };
  const RETIRED_PLUGINS = { ...BUILT_IN_PLUGINS, ...REMOVED_PLUGINS };
  function finalizePlugin(filename, code, manifest, pkg) {
    if (!manifest || !manifest.id) { importFail("Plugin must call QB.registerPlugin({ id, ... })"); return null; }
    // A plugin that is now part of the app (multiplayer, achievement icons) can't be replaced by a zip.
    if (BUILT_IN_PLUGINS[manifest.id]) { importFail(BUILT_IN_PLUGINS[manifest.id] + " is built into the app"); return null; }
    if (REMOVED_PLUGINS[manifest.id]) { importFail(REMOVED_PLUGINS[manifest.id] + " is no longer part of OfflineQuiz"); return null; }
    if (QB._plugins.some((x) => x.id === manifest.id && x._builtin)) { importFail(manifest.name || manifest.id ? (manifest.name || manifest.id) + " is built into the app" : "Built into the app"); return null; }
    const prev = QB._plugins.find((x) => x.id === manifest.id);
    const wasEnabled = !!(prev && prev.enabled);
    if (prev && prev._enabledRuntime) { try { QB.disablePlugin(prev.id); } catch (e) {} }
    QB._plugins = QB._plugins.filter((p) => p.id !== manifest.id);
    const p = {
      id: manifest.id, name: manifest.name || manifest.id, version: manifest.version || "1.0",
      author: manifest.author || "unknown", description: manifest.description || "",
      filename, code, enabled: wasEnabled, _manifest: manifest,
    };
    // plugin.json's icon (24×24 stroke SVG markup) and guide (the how-to article)
    const icon = (pkg && pkg.icon) || manifest.icon, guide = (pkg && pkg.guide) || manifest.guide;
    if (typeof icon === "string" && icon.length < 4000) p.icon = icon;
    if (guide && typeof guide === "object") p.guide = guide;
    QB._plugins.push(p);
    savePlugins();
    if (wasEnabled) { try { QB.enablePlugin(p.id); } catch (e) {} }
    return p;
  }
  QB.installPlugin = (filename, code) => {
    try { const r = runEntry(code); return finalizePlugin(filename, code, r.plugin); }
    catch (e) { importFail("Invalid plugin: " + e.message); return null; }
  };
  QB.enablePlugin = (id) => {
    const p = QB._plugins.find((x) => x.id === id);
    if (!p || p._enabledRuntime) return;
    if (QB._pluginsHeld && !p._builtin) { p.enabled = true; savePlugins(); return; }   // runs once the account allows it
    try {
      if (!p._manifest) p._manifest = runEntry(p.code).plugin;
      const ctx = makeCtx(p); p._ctx = ctx;
      if (typeof p._manifest.onEnable === "function") p._manifest.onEnable(ctx);
      p._enabledRuntime = true; p.enabled = true; p._error = null; savePlugins();
      pluginListChanged();
      QB._emit("plugins:changed");
    } catch (e) {
      console.error(e); p._error = e.message || String(e);
      // Unwind whatever the failed onEnable managed to register, so a retry
      // can't stack duplicate hooks.
      if (p._ctx) { p._ctx._unsub?.forEach?.((u) => { try { u(); } catch {} }); p._ctx = null; }
      p.enabled = false; savePlugins();
    }
  };
  QB.disablePlugin = (id) => {
    const p = QB._plugins.find((x) => x.id === id); if (!p) return;
    if (p._builtin && !QB._unloading) return;   // built into the app: always on
    try { if (p._manifest && typeof p._manifest.onDisable === "function" && p._ctx) p._manifest.onDisable(p._ctx); } catch (e) { console.error(e); }
    if (p._ctx) p._ctx._unsub.forEach((u) => { try { u(); } catch {} });
    p._ctx = null; p._enabledRuntime = false; p.enabled = false; savePlugins();
    pluginListChanged();
    QB._emit("plugins:changed");
  };
  QB.togglePlugin = (id, on) => (on ? QB.enablePlugin(id) : QB.disablePlugin(id));
  QB.removePlugin = (id) => { const p = QB._plugins.find((x) => x.id === id); if (p && p._builtin) return; QB.disablePlugin(id); QB._plugins = QB._plugins.filter((x) => x.id !== id); savePlugins(); pluginListChanged(); };
  QB.isPluginEnabled = (id) => { const p = QB._plugins.find((x) => x.id === id); return !!(p && p._enabledRuntime); };
  QB.getEnabledPlugins = () => QB._plugins.filter((p) => p._enabledRuntime).map((p) => p.id);

  QB.getActiveHotkeys = () => {
    const out = [];
    QB._plugins.forEach((p) => {
      if (!p.enabled) return;
      ((p._manifest && p._manifest.hotkeys) || []).forEach((hk) => {
        out.push({ action: p.id + ":" + hk.id, label: "[" + p.name + "] " + (hk.label || hk.id), default: hk.default || "", pluginId: p.id });
      });
    });
    return out;
  };
  QB.fireHotkey = (action) => { const fn = QB._hotkeyHandlers[action]; if (fn) { try { fn(); } catch (e) { console.error(e); } } };
  QB.getSaveActions = (question, type) => {
    const out = [];
    for (const r of QB._saveActions) {
      try { (r.fn(question, type) || []).forEach((a) => { if (a && a.label && typeof a.onClick === "function") out.push(a); }); }
      catch (e) { console.error("[QB] save action", r.pluginId, e); }
    }
    return out;
  };
  QB.handleBack = () => {
    for (const r of QB._backHandlers) {
      try { if (r.fn() === true) return true; } catch (e) { console.error("[QB] back handler", r.pluginId, e); }
    }
    return false;
  };

  QB._createPage = (ext, page) => {
    const screenId = "ext-page-" + ext.id + "-" + page.id;
    let el = document.getElementById(screenId);
    if (!el) {
      el = document.createElement("div");
      el.id = screenId; el.className = "screen";
      const t0 = String(page.title || page.navLabel || ext.name || "");
      const title = /[a-z]/.test(t0) ? t0 : t0.toLowerCase().replace(/(^|[\s:/(-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
      el.innerHTML =
        '<div class="top-bar page-head"><div class="top-bar-left"><span class="top-bar-title">' +
        esc(title) + '</span></div>' +
        '<div class="top-bar-right"><button class="btn btn-ghost ext-page-home"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>Home</button></div></div>' +
        '<div class="ext-page-body"></div>';
      (document.getElementById("app") || document.body).appendChild(el);
      el.querySelector(".ext-page-home").addEventListener("click", () => QB._host.goHome && QB._host.goHome());
    }
    const rec = { id: page.id, pluginId: ext.id, navLabel: page.navLabel, title: page.title, screenEl: el, body: el.querySelector(".ext-page-body"), onShow: page.onShow, onHide: page.onHide };
    QB._pages = QB._pages.filter((p) => !(p.pluginId === ext.id && p.id === page.id));
    QB._pages.push(rec);
    QB._emit("plugins:changed");
    return rec;
  };
  QB._removePage = (rec) => { QB._pages = QB._pages.filter((p) => p !== rec); if (rec.screenEl) rec.screenEl.remove(); QB._emit("plugins:changed"); };
  QB.getActivePages = () => QB._pages.map((p) => ({ id: p.pluginId + "::" + p.id, navLabel: p.navLabel, title: p.title }));
  QB.getStarredProviders = () => QB._starredProviders.slice();
  QB.getStarredActions = () => QB._starredActions.slice();
  QB.getStatsProviders = () => QB._statsProviders.slice();
  QB.getResultPanels = () => QB._resultPanels.slice();
  QB.hasJudgingRules = () => QB._answerRules.length > 0 || QB._scoringRules.length > 0;
  QB.applyAnswerRules = (verdict, context) => {
    let v = Object.assign({}, verdict);
    for (const r of QB._answerRules) {
      try {
        const out = r.fn(Object.assign({}, v), context || {});
        if (typeof out === "string") v.status = out;
        else if (out && typeof out === "object" && out.status) v = Object.assign({}, v, out);
      } catch (e) { console.error("[QB] answer rule", r.pluginId, e); }
    }
    return v;
  };
  QB.applyScoringRules = (points, context) => {
    let p = points;
    for (const r of QB._scoringRules) {
      try {
        const out = r.fn(p, context || {});
        if (typeof out === "number" && isFinite(out)) p = Math.round(out);
      } catch (e) { console.error("[QB] scoring rule", r.pluginId, e); }
    }
    return p;
  };
  QB.applyTextTransforms = (text, context) => {
    let out = String(text == null ? "" : text);
    for (const t of QB._textTransforms) {
      try {
        const r = t.apply(out, context || {});
        if (typeof r === "string") out = r;
      } catch (e) { console.error("[QB] text transform", t.pluginId, e); }
    }
    return out;
  };
  QB.passesQuestionFilters = (question, context) => {
    for (const f of QB._questionFilters) {
      try { if (f.fn(question, context || {}) === false) return false; }
      catch (e) { console.error("[QB] question filter", f.pluginId, e); }
    }
    return true;
  };
  // Fire the outgoing plugin page's onHide whenever the active screen changes
  // away from it — plugins rely on this for cleanup (timers, borrowed panel).
  QB._lastActivePage = null;
  QB.on("screen:change", () => {
    const prev = QB._lastActivePage;
    if (prev && (!prev.screenEl || !prev.screenEl.classList.contains("active"))) {
      QB._lastActivePage = null;
      try { if (typeof prev.onHide === "function") prev.onHide(); } catch (e) { console.error("[QB] onHide", e); }
    }
    const now = QB._pages.find((p) => p.screenEl && p.screenEl.classList.contains("active"));
    if (now) QB._lastActivePage = now;
  });

  QB.showPage = (combined, opts) => {
    if (QB._host && typeof QB._host.isLocked === "function" && QB._host.isLocked()) return;   // locked for the database update
    const rec = QB._pages.find((p) => p.pluginId + "::" + p.id === combined);
    if (!rec) return false;
    const back = !!(opts && opts.back);
    // Snapshot the outgoing screen's scroll while it is still visible.
    try { QB._host.saveScreenScroll && QB._host.saveScreenScroll(); } catch (err) {}
    try { QB._host.recordNav && QB._host.recordNav(combined); } catch (err) {}
    // Fresh entries open with the borrowed panel collapsed; Back hands the
    // page back exactly as it was left.
    if (!back) { try { QB._host.collapseFilterSections && QB._host.collapseFilterSections(); } catch (err) {} }
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    rec.screenEl.classList.add("active");
    QB._emit("screen:change", { name: combined, back });
    if (typeof rec.onShow === "function") {
      try { rec.onShow(rec.body, { back, first: !rec._shown }); } catch (e) { console.error(e); }
    }
    rec._shown = true;
    try { QB._host.restoreScreenScroll && QB._host.restoreScreenScroll(rec.screenEl); } catch (err) {}
    try { QB._host.updateTopbar && QB._host.updateTopbar(); } catch (err) {}   // the crumb names this page
    return true;
  };

  function finalizeTheme(filename, code, manifest) {
    if (!manifest || !manifest.id) { importFail("Theme must call QB.registerTheme({ id, ... })"); return null; }
    QB._themes = QB._themes.filter((t) => t.id !== manifest.id);
    const t = {
      id: manifest.id, name: manifest.name || manifest.id, version: manifest.version || "1.0",
      author: manifest.author || "unknown", description: manifest.description || "",
      filename, code, enabled: false, _manifest: manifest,
    };
    QB._themes.push(t);
    saveThemes();
    return t;
  }
  QB.installTheme = (filename, code) => {
    try { const r = runEntry(code); return finalizeTheme(filename, code, r.theme); }
    catch (e) { importFail("Invalid theme: " + e.message); return null; }
  };
  QB.enableTheme = (id) => {
    _themeSwitching = true;
    try {
      // Stand the baseline down FIRST. Its onDisable removes the <html>
      // attributes its CSS keys off, and a user copy of the same theme sets the
      // very same ones — tearing down after the enable would strip them back
      // out from under the theme that just took over.
      disableBaseTheme();
      QB._themes.forEach((t) => { if (t.id !== id && t._enabledRuntime) QB.disableTheme(t.id); });
      const t = QB._themes.find((x) => x.id === id); if (!t) return;
      try {
        if (!t._manifest) t._manifest = runEntry(t.code).theme;
        const ctx = makeCtx(t); t._ctx = ctx;
        if (typeof t._manifest.onEnable === "function") t._manifest.onEnable(ctx);
        t._enabledRuntime = true; t.enabled = true; t._error = null;
        QB._themes.forEach((x) => { if (x.id !== id) x.enabled = false; });
        saveThemes();
        QB._emit("theme:change", t);
      } catch (e) {
        // Off, not "active": at boot the stored enabled=true used to survive a
        // failed onEnable, so the card claimed a theme that was not running.
        console.error(e); t._error = e.message || String(e); t.enabled = false; saveThemes();
        if (t._ctx) { (t._ctx._unsub || []).forEach((u) => { try { u(); } catch (e2) {} }); t._ctx = null; }
      }
    } finally {
      _themeSwitching = false;
      // A user theme takes over from the baseline — and if it failed to load,
      // this puts the baseline back rather than leaving the app unstyled.
      QB.syncBaseTheme();
    }
  };
  QB.disableTheme = (id) => {
    const t = QB._themes.find((x) => x.id === id); if (!t) return;
    try { if (t._manifest && typeof t._manifest.onDisable === "function" && t._ctx) t._manifest.onDisable(t._ctx); } catch (e) { console.error(e); }
    if (t._ctx) t._ctx._unsub.forEach((u) => { try { u(); } catch {} });
    t._ctx = null; t._enabledRuntime = false; t.enabled = false; saveThemes();
    QB._emit("theme:change", null);
    QB.syncBaseTheme();
  };
  QB.removeTheme = (id) => { QB.disableTheme(id); QB._themes = QB._themes.filter((t) => t.id !== id); saveThemes(); };

  function declarativeThemeCode(mf, cssText) {
    const D = {
      id: mf.id, name: mf.name || mf.id, version: mf.version || "1.0",
      author: mf.author || "unknown", description: mf.description || "",
      settings: Array.isArray(mf.settings) ? mf.settings : [],
      appearance: mf.appearance, vars: mf.vars || null, css: cssText || "",
    };
    return "(function(){var D=" + JSON.stringify(D) + ";QB.registerTheme({" +
      "id:D.id,name:D.name,version:D.version,author:D.author,description:D.description," +
      "settings:D.settings,appearance:D.appearance,onEnable:function(ctx){" +
      "if(D.css)ctx.addCSS(D.css);" +
      "if(D.vars)for(var k in D.vars)ctx.setVar(k,D.vars[k]);" +
      "function ap(){for(var i=0;i<D.settings.length;i++){var s=D.settings[i];var v=ctx.getSetting(s.key);" +
      "if(s.var){if(v!=null&&v!=='')ctx.setVar(s.var,v);if(s.varDim&&/^#[0-9a-fA-F]{6}$/.test(v))ctx.setVar(s.varDim,v+'33');continue;}" +
      "var a='data-t-'+s.key;" +
      "if(s.type==='toggle')document.documentElement.toggleAttribute(a,!!v);" +
      "else document.documentElement.setAttribute(a,v==null?'':String(v));}}" +
      "ap();ctx.onSetting(function(){ap();});" +
      "ctx._unsub.push(function(){for(var i=0;i<D.settings.length;i++)document.documentElement.removeAttribute('data-t-'+D.settings[i].key);});" +
      "}});})();";
  }

  function assetPreamble(id, fileMap) {
    if (!id) return "";
    const assets = {};
    for (const p of Object.keys(fileMap)) { const v = fileMap[p]; if (typeof v === "string" && v.slice(0, 5) === "data:") assets[p.split("/").pop()] = v; }
    return Object.keys(assets).length ? "QB._registerAssets(" + JSON.stringify(id) + "," + JSON.stringify(assets) + ");\n" : "";
  }

  QB.installPackage = (fileMap) => {
    const paths = Object.keys(fileMap);
    let entry = null, manifest = null;
    const mfPath = paths.find((p) => /(^|\/)(theme|plugin|manifest)\.json$/i.test(p));
    if (mfPath) { try { manifest = JSON.parse(fileMap[mfPath]); if (manifest.entry) entry = manifest.entry; } catch (e) { importFail("Bad manifest JSON: " + e.message); return null; } }
    const resolvePath = (name) => paths.find((p) => p.endsWith("/" + name) || p === name);

    // Multifile packages: manifest.files is an ordered list of .js files that
    // are combined into one script sharing a single top-level scope.
    let code = null, filename = null;
    if (manifest && Array.isArray(manifest.files) && manifest.files.length) {
      const parts = [];
      for (const f of manifest.files) {
        const p = resolvePath(f);
        if (!p) { importFail("Package is missing a file listed in its manifest: " + f); return null; }
        const body = fileMap[p];
        if (typeof body !== "string" || body.slice(0, 5) === "data:") { importFail("manifest.files entry is not a script: " + f); return null; }
        parts.push(body);
      }
      code = parts.join("\n;\n");
      filename = String(entry || manifest.files[manifest.files.length - 1]).split("/").pop();
    } else {
      const codePath =
        (entry && resolvePath(entry)) ||
        paths.find((p) => /(^|\/)(theme|plugin)\.js$/i.test(p)) ||
        paths.find((p) => /\.js$/i.test(p));
      if (!codePath) {
        const styleList = manifest && manifest.style ? (Array.isArray(manifest.style) ? manifest.style : [manifest.style]) : [];
        const cssPaths = styleList.map(resolvePath).filter((p) => p && typeof fileMap[p] === "string");
        const cssText = cssPaths.length
          ? cssPaths.map((p) => fileMap[p]).join("\n")
          : (() => { const p = paths.find((x) => /\.css$/i.test(x)); return p ? fileMap[p] : ""; })();
        const isTheme = manifest && manifest.id && (cssText || manifest.vars || manifest.type === "theme" || /(^|\/)theme\.json$/i.test(mfPath || ""));
        if (isTheme) {
          const dcode = assetPreamble(manifest.id, fileMap) + declarativeThemeCode(manifest, cssText);
          let r; try { r = runEntry(dcode); } catch (e) { importFail("Invalid theme: " + e.message); return null; }
          if (r.theme) return finalizeTheme(manifest.id + ".theme.js", dcode, r.theme);
        }
        importFail("No .js entry or theme CSS found in the package");
        return null;
      }
      code = fileMap[codePath];
      filename = codePath.split("/").pop();
    }

    // manifest.style: one CSS file or an ordered list, auto-attached on enable
    // (works for plugins and themes alike).
    let extraCss = "";
    if (manifest && manifest.style) {
      const styles = Array.isArray(manifest.style) ? manifest.style : [manifest.style];
      const cssParts = [];
      for (const s of styles) {
        const sp = resolvePath(s);
        if (sp && typeof fileMap[sp] === "string") cssParts.push(fileMap[sp]);
      }
      extraCss = cssParts.join("\n");
    }
    const finalCode = assetPreamble(manifest && manifest.id, fileMap) + (extraCss ? wrapWithCss(code, extraCss) : code);
    let r;
    try { r = runEntry(finalCode); } catch (e) { importFail("Invalid package: " + e.message); return null; }
    if (r.theme) return finalizeTheme(filename, finalCode, r.theme);
    if (r.plugin) return finalizePlugin(filename, finalCode, r.plugin, manifest);
    importFail("Package didn't call QB.registerPlugin or QB.registerTheme");
    return null;
  };

  function wrapWithCss(code, cssText) {
    return "(function(){var __css=" + JSON.stringify(cssText) + ";var __ot=QB.registerTheme;var __op=QB.registerPlugin;" +
      "function __wrap(m){var oe=m.onEnable;m.onEnable=function(ctx){try{ctx.addCSS(__css);}catch(e){}if(oe)return oe.call(this,ctx);};return m;}" +
      "QB.registerTheme=function(m){return __ot.call(QB,__wrap(m));};" +
      "QB.registerPlugin=function(m){return __op.call(QB,__wrap(m));};" +
      "try{\n" + code + "\n}finally{QB.registerTheme=__ot;QB.registerPlugin=__op;}})();";
  }

  // ── the app's baseline look ────────────────────────────────────────────────
  // This is NOT an installed theme: it is never listed in Plugins & Themes,
  // never written to localStorage, and cannot be removed. It simply runs
  // whenever no user theme is enabled — so a stock install already looks
  // designed, and turning every theme off returns here rather than to the
  // unstyled defaults. Enabling any theme stands it down; disabling that theme
  // brings it back.
  let _baseTheme = null;
  function baseThemeRec() {
    if (!_baseTheme) {
      _baseTheme = { id: "daylight-cards-studio", name: "Daylight Cards Studio",
        filename: DEFAULT_THEME_FILE, code: STARTER_THEME, enabled: false, _base: true };
    }
    return _baseTheme;
  }
  function enableBaseTheme() {
    const t = baseThemeRec();
    if (t._enabledRuntime) return;
    try {
      if (!t._manifest) t._manifest = runEntry(t.code).theme;
      const ctx = makeCtx(t); t._ctx = ctx;
      if (typeof t._manifest.onEnable === "function") t._manifest.onEnable(ctx);
      t._enabledRuntime = true;
      QB._emit("theme:change", t);
    } catch (e) { console.error(e); }
  }
  function disableBaseTheme() {
    const t = _baseTheme;
    if (!t || !t._enabledRuntime) return;
    try { if (t._manifest && typeof t._manifest.onDisable === "function" && t._ctx) t._manifest.onDisable(t._ctx); } catch (e) { console.error(e); }
    if (t._ctx) t._ctx._unsub.forEach((u) => { try { u(); } catch {} });
    t._ctx = null; t._enabledRuntime = false;
  }
  // Suppressed while enableTheme swaps one theme for another, so the baseline
  // does not flash on between the disable and the enable.
  let _themeSwitching = false;
  // The app's own (dark) look is the default now. Daylight Cards Studio is
  // still offered under Plugins → Themes ("Use" installs it as a normal theme);
  // it no longer switches itself on when no theme is enabled.
  QB.syncBaseTheme = () => {
    if (_themeSwitching) return;
    disableBaseTheme();
  };
  QB.isBaseTheme = (id) => !!(_baseTheme && _baseTheme._base && id === _baseTheme.id);

  QB.boot = (host) => {
    QB.connect(host);
    const builtinIds = new Set(QB._builtinManifests.map((m) => m.id).concat(Object.keys(RETIRED_PLUGINS)));
    const stored = loadStore(PLUGINS_KEY);
    QB._plugins = stored.filter((p) => p.code && !builtinIds.has(p.id));
    if (QB._plugins.length !== stored.filter((p) => p.code).length) savePlugins();
    for (const m of QB._builtinManifests) {
      QB._plugins.push({ id: m.id, name: m.name || m.id, version: m.version || "1.0", author: m.author || "OfflineQuiz", description: m.description || "", filename: "", code: null, enabled: true, _manifest: m, _builtin: true });
    }
    QB._themes = loadStore(THEMES_KEY).filter((t) => t.code);
    // An earlier build briefly auto-INSTALLED the default theme into the user's
    // list. It is a built-in baseline now, so drop that copy — but only the one
    // we installed, never a theme the user imported themselves.
    try {
      if (localStorage.getItem("qb-default-theme-installed")) {
        localStorage.removeItem("qb-default-theme-installed");
        const i = QB._themes.findIndex((x) => x.id === "daylight-cards-studio");
        if (i >= 0) { QB._themes.splice(i, 1); saveThemes(); }
      }
    } catch (e) {}
    // Daylight Cards Studio is withdrawn for now (its layout predates the
    // redesign and no longer lines up): drop an installed copy, back to Default.
    {
      const i = QB._themes.findIndex((x) => x.id === "daylight-cards-studio");
      if (i >= 0) { QB._themes.splice(i, 1); saveThemes(); }
    }
    // The website has no themes, only the default dark/light.
    const t = WEBSITE ? null : QB._themes.find((x) => x.enabled);
    QB._themes.forEach((x) => { x._enabledRuntime = false; });
    if (t && t.code) QB.enableTheme(t.id);
    QB.syncBaseTheme();
    // The website runs installed plugins only for a signed-in account (when
    // accounts are required): app.js calls setPluginsAllowed once it knows.
    // plugins start once the profile's plugin data is here (a moment; at most 4 s — then
    // they start on what this machine has, and the data loads after)
    QB._plugins.forEach((p) => { p._enabledRuntime = false; });
    // what's built in (multiplayer) starts now — the website's addresses (/multiplayer/<room>,
    // /shop/done) need it at once; the rest once the profile's data is here
    PD.applying = true;
    try { QB._plugins.forEach((p) => { if (p._builtin && p.enabled) QB.enablePlugin(p.id); }); } finally { PD.applying = false; }
    const loaded = Promise.race([pdLoad().then((d) => { PD.data = d; pdMigrate(); return true; }, () => false), new Promise((r) => setTimeout(() => r(false), 4000))]);
    QB._ready = loaded.then(async (ok) => {
      // starting what this machine had on isn't a change to the list (the profile's list says
      // what's on: applyPluginList, next)
      PD.applying = true;
      try { QB._plugins.forEach((p) => { if (p.enabled && !p._enabledRuntime && (p._builtin || !QB._pluginsHeld)) QB.enablePlugin(p.id); }); }
      finally { PD.applying = false; }
      if (ok) { try { if (await applyPluginList()) QB._emit("plugins:changed"); } catch (e) { console.error(e); } }
      else setTimeout(() => QB.reloadPluginData(), 3000);
      QB._emit("plugins:ready");
    });
    if (WEBSITE) {
      setTimeout(storeAutoUpdate, 2500);
      // what the app (or another tab) changed shows up when this tab is looked at again
      document.addEventListener("visibilitychange", () => { if (!document.hidden && PD.data) QB.reloadPluginData(); });
    }
  };
  QB.whenReady = () => QB._ready || Promise.resolve();
  // The website keeps the plugins someone added current with the Store (a new version
  // brings its fixes and its guide); Manage still turns them on and off. (The app gets
  // its plugins with app updates.)
  async function storeAutoUpdate() {
    try {
      const r = await fetch("/api/plugin-store", { cache: "no-store" }); if (!r.ok) return;
      const list = ((await r.json()) || {}).plugins || [];
      if (!QB._store.list) QB._store.list = list;
      let n = 0;
      for (const item of list) {
        const have = QB._plugins.find((x) => x.id === item.id && !x._builtin);
        if (!have || !verNewer(item.version, have.version)) continue;
        try { const z = await fetch("/store/" + encodeURIComponent(item.file)); if (z.ok && await QB.installZipBytes(new Uint8Array(await z.arrayBuffer()))) n++; } catch (e) {}
      }
      if (n && document.getElementById("extensions-container")?.offsetParent) QB.renderScreen();
    } catch (e) {}
  }
  QB._pluginsHeld = !window.qbreader && !!window.QB_WEB;
  // Stand installed plugins down (signed out) or bring them back, without
  // touching their saved on/off.
  QB.setPluginsAllowed = (ok) => {
    if (window.qbreader || !window.QB_WEB) return;
    QB._pluginsHeld = !ok;
    let changed = false;
    QB._plugins.forEach((p) => {
      if (p._builtin) return;
      if (ok && p.enabled && !p._enabledRuntime) { QB.enablePlugin(p.id); changed = true; }
      if (!ok && p._enabledRuntime) {
        try { if (p._manifest && typeof p._manifest.onDisable === "function" && p._ctx) p._manifest.onDisable(p._ctx); } catch (e) { console.error(e); }
        if (p._ctx) p._ctx._unsub.forEach((u) => { try { u(); } catch {} });
        p._ctx = null; p._enabledRuntime = false; changed = true;
      }
    });
    if (changed) QB._emit("plugins:changed");
  };

  function readArrayBuffer(file) {
    return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsArrayBuffer(file); });
  }
  async function inflateRaw(bytes) {
    const ds = new DecompressionStream("deflate-raw");
    const ab = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
    return new Uint8Array(ab);
  }
  const IMG_EXT = /\.(png|jpe?g|gif|webp|bmp|ico|avif|svg)$/i;
  function mimeOf(name) {
    const e = (name.split(".").pop() || "").toLowerCase();
    return { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
      webp: "image/webp", bmp: "image/bmp", ico: "image/x-icon", avif: "image/avif",
      svg: "image/svg+xml" }[e] || "application/octet-stream";
  }
  function bytesToBase64(bytes) {
    let bin = ""; const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return btoa(bin);
  }
  async function unzip(arrayBuffer) {
    const u8 = new Uint8Array(arrayBuffer);
    const dv = new DataView(arrayBuffer);
    let eocd = -1;
    for (let i = u8.length - 22; i >= 0; i--) { if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; } }
    if (eocd < 0) throw new Error("not a valid .zip");
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    const dec = new TextDecoder();
    const files = {};
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(off, true) !== 0x02014b50) break;
      const method = dv.getUint16(off + 10, true);
      const compSize = dv.getUint32(off + 20, true);
      const nameLen = dv.getUint16(off + 28, true);
      const extraLen = dv.getUint16(off + 30, true);
      const commentLen = dv.getUint16(off + 32, true);
      const localOff = dv.getUint32(off + 42, true);
      const name = dec.decode(u8.subarray(off + 46, off + 46 + nameLen));
      const lNameLen = dv.getUint16(localOff + 26, true);
      const lExtraLen = dv.getUint16(localOff + 28, true);
      const dataStart = localOff + 30 + lNameLen + lExtraLen;
      const comp = u8.subarray(dataStart, dataStart + compSize);
      if (!name.endsWith("/") && !name.startsWith("__MACOSX/") && !name.endsWith(".DS_Store")) {
        try {
          const data = method === 0 ? comp : method === 8 ? await inflateRaw(comp) : null;
          if (data) files[name] = IMG_EXT.test(name) ? ("data:" + mimeOf(name) + ";base64," + bytesToBase64(data)) : dec.decode(data);
        } catch (e) {}
      }
      off += 46 + nameLen + extraLen + commentLen;
    }
    return files;
  }
  async function handleZips(fileList, zoneId) {
    QB._importError = null; QB._importZone = zoneId || null;
    for (const f of fileList) {
      if (!/\.zip$/i.test(f.name)) { importFail("Import a .zip package"); continue; }
      try {
        const files = await unzip(await readArrayBuffer(f));
        if (!Object.keys(files).length) throw new Error("empty archive");
        QB.installPackage(files);
      } catch (e) { importFail("Could not read " + f.name + ": " + e.message); }
    }
    QB.renderScreen();
    QB._importError = null; QB._importZone = null;   // shown once, for this import only
  }

  QB.installZipBytes = async (bytes) => {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const files = await unzip(u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength));
    if (!Object.keys(files).length) throw new Error("empty archive");
    return QB.installPackage(files);
  };

  // The theme a fresh install ships with, embedded so first launch needs no
  // file access. Swapping the default means replacing this source AND the
  // DEFAULT_THEME_FILE name below.
  const DEFAULT_THEME_FILE = "daylight-cards-studio.js";
  const STARTER_THEME = String.raw`
/**
 * Daylight Cards Studio — a copy of "Daylight Cards" that takes over the WHOLE
 * Appearance settings section with a custom UI (ctx.registerAppearancePanel),
 * instead of the standard select/toggle controls. The base preset/custom pickers
 * are hidden; everything you see in Appearance is built by this theme.
 */
QB.registerTheme({
  id: "daylight-cards-studio",
  name: "Daylight Cards Studio",
  version: "1.3.0",
  author: "OfflineQuiz",
  description: "Light card-based restyle with a fully CUSTOM Appearance panel: palette cards, a live accent picker, font + layout buttons, and a shadow toggle — all built by the theme via registerAppearancePanel.",
  // Settings still exist (defaults + persistence) but are NOT auto-rendered —
  // location:"hidden" keeps them out of every section so our panel owns the UI.
  settings: [
    { key: "palette", type: "hidden", default: "paper" },
    { key: "accentOverride", type: "hidden", default: "" },
    { key: "font", type: "hidden", default: "sans" },
    { key: "panelSide", type: "hidden", default: "right" },
    { key: "shadows", type: "hidden", default: true },
    { key: "custom", type: "hidden", default: "" },
  ],
  onEnable: function (ctx) {
    var palettes = {
      paper:    { label: "Paper",    accent: "#2563eb", bg: "#f4f6fb", sec: "#ffffff", ter: "#eef1f7", text: "#1c2433", text2: "#475569", muted: "#94a3b8", border: "#d8dee9", border2: "#e5e9f2", green: "#15803d", red: "#dc2626", yellow: "#b45309" },
      sepia:    { label: "Sepia",    accent: "#9a3412", bg: "#f6efe3", sec: "#fffaf0", ter: "#efe6d4", text: "#3b2f23", text2: "#6b5b48", muted: "#a3937d", border: "#ddd0b8", border2: "#e8ddc9", green: "#3f6212", red: "#b91c1c", yellow: "#92600a" },
      slate:    { label: "Slate",    accent: "#0e7490", bg: "#eceff3", sec: "#f8fafc", ter: "#e2e8f0", text: "#0f172a", text2: "#475569", muted: "#8b9bb0", border: "#cbd5e1", border2: "#dbe3ec", green: "#047857", red: "#be123c", yellow: "#a16207" },
      midnight: { label: "Midnight", accent: "#5b8cff", bg: "#0f1522", sec: "#161e30", ter: "#1d2740", text: "#e8edf7", text2: "#aab6cf", muted: "#5f6c87", border: "#2b3650", border2: "#222c44", green: "#3ecf8e", red: "#ff6b7a", yellow: "#e8b339" },
    };
    var fonts = {
      sans: "'Avenir Next','Segoe UI','Helvetica Neue',system-ui,sans-serif",
      serif: "Georgia,'Iowan Old Style','Times New Roman',serif",
    };
    function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

    // Every themable part, its CSS variable, and where its palette default
    // comes from. "dim" parts also get a translucent -dim companion.
    var PARTS = [
      { v: "--bg", label: "Background", of: "bg" },
      { v: "--bg-secondary", label: "Cards", of: "sec" },
      { v: "--bg-tertiary", label: "Panels & inputs", of: "ter" },
      { v: "--text", label: "Text", of: "text" },
      { v: "--text-secondary", label: "Secondary text", of: "text2" },
      { v: "--text-muted", label: "Muted text", of: "muted" },
      { v: "--border", label: "Borders", of: "border" },
      { v: "--border-light", label: "Light borders", of: "border2" },
      { v: "--green", label: "Correct", of: "green", dim: true },
      { v: "--red", label: "Wrong", of: "red", dim: true },
      { v: "--yellow", label: "Warning", of: "yellow", dim: true },
      { v: "--star", label: "Stars", of: "accent" },
      { v: "--power-mark", label: "Power mark", of: "accent" },
    ];
    function customMap() {
      try { var m = JSON.parse(ctx.getSetting("custom") || "{}"); return m && typeof m === "object" ? m : {}; }
      catch (e) { return {}; }
    }
    function apply() {
      var p = palettes[ctx.getSetting("palette")] || palettes.paper;
      var accent = ctx.getSetting("accentOverride") || p.accent;
      var custom = customMap();
      ctx.setVar("--accent", accent); ctx.setVar("--accent-dim", accent + "22");
      ctx.setVar("--bg", p.bg); ctx.setVar("--bg-secondary", p.sec); ctx.setVar("--bg-tertiary", p.ter);
      ctx.setVar("--text", p.text); ctx.setVar("--text-secondary", p.text2); ctx.setVar("--text-muted", p.muted);
      ctx.setVar("--border", p.border); ctx.setVar("--border-light", p.border2);
      ctx.setVar("--green", p.green); ctx.setVar("--green-dim", p.green + "22");
      ctx.setVar("--red", p.red); ctx.setVar("--red-dim", p.red + "22");
      ctx.setVar("--yellow", p.yellow); ctx.setVar("--yellow-dim", p.yellow + "22");
      ctx.setVar("--star", accent); ctx.setVar("--power-mark", accent);
      ctx.setVar("--buzz-mark-self", p.green); ctx.setVar("--buzz-mark-other", p.yellow);
      PARTS.forEach(function (part) {
        var c = custom[part.v];
        if (!c || !/^#[0-9a-fA-F]{6}$/.test(c)) return;
        ctx.setVar(part.v, c);
        if (part.dim) ctx.setVar(part.v + "-dim", c + "22");
      });
      ctx.setVar("--font", fonts[ctx.getSetting("font")] || fonts.sans);
      ctx.setVar("--radius", "12px");
      var d = document.documentElement;
      d.setAttribute("data-dls", "1");
      d.setAttribute("data-dls-side", ctx.getSetting("panelSide") || "right");
      d.toggleAttribute("data-dls-shadow", ctx.getSetting("shadows") !== false);
      d.setAttribute("data-dls-art", "1");
    }
    apply();

    // ── The same card re-layout as Daylight Cards (data-dls scoped) ──
    ctx.addCSS(
      "[data-dls][data-dls-side='right'] .practice-layout{flex-direction:row-reverse}" +
      "[data-dls] .top-bar{margin:10px 14px 4px;border:1px solid var(--border);border-radius:14px;background:var(--bg-secondary);padding:10px 16px}" +
      "[data-dls] .filters-panel,[data-dls] .stats-panel{background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;margin:8px}" +
      "[data-dls-shadow] .filters-panel,[data-dls-shadow] .stats-panel,[data-dls-shadow] .top-bar,[data-dls-shadow] .qcard,[data-dls-shadow] .history-panel,[data-dls-shadow] .stats-section,[data-dls-shadow] .question-content{box-shadow:0 2px 10px rgba(15,23,42,.06)}" +
      "[data-dls] .question-area{padding:24px 28px}" +
      "[data-dls] .question-content{background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:18px 20px}" +
      "[data-dls] .history-panel,[data-dls] .stats-section{background:var(--bg-secondary);border:1px solid var(--border);border-radius:14px;padding:14px}" +
      "[data-dls] .btn{border-radius:10px}[data-dls] .btn-primary{box-shadow:none}" +
      "[data-dls] input[type=text],[data-dls] input[type=number],[data-dls] select{border-radius:8px}" +
      // ── "Remove ASCII art" → Daylight Cards title screen: hide the art, show a
      //    styled wordmark, and lay the menu out as a 2-column card grid. Scoped to
      //    [data-dls-art] so toggling the setting brings the ASCII art back. ──
      "[data-dls][data-dls-art] #title-screen{flex-direction:column;align-items:center;overflow:hidden;padding:18px 0 8px}" +
      "[data-dls][data-dls-art] #title-screen .title-left,[data-dls][data-dls-art] #title-screen.sidebar .title-left,[data-dls][data-dls-art] #title-screen.stacked .title-left{width:100%;max-width:860px;flex:1 1 auto;min-height:0;margin:0 auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:10px 28px;border:none;background:transparent;overflow:hidden}" +
      "[data-dls][data-dls-art] .title-art,[data-dls][data-dls-art] .title-art-stacked-spot,[data-dls][data-dls-art] .settings-art-panel,[data-dls][data-dls-art] .art-frame{display:none!important}" +
      "[data-dls][data-dls-art] .settings-container{max-width:none;padding:24px 48px}" +
      "[data-dls][data-dls-art] .title-logo{display:flex;flex-direction:column;align-items:center;flex:0 0 auto}" +
      "[data-dls][data-dls-art] .title-logo pre{display:none}" +
      "[data-dls][data-dls-art] .title-logo::before{content:'OfflineQuiz';display:block;font-size:52px;font-weight:800;letter-spacing:-0.5px;color:var(--text);line-height:1.1}" +
      "[data-dls][data-dls-art] .title-logo::after{content:'';display:block;width:64px;height:4px;border-radius:2px;background:var(--accent);margin:10px auto 0}" +
      "[data-dls][data-dls-art] .title-greeting,[data-dls][data-dls-art] .title-streak{min-height:0;width:100%;text-align:center;flex:0 0 auto}" +
      "[data-dls][data-dls-art] .title-menu{display:grid;grid-template-columns:repeat(2,minmax(240px,1fr));gap:10px;margin-top:14px;width:100%;flex:0 1 auto;min-height:0;overflow-y:auto;padding:2px}" +
      "[data-dls][data-dls-art] .menu-item{display:flex;align-items:center;gap:10px;height:48px;margin:0;padding:0 16px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;text-align:left;font-size:13px}" +
      "[data-dls][data-dls-art] .menu-item:hover{border-color:var(--accent);background:var(--accent-dim);transform:none}" +
      "[data-dls][data-dls-art] .menu-item .key{flex:0 0 auto;font-size:11px;color:var(--accent);background:var(--accent-dim);border-radius:6px;padding:2px 7px}" +
      "[data-dls][data-dls-art] #title-extra-menu{grid-column:1 / -1;display:grid;grid-template-columns:repeat(2,minmax(240px,1fr));gap:10px}" +
      "[data-dls][data-dls-art] #title-extra-menu .title-extra-label{grid-column:1 / -1;font-size:10px;font-weight:700;letter-spacing:1px;color:var(--text-muted);text-align:left;margin:2px 2px 0}" +
      "[data-dls][data-dls-art] .title-status{width:100%;text-align:center;margin-top:10px;font-size:11px;color:var(--text-muted);flex:0 0 auto}" +
      // ── Styling for our custom appearance panel ──
      ".dls-panel{display:flex;flex-direction:column;gap:16px;align-items:stretch}" +
      ".dls-cols{display:flex;flex-wrap:wrap;gap:16px 48px;align-items:flex-start}" +
      ".dls-h{font-size:11px;font-weight:700;letter-spacing:1px;color:var(--text-muted);text-transform:uppercase;margin-bottom:6px}" +
      ".dls-pals{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}" +
      ".dls-pal{display:flex;align-items:center;gap:10px;padding:10px;border:2px solid var(--border);border-radius:12px;background:var(--bg-tertiary);cursor:pointer;transition:border-color 120ms,transform 120ms}" +
      ".dls-pal:hover{transform:translateY(-1px)}" +
      ".dls-pal.sel{border-color:var(--accent)}" +
      ".dls-dots{display:flex;gap:4px}.dls-dot{width:16px;height:16px;border-radius:50%;box-shadow:0 0 0 1px rgba(0,0,0,.12)}" +
      ".dls-pal-name{font-size:13px;font-weight:600;color:var(--text)}" +
      ".dls-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
      ".dls-seg{display:inline-flex;border:1px solid var(--border);border-radius:10px;overflow:hidden}" +
      ".dls-seg button{border:none;background:var(--bg-tertiary);color:var(--text-secondary);padding:6px 14px;font-size:12px;cursor:pointer}" +
      ".dls-seg button.sel{background:var(--accent);color:#fff}" +
      ".dls-accent{display:flex;align-items:center;gap:8px;flex-wrap:wrap}" +
      ".dls-accent input[type=color]{width:42px;height:28px;border:1px solid var(--border);border-radius:8px;background:var(--bg-tertiary);cursor:pointer;padding:0;flex:0 0 auto}" +
      ".dls-sw{flex:0 0 auto;width:24px;height:24px;border-radius:50%;border:2px solid transparent;box-shadow:0 0 0 1px var(--border);cursor:pointer}" +
      ".dls-sw.sel{border-color:var(--text)}" +
      ".dls-btn{font-size:12px;color:var(--text);background:var(--bg-tertiary);border:1px solid var(--border);border-radius:8px;padding:5px 12px;cursor:pointer;flex:0 0 auto}" +
      ".dls-btn:hover{border-color:var(--accent);color:var(--accent)}" +
      ".dls-toggle{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--text)}" +
      ".dls-more{border:1px solid var(--border);border-radius:12px;background:var(--bg-tertiary);padding:10px 14px}" +
      ".dls-more summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px}" +
      ".dls-more summary::-webkit-details-marker{display:none}" +
      ".dls-more summary::before{content:'';width:0;height:0;border-left:5px solid var(--text-muted);border-top:4px solid transparent;border-bottom:4px solid transparent;transition:transform 120ms}" +
      ".dls-more[open] summary::before{transform:rotate(90deg)}" +
      ".dls-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px 18px;margin:12px 0}"
      + ".dls-crow{display:flex;align-items:center;gap:8px}.dls-crow label{flex:1}" +
      ".dls-grid label{font-size:12px;color:var(--text-secondary)}" +
      ".dls-grid input[type=color]{width:38px;height:26px;border:1px solid var(--border);border-radius:7px;background:var(--bg-secondary);cursor:pointer;padding:0}" +
      ".dls-clear{width:22px;height:22px;border:none;border-radius:6px;background:none;color:var(--text-muted);cursor:pointer;font-size:13px;line-height:1}" +
      ".dls-clear:hover{color:var(--red)}" +
      ".dls-clear:disabled{opacity:.25;cursor:default}"
    );

    // ── TAKE OVER the Appearance section with a fully custom UI ──
    var ACCENTS = ["#2563eb", "#7c3aed", "#0e7490", "#15803d", "#b45309", "#dc2626", "#db2777", "#0f172a"];
    ctx.registerAppearancePanel(function (el) {
      var moreOpen = false;
      function g(k) { return ctx.getSetting(k); }
      function build() {
        var pal = g("palette"), accentOv = g("accentOverride") || "", font = g("font"), side = g("panelSide"), shadow = g("shadows") !== false;
        var p0 = palettes[pal] || palettes.paper;
        var custom = customMap();
        var palCards = Object.keys(palettes).map(function (k) {
          var p = palettes[k];
          return '<div class="dls-pal' + (pal === k ? " sel" : "") + '" data-pal="' + k + '">' +
            '<div class="dls-dots"><span class="dls-dot" style="background:' + p.accent + '"></span>' +
            '<span class="dls-dot" style="background:' + p.bg + '"></span>' +
            '<span class="dls-dot" style="background:' + p.text + '"></span></div>' +
            '<span class="dls-pal-name">' + esc(p.label) + "</span></div>";
        }).join("");
        var swatches = ACCENTS.map(function (c) {
          return '<span class="dls-sw' + (accentOv === c ? " sel" : "") + '" data-acc="' + c + '" style="background:' + c + '" title="' + c + '"></span>';
        }).join("");
        var rows = PARTS.map(function (part) {
          var cur = custom[part.v] || p0[part.of] || "#888888";
          var overridden = !!custom[part.v];
          return '<div class="dls-crow"><label>' + esc(part.label) + (overridden ? " •" : "") + '</label>' +
            '<input type="color" data-var="' + part.v + '" value="' + esc(cur) + '">' +
            '<button class="dls-clear" data-clearvar="' + part.v + '" title="Back to palette color"' + (overridden ? "" : " disabled") + '>&times;</button></div>';
        }).join("");
        el.innerHTML =
          '<div class="dls-panel">' +
            '<div><div class="dls-h">Palette</div><div class="dls-pals">' + palCards + "</div></div>" +
            '<div class="dls-cols">' +
              '<div><div class="dls-h">Accent</div><div class="dls-accent">' +
                swatches +
                '<input type="color" id="dls-color" value="' + esc(/^#[0-9a-fA-F]{6}$/.test(accentOv) ? accentOv : p0.accent) + '">' +
                '<button class="dls-btn" id="dls-reset"' + (accentOv ? "" : " disabled") + '>Use palette accent</button>' +
              "</div></div>" +
              '<div><div class="dls-h">Font</div><div class="dls-seg" id="dls-font">' +
                '<button data-font="sans" class="' + (font === "sans" ? "sel" : "") + '">Sans</button>' +
                '<button data-font="serif" class="' + (font === "serif" ? "sel" : "") + '">Serif</button></div></div>' +
              '<div><div class="dls-h">Filters panel side</div><div class="dls-seg" id="dls-side">' +
                '<button data-side="left" class="' + (side === "left" ? "sel" : "") + '">Left</button>' +
                '<button data-side="right" class="' + (side === "right" ? "sel" : "") + '">Right</button></div></div>' +
              '<div><div class="dls-h">Effects</div><label class="dls-toggle"><input type="checkbox" id="dls-shadow"' + (shadow ? " checked" : "") + "> Card shadows</label></div>" +
            "</div>" +
            '<details class="dls-more" id="dls-more"' + (moreOpen ? " open" : "") + '>' +
              '<summary><span class="dls-h" style="margin:0">More settings — colors</span></summary>' +
              '<div class="dls-grid">' + rows + "</div>" +
              '<button class="dls-btn" id="dls-clearall">Reset all custom colors</button>' +
            "</details>" +
          "</div>";
        wire();
      }
      function setCustom(v, val) {
        var m = customMap();
        if (val == null) delete m[v]; else m[v] = val;
        ctx.setSetting("custom", Object.keys(m).length ? JSON.stringify(m) : "");
      }
      function wire() {
        el.querySelectorAll("[data-pal]").forEach(function (b) { b.onclick = function () { ctx.setSetting("palette", b.dataset.pal); build(); }; });
        el.querySelectorAll("[data-acc]").forEach(function (b) { b.onclick = function () { ctx.setSetting("accentOverride", b.dataset.acc); build(); }; });
        var col = el.querySelector("#dls-color"); if (col) { col.oninput = function () { ctx.setSetting("accentOverride", col.value); }; col.onchange = function () { build(); }; }
        var rst = el.querySelector("#dls-reset"); if (rst) rst.onclick = function () { ctx.setSetting("accentOverride", ""); build(); };
        el.querySelectorAll("#dls-font button").forEach(function (b) { b.onclick = function () { ctx.setSetting("font", b.dataset.font); build(); }; });
        el.querySelectorAll("#dls-side button").forEach(function (b) { b.onclick = function () { ctx.setSetting("panelSide", b.dataset.side); build(); }; });
        var sh = el.querySelector("#dls-shadow"); if (sh) sh.onchange = function () { ctx.setSetting("shadows", sh.checked); };
        var more = el.querySelector("#dls-more"); if (more) more.ontoggle = function () { moreOpen = more.open; };
        el.querySelectorAll(".dls-grid input[type=color]").forEach(function (inp) {
          inp.oninput = function () { setCustom(inp.dataset.var, inp.value); };
          inp.onchange = function () { build(); };
        });
        el.querySelectorAll("[data-clearvar]").forEach(function (b) {
          b.onclick = function () { setCustom(b.dataset.clearvar, null); build(); };
        });
        var ca = el.querySelector("#dls-clearall"); if (ca) ca.onclick = function () { ctx.setSetting("custom", ""); build(); };
      }
      build();
    }, { title: "Daylight Studio — Appearance" });

    // Re-apply the palette whenever any setting changes.
    ctx.onSetting(function () { apply(); });
  },
  onDisable: function () {
    var d = document.documentElement;
    d.removeAttribute("data-dls"); d.removeAttribute("data-dls-side"); d.removeAttribute("data-dls-shadow"); d.removeAttribute("data-dls-art");
  },
});

`;

  // Kept for the console / older callers: installs the baseline as a normal,
  // user-managed theme. Nothing in the app calls it — the baseline runs on its
  // own now (see syncBaseTheme), so using this only creates a duplicate entry.
  QB.installStarterTheme = () => { QB.installTheme(DEFAULT_THEME_FILE, STARTER_THEME); QB.renderScreen(); };

  function settingControl(extId, def) {
    const val = QB.getSetting(extId, def.key);
    const idAttr = ' data-ext-id="' + esc(extId) + '" data-setting-key="' + esc(def.key) + '"';
    let control = "";
    if (def.type === "toggle") {
      control = '<label class="ext-switch ext-switch-sm"><input type="checkbox"' + idAttr + (val ? " checked" : "") + '><span class="ext-slider"></span></label>';
    } else if (def.type === "select") {
      let opts = typeof def.options === "function" ? def.options() : (def.options || []);
      if (!Array.isArray(opts)) opts = [];
      control = '<select class="ext-setting-input"' + idAttr + ">" +
        opts.map((o) => { const v = o.value != null ? o.value : o; const l = o.label != null ? o.label : o; return '<option value="' + esc(v) + '"' + (val == v ? " selected" : "") + ">" + esc(l) + "</option>"; }).join("") + "</select>";
    } else if (def.type === "color") {
      control = '<input type="color" class="ext-setting-color"' + idAttr + ' value="' + esc(val || "#000000") + '">';
    } else if (def.type === "swatches") {
      let opts = typeof def.options === "function" ? def.options() : (def.options || []);
      if (!Array.isArray(opts)) opts = [];
      const sw = opts.map((o) => {
        const v = o && o.value != null ? o.value : o;
        const l = o && o.label != null ? o.label : v;
        return '<button type="button" class="ext-swatch' + (val == v ? " sel" : "") + '"' + idAttr +
          ' data-swatch="' + esc(v) + '" style="background:' + esc(v) + '" title="' + esc(l) + '"></button>';
      }).join("");
      const custom = def.custom === false ? "" :
        '<label class="ext-swatch-custom">Custom<input type="color" class="ext-setting-color"' + idAttr +
        ' value="' + esc(/^#[0-9a-fA-F]{6}$/.test(val || "") ? val : "#000000") + '"></label>';
      control = '<div class="ext-swatches">' + sw + custom + "</div>";
    } else {
      const t = def.type === "number" ? "number" : def.type === "password" ? "password" : "text";
      control = '<input type="' + t + '" class="ext-setting-input"' + idAttr + ' value="' + esc(val != null ? val : "") + '"' + (def.placeholder ? ' placeholder="' + esc(def.placeholder) + '"' : "") + ' autocomplete="off" spellcheck="false">';
    }
    return '<div class="ext-setting-row"><span class="ext-setting-label">' + esc(def.label) + "</span>" + control + "</div>";
  }
  function settingsHtml(ext, location) {
    const defs = ((ext._manifest && ext._manifest.settings) || []).filter((d) => d.type !== "hidden" && (d.location || "card") === location);
    if (!ext.enabled || !defs.length) return "";
    return defs.map((d) => settingControl(ext.id, d)).join("");
  }
  function wireSettingControls(root) {
    if (!root) return;
    root.querySelectorAll("input[data-setting-key],select[data-setting-key],textarea[data-setting-key]").forEach((el) => {
      const id = el.dataset.extId, key = el.dataset.settingKey;
      const evt = el.tagName === "SELECT" || el.type === "checkbox" ? "change" : "input";
      el.addEventListener(evt, () => {
        const v = el.type === "checkbox" ? el.checked : (el.type === "number" ? parseFloat(el.value) : el.value);
        QB.setSetting(id, key, v);
      });
    });
    root.querySelectorAll(".ext-swatch[data-setting-key]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.extId, key = btn.dataset.settingKey;
        QB.setSetting(id, key, btn.dataset.swatch);
        root.querySelectorAll('.ext-swatch[data-setting-key="' + key + '"]').forEach((b) => b.classList.toggle("sel", b === btn));
      });
    });
    (QB._settingsSections || []).forEach((rec) => {
      if (!rec || typeof rec.render !== "function") return;
      const host = root.querySelector('[data-settings-section="' + rec.pluginId + ":" + rec.id + '"]');
      if (host) { try { rec.render(host); } catch (e) { console.error("[QB] settings section", rec.pluginId, e); } }
    });
  }

  function renderSettingsInto(container, location) {
    if (!container) return;
    const exts = QB._themes.filter((t) => t.enabled).concat(QB._plugins.filter((p) => p.enabled));
    let html = "";
    const fullPanels = location === "appearance" ? (QB._settingsSections || []).filter((s) => s._fullAppearance) : [];
    fullPanels.forEach((s) => {
      // no "<Theme> — Appearance" heading: the section is already titled APPEARANCE
      html += '<div class="ext-appearance-panel" data-settings-section="' + esc(s.pluginId + ":" + s.id) + '"></div>';
    });
    exts.forEach((ext) => {
      const inner = settingsHtml(ext, location);
      const sections = (QB._settingsSections || []).filter((s) => s.pluginId === ext.id && (s.location || "appearance") === location && !s._fullAppearance);
      const sectionHtml = sections.map((s) =>
        (s.title ? '<div class="ext-setting-label">' + esc(s.title) + "</div>" : "") +
        '<div data-settings-section="' + esc(ext.id + ":" + s.id) + '"></div>'
      ).join("");
      if (inner || sectionHtml) html += '<div class="ext-settings-group"><div class="ext-settings-group-title">' + esc(ext.name) + "</div>" + (inner || "") + sectionHtml + "</div>";
    });
    container.innerHTML = html;
    container.style.display = html ? "" : "none";
    wireSettingControls(container);
  }
  QB.hasAppearancePanel = () => (QB._settingsSections || []).some((s) => s._fullAppearance);
  QB.renderSettingsSections = (container) => {
    renderSettingsInto(container, "settings");
    const sec = container && container.closest(".stats-section");
    if (sec) sec.style.display = container && container.children.length ? "" : "none";
  };
  QB.renderPracticeSettings = (container) => renderSettingsInto(container, "practice");
  QB.renderAppearanceSettings = (container) => {
    renderSettingsInto(container, "appearance");
    try { if (QB._host && QB._host.syncAppearanceSection) QB._host.syncAppearanceSection(); } catch (e) {}
  };

  function dropError(zoneId) {
    return QB._importError && QB._importZone === zoneId ? '<div class="ext-drop-error">' + esc(QB._importError) + "</div>" : "";
  }
  function card(ext, kind) {
    const idAttr = kind === "theme" ? "data-theme-id" : "data-plugin-id";
    const removeAttr = kind === "theme" ? "data-remove-theme" : "data-remove-plugin";
    const badge = kind === "theme" ? "theme" : "plugin";
    const onLabel = kind === "theme" ? "active" : "enabled";
    return (
      '<div class="ext-card' + (ext.enabled ? " active" : "") + '">' +
        '<div class="ext-card-row">' +
          '<div class="ext-card-main">' +
            '<div class="ext-card-title">' + esc(ext.name) +
              (ext.description ? ' <span class="qb-info" data-tip="' + esc(ext.description) + '">i</span>' : "") +
              ' <span class="ext-badge">' + badge + "</span>" +
              (kind === "plugin" ? ' <span class="ext-ver">v' + esc(ext.version) + "</span>" : "") +
              (ext.enabled ? ' <span class="ext-badge on">' + onLabel + "</span>" : "") +
              (ext._error ? ' <span class="ext-badge err">failed</span><span class="qb-info" data-tip="' + esc(ext._error) + '">i</span>' : "") +
            "</div>" +
            '<div class="ext-card-meta">by ' + esc(ext.author) + (ext.filename ? " · " + esc(ext.filename) : "") + "</div>" +
          "</div>" +
          '<div class="ext-card-actions">' +
            '<label class="ext-switch"><input type="checkbox" ' + idAttr + '="' + esc(ext.id) + '"' + (ext.enabled ? " checked" : "") + '><span class="ext-slider"></span></label>' +
            '<button class="ext-remove" ' + removeAttr + '="' + esc(ext.id) + '" title="Remove">&times;</button>' +
          "</div>" +
        "</div>" +
        (settingsHtml(ext, "card") ? '<div class="ext-settings">' + settingsHtml(ext, "card") + "</div>" : "") +
      "</div>"
    );
  }

  const UPLOAD_ICON =
    '<svg class="ext-drop-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 15V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></svg>';

  // ── Plugins page: Open (plugin pages) · Manage (install / on-off) · Themes ──
  const PLUGIN_GROUP = {
    "flashcards": "Study", "coach-mode": "Study",
    "packet-builder": "Tools", "folders": "Tools",
    "keyword-freq": "Analysis", "buzz-words": "Analysis", "fact-sheet": "Analysis", "canon-tracker": "Analysis",
    "achievement-glyphs": "Extras",
  };
  const GROUP_ORDER = ["Study", "Tools", "Analysis", "Extras", "Other"];
  const GROUP_COLOR = { Study: "#3fb950", Tools: "#58a6ff", Analysis: "#bc8cff", Extras: "#8b949e", Other: "#8b949e" };
  const groupOf = (id) => PLUGIN_GROUP[id] || "Other";
  const mono = (name) => String(name || "?").replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  const ICO = {
    upload: '<svg class="ext-drop-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>',
    trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  };
  // Theme preview colours: a declarative theme's vars, or a known palette.
  const KNOWN_THEME_COLORS = {
    "daylight-cards-studio": ["#f4f6fb", "#ffffff", "#2563eb", "#1c2433"],
    "aurora": ["#0b1a24", "#12303f", "#4fd1c5", "#d7f4f1"], "phosphor": ["#020a02", "#0b1d0b", "#33ff66", "#7dff9a"],
    "synthwave84": ["#1a0b2e", "#2b1050", "#ff3bd4", "#f9e2ff"], "synthwave": ["#1a0b2e", "#2b1050", "#ff3bd4", "#f9e2ff"],
    "clarity": ["#000000", "#1a1a1a", "#ffd400", "#ffffff"], "daylight": ["#ffffff", "#eaeef2", "#0969da", "#1f2328"],
  };
  function themeColors(t) {
    const v = (t && t._manifest && t._manifest.vars) || null;
    if (v && (v["--bg"] || v["--accent"])) return [v["--bg"] || "#0d1117", v["--bg-secondary"] || v["--bg"] || "#161b22", v["--accent"] || "#58a6ff", v["--text"] || "#c9d1d9"];
    if (t && KNOWN_THEME_COLORS[t.id]) return KNOWN_THEME_COLORS[t.id];
    let h = 0; for (const ch of String((t && t.id) || "")) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return ["hsl(" + h + " 30% 9%)", "hsl(" + h + " 26% 15%)", "hsl(" + h + " 80% 62%)", "hsl(" + h + " 20% 82%)"];
  }
  function themeCardHtml(key, name, colors, active, desc, removable) {
    const [bg, panel, acc, text] = colors;
    return '<div class="theme-card' + (active ? " on" : "") + '">' +
      '<div class="theme-prev" style="background:' + esc(bg) + '"><i style="height:14px;width:60%;background:' + esc(panel) + '"></i><i style="height:8px;width:85%;background:' + esc(text) + ';opacity:.6"></i><i style="height:8px;width:70%;background:' + esc(text) + ';opacity:.35"></i><i style="height:22px;width:90px;margin-top:auto;border-radius:6px;background:' + esc(acc) + '"></i></div>' +
      '<div class="theme-foot"><b>' + esc(name) + "</b>" + (desc ? '<span class="qb-info" data-tip="' + esc(desc) + '">i</span>' : "") +
        (removable ? '<button type="button" class="btn btn-ghost btn-icon btn-sm" data-remove-theme="' + esc(key) + '" title="Remove" aria-label="Remove ' + esc(name) + '">' + ICO.trash + "</button>" : "") +
        '<button type="button" class="btn btn-sm' + (active ? " in-use" : "") + '" data-use-theme="' + esc(key) + '"' + (active ? " disabled" : "") + ">" + (active ? "In use" : "Use") + "</button></div></div>";
  }
  // ── Plugin icons: plugin.json's "icon" (inner markup of a 24×24 stroke SVG), kept to plain
  // shapes and geometry attributes; a plugin without one shows its initials ──
  const ICON_TAGS = new Set(["path", "rect", "circle", "ellipse", "line", "polyline", "polygon"]);
  const ICON_ATTRS = new Set(["d", "x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "y1", "x2", "y2", "points", "fill", "stroke-width", "opacity", "transform"]);
  const _iconCache = new Map();
  function cleanIcon(markup) {
    if (!markup || typeof markup !== "string") return "";
    if (_iconCache.has(markup)) return _iconCache.get(markup);
    let out = "";
    try {
      const doc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + markup + "</svg>", "image/svg+xml");
      if (!doc.querySelector("parsererror")) {
        for (const el of doc.documentElement.querySelectorAll("*")) {
          const tag = el.localName; if (!ICON_TAGS.has(tag)) continue;
          let a = "";
          for (const at of el.attributes) if (ICON_ATTRS.has(at.name) && !/[<>"]|url\(|javascript:/i.test(at.value)) a += " " + at.name + '="' + at.value + '"';
          out += "<" + tag + a + "/>";
        }
      }
    } catch (e) { out = ""; }
    _iconCache.set(markup, out);
    return out;
  }
  const iconSvg = (markup, size) => { const inner = cleanIcon(markup); return inner ? '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>" : ""; };
  // the icon of an installed plugin (or a Store item) as SVG, "" when it has none
  QB.pluginIconHtml = (idOrItem, size) => {
    const p = typeof idOrItem === "string" ? (QB._plugins.find((x) => x.id === idOrItem) || ((QB._store && QB._store.list) || []).find((x) => x.id === idOrItem)) : idOrItem;
    return iconSvg(p && p.icon, size || 18);
  };
  const piconHtml = (item, color, extra) => {
    const svg = iconSvg(item && item.icon, 20);
    return '<span class="picon' + (svg ? " has-ico" : "") + (extra || "") + '" style="--c:' + color + '">' + (svg || esc(mono(item && item.name))) + "</span>";
  };

  // ── The plugin guide: clicking a plugin in Manage or the Store opens its how-to article
  // (plugin.json "guide": { tagline, sections: [{ title, body | steps | keys }] }) ──
  function guideInline(t) {
    return esc(t).replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<kbd>$1</kbd>");
  }
  function guideBody(text) {
    return String(text || "").split(/\n\s*\n/).map((block) => {
      const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
      if (!lines.length) return "";
      if (lines.every((l) => l.startsWith("- "))) return "<ul>" + lines.map((l) => "<li>" + guideInline(l.slice(2)) + "</li>").join("") + "</ul>";
      return "<p>" + lines.map(guideInline).join("<br>") + "</p>";
    }).join("");
  }
  // A guide's pictures: mock-ups of the plugin's screens drawn with the .pgm-* kit (ui.css), each
  // in a window frame with a caption — plugin.json guide sections' "shots": [{ html, caption,
  // screen }]. They follow the theme, cost a few KB, and work offline. Only the kit's tags and
  // classes and a few layout styles get through (cleanMock); nothing in them can be clicked.
  const MOCK_TAGS = new Set("div span b i u em strong small p ul ol li br kbd table thead tbody tr th td svg path rect circle line polyline polygon g".split(" "));
  const MOCK_SVG_ATTR = /^(viewbox|d|x|y|x1|y1|x2|y2|width|height|rx|ry|cx|cy|r|points|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|opacity)$/i;
  const MOCK_STYLE = /^(width|height|min-width|max-width|min-height|flex|flex-basis|flex-direction|gap|grid-template-columns|grid-column|text-align|justify-content|align-items|align-self|font-size|font-weight|opacity|margin|margin-top|margin-left|margin-right|margin-bottom|padding|position|top|left|right|bottom|letter-spacing|line-height|white-space|--[a-z-]+)$/;
  function cleanMock(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = String(html || "").slice(0, 20000);
    const walk = (node) => {
      for (const el of [...node.children]) {
        const tag = el.tagName.toLowerCase();
        if (!MOCK_TAGS.has(tag)) { el.remove(); continue; }
        for (const a of [...el.attributes]) {
          const n = a.name.toLowerCase();
          if (n === "class") {
            const keep = a.value.split(/\s+/).filter((c) => /^pgm-[a-z0-9-]+$/.test(c));
            if (keep.length) el.setAttribute("class", keep.join(" ")); else el.removeAttribute("class");
          } else if (n === "style") {
            const keep = a.value.split(";").map((d) => d.trim()).filter((d) => {
              const i = d.indexOf(":"); if (i < 1) return false;
              const p = d.slice(0, i).trim().toLowerCase(), v = d.slice(i + 1);
              return MOCK_STYLE.test(p) && !/url\(|expression|javascript|@import|\\|attr\(|var\(--[^)]*url/i.test(v);
            });
            if (keep.length) el.setAttribute("style", keep.join("; ")); else el.removeAttribute("style");
          } else if ((n === "colspan" || n === "rowspan") && (tag === "td" || tag === "th")) {
            if (!/^\d{1,2}$/.test(a.value)) el.removeAttribute(a.name);
          } else if (!(el.namespaceURI === "http://www.w3.org/2000/svg" && MOCK_SVG_ATTR.test(n) && !/url\(|javascript/i.test(a.value))) el.removeAttribute(a.name);
        }
        walk(el);
      }
    };
    walk(tpl.content);
    return tpl.innerHTML;
  }
  function shotHtml(s, name) {
    if (!s || typeof s.html !== "string") return "";
    return '<figure class="pg-shot"><div class="pg-frame" aria-hidden="true" inert>' +
      '<div class="pg-fbar"><i></i><i></i><i></i><span>' + esc(s.screen || name || "") + "</span></div>" +
      '<div class="pgm">' + cleanMock(s.html) + "</div></div>" +
      (s.caption ? "<figcaption>" + guideInline(s.caption) + "</figcaption>" : "") + "</figure>";
  }
  function guideSectionHtml(sec, name) {
    if (!sec || typeof sec !== "object") return "";
    let inner = "";
    if (sec.body) inner += guideBody(sec.body);
    if (Array.isArray(sec.shots) && sec.shots.length) inner += '<div class="pg-shots">' + sec.shots.map((s) => shotHtml(s, name)).join("") + "</div>";
    if (Array.isArray(sec.steps) && sec.steps.length) inner += "<ol>" + sec.steps.map((x) => "<li>" + guideInline(x) + "</li>").join("") + "</ol>";
    if (Array.isArray(sec.keys) && sec.keys.length) inner += '<div class="pg-keys">' + sec.keys.map((k) => '<div class="pg-key"><kbd>' + esc(k[0]) + "</kbd><span>" + guideInline(k[1] || "") + "</span></div>").join("") + "</div>";
    return inner ? '<section class="pg-sec">' + (sec.title ? "<h3>" + esc(sec.title) + "</h3>" : "") + inner + "</section>" : "";
  }
  QB.openPluginGuide = (id) => {
    const have = QB._plugins.find((x) => x.id === id && !x._builtin);
    const item = ((QB._store && QB._store.list) || []).find((x) => x.id === id);
    const src = have && have.guide ? have : (item || have);
    if (!src) return;
    const g = (src.guide && typeof src.guide === "object") ? src.guide : null;
    const name = (have || item).name, version = (have || item).version, author = (have || item).author;
    const color = GROUP_COLOR[groupOf(id)];
    document.getElementById("plugin-guide")?.remove();
    const el = document.createElement("div");
    el.id = "plugin-guide";
    el.className = "qb-overlay confirm-overlay pg-overlay";
    el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", name + " guide");
    const sections = g && Array.isArray(g.sections) ? g.sections.map((s) => guideSectionHtml(s, name)).join("") : "";
    el.innerHTML = '<div class="pg-box" role="document">' +
      '<header class="pg-head">' + piconHtml(src.icon ? src : (have || item), color, " pg-ico") +
        '<div class="pg-title"><h2>' + esc(name) + "</h2><small>" + (version ? "v" + esc(version) : "") + (author ? " · " + esc(author) : "") + " · " + esc(groupOf(id)) + "</small></div>" +
        '<button type="button" class="btn btn-ghost btn-icon btn-sm pg-x" aria-label="Close"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      "</header>" +
      '<div class="pg-scroll">' +
        '<p class="pg-tagline">' + guideInline((g && g.tagline) || (have || item).description || "") + "</p>" +
        '<div class="pg-actions"></div>' +
        (sections || '<p class="pg-empty">No guide yet.</p>') +
      "</div></div>";
    const close = () => { document.removeEventListener("keydown", onKey, true); offScreen(); if (QB._host && QB._host.animateRemove) QB._host.animateRemove(el); else el.remove(); };
    const offScreen = QB.on("screen:change", () => close());   // another page opened (a plugin's, from a script)
    const onKey = (ev) => { if (ev.key === "Escape" && el.isConnected) { ev.stopPropagation(); ev.preventDefault(); close(); } };
    document.addEventListener("keydown", onKey, true);
    el.addEventListener("click", (ev) => { if (ev.target === el) close(); });
    el.querySelector(".pg-x").onclick = close;
    // what you can do from here: open its page, turn it on or off, get it from the Store
    const actions = () => {
      const a = el.querySelector(".pg-actions"); if (!a) return;
      const p = QB._plugins.find((x) => x.id === id && !x._builtin);
      const page = p && p.enabled ? QB._pages.find((pg) => pg.pluginId === id) : null;
      const busy = QB._store && QB._store.busy[id];
      let h = "";
      if (page) h += '<button type="button" class="btn btn-primary btn-sm" data-pg="open">Open</button>';
      if (p) h += '<label class="pg-switch"><span>' + (p.enabled ? "On" : "Off") + '</span><span class="ext-switch"><input type="checkbox" data-pg="toggle"' + (p.enabled ? " checked" : "") + ' aria-label="Turn ' + esc(name) + ' on or off"><span class="ext-slider"></span></span></label>';
      else if (item) h += '<button type="button" class="btn btn-primary btn-sm" data-pg="get"' + (busy ? " disabled" : "") + ">" + (busy ? esc(busy) : "Get") + "</button>";
      if (p && item && verNewer(item.version, p.version)) h += '<button type="button" class="btn btn-sm" data-pg="get"' + (busy ? " disabled" : "") + ">" + (busy ? esc(busy) : "Update") + "</button>";
      a.innerHTML = h;
      a.querySelector('[data-pg="open"]')?.addEventListener("click", () => { close(); QB.showPage(page.pluginId + "::" + page.id); });
      a.querySelector('[data-pg="toggle"]')?.addEventListener("change", (e) => { QB.togglePlugin(id, e.target.checked); QB.renderScreen(); actions(); });
      a.querySelectorAll('[data-pg="get"]').forEach((b) => b.addEventListener("click", async () => { await storeGet(id); actions(); }));
    };
    actions();
    document.body.appendChild(el);
    el.querySelector(".pg-x").focus();
  };

  // The website: plugins come from the Store tab (no importing, no themes —
  // its looks are the default dark/light).
  const WEBSITE = !window.qbreader && !!window.QB_WEB;
  QB._extTab = "open";
  QB.renderScreen = () => {
    const container = document.getElementById("extensions-container");
    // website, accounts required, signed out: the Store and plugins need an account
    if (container && WEBSITE && QB._host && QB._host.needsAccount && QB._host.needsAccount()) {
      container.innerHTML = QB._host.accountPanelHtml("Sign in to get plugins from the Store and use them.");
      return;
    }
    if (!container) return;
    if (WEBSITE && QB._extTab === "themes") QB._extTab = "store";
    const tab = QB._extTab || "open";
    const visible = QB._plugins.filter((p) => !p._builtin);
    const tabs = (WEBSITE ? [["open", "Open"], ["manage", "Manage"], ["store", "Store"]] : [["open", "Open"], ["manage", "Manage"], ["themes", "Themes"]]).map(([k, l]) =>
      '<button type="button" class="db-tab' + (tab === k ? " active" : "") + '" role="tab" aria-selected="' + (tab === k) + '" data-ext-tab="' + k + '">' + l + "</button>").join("");
    const bulk = tab === "manage" && visible.length
      ? '<span class="ext-bulk"><button class="btn btn-sm" id="ext-enable-all">Enable all</button><button class="btn btn-sm" id="ext-disable-all">Disable all</button></span>' : "";
    let body = "";
    if (tab === "store") {
      body = storeHtml();
    } else if (tab === "open") {
      const pages = QB._pages.filter((pg) => !(QB._plugins.find((x) => x.id === pg.pluginId) || {})._builtin);
      if (!pages.length) {
        body = WEBSITE ? '<div class="ext-empty-state">No plugin pages yet <button type="button" class="btn btn-sm" data-ext-tab="store">Open the Store</button></div>' : '<div class="ext-empty-state">No plugin pages yet</div>';
      } else {
        const groups = {};
        pages.forEach((pg) => { (groups[groupOf(pg.pluginId)] = groups[groupOf(pg.pluginId)] || []).push(pg); });
        body = GROUP_ORDER.filter((g) => groups[g]).map((g) =>
          '<section class="pgroup"><h2>' + esc(g) + '</h2><div class="pgrid">' + groups[g].map((pg) => {
            const plug = QB._plugins.find((x) => x.id === pg.pluginId) || {};
            const label = pg.navLabel || pg.title || plug.name || pg.id;
            const nice = /[a-z]/.test(label) ? label : String(label).toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());
            return '<button type="button" class="ptile" data-page="' + esc(pg.pluginId + "::" + pg.id) + '">' + piconHtml(plug.icon ? plug : { name: nice }, GROUP_COLOR[g]) + '<span style="min-width:0"><b>' + esc(nice) + '</b><small>v' + esc(plug.version || "") + "</small></span></button>";
          }).join("") + "</div></section>").join("");
      }
    } else if (tab === "manage") {
      const rows = visible.slice().sort((a, b) => GROUP_ORDER.indexOf(groupOf(a.id)) - GROUP_ORDER.indexOf(groupOf(b.id)) || String(a.name).localeCompare(String(b.name))).map((p) => {
        const g = groupOf(p.id);
        const set = p.enabled ? settingsHtml(p, "card") : "";
        return '<div class="ext-row ext-card' + (p.enabled ? " active" : "") + '" data-guide="' + esc(p.id) + '" tabindex="0" role="button" aria-label="' + esc(p.name) + ' — how to use it">' +
          piconHtml(p, GROUP_COLOR[g]) +
          '<span class="er-name"><b>' + esc(p.name) +
            (p._error ? ' <span class="ext-badge err">failed</span><span class="qb-info" data-tip="' + esc(p._error) + '">i</span>' : "") + "</b>" +
            '<small>' + esc(p.author ? "by " + p.author : "") + "</small></span>" +
          '<span class="er-ver">v' + esc(p.version) + "</span>" +
          '<span class="er-grp">' + esc(g) + "</span>" +
          '<label class="ext-switch" title="' + (p.enabled ? "Turn off" : "Turn on") + '"><input type="checkbox" data-plugin-id="' + esc(p.id) + '"' + (p.enabled ? " checked" : "") + ' aria-label="Turn ' + esc(p.name) + ' on or off"><span class="ext-slider"></span></label>' +
          '<button class="ext-remove" data-remove-plugin="' + esc(p.id) + '" title="Remove" aria-label="Remove ' + esc(p.name) + '">' + ICO.trash + "</button>" +
          "</div>" + (set ? '<div class="ext-row-settings ext-settings">' + set + "</div>" : "");
      }).join("");
      body = (WEBSITE ? "" : importZone("plugin", "")) +
        (rows ? '<div class="list ext-list">' + rows + "</div>" : (WEBSITE ? '<div class="ext-empty-state">No plugins yet <button type="button" class="btn btn-sm" data-ext-tab="store">Open the Store</button></div>' : '<div class="ext-empty-state" style="margin-top:16px">No plugins installed yet</div>'));
    } else {
      const active = QB._themes.find((t) => t.enabled);
      let cards = themeCardHtml("", "Default", ["#0d1117", "#161b22", "#58a6ff", "#c9d1d9"], !active, "", false);
      cards += QB._themes.map((t) => themeCardHtml(t.id, t.name, themeColors(t), !!t.enabled, t.description || "", true)).join("");
      body = '<div class="theme-grid">' + cards + "</div>" + importZone("theme", ' style="margin-top:16px"');
    }
    container.innerHTML = '<div class="ext-tabs" role="tablist" aria-label="Plugins">' + tabs + bulk + "</div>" + body;
    wireScreen();
    if (tab === "store" && QB._host && QB._host.tip) QB._host.tip(container, "store", null, container.querySelector(".ext-tabs")?.nextElementSibling);
  };

  // ── Plugin Store (website): /api/plugin-store lists the plugins the server
  // hosts (scripts/build-store.mjs); Get installs one into this browser and
  // turns it on, after which Manage switches it on and off like any plugin.
  QB._store = { list: null, loading: false, busy: {}, failed: {} };
  const verNewer = (a, b) => { const x = String(a || "0").split("."), y = String(b || "0").split("."); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (parseInt(x[i], 10) || 0) - (parseInt(y[i], 10) || 0); if (d) return d > 0; } return false; };
  function storeHtml() {
    const st = QB._store;
    if (!st.list) {
      if (st.err) return '<div class="ext-empty-state">Couldn\'t reach the Store <button type="button" class="btn btn-sm" data-store-reload>Try again</button></div>';
      if (!st.loading) {
        st.loading = true;
        fetch("/api/plugin-store", { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
          .then((d) => { st.list = (d && d.plugins) || []; }).catch(() => { st.err = true; })
          .then(() => { st.loading = false; if (QB._extTab === "store") QB.renderScreen(); });
      }
      return '<div class="ext-empty-state">Loading…</div>';
    }
    if (!st.list.length) return '<div class="ext-empty-state">The Store is empty right now</div>';
    const groups = {};
    st.list.forEach((item) => { (groups[groupOf(item.id)] = groups[groupOf(item.id)] || []).push(item); });
    return GROUP_ORDER.filter((g) => groups[g]).map((g) =>
      '<section class="pgroup"><h2>' + esc(g) + '</h2><div class="store-grid">' + groups[g].map((item) => {
        const have = QB._plugins.find((x) => x.id === item.id && !x._builtin);
        const busy = st.busy[item.id];
        const btn = busy ? '<button type="button" class="btn btn-sm" disabled>' + esc(busy) + "</button>"
          : st.failed[item.id] ? '<button type="button" class="btn btn-sm" data-store-get="' + esc(item.id) + '" title="Couldn\'t add it — try again">Retry</button>'
          : !have ? '<button type="button" class="btn btn-sm btn-primary" data-store-get="' + esc(item.id) + '">Get</button>'
          : verNewer(item.version, have.version) ? '<button type="button" class="btn btn-sm" data-store-get="' + esc(item.id) + '">Update</button>'
          : '<label class="ext-switch" title="' + (have.enabled ? "Turn off" : "Turn on") + '"><input type="checkbox" data-plugin-id="' + esc(have.id) + '"' + (have.enabled ? " checked" : "") + ' aria-label="Turn ' + esc(item.name) + ' on or off"><span class="ext-slider"></span></label>';
        return '<div class="store-card" data-guide="' + esc(item.id) + '" tabindex="0" role="button" aria-label="' + esc(item.name) + ' — how to use it">' + piconHtml(item, GROUP_COLOR[g]) +
          '<span class="store-main"><b>' + esc(item.name) + '</b><small>v' + esc(item.version) + (item.author ? " · " + esc(item.author) : "") + "</small></span>" +
          btn + "</div>";
      }).join("") + "</div></section>").join("");
  }
  async function storeGet(id) {
    const st = QB._store, item = (st.list || []).find((x) => x.id === id);
    if (!item || st.busy[id]) return;
    const had = QB._plugins.find((x) => x.id === id);
    st.busy[id] = had ? "Updating…" : "Adding…"; QB.renderScreen();
    let ok = false;
    try {
      const r = await fetch("/store/" + encodeURIComponent(item.file));
      if (!r.ok) throw new Error("HTTP " + r.status);
      const p = await QB.installZipBytes(new Uint8Array(await r.arrayBuffer()));
      if (p && p.id) { if (!had) QB.enablePlugin(p.id); ok = true; }
    } catch (e) { console.error("store:", e); }
    if (ok) delete st.failed[id]; else st.failed[id] = true;
    delete st.busy[id];
    QB.renderScreen();
  }

  // Desktop only: a drop zone (drag a .zip in, or choose one). The website
  // installs plugins from the Store and has no import.
  function importZone(kind, attrs) {
    const id = "ext-drop-" + kind;
    const input = '<input type="file" id="ext-file-' + kind + '" accept=".zip" multiple hidden>';
    return '<div class="ext-dropzone" id="' + id + '"' + attrs + ">" + ICO.upload + "<span>Drop a " + kind + " <strong>.zip</strong> here, or</span>" +
      '<button type="button" class="btn btn-sm" id="ext-browse-' + kind + '">Choose a file</button>' + dropError(id) + input + "</div>";
  }

  function wireDropzone(zoneId, inputId, browseId) {
    const zone = document.getElementById(zoneId), input = document.getElementById(inputId), browse = document.getElementById(browseId);
    if (!zone || !input) return;
    browse && browse.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      const files = Array.from(input.files || []);
      input.value = "";
      if (files.length) handleZips(files, zoneId);
    });
    ["dragenter", "dragover"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("dragging"); }));
    ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("dragging"); }));
    zone.addEventListener("drop", (e) => { const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []); if (files.length) handleZips(files, zoneId); });
  }

  function wireScreen() {
    const root = document.getElementById("extensions-container");
    if (!root) return;
    wireDropzone("ext-drop-theme", "ext-file-theme", "ext-browse-theme");
    wireDropzone("ext-drop-plugin", "ext-file-plugin", "ext-browse-plugin");
    wireSettingControls(root);
    root.querySelectorAll("[data-ext-tab]").forEach((b) => b.addEventListener("click", () => { QB._extTab = b.dataset.extTab; QB.renderScreen(); if (window.qbWebPathSync) window.qbWebPathSync(); }));
    root.querySelectorAll("[data-store-get]").forEach((b) => b.addEventListener("click", () => storeGet(b.dataset.storeGet)));
    root.querySelector("[data-store-reload]")?.addEventListener("click", () => { QB._store.err = false; QB.renderScreen(); });
    root.querySelectorAll("[data-page]").forEach((b) => b.addEventListener("click", () => QB.showPage(b.dataset.page)));
    root.querySelectorAll("[data-guide]").forEach((row) => {
      const go = (e) => { if (e.target.closest("button, a, input, label, select, textarea, .ext-settings")) return; QB.openPluginGuide(row.dataset.guide); };
      row.addEventListener("click", go);
      row.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target === row) { e.preventDefault(); QB.openPluginGuide(row.dataset.guide); } });
    });
    root.querySelectorAll("[data-plugin-id]").forEach((cb) => {
      cb.addEventListener("change", () => { QB.togglePlugin(cb.dataset.pluginId, cb.checked); QB.renderScreen(); });
    });
    root.querySelectorAll("[data-remove-plugin]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.dataset.removePlugin, p = QB._plugins.find((x) => x.id === id);
        const go = () => { QB.removePlugin(id); QB.renderScreen(); };
        if (QB._host && QB._host.confirm) QB._host.confirm("Remove " + ((p && p.name) || "this plugin") + "?", go, { yes: "Remove" }); else go();
      });
    });
    root.querySelectorAll("[data-use-theme]").forEach((b) => {
      b.addEventListener("click", () => {
        const key = b.dataset.useTheme;
        if (!key) { QB._themes.filter((t) => t.enabled || t._enabledRuntime).forEach((t) => QB.disableTheme(t.id)); }
        else QB.enableTheme(key);
        QB.renderScreen();
      });
    });
    root.querySelectorAll("[data-remove-theme]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.dataset.removeTheme, t = QB._themes.find((x) => x.id === id);
        const go = () => { QB.removeTheme(id); QB.renderScreen(); };
        if (QB._host && QB._host.confirm) QB._host.confirm("Remove the " + ((t && t.name) || "theme") + " theme?", go, { yes: "Remove" }); else go();
      });
    });
    const enAll = document.getElementById("ext-enable-all");
    if (enAll) enAll.addEventListener("click", () => { QB._plugins.slice().forEach((p) => { if (!p.enabled && !p._builtin) QB.enablePlugin(p.id); }); QB.renderScreen(); });
    const disAll = document.getElementById("ext-disable-all");
    if (disAll) disAll.addEventListener("click", () => { QB._plugins.slice().forEach((p) => { if (p.enabled && !p._builtin) QB.disablePlugin(p.id); }); QB.renderScreen(); });
  }

  window.QB = QB;
})();

;/* ── multiplayer.js (bundled by build-update) ── */
/**
 * Multiplayer — built into the app (it used to be plugins/multiplayer.zip).
 *
 * Registered through QB.registerBuiltin: always enabled, never listed under
 * Plugins → Manage, and a user-installed multiplayer.zip is dropped at boot.
 * It still runs through the same plugin ctx API as before (registerPage,
 * host.getFilterSelectionSnapshot …), so the room logic is unchanged:
 *   - Transport: every player opens an outbound WebSocket to the baked-in
 *     Cloudflare relay (relay/worker.js), so it works on school Wi-Fi too.
 *     (The old PeerJS P2P option is gone; a hosted server will replace the relay.)
 * Reading is clock-synced: the host sends "reading from index I at speed S"
 * once and every client animates locally.
 * The host borrows the real practice filter panel (#filters-panel) as the
 * room's settings drawer; returnPanel() puts it back before any re-render.
 */
(function () {
function __qbMain(ctx) {
    var isHost = false, myId = "", srvHost = null, kickBans = [], devOf = {};
    // the host of the room you're in: in a relay room the one running it; on the game server the one
    // it says (the first in), or in a bought room its owner and admins
    function amHost() { return serverMode ? (roomInfo ? roomInfo.role === "owner" || roomInfo.role === "admin" : !!myId && srvHost === myId) : isHost; }
    var ws = null, _relayConns = {};
    // Rooms are run by the game server (mpserver/, mp.onlinequiz.net): it plays
    // the host's part of this same protocol, so in a server room every app is a
    // client (isHost stays false) — serverMode. When the server can't be
    // reached, the room falls back to the old Cloudflare relay, where the first
    // player's app hosts. localStorage "qb-mp-server" points tests elsewhere.
    var GAME_SERVER = "https://mp.onlinequiz.net";
    var DEFAULT_RELAY = "https://offlinequiz-mp-relay.warren2028045.workers.dev";
    var serverMode = false;
    function relayUrl() { return DEFAULT_RELAY; }
    var pubTimer = null;   // the lobby's Public rooms refresh
    function gameServerUrl() { try { return localStorage.getItem("qb-mp-server") || GAME_SERVER; } catch (e) { return GAME_SERVER; } }
    var lobby = "", myName = "", body = null, page = null;
    var mySpec = false;  // joined as spectator (watch + chat, no buzzing)
    function myAv() { try { return ((ctx.host && ctx.host.getState && ctx.host.getState()) || {}).avatar || ""; } catch (e) { return ""; } }
    // your onlinequiz username when signed in: other players can open your profile / add you
    function myHandle() { try { return (window.qbAccountHandle && window.qbAccountHandle()) || ""; } catch (e) { return ""; } }
    // ── bought rooms (the shop: web/shop.mjs, mpserver/owned.mjs) ──
    // A signed-in player's hello carries a ticket from the website that proves their account
    // (members, admins and the owner get in by it); a room's password goes with it when one was
    // typed for that room. roomInfo: the room's own details (only in a bought room).
    var myTicket = null, myTicketAt = 0, myPassword = "", myPasswordFor = "", roomInfo = null, roomOpErr = "", roomOpUndo = null, door = null, goJoin = null;
    // a game-server room is shown only once it has let us in (its first "state"): until then the
    // form stays, saying "Joining …" — or asking for the room's password on the same connection
    var admitting = false;
    function abandonJoin() {
      admitting = false;
      try { if (ws) { ws.onclose = null; ws.onmessage = null; ws.close(); } } catch (e) {}
      ws = null; lobby = ""; markBusy(false);
    }
    function acctOf() { var st = (ctx.host && ctx.host.getState && ctx.host.getState()) || {}; return st.account || null; }
    function hostApi() { return ctx.host && ctx.host.api; }
    async function getTicket() {
      if (!acctOf() || !hostApi()) { myTicket = null; return null; }
      if (myTicket && Date.now() - myTicketAt < 10 * 60e3) return myTicket;
      try { var r = await hostApi().post("/api/mp/ticket", {}); if (r && r.ticket) { myTicket = r.ticket; myTicketAt = Date.now(); return myTicket; } } catch (e) {}
      return null;
    }
    // this browser / app, for the 30 minutes someone taken out of a room stays out (not their IP: a
    // whole school shares one)
    function deviceId() {
      try { var v = localStorage.getItem("qb-mp-device"); if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem("qb-mp-device", v); } return v; } catch (e) { return ""; }
    }
    function helloMsg() {
      var m = { t: "hello", name: myName, spectate: mySpec, avatar: myAv(), handle: myHandle(), device: deviceId() };
      if (myTicket) m.ticket = myTicket;
      if (myPassword && myPasswordFor === String(lobby).toLowerCase()) m.password = myPassword;
      return m;
    }
    var validHandle = function (h) { h = String(h || "").trim().toLowerCase(); return /^[a-z0-9]{3,20}$/.test(h) ? h : ""; };

    // Shared game state (host is the source of truth; clients mirror it).
    var players = {};            // id -> { id, name, team, score }
    var order = [];              // id order for stable display
    // MP-specific lobby settings (synced, anyone can edit). All the question
    // FILTERS (categories+weights, difficulties, year range, strictness, reading
    // speed, etc.) are reused from the host's Tossups Practice page via
    // ctx.host.getPracticeConfig() — multiplayer inherits every practice option.
    var settings = { answerSeconds: 10, buzzWindow: 10, rebuzz: false };
    var filterSummary = "";      // host's practice-filter summary, synced for display
    var curRevealSpeed = 25, curStrictness = 10;  // captured from practice per question
    var hostLocalSpeed = null;   // host's OWN slider value — client speed edits must not be reverted by it
    var current = null;          // { id, text } current question (char-based reveal)
    var hostQ = null;            // host-only full question object
    var mpSessId = "";           // this client's local stats session for the current game
    function mpSession() { if (!mpSessId) mpSessId = "mp-" + (lobby || "game") + "-" + Date.now(); return mpSessId; }
    // Bonus phase (imported TU+B packets): only the tossup winner answers.
    var bonusState = null;       // host-only { winner, k, got }
    var bonusParts = [], bonusAnswers = [], bonusRawAnswers = [];  // host-only
    var bonusView = null;        // everyone: { leadin, parts, winner, name, k, got, done, results[] }
    var bonusTimer = null;
    var bonusPending = false;    // a random bonus is being fetched after a correct TU
    var roomConfig = null;       // shared question filters (anyone can edit)
    var leftIntentionally = false;
    var curFilters = {};         // filters used for the current tossup (so the bonus matches)
    var curPowerEnd = 0, curStopPower = false, pausedAtPower = false;
    var revealIdx = 0, revealTimer = null;   // revealIdx = character index
    var ended = false, pendingBuzzer = null, answerTimer = null, answerDeadline = 0, tickTimer = null, pendingPrompted = false, pendingPromptFrom = "";
    var lockedTeams = {}, lockedIds = {};   // per-question lockouts
    var buzzHistory = [];        // per-question [{name, correct, points, given, index}]
    var buzzCharMarks = [];      // character indices where a buzz happened (for (#) marks)
    var sessionLog = [];         // all completed questions: {text, answer, category, difficulty, buzzes[], marks[]}
    var paused = false, qCount = 0;
    var borrowedPanel = null, panelHome = null;   // the borrowed practice filter panel
    var chatScope = "all";        // "all" | "team" — which channel the chat box sends to
    var autoSubTimer = null;      // client-side: submits whatever is typed when the timer runs out
    var mpPre = { key: "", q: null, busy: false };  // host-only: next tossup fetched ahead
    var _lastSelJson = "";        // last panel-selection snapshot applied/sent (dedupe)
    var _hostSelGen = 0;          // host-side: only the newest client-sel apply broadcasts

    // Set name -> set id (host-side, loaded once). Set names can contain
    // commas, so a query prefers setIds whenever every name resolves.
    var _setIdByName = null, _setIdLoading = false;
    function loadSetIds() {
      if (_setIdByName || _setIdLoading) return;
      _setIdLoading = true;
      Promise.resolve(ctx.api.get("/api/sets")).then(function (d) {
        var m = {};
        ((d && d.sets) || []).forEach(function (s) { if (s && s.name && s.id) m[s.name] = String(s.id); });
        _setIdByName = m;
      }).catch(function () {}).then(function () { _setIdLoading = false; });
    }
    function strList(a) { return Array.isArray(a) ? a.filter(function (x) { return x != null && x !== ""; }).map(String) : []; }

    // Build a /api/tossups/random query from a practice getActiveFilters() object.
    // `categories` holds category-tree node ids (plain level-1 names on older
    // bases); `categoryPaths` is display-only and never sent.
    function filtersToQuery(f) {
      f = f || {};
      var p = ["random=1", "limit=1"];
      if (f.standard) p.push("standard=1");
      var cats = strList(f.categories);
      if (cats.length) p.push("categories=" + encodeURIComponent(cats.join(",")));
      // Older bases only (the tree base never sends these).
      var subs = strList(f.subcategories), alts = strList(f.alternateSubcategories);
      if (subs.length) p.push("subcategories=" + encodeURIComponent(subs.join(",")));
      if (alts.length) p.push("alternateSubcategories=" + encodeURIComponent(alts.join(",")));
      if (f.difficulties && f.difficulties.length) p.push("difficulties=" + f.difficulties.join(","));
      var setIds = strList(f.setIds), setNames = strList(f.setNames);
      if (!setIds.length && setNames.length && _setIdByName) {
        var ids = setNames.map(function (n) { return _setIdByName[n]; });
        if (ids.every(Boolean)) setIds = ids;
      }
      if (setIds.length) p.push("setIds=" + encodeURIComponent(setIds.join(",")));
      else if (setNames.length) { loadSetIds(); p.push("setNames=" + encodeURIComponent(setNames.join(","))); }
      if (f.packetNumbers && f.packetNumbers.length) p.push("packetNumbers=" + f.packetNumbers.join(","));
      if (f.yearMin != null) p.push("yearMin=" + f.yearMin);
      if (f.yearMax != null) p.push("yearMax=" + f.yearMax);
      if (f.powermarkOnly) p.push("powermarkOnly=true");
      if (f.tags && f.tags.length) p.push("tags=" + encodeURIComponent(JSON.stringify(f.tags.map(function (t) { return t.id ? { f: t.f, v: t.v, x: t.x ? 1 : 0, id: t.id } : { f: t.f, v: t.v, x: t.x ? 1 : 0 }; }))));
      // (starred-only is intentionally NOT used in multiplayer)
      return p.join("&");
    }

    function esc(s) { return (s == null ? "" : String(s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    // Decode HTML entities ONCE (a textarea parses its content as text, so no
    // tag in the input is ever interpreted).
    var _decEl = null;
    function decodeEntities(s) {
      s = String(s == null ? "" : s);
      if (s.indexOf("&") < 0) return s;
      try { _decEl = _decEl || document.createElement("textarea"); _decEl.innerHTML = s; return _decEl.value; } catch (e) { return s; }
    }
    // Answer lines keep their real <b>/<u>/<i>/<em>/<strong>/<sup> formatting;
    // every other "<…>" is text, and entities are decoded once then escaped
    // (so "&lt;" shows as "<", never as "&lt;").
    function ansHtml(raw, fallback) {
      var src = (raw && String(raw).trim()) ? String(raw) : String(fallback || "");
      var html = src.split(/(<\/?(?:b|u|i|em|strong|sup)>)/i).map(function (part, i) {
        return i % 2 ? part.toLowerCase() : esc(decodeEntities(part));
      }).join("");
      // auto-close unbalanced tags so a stray <u> can't underline the page
      var d = document.createElement("div");
      d.innerHTML = html;
      return d.innerHTML;
    }
    // ── new question database helpers (feature-detected; older bases fall back) ──
    function jsonArr(v) {
      if (Array.isArray(v)) return v;
      try { var a = JSON.parse(v || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; }
    }
    // A record's text as the practice screen reads it (moderator notes hidden,
    // pronunciation guides stripped per the user's settings). kind: "question",
    // "leadin" or "part" (with part index).
    function readText(q, kind, part, hidePron) {
      var t = null;
      try { if (ctx.host && ctx.host.questionText) t = ctx.host.questionText(q, kind, part); } catch (e) { t = null; }
      if (typeof t !== "string") {
        if (kind === "leadin") t = (q && (q.leadin_sanitized || q.leadin)) || "";
        else if (kind === "part") t = jsonArr(q && q.parts_sanitized)[part] || jsonArr(q && q.parts)[part] || "";
        else t = (q && (q.question_sanitized || q.question)) || "";
        if (hidePron && ctx.host && ctx.host.stripPronunciations) t = ctx.host.stripPronunciations(t);
      }
      return String(t || "").replace(/\s+/g, " ").trim();
    }
    // Per-part point values (10 each when the record states none) and the max.
    function bonusValuesOf(b, n) {
      var r = null;
      try { if (ctx.host && ctx.host.bonusValues) r = ctx.host.bonusValues(b); } catch (e) { r = null; }
      var src = r && Array.isArray(r.values) ? r.values : jsonArr(b && b.point_values);
      var values = [];
      for (var i = 0; i < n; i++) { var v = +src[i]; values.push(isFinite(v) && v > 0 ? v : 10); }
      return { values: values, max: values.reduce(function (a, v) { return a + v; }, 0) };
    }
    // "A > B > C > D" -> "C > D": the ended-question meta shows the last two
    // levels of the category path (older rows: the plain category).
    function catLabel(q) {
      if (!q) return "";
      var segs = String(q.category_path || "").split(" > ").map(function (s) { return s.trim(); }).filter(Boolean);
      if (!segs.length) return q.category || "";
      return segs.slice(-2).join(" > ");
    }
    function lobbyId(n) { return "offlinequiz-mp-" + n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

    // ── page (mirrors the practice screen) ──
    page = ctx.registerPage({
      id: "lobby", navLabel: "Multiplayer", title: "MULTIPLAYER",
      onShow: function (el) { body = el; el.classList.add("mp-flush"); render(); }, onHide: function () { returnPanel(); },
    });
    function active() { return page && page.screenEl && page.screenEl.classList.contains("active"); }
    // Safety net: whenever we navigate away from the MP page, give the borrowed
    // practice filter panel back so the Tossups screen is never left without it.
    ctx.on("screen:change", function () { setTimeout(function () { if (!active()) returnPanel(); }, 0); });

    // The borrowed practice panel hides its practice-only sections in MP.

    function onKey(e) {
      if (!active() || !lobby) return;
      // the room settings panel sits BESIDE the room (it pushes it left), so the
      // room's keys keep working while it is open
      var t = e.target.tagName; if (t === "INPUT" || t === "TEXTAREA") return;
      // I'm answering but the box lost focus: route printable keys INTO it
      // (focusing during keydown makes the character land there), exactly like
      // solo tossups.
      var myInp = body && (body.querySelector("#mp-ans-input") || body.querySelector(".mp-binput"));
      if (myInp && !myInp.disabled && e.key && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        myInp.focus();
        return;
      }
      if (e.code === "Space") { e.preventDefault(); requestBuzz(); }
      else if (e.key === "p" || e.key === "P") { e.preventDefault(); requestPause(); }
      else if (e.key === "n" || e.key === "N" || e.key === "s" || e.key === "S") { e.preventDefault(); requestNext(); }
      else if (e.key === "q" || e.key === "Q") { e.preventDefault(); confirmLeave(); }
    }
    function confirmLeave() {
      if (!lobby) return;
      if (ctx.host && ctx.host.confirm) ctx.host.confirm("Leave the lobby?", function () { leave(); }, { yes: "Leave" });
      else if (window.confirm("Leave the lobby?")) leave();
    }
    document.addEventListener("keydown", onKey);
    function onDrawerEsc(e) {
      if (e.key !== "Escape" || !active() || !borrowedPanel || !borrowedPanel.classList.contains("open")) return;
      if (document.querySelector('.qb-select[data-open="true"]')) return;
      var co = document.getElementById("cat-ovl"); if (co && !co.classList.contains("hidden")) return;
      e.preventDefault(); e.stopPropagation(); toggleRoomSettings(false);
    }
    window.addEventListener("keydown", onDrawerEsc, true);
    // a click on a player in the room (the app's player menu): the host can take them out
    var dropUserItems = ctx.host && ctx.host.addUserMenuItems ? ctx.host.addUserMenuItems(function (u) {
      if (!active() || !u || !u.pid || u.pid === myId || !players[u.pid] || !amHost()) return [];
      var nm = players[u.pid].name;
      return [{ label: "Take out of the room", danger: true, onClick: function () {
        var go = function () { kickPlayer(u.pid); };
        if (ctx.host.confirm) ctx.host.confirm("Take " + nm + " out of the room?", go, { yes: "Take out", danger: true, detail: "They can't come back for 30 minutes." });
        else go();
      } }];
    }) : null;
    ctx._cleanup = function () { if (dropUserItems) dropUserItems(); window.removeEventListener("keydown", onDrawerEsc, true); markBusy(false); returnPanel(); restoreSoloPanel(); document.removeEventListener("keydown", onKey); stopReveal(); stopAnswerTimer(); stopTick(); stopBuzzWindowTimer(); stopBonusTimer(); stopClientRead(); stopAutoSub(); try { if (ws) ws.close(); } catch (e) {} };

    // ── networking helpers (transport-agnostic) ──
    function sendRelay(o) { if (ws && ws.readyState === 1) { try { ws.send(JSON.stringify(o)); } catch (e) {} } }
    function broadcast(m) { sendRelay({ to: "all", d: m }); }
    function toHost(m) { sendRelay({ to: "host", d: m }); }
    // A conn-shaped wrapper so the host code paths work identically on relay.
    function relayConn(id) {
      if (!_relayConns[id]) _relayConns[id] = { peer: id, send: function (d) { sendRelay({ to: id, d: d }); } };
      return _relayConns[id];
    }
    // roomSel is the host panel's lossless selection snapshot (app 14.2+) —
    // it's what lets every client mirror categories/subcats/alt-subcats, which
    // the derived roomFilters object cannot rebuild. roomFilters stays for
    // clients running an older base.
    function hostSel() { try { return (ctx.host && ctx.host.getFilterSelectionSnapshot) ? ctx.host.getFilterSelectionSnapshot() : null; } catch (e) { return null; } }
    function stateMsg() { return { t: "state", players: order.map(function (id) { return players[id]; }), settings: settings, filterSummary: filterSummary, roomFilters: (roomConfig && roomConfig.filters) || null, roomSel: isHost ? hostSel() : null }; }
    function pushState() { broadcast(stateMsg()); renderScores(); renderSettings(); updateTopBar(); }

    function addPlayer(id, name, team, spec, avatar, handle) {
      if (!players[id]) order.push(id);
      players[id] = { id: id, name: name || ("Player" + order.length), team: team || "", score: (players[id] && players[id].score) || 0, spec: !!spec, avatar: avatar || (players[id] && players[id].avatar) || "", handle: validHandle(handle) || (players[id] && players[id].handle) || "" };
    }
    function removePlayer(id) { delete players[id]; order = order.filter(function (x) { return x !== id; }); }
    // the host takes someone out (a click on their name → Take out of the room): on the game server it
    // does it; in a relay room the host's app does, and keeps them out for 30 minutes
    function kickPlayer(pid) {
      if (!pid || pid === myId || !players[pid]) return;
      if (serverMode) { toHost({ t: "kick", id: pid }); return; }
      if (!isHost) return;
      var p = players[pid];
      kickBans.push({ device: devOf[pid] || "", handle: p.handle || "", until: Date.now() + 30 * 60e3 });
      try { relayConn(pid).send({ t: "kicked", text: "The host took you out of this room. You can come back in 30 minutes." }); } catch (e) {}
      if (pendingBuzzer === pid) hostHandleAnswer(pid, "");   // their buzz ends like a blank answer, as on the game server
      if (bonusState && bonusState.winner === pid) { bonusState = null; broadcast({ t: "bcancel" }); }
      removePlayer(pid);
      sysChat((players[myId] ? players[myId].name : "The host") + " took " + p.name + " out of the room");
      pushState();
    }

    // A visible banner when YOUR connection drops mid-game (lag-out).
    function showDisconnected() {
      var area = body && body.querySelector(".question-area");
      if (!area) { setStatus("Disconnected from the lobby."); return; }
      var existing = body.querySelector("#mp-disconnect"); if (existing) return;
      var el = document.createElement("div");
      el.id = "mp-disconnect"; el.className = "mp-disconnect";
      el.innerHTML = '<div class="mp-disc-box"><div class="mp-disc-title">\u26a0 Disconnected from the lobby</div>' +
        '<div class="mp-disc-actions"><button class="btn btn-primary" id="mp-rejoin">Rejoin</button>' +
        '<button class="btn btn-ghost" id="mp-discleave">Leave</button></div></div>';
      area.appendChild(el);
      el.querySelector("#mp-rejoin").onclick = function () { el.remove(); isHost = false; join(); };
      el.querySelector("#mp-discleave").onclick = function () { el.remove(); leave(); };
    }

    // ── solo-settings isolation ──
    // The lobby borrows and MUTATES the real practice panel (room creation
    // even resets it). Everything is snapshotted on join and restored on
    // leave THROUGH the real controls, so solo Tossups comes back exactly as
    // the player left it — multiplayer never bleeds into practice settings.
    var soloBackup = null;
    // The host's REAL practice mode. While the base shows a custom question
    // list, #mode-select holds a "custom" placeholder (a background host must
    // still serve the room from the real mode); older bases fall back to the DOM.
    function realMode() {
      try { if (ctx.host && ctx.host.getPracticeMode) return ctx.host.getPracticeMode() || "random"; } catch (e) {}
      var ms = document.getElementById("mode-select");
      return ms ? ms.value : "random";
    }
    function backupSoloPanel() {
      try {
        if (!(ctx.host && ctx.host.getFilterSelectionSnapshot && ctx.host.getPracticeConfig)) return null;
        return {
          sel: ctx.host.getFilterSelectionSnapshot(),
          cfg: ctx.host.getPracticeConfig(),
          mode: realMode(),
          setName: (document.getElementById("mode-set-name") || {}).value || "",
          packet: (document.getElementById("mode-packet") || {}).value || "",
        };
      } catch (e) { return null; }
    }
    function restoreSoloPanel() {
      var b = soloBackup;
      soloBackup = null;
      if (!b || !(ctx.host && ctx.host.applyFilterSelectionSnapshot)) return;
      var fire = function (el, evt) { try { el.dispatchEvent(new Event(evt, { bubbles: true })); } catch (e) {} };
      var setVal = function (id, v, evts) {
        var el = document.getElementById(id);
        if (!el || v === undefined || v === null) return;
        el.value = v;
        (evts || ["change"]).forEach(function (ev) { fire(el, ev); });
      };
      var setChk = function (id, want) {
        var el = document.getElementById(id);
        if (el && el.checked !== !!want) { el.checked = !!want; fire(el, "change"); }
      };
      try {
        // A custom list showing: writing the select would END the list (the base
        // treats a mode pick as leaving it); the snapshot below carries the mode.
        var msNow = document.getElementById("mode-select");
        if (!(msNow && msNow.value === "custom")) setVal("mode-select", b.mode);
        if (b.mode === "set") { setVal("mode-set-name", b.setName); setVal("mode-packet", b.packet); }
        Promise.resolve(ctx.host.applyFilterSelectionSnapshot(b.sel)).catch(function () {}).then(function () {
          setVal("strictness-slider", b.cfg.strictness, ["input", "change"]);
          // the slider holds a level (1 … 50, 51 = Instant); the config is ms per character
          setVal("panel-speed-slider", window.qbSpeedLevel ? window.qbSpeedLevel(b.cfg.revealSpeed) : b.cfg.revealSpeed, ["input", "change"]);
          setChk("opt-stop-on-power", b.cfg.stopOnPower);
          setChk("opt-allow-skips", b.cfg.allowSkips !== false);
          setChk("filter-hide-pron", b.cfg.hidePron);
          // persist the restored selection (the app saves on panel change)
          var panel = document.getElementById("filters-panel");
          if (panel) fire(panel, "change");
        });
      } catch (e) {}
    }

    // ── join ──
    var ROOM_DEFAULTS = { answerSeconds: 10, buzzWindow: 10, rebuzz: false, bonusEvery: false, stopPower: false, allowSkips: true, locked: false, public: true, tournament: false };
    // While in a room the app must not reload itself (it switches to a newly
    // downloaded question database only when nothing is busy).
    function markBusy(on) { try { if (ctx.host && ctx.host.setBusy) ctx.host.setBusy("multiplayer", on); } catch (e) {} }
    async function join() {
      markBusy(true);
      if (!soloBackup) soloBackup = backupSoloPanel();   // once per lobby stay (rejoins keep the original)
      // Every room starts from the SAME defaults — nothing carries over from a
      // previous room, and a reopened room starts fresh too.
      settings = JSON.parse(JSON.stringify(ROOM_DEFAULTS));
      // Packet/set reading never carries across lobbies — always start at q1.
      setSig = ""; setIndex = 0; setQueue = null; impSig = ""; impIndex = 0;
      roomConfig = null; leftIntentionally = false;
      roomInfo = null; roomOpErr = ""; showPw = false;
      // who's signed in must be known first (a direct /multiplayer/<room> visit can get here sooner):
      // a signed-in player never joins under a guest name
      if (ctx.host && ctx.host.whenAccountKnown) { try { await Promise.race([ctx.host.whenAccountKnown(), new Promise(function (r) { setTimeout(r, 5000); })]); } catch (e) {} }
      var stNow = (ctx.host && ctx.host.getState && ctx.host.getState()) || {};
      if (stNow.web && stNow.account) myName = stNow.account.displayName || stNow.account.handle;
      await getTicket();   // a bought room lets its members in by their account
      // Fresh log: on (re)join the host replays every entry, so keeping the old
      // list would duplicate the entire session history.
      sessionLog = []; logCollapsed = {}; chatHist = [];
      serverMode = false;
      var srv = gameServerUrl();
      if (srv && srv !== "off") joinRelay(srv, function () { joinRelay(relayUrl()); });
      else joinRelay(relayUrl());
    }
    // ── relay transport: one outbound WebSocket per player ──
    // `fallback` runs instead of an error when this server never answers.
    function joinRelay(relay, fallback) {
      setStatus("Connecting…");
      var base = relay.replace(/\/+$/, "");
      if (/^https?:/i.test(base)) base = base.replace(/^http/i, "ws").replace(/^HTTPS/i, "wss");
      if (!/^wss?:/i.test(base)) base = "wss://" + base;
      var sock;
      try { sock = new WebSocket(base + "/lobby/" + encodeURIComponent(lobbyId(lobby))); }
      catch (e) { if (fallback) { fallback(); return; } setStatus("Bad relay URL."); return; }
      ws = sock;
      var opened = false, fellBack = false;
      var giveUp = function () {
        if (opened || fellBack || ws !== sock) return;
        fellBack = true;
        try { sock.onclose = null; sock.onerror = null; sock.onmessage = null; sock.close(); } catch (e) {}
        ws = null;
        fallback();
      };
      if (fallback) setTimeout(giveUp, 6000);   // no welcome in 6 s: use the relay
      sock.onmessage = function (ev) {
        var m; try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (m.t === "welcome") {
          opened = true;
          serverMode = !!m.server;
          myId = m.id; isHost = !serverMode && !!m.host;
          setTimeout(rememberRoom, 1500);
          if (isHost) {
            try { if (ctx.host && ctx.host.resetPracticeFilters) ctx.host.resetPracticeFilters(); } catch (e) {}
            addPlayer(myId, myName, "", mySpec, myAv(), myHandle());
            sysChat(myName + " created the lobby");
            mpPrefetchNow();   // the FIRST question should serve instantly too
          } else {
            toHost(helloMsg());
          }
          admitting = serverMode;
          render();
          return;
        }
        if (m.t === "msg") {
          if (isHost) onHostData(relayConn(m.from), m.d);
          else if (m.host) onClientData(m.d);   // clients only trust the host
          return;
        }
        if (m.t === "peerleft") { if (isHost) hostPeerGone(m.id); return; }
        // Relay 2.0: the host leaving promotes a survivor instead of closing
        // the lobby. "hostleft" only ever comes from an old relay build.
        if (m.t === "youhost") { becomePromotedHost(m.left); return; }
        if (m.t === "newhost") {
          if (m.left && players[m.left]) { players[m.left].off = true; renderScores(); }
          // If our hello was swallowed by the dying host (we joined during the
          // detection gap and never got seated), introduce ourselves again.
          if (!players[myId]) toHost(helloMsg());
          setStatus("Host left \u2014 " + (((players[m.id] || {}).name) || "another player") + " is now the host.");
          return;
        }
        if (m.t === "hostleft") { setStatus("Host left \u2014 lobby closed."); }
      };
      sock.onclose = function () {
        if (!opened && fallback) { giveUp(); return; }
        if (!opened) setStatus("Couldn't reach the relay \u2014 check the URL (and that the worker is deployed).");
        else if (admitting && ws === sock) {
          // closed before it let us in (too many wrong passwords, the server restarting …)
          admitting = false; lobby = ""; ws = null; markBusy(false);
          if (door) door.live = false;
          render();
          if (!door) setStatus("Couldn't join that room \u2014 try again.");
          return;
        }
        else if (!leftIntentionally && lobby) showDisconnected();
        if (ws === sock) ws = null;
      };
      sock.onerror = function () { if (!opened && fallback) { giveUp(); return; } if (!opened) setStatus("Couldn't reach the relay \u2014 check the URL."); };
    }

    // The relay promoted THIS client to host (the old host disconnected). The
    // players/scores/settings/log are already mirrored locally, and the filter
    // panel has been kept in sync via roomSel — so the host role can simply be
    // picked up. The one thing that can't continue is a question mid-read: its
    // answer key lived only on the old host, so it's cancelled cleanly.
    function becomePromotedHost(leftId) {
      if (isHost || !lobby) return;
      isHost = true;
      hostLocalSpeed = null;
      roomConfig = null;   // hostNext reads this (already-synced) panel instead
      mpPre = { key: "", q: null, busy: false };
      if (leftId && players[leftId]) players[leftId].off = true;
      var hadQ = !!current && !ended;
      stopClientRead(); stopAutoSub(); stopReveal(); stopAnswerTimer(); stopTick(); stopBuzzWindowTimer(); stopBonusTimer();
      current = null; hostQ = null; ended = false; pendingBuzzer = null; paused = false;
      bonusState = null; bonusView = null; bonusPending = false;
      // Only rebuild the page when it's actually on screen — renderRoom
      // borrows the REAL #filters-panel, and doing that from a background page
      // would yank the panel out from under the practice screen the player is
      // using. When they return, onShow renders with the host UI.
      if (active()) render();
      broadcast({ t: "qreset" });   // reset clients BEFORE the announcement lands
      sysChat("The host left — " + myName + " is the new host" + (hadQ ? " (that question was cancelled — press N)" : ""));
      pushState();
      mpPrefetchNow();   // this machine serves questions now — fetch ahead
    }

    // A player left: keep their seat and score so a rejoin
    // under the same name continues where they left off; abandon their bonus.
    function hostPeerGone(id) {
      var p = players[id];
      if (p && !p.off) { p.off = true; sysChat(p.name + " disconnected \u2014 seat and score saved"); pushState(); }
      if (bonusState && id === bonusState.winner) {
        bonusState = null; stopBonusTimer();
        sysChat("Bonus abandoned \u2014 the answerer left.");
        broadcast({ t: "bcancel" }); applyBonusCancel();
      }
    }

    // ── host: handle messages from clients ──
    function onHostData(conn, d) {
      var id = conn.peer;
      if (d.t === "hello") {
        if (settings.locked) { try { conn.send({ t: "locked" }); } catch (e) {} return; }
        var now = Date.now(); kickBans = kickBans.filter(function (b) { return b.until > now; });
        if (kickBans.some(function (b) { return (d.device && b.device === d.device) || (validHandle(d.handle) && b.handle === validHandle(d.handle)); })) { try { conn.send({ t: "kicked", text: "The host took you out of this room. You can come back in 30 minutes." }); } catch (e) {} return; }
        if (d.device) devOf[id] = String(d.device).slice(0, 40);   // kept here, never sent to the others
        // Same name = same person, but only an OFFLINE seat can be reclaimed:
        // never the host's own entry, never a connected player's (a live name
        // collision gets a numbered name instead of stealing the seat).
        var wantName = String(d.name || "").trim().toLowerCase();
        var sameName = function (x) { return x !== id && x !== myId && players[x] && String(players[x].name).trim().toLowerCase() === wantName; };
        var oldId = wantName ? order.find(function (x) { return sameName(x) && players[x].off; }) : null;
        if (oldId) {
          var seat = players[oldId];
          delete players[oldId];
          order[order.indexOf(oldId)] = id;
          seat.id = id;
          seat.off = false;
          seat.spec = !!d.spectate;
          if (d.avatar) seat.avatar = d.avatar;
          if (validHandle(d.handle)) seat.handle = validHandle(d.handle);
          players[id] = seat;
          if (bonusState && bonusState.winner === oldId) bonusState.winner = id;
          if (pendingBuzzer === oldId) pendingBuzzer = id;
          if (lockedIds[oldId]) { lockedIds[id] = lockedIds[oldId]; delete lockedIds[oldId]; }
          sysChat(seat.name + " rejoined");
        } else {
          var joinName = String(d.name || "").trim();
          var hostClash = joinName && players[myId] && String(players[myId].name).trim().toLowerCase() === wantName;
          if (joinName && (hostClash || order.some(sameName))) {
            var base = joinName, n = 2;
            var taken = function (nm) {
              var low = nm.trim().toLowerCase();
              return order.some(function (x) { return x !== id && players[x] && String(players[x].name).trim().toLowerCase() === low; });
            };
            while (taken(base + " (" + n + ")")) n++;
            joinName = base + " (" + n + ")";
          }
          addPlayer(id, joinName || d.name, "", d.spectate, d.avatar, d.handle);
          sysChat(players[id].name + " joined" + (d.spectate ? " (spectating)" : ""));
        }
        pushState();
        // bring the newcomer up to speed
        sessionLog.forEach(function (e) { conn.send({ t: "logentry", entry: e }); });
        if (current) {
          conn.send(questionMsg());
          var reading = !paused && !pendingBuzzer && !ended && revealIdx < current.text.length;
          conn.send({ t: "read", from: revealIdx, speed: reading ? curRevealSpeed : 0 });
          // A bonus is in progress — replay it (and its judged parts) so the
          // newcomer sees the bonus UI, not a frozen tossup.
          if (bonusState && bonusView) {
            conn.send({ t: "bonus", leadin: bonusView.leadin, parts: bonusView.parts, values: bonusView.values, max: bonusView.max, winner: bonusView.winner, name: bonusView.name, secs: settings.answerSeconds || 10 });
            (bonusView.results || []).forEach(function (rp) { if (rp) conn.send(rp); });
          }
        }
      }
      else if (d.t === "chat") {
        if (d.chan === "team") relayTeamChat(id, players[id] ? players[id].name : "?", d.text);
        else relayChat(players[id] ? players[id].name : "?", d.text);
      }
      else if (d.t === "setName") { if (players[id]) { var old = players[id].name; players[id].name = d.name || old; sysChat(old + " is now " + players[id].name); pushState(); } }
      else if (d.t === "setTeam") { if (players[id]) { players[id].team = d.team || ""; pushState(); } }
      else if (d.t === "setSetting") { settings[d.key] = d.val; sysChat((players[id] ? players[id].name : "?") + " " + describeSetting(d.key, d.val)); pushState(); }
      else if (d.t === "setConfig") {
        if (d.config) { roomConfig = roomConfig || {}; ["filters", "strictness", "revealSpeed", "hidePron", "filterSummary"].forEach(function (k) { if (d.config[k] !== undefined) roomConfig[k] = d.config[k]; }); if (d.config.filterSummary != null) filterSummary = d.config.filterSummary; }
        if (d.change) sysChat((players[id] ? players[id].name : "?") + " " + d.change);
        mpPre.q = null;   // the prefetched tossup no longer matches the filters
        mpPrefetchNow();  // queue one for the NEW filters right away
        // Mirror the sender's panel selection into the HOST panel — hostNext
        // reads this panel, and without the mirror the host's next local edit
        // would silently clobber the client's change.
        // roomConfig keeps the SENDER's values (merged above) — recomputing it
        // from the host panel here would discard the client's strictness /
        // reading-speed / set-mode edits, which the sel snapshot doesn't carry.
        if (d.config && d.config.sel && ctx.host && ctx.host.applyFilterSelectionSnapshot) {
          _lastSelJson = JSON.stringify(d.config.sel);
          var selGen = ++_hostSelGen;
          Promise.resolve(ctx.host.applyFilterSelectionSnapshot(d.config.sel)).catch(function () {}).then(function () {
            if (selGen !== _hostSelGen) return;   // a newer edit superseded this apply — it will broadcast
            broadcast(stateMsg()); renderFilterSummary();
          });
          return;
        }
        broadcast(stateMsg()); renderFilterSummary();
      }
      else if (d.t === "typing") {
        if (id === pendingBuzzer || (bonusState && id === bonusState.winner)) {
          var _tx = String(d.text || "").slice(0, 120);
          liveTyped = _tx;   // the timeout fallback submits this, not ""
          broadcast({ t: "typing", id: id, text: _tx });   // the typer ignores its own echo
          applyTyping(id, _tx);
        }
      }
      else if (d.t === "buzz") { hostHandleBuzz(id); }
      else if (d.t === "answer") { if (id === pendingBuzzer) hostHandleAnswer(id, d.text); }
      else if (d.t === "reqNext") { if (!players[id] || players[id].spec) return; hostNext(players[id].name); }
      else if (d.t === "banswer") { if (bonusState && id === bonusState.winner) hostHandleBonusAnswer(id, d.text, d.k); }
      else if (d.t === "pause") { hostTogglePause(id); }
    }

    // ── host: game flow ──
    function questionMsg() { return { t: "question", q: { id: current.id, text: current.text }, count: qCount }; }

    // "Select set by name" mode → serve the packet's tossups in order (1, 2, …).
    var setQueue = null, setIndex = 0, setSig = "";
    async function nextSetQuestion(f) {
      var sig = (f.setNames || []).join("|") + "::" + (f.packetNumbers || []).join(",");
      if (sig !== setSig) {
        setSig = sig; setIndex = 0; setQueue = [];
        var setName = f.setNames[0];
        var packets = f.packetNumbers && f.packetNumbers.length ? f.packetNumbers : null;
        if (!packets) {
          try { packets = ((await ctx.api.get("/api/packets-for-set?setName=" + encodeURIComponent(setName))).packets || []).map(function (p) { return p.packet_number; }); } catch (e) { packets = []; }
        }
        for (var i = 0; i < packets.length; i++) {
          try { var pc = await ctx.api.get("/api/packet-content?setName=" + encodeURIComponent(setName) + "&packetNumber=" + packets[i]); setQueue = setQueue.concat(pc.tossups || []); } catch (e) {}
        }
      }
      if (!setQueue.length) { setStatus("No questions found in that set."); return null; }
      if (setIndex >= setQueue.length) { setStatus("Packet finished — no more questions."); sysChat("Packet finished — no more questions."); return null; }
      return setQueue[setIndex++];
    }

    // Any player may advance: after a question ends it's a plain "next"; mid-
    // question it's a SKIP and only allowed when skips are on (host included).
    function requestNext() {
      if (isHost) { hostNext(); return; }
      // weighted categories: the server draws each question from the asker's
      // fresh roll (every panel mirrors the room, so any roll is the same draw)
      var roll = null;
      if (serverMode && weightedOn()) { try { roll = ctx.host.getPracticeConfig().filters || null; } catch (e) {} }
      toHost(roll ? { t: "reqNext", roll: roll } : { t: "reqNext" });
    }
    function skipsAllowed() { return settings.allowSkips !== false; }
    async function hostNext(byName) {
      if (!isHost || bonusState || bonusPending) return;
      // Never advance while a buzz is live or being judged — the in-flight
      // verdict would otherwise land on (and instantly end) the NEXT question.
      if (pendingBuzzer || answerJudging) { setStatus("Someone is answering — wait for the verdict."); return; }
      if (current && !ended) {
        if (!skipsAllowed()) { setStatus("Skips are off (OPTIONS) \u2014 finish this question first."); return; }
        if (byName) sysChat(byName + " skipped the question");
      }
      hostFinalize();
      // Reuse the host's Tossups Practice filters + strictness + reading speed.
      var cfg = roomConfig || ((ctx.host && ctx.host.getPracticeConfig) ? ctx.host.getPracticeConfig() : { filters: {}, strictness: 10, revealSpeed: 25, filterSummary: "" });
      curRevealSpeed = cfg.revealSpeed != null ? cfg.revealSpeed : 25;
      curStrictness = cfg.strictness != null ? cfg.strictness : 10;
      curStopPower = !!settings.stopPower;
      filterSummary = cfg.filterSummary || "All categories";
      var f = cfg.filters || {};
      curFilters = f;
      try {
        var q;
        var mode = realMode();
        // Weighted mode re-rolls per question: a stored roomConfig froze the
        // ONE category rolled at edit time, which would serve every question
        // from a single category. The host panel mirrors every edit (sel
        // sync), so it is safe to re-derive the roll live.
        var wEl = document.getElementById("enable-cat-weights");
        if (roomConfig && wEl && wEl.checked && mode === "random" && !(f.setNames && f.setNames.length) && ctx.host && ctx.host.getPracticeConfig) {
          try { f = ctx.host.getPracticeConfig().filters || f; curFilters = f; } catch (e2) {}
        }
        if (f.setNames && f.setNames.length) {
          q = await nextSetQuestion(f);           // ordered set mode
          if (!q) return;                          // status already set
        } else {
          // Serve the prefetched tossup when it matches the current filters —
          // pressing N renders instantly; the next one loads in the background.
          // (Weighted mode matches on "W": the queued question carries its own
          // fresh roll, drawn from the same distribution.)
          var qkey = weightedOn() ? "W" : filtersToQuery(f);
          if (mpPre.q && mpPre.key === qkey) { q = mpPre.q; mpPre.q = null; }
          else {
            var data = await ctx.api.get("/api/tossups/random?" + filtersToQuery(f));
            q = data.tossup;
            if (!q) { setStatus("No question matches your Tossups filters."); return; }
          }
        }
        hostQ = q;
        qCount++;
        // Read exactly what solo practice reads (notes hidden, guides per
        // settings); "(*)" survives so the power index still comes from it.
        var rawText = readText(q, "question", 0, cfg.hidePron);
        var pIdx = rawText.indexOf("(*)");
        curPowerEnd = pIdx > 0 ? rawText.slice(0, pIdx).trim().length : 0;
        var text = rawText.split("(*)").join(" ").replace(/\s+/g, " ").trim();
        startQuestion({ id: q.id, text: text });
        broadcast(questionMsg());
        broadcast(stateMsg());            // sync the filter summary
        renderFilterSummary();
        beginReveal();
        // Preload the NEXT question while this one reads (mpPrefetchNext
        // no-ops in set/import modes — those are in-memory queues already).
        mpPrefetchNext(f);
        if (settings.bonusEvery && !q._mpBonus) prefetchBonusFor(q);
      } catch (e) { setStatus("Couldn't load question: " + (e.message || e)); }
    }
    // ── host-side preloading ──
    // Weighted mode note: each question is its own category roll, so an exact
    // filter-key match would NEVER hit. Instead the prefetch itself draws a
    // fresh roll and stores under the "W" key — the queued question follows
    // the same weighted distribution as an on-demand one, so serving it is
    // statistically identical. Any panel edit clears mpPre either way.
    function weightedOn() {
      var w = document.getElementById("enable-cat-weights");
      return !!(w && w.checked && realMode() === "random");
    }
    function mpPrefetchNext(f) {
      if (!isHost) return;
      if (f && f.setNames && f.setNames.length) return;      // ordered local queue
      var wt = weightedOn();
      if (wt && ctx.host && ctx.host.getPracticeConfig) {
        try { f = ctx.host.getPracticeConfig().filters || f; } catch (e) {}
      }
      var key = wt ? "W" : filtersToQuery(f);
      if (mpPre.busy || (mpPre.q && mpPre.key === key)) return;
      mpPre.busy = true;
      ctx.api.get("/api/tossups/random?" + filtersToQuery(f)).then(function (data) {
        mpPre.busy = false;
        var q = data && data.tossup;
        if (q && (!hostQ || q.id !== hostQ.id)) { mpPre.key = key; mpPre.q = q; }
      }).catch(function () { mpPre.busy = false; });
    }
    // Fetch ahead as soon as this machine is hosting (room created, promoted,
    // or filters settled) — the FIRST press of N should be instant too.
    function mpPrefetchNow() {
      try { if (isHost && ctx.host && ctx.host.getPracticeConfig) mpPrefetchNext(((roomConfig || ctx.host.getPracticeConfig()) || {}).filters || {}); } catch (e) {}
    }
    // With "bonus after every question" on, fetch the matching bonus while the
    // tossup is still being read, so a correct buzz starts the bonus instantly.
    function prefetchBonusFor(q) {
      fetchBonusForTossup(q).then(function (b) {
        if (b && hostQ === q && !q._mpBonus && !bonusState) q._mpBonusPre = b;
      }).catch(function () {});
    }

    function startQuestion(q) {
      qGen++; answerJudging = false;   // void any in-flight verdict from the previous question
      resetTyping();
      endedPowerEnd = 0;
      current = q; ended = false; pendingBuzzer = null; revealIdx = 0;
      lockedTeams = {}; lockedIds = {}; buzzHistory = []; buzzCharMarks = []; paused = false;
      bonusState = null; bonusView = null; bonusPending = false; pausedAtPower = false;
      stopAnswerTimer(); stopTick(); stopBuzzWindowTimer(); stopReveal(); stopBonusTimer(); stopAutoSub();
      renderQuestion(); renderBuzzes(); updateTopBar();
    }
    var bwTimer = null, bwDeadline = 0;
    function stopBuzzWindowTimer() { if (bwTimer) { clearTimeout(bwTimer); bwTimer = null; } }
    // Question finished reading → everyone gets a buzz window; if nobody
    // buzzes before it runs out, the question goes dead.
    function hostStartBuzzWindow() {
      if (!isHost || ended || pendingBuzzer) return;
      stopBuzzWindowTimer();
      var secs = settings.buzzWindow || 10;
      bwDeadline = Date.now() + secs * 1000;
      broadcast({ t: "buzzwin", secs: secs });
      applyBuzzWindow(bwDeadline);
      bwTimer = setTimeout(function () {
        if (ended || pendingBuzzer) return;
        ended = true;
        var payload = { t: "result", id: "", name: "", correct: false, points: 0, given: "", index: revealIdx, answer: hostQ ? (hostQ.answer_sanitized || "") : "", answerRaw: hostQ ? hostQ.answer : "", history: buzzHistory, ended: true, fullText: current ? current.text : "", noBuzz: true, category: catLabel(hostQ), powerEnd: curPowerEnd };
        broadcast(payload); applyResult(payload); pushState();
        stopReveal(); hostFinalize();
      }, secs * 1000);
    }
    function applyBuzzWindow(deadline) {
      var buzz = body && body.querySelector("#mp-buzz"); if (!buzz) return;
      buzz.className = "buzz-area";
      buzz.innerHTML = '<div class="buzz-hints"><span id="mp-timer"></span></div><div class="mp-timer-bar"><div id="mp-timer-fill"></div></div>';
      startTick(deadline, (settings.buzzWindow || 10) * 1000);
    }

    // Clock-synced reading: ONE "read" message (start index + speed) and every
    // client animates locally. Buzz/pause/result/buzzwin messages carry the
    // authoritative index, so clients re-sync at every event.
    function beginReveal() {
      stopReveal();
      if (curRevealSpeed === 0) {
        // Instant reading still honours "Stop on power": hold at the mark;
        // resuming (P) reveals the rest instantly.
        if (curStopPower && curPowerEnd > 0 && !pausedAtPower && revealIdx < curPowerEnd) {
          revealIdx = curPowerEnd;
          broadcast({ t: "read", from: revealIdx, speed: 0 });
          applyReveal(revealIdx);
          pausedAtPower = true;
          paused = true;
          sysChat("Stopped at power \u2014 press P to resume");
          broadcast({ t: "pause", paused: true, idx: revealIdx });
          applyPause(true);
          return;
        }
        revealIdx = current.text.length; broadcast({ t: "read", from: revealIdx, speed: 0 }); applyReveal(revealIdx); hostStartBuzzWindow(); return;
      }
      broadcast({ t: "read", from: revealIdx, speed: curRevealSpeed });
      // TIME-BASED reveal: the index follows the wall clock, not the number of
      // interval fires — a busy host machine can no longer fall behind its own
      // clients' text. (The old ticker also ran getPracticeConfig — two full
      // panel scans — per CHARACTER on the host and nothing on clients, which
      // is exactly why nonhosts used to see the question sooner.)
      // ms per character (fractional at the fast end: several characters per tick); the
      // timer itself never fires more often than every 8 ms
      var tickMs = curRevealSpeed;
      var t0 = Date.now(), base = revealIdx, lastCfg = 0;
      revealTimer = setInterval(function () {
        // While held, keep sliding the baseline so resuming never jumps ahead.
        if (paused || pendingBuzzer || ended) { t0 = Date.now(); base = revealIdx; return; }
        var nowT = Date.now();
        // Live speed / stop-on-power: sample at most twice a second — far too
        // expensive to run per character.
        if (nowT - lastCfg > 500) {
          lastCfg = nowT;
          try {
            curStopPower = !!settings.stopPower;   // a synced room setting now
            var cfg = ctx.host.getPracticeConfig && ctx.host.getPracticeConfig();
            // Restart only when the HOST moves their own slider — comparing
            // against curRevealSpeed would instantly revert a client's speed edit.
            if (cfg && typeof cfg.revealSpeed === "number") {
            if (hostLocalSpeed === null) hostLocalSpeed = cfg.revealSpeed;
            if (cfg.revealSpeed !== hostLocalSpeed) {
              hostLocalSpeed = cfg.revealSpeed;
              curRevealSpeed = cfg.revealSpeed;
              beginReveal();
              return;
            }
            }
          } catch (e) {}
        }
        if (revealIdx >= current.text.length) { stopReveal(); hostStartBuzzWindow(); return; }
        var want = Math.min(current.text.length, base + Math.floor((nowT - t0) / tickMs));
        // Catching up must not blow past the power mark — stop exactly on it.
        if (curStopPower && curPowerEnd > 0 && !pausedAtPower && revealIdx < curPowerEnd && want > curPowerEnd) want = curPowerEnd;
        if (want <= revealIdx) return;
        revealIdx = want;
        applyReveal(revealIdx);
        // Stop on power: pause at the power mark (everyone), resume with P.
        if (curStopPower && curPowerEnd > 0 && revealIdx >= curPowerEnd && !pausedAtPower && revealIdx < current.text.length) {
          pausedAtPower = true;
          paused = true;
          sysChat("Stopped at power \u2014 press P to resume");
          broadcast({ t: "pause", paused: true, idx: revealIdx });
          applyPause(true);
        }
      }, Math.max(8, tickMs));
    }

    // ── client-side reading ticker (driven by the host's "read" message) ──
    var clientReadTimer = null;
    function stopClientRead() { if (clientReadTimer) { clearInterval(clientReadTimer); clientReadTimer = null; } }
    function clientStartRead(from, speed) {
      stopClientRead();
      if (typeof from === "number") revealIdx = from;
      applyReveal(revealIdx);
      if (!current || !speed) return;   // speed 0 ⇒ hold at "from" (instant reveal sends from = full length)
      // Same wall-clock pacing as the host's reveal, so both texts track the
      // same clock regardless of tick jitter on either machine.
      var tickMs = speed;   // may be under 1 ms per character: the clock decides how many show
      var t0 = Date.now(), base = revealIdx;
      clientReadTimer = setInterval(function () {
        // While held, slide the baseline so a resume never leaks unread text.
        if (paused || ended || !current) { t0 = Date.now(); base = revealIdx; return; }
        if (revealIdx >= (current.len || current.text.length)) { stopClientRead(); return; }
        // text not here yet (server rooms send it just ahead): wait for it
        var want = Math.min(current.text.length, base + Math.floor((Date.now() - t0) / tickMs));
        if (want <= revealIdx) return;
        revealIdx = want;
        applyReveal(revealIdx);
      }, Math.max(8, tickMs));
    }
    function stopReveal() { if (revealTimer) { clearInterval(revealTimer); revealTimer = null; } }

    function hostHandleBuzz(id) {
      if (!current || ended || pendingBuzzer || paused) return;
      var p = players[id]; if (!p) return;
      if (p.spec) return; // spectators never buzz
      if (lockedIds[id]) return;
      if (p.team && lockedTeams[p.team]) return;
      pendingBuzzer = id;
      pendingPrompted = false; pendingPromptFrom = "";
      liveTyped = "";
      stopReveal();
      stopBuzzWindowTimer();
      var secs = settings.answerSeconds || 10;
      answerDeadline = Date.now() + secs * 1000;
      // Send REMAINING SECONDS (not an absolute timestamp) so clients compute
      // the deadline on their own clock — clock skew between machines would
      // otherwise make the countdown show 0 or a wrong number.
      broadcast({ t: "buzz", id: id, name: p.name, index: revealIdx, secs: secs });
      applyBuzz(id, p.name, revealIdx, answerDeadline);
      startAnswerTimer();
    }
    // The host timer is a FALLBACK: the answering client submits whatever it
    // has typed at the deadline (armAutoSub), so the extra 1.5s here is grace
    // for that message to arrive before the host closes the buzz with "".
    function startAnswerTimer() { if (answerTimer) clearTimeout(answerTimer); answerTimer = setTimeout(function () { if (pendingBuzzer) hostHandleAnswer(pendingBuzzer, liveTyped); }, (settings.answerSeconds || 10) * 1000 + 1500); }
    function stopAnswerTimer() { if (answerTimer) { clearTimeout(answerTimer); answerTimer = null; } }
    function stopTick() { if (tickTimer) { clearInterval(tickTimer); tickTimer = null; } }

    // answerJudging + qGen mirror the bonus path's judging guard: the client's
    // auto-submitted answer and the host's fallback "" can otherwise BOTH be in
    // flight for the same buzz (double-judged score, double lockout), and a
    // question change during the await must void the verdict entirely.
    var answerJudging = false, qGen = 0;
    var liveTyped = "";   // host: the answerer's last live-typed text (fallback submission)
    // The room reads a DISPLAY string (notes/guides stripped, "(*)" removed,
    // whitespace collapsed); the server takes buzz positions as indexes into
    // question_sanitized AS STORED, "(*)" included (power scoring and _readPos
    // both count that way). Map the index across.
    function origBuzzPos(idx) {
      if (!hostQ || !current) return idx;
      var orig = String(hostQ.question_sanitized || hostQ.question || "");
      try {
        if (ctx.host && ctx.host.mapDisplayPos) {
          var m = ctx.host.mapDisplayPos(current.text, orig, idx);
          if (typeof m === "number" && isFinite(m)) return Math.max(0, Math.min(orig.length, m));
        }
      } catch (e) {}
      return idx;
    }
    async function hostHandleAnswer(id, text) {
      if (id !== pendingBuzzer || answerJudging) return;
      answerJudging = true;
      var myGen = qGen;
      stopAnswerTimer();
      var p = players[id]; if (!p) { pendingBuzzer = null; answerJudging = false; return; }
      var res;
      var origPos = origBuzzPos(revealIdx);
      try {
        res = await ctx.api.post("/api/check-tossup", { questionId: hostQ.id, answer: text, buzzPosition: origPos, fullyRead: revealIdx >= current.text.length, strictness: curStrictness != null ? curStrictness : 10, allowPrompt: !pendingPrompted, previous: pendingPrompted ? pendingPromptFrom : null, record: false });
      } catch (e) { res = { correct: false, points: 0, answer: hostQ.answer_sanitized }; }
      // The question advanced or the buzz was resolved elsewhere while we
      // were judging — this verdict belongs to a dead world; drop it.
      if (myGen !== qGen || id !== pendingBuzzer) { answerJudging = false; return; }
      answerJudging = false;
      // Prompt: ask the same player to be more specific (one prompt per buzz).
      if (res && res.prompted && !pendingPrompted) {
        pendingPrompted = true; pendingPromptFrom = text;
        var ask = (res.prompt && res.prompt.ask) || (res.antiprompt ? "less specific?" : "");
        var psecs = settings.answerSeconds || 10;
        answerDeadline = Date.now() + psecs * 1000; // fresh window for the prompt
        liveTyped = "";   // fresh window, fresh live text
        sysChat(p.name + " was prompted");
        broadcast({ t: "prompt", id: id, name: p.name, ask: ask, secs: psecs });
        applyPrompt(id, p.name, ask, answerDeadline);
        startAnswerTimer();
        return;
      }
      var correct = !!res.correct, points = res.points || 0;
      p.score = (p.score || 0) + points;
      buzzHistory.push({ name: p.name, correct: correct, points: points, given: text, index: revealIdx, orig: origPos });
      pendingBuzzer = null;
      if (!correct && !settings.rebuzz) { if (p.team) lockedTeams[p.team] = true; else lockedIds[id] = true; }
      // With rebuzzes off, if everyone is now locked out, end the question.
      var deadEnd = !correct && !settings.rebuzz && allLockedOut();
      var payload = { t: "result", id: id, name: p.name, correct: correct, points: points, given: text, index: revealIdx, origIndex: origPos, answer: res.answer || hostQ.answer_sanitized, answerRaw: hostQ.answer || "", history: buzzHistory };
      if (correct || deadEnd) { ended = true; payload.ended = true; payload.fullText = current.text; payload.category = catLabel(hostQ); payload.powerEnd = curPowerEnd; }
      broadcast(payload); applyResult(payload); pushState();
      if (ended) {
        stopReveal(); hostFinalize();
        if (correct) maybeStartBonus(id);
      }
      else if (current && revealIdx >= current.text.length) { hostStartBuzzWindow(); }
      else { broadcast({ t: "reading" }); beginReveal(); }
    }

    // ── bonus phase (host): ONLY the tossup winner answers; all watch ──
    // Decide whether a bonus follows this (correct) tossup, and on what.
    function maybeStartBonus(winnerId) {
      // Imported "TU + bonus" packets already pair a bonus to the tossup.
      if (hostQ && hostQ._mpBonus) { hostStartBonus(winnerId); return; }
      if (!settings.bonusEvery) return;
      // Prefetched while the tossup was reading — kept SEPARATE from _mpBonus
      // so toggling "bonus after every question" off mid-question still wins.
      if (hostQ && hostQ._mpBonusPre) { hostQ._mpBonus = hostQ._mpBonusPre; hostStartBonus(winnerId); return; }
      // Otherwise draw a random bonus matching the same filters as the tossup.
      bonusPending = true;
      var forQ = hostQ;
      fetchBonusForTossup(forQ).then(function (b) {
        bonusPending = false;
        // Still on the same (ended) question, and nobody advanced meanwhile?
        if (b && hostQ && hostQ === forQ && ended && !bonusState) { hostQ._mpBonus = b; hostStartBonus(winnerId); }
        else if (!b) sysChat("No bonus matched the filters \u2014 skipping.");
      }).catch(function () { bonusPending = false; });
    }
    // Category-tree node for the tossup's level-2 subtree ("A > B"), looked up
    // by path in the bonus tree. Loaded once; any failure falls back to the root.
    var _bonusTreeByPath = null, _bonusTreeP = null;
    function bonusTreeIndex() {
      if (_bonusTreeByPath) return Promise.resolve(_bonusTreeByPath);
      if (!_bonusTreeP) {
        var get = (ctx.host && ctx.host.getCategoryTree)
          ? Promise.resolve(ctx.host.getCategoryTree("bonuses"))
          : Promise.resolve(ctx.api.get("/api/category-tree?type=bonuses")).then(function (d) { return (d && d.tree) || []; });
        _bonusTreeP = get.then(function (roots) {
          var m = {};
          (function walk(list) { (list || []).forEach(function (n) { if (n && n.path) { m[n.path] = n; if (n.depth < 2) walk(n.children); } }); })(roots);
          _bonusTreeByPath = m;
          return m;
        }).catch(function () { _bonusTreeP = null; return {}; });
      }
      return _bonusTreeP;
    }
    // A random bonus that genuinely matches the served tossup: same level-2
    // subtree when the tree knows it (else the same root category), and the
    // same difficulty when known \u2014 regardless of how the tossup was picked.
    // Falls back to the root category when the narrower draw comes up empty.
    function bonusQuery(cat, q) {
      var parts = ["random=1", "limit=1"];
      if (cat) parts.push("categories=" + encodeURIComponent(cat));
      if (q && q.difficulty != null && q.difficulty !== "") parts.push("difficulties=" + q.difficulty);
      return parts.join("&");
    }
    async function fetchBonusForTossup(q) {
      if (!q) return null;
      var root = q.category || "";
      var segs = String(q.category_path || "").split(" > ").map(function (s) { return s.trim(); }).filter(Boolean);
      var narrow = "";
      if (segs.length >= 2) {
        try {
          var idx = await bonusTreeIndex();
          var n = idx[segs[0] + " > " + segs[1]];
          if (n && n.id && n.count > 0) narrow = n.id;
        } catch (e) {}
      }
      var tries = narrow ? [narrow, root || segs[0] || ""] : [root || segs[0] || ""];
      for (var i = 0; i < tries.length; i++) {
        try {
          var data = await ctx.api.get("/api/bonuses/random?" + bonusQuery(tries[i], q));
          if (data && data.bonus) return data.bonus;
        } catch (e) {}
      }
      return null;
    }
    function stopBonusTimer() { if (bonusTimer) { clearTimeout(bonusTimer); bonusTimer = null; } }
    function startBonusTimer() {
      stopBonusTimer();
      // +1.5s grace: the winner's client auto-submits their typed text at the
      // deadline; this fallback only fires if that message never arrives.
      bonusTimer = setTimeout(function () { if (bonusState) hostHandleBonusAnswer(bonusState.winner, liveTyped, bonusState.k); }, (settings.answerSeconds || 10) * 1000 + 1500);
    }
    var bonusValues = [], bonusMax = 0;   // host-only: per-part points + total
    function hostStartBonus(winnerId) {
      var b = hostQ._mpBonus, p = players[winnerId];
      if (!b || !p) return;
      // Any number of parts (1–9); text read like solo practice.
      var n = Math.max(jsonArr(b.parts_sanitized).length, jsonArr(b.parts).length);
      bonusParts = []; bonusAnswers = jsonArr(b.answers_sanitized); bonusRawAnswers = jsonArr(b.answers);
      for (var i = 0; i < n; i++) bonusParts.push(readText(b, "part", i, curHidePron()));
      if (!bonusParts.length) return;
      var bv = bonusValuesOf(b, bonusParts.length);
      bonusValues = bv.values; bonusMax = bv.max;
      bonusState = { winner: winnerId, k: 0, got: 0, pts: 0 };
      liveTyped = "";
      sysChat(p.name + " earned the bonus");
      var msg = { t: "bonus", leadin: readText(b, "leadin", 0, curHidePron()), parts: bonusParts, values: bonusValues, max: bonusMax, winner: winnerId, name: p.name, secs: settings.answerSeconds || 10 };
      broadcast(msg); applyBonus(msg);
      startBonusTimer();
    }
    function curHidePron() {
      try { var c = roomConfig || (ctx.host && ctx.host.getPracticeConfig && ctx.host.getPracticeConfig()); return !!(c && c.hidePron); } catch (e) { return false; }
    }
    async function hostHandleBonusAnswer(id, text, k) {
      if (!bonusState || id !== bonusState.winner || bonusState.judging) return;
      // A late answer for an already-scored part (the +1.5s fallback advanced
      // it) must not be judged against the NEXT part's answerline.
      if (k != null && bonusState.k !== k) return;
      stopBonusTimer();
      var k = bonusState.k;
      bonusState.judging = true;   // re-entrancy guard across the await
      var ok = false;
      try {
        var strict = curStrictness != null ? curStrictness : 10, bq = hostQ && hostQ._mpBonus, r = null;
        if (bq && bq.id) {
          try { r = await ctx.api.post("/api/evaluate-bonus-part", { questionId: bq.id, part: k, answer: text, strictness: strict }); } catch (e) { r = null; }
          if (r && r.error) r = null;
        }
        if (!r) r = await ctx.api.post("/api/evaluate-answer", { answerline: bonusRawAnswers[k] || "", sanitized: bonusAnswers[k] || "", answer: text, strictness: strict });
        // A prompt is not a correct answer (rooms have no bonus prompt round).
        ok = r.status === "accept";
      } catch (e) {}
      // The winner may have left, the bonus may have been cancelled, or a new
      // question may have started during the await — bail if state moved on.
      if (!bonusState || bonusState.winner !== id || bonusState.k !== k) return;
      bonusState.judging = false;
      var p = players[id];
      var val = bonusValues[k] || 10;
      if (ok && p) { bonusState.got++; bonusState.pts += val; p.score = (p.score || 0) + val; }
      var done = k + 1 >= bonusParts.length;
      bonusState.k++;
      liveTyped = "";   // next part starts with a clean slate
      var msg = { t: "bpart", k: k, ok: ok, val: val, given: text, answer: bonusAnswers[k] || "", answerRaw: bonusRawAnswers[k] || "", done: done, got: bonusState.got, pts: bonusState.pts, secs: settings.answerSeconds || 10 };
      broadcast(msg); applyBonusPart(msg); pushState();
      if (done) { sysChat((p ? p.name : "?") + " bonus: " + bonusState.pts + "/" + (bonusMax || bonusParts.length * 10)); bonusState = null; }
      else startBonusTimer();
    }
    function allLockedOut() {
      var active = order.filter(function (id) { return players[id] && !players[id].spec && !players[id].off; });
      return active.length > 0 && active.every(function (id) {
        var p = players[id];
        return lockedIds[id] || (p && p.team && lockedTeams[p.team]);
      });
    }
    function hostTogglePause(who) {
      if (bonusState || bonusPending) { return; }   // no pausing during a bonus
      paused = !paused;
      var nm = (players[who] && players[who].name) || (who === myId ? myName : "Someone");
      sysChat(nm + (paused ? " paused the game" : " resumed the game"));
      broadcast({ t: "pause", paused: paused, idx: revealIdx }); applyPause(paused);
      if (!paused && !pendingBuzzer && !ended) beginReveal();
    }
    function describeSetting(key, val) {
      var label = key === "answerSeconds" ? "Answer Time" : key === "buzzWindow" ? "Buzz Window" : key === "rebuzz" ? "Rebuzzes" : key === "bonusEvery" ? "Bonus after every question" : key === "stopPower" ? "Stop on power" : key === "allowSkips" ? "Skips" : key === "locked" ? "Room lock" : key === "public" ? "Public room" : key === "tournament" ? "Tournament mode" : key;
      return "changed " + label + " to " + val;
    }

    // Finalize the current question into the shared session log (host only).
    function hostFinalize() {
      if (!isHost || !current || current._logged) return;
      current._logged = true;
      var entry = {
        qid: (hostQ && hostQ.id) || (current && current.id) || "",
        text: current.text,
        answer: (hostQ && (hostQ.answer_sanitized || hostQ.answer)) || "",
        answerRaw: (hostQ && hostQ.answer) || "",
        category: (hostQ && hostQ.category) || "",
        categoryPath: (hostQ && hostQ.category_path) || "",
        difficulty: (hostQ && hostQ.difficulty) != null ? hostQ.difficulty : "",
        buzzes: buzzHistory.slice(),
        marks: buzzCharMarks.slice(),
      };
      sessionLog.push(entry); broadcast({ t: "logentry", entry: entry }); renderSessionLog();
    }

    // ── client: handle messages from host ──
    function onClientData(d) {
      if (d.t === "state") {
        if (admitting) { admitting = false; door = null; render(); }   // let in: now the room shows
        srvHost = d.host || null;
        players = {}; order = []; (d.players || []).forEach(function (p) { players[p.id] = p; order.push(p.id); });
        settings = d.settings || settings;
        match = d.match || null;
        if (d.filterSummary != null) filterSummary = d.filterSummary;
        // Full panel mirror when the host sends one (app 14.2+); the lossy
        // toggle-only sync is the fallback for older hosts. Deduped: state is
        // re-broadcast on every score change, and re-applying an unchanged
        // selection would thrash the panel while this player is mid-edit.
        if (d.roomSel) {
          var sj = JSON.stringify(d.roomSel);
          if (sj !== _lastSelJson) { _lastSelJson = sj; applyRemoteSel(d.roomSel); }
        } else if (d.roomFilters) applyRoomFiltersToPanel(d.roomFilters);
        renderScores(); renderSettings(); renderFilterSummary(); updateTopBar();
      }
      else if (d.t === "chat") { addChat(d.name, d.text, d.sys, d.chan === "team"); }
      // server rooms: the question's text arrives a few seconds ahead of the
      // reading ("more"); q.len is its full length
      else if (d.t === "more") { if (current && typeof d.text === "string") current.text += d.text; }
      else if (d.t === "status") { setStatus(d.text || ""); }
      else if (d.t === "needConfig") { sendRoomConfig(true); }
      else if (d.t === "question") { stopClientRead(); stopAutoSub(); endedPowerEnd = 0; current = d.q; if (typeof d.count === "number") qCount = d.count; ended = false; pendingBuzzer = null; revealIdx = 0; buzzHistory = []; buzzCharMarks = []; paused = false; bonusView = null; renderQuestion(); renderBuzzes(); updateTopBar(); }
      else if (d.t === "read") { clientStartRead(d.from, d.speed); }
      else if (d.t === "reveal") { revealIdx = d.index; applyReveal(d.index); }  // legacy hosts
      else if (d.t === "buzz") { stopClientRead(); if (typeof d.index === "number") { revealIdx = d.index; applyReveal(revealIdx); } answerDeadline = Date.now() + ((d.secs || settings.answerSeconds || 10) * 1000); applyBuzz(d.id, d.name, d.index, answerDeadline); }
      else if (d.t === "buzzwin") { stopClientRead(); if (current) { revealIdx = current.text.length; applyReveal(revealIdx); } applyBuzzWindow(Date.now() + ((d.secs || settings.buzzWindow || 10) * 1000)); }
      else if (d.t === "result") {
        stopClientRead();
        if (current && d.qid) current.id = d.qid;   // a server room names the question only now
        if (current && d.fullText && d.fullText.length > current.text.length) current.text = d.fullText; if (typeof d.index === "number" && !d.ended) revealIdx = d.index; buzzHistory = d.history || buzzHistory; if (d.ended) ended = true; applyResult(d); renderBuzzes(); }
      else if (d.t === "reading") { /* the host's "read" message restarts the local ticker */ }
      else if (d.t === "pause") { paused = d.paused; if (typeof d.idx === "number") { revealIdx = d.idx; applyReveal(revealIdx); } applyPause(d.paused); }
      else if (d.t === "prompt") { answerDeadline = Date.now() + ((d.secs || settings.answerSeconds || 10) * 1000); applyPrompt(d.id, d.name, d.ask, answerDeadline); }
      else if (d.t === "typing") { if (d.id !== myId) applyTyping(d.id, d.text); }
      else if (d.t === "logentry") { sessionLog.push(d.entry); renderSessionLog(); }
      else if (d.t === "matchover") { if (active()) openMatchSheet(); }
      else if (d.t === "locked") { leftIntentionally = true; ctx.toast("Lobby is locked", "error"); leave(); setStatus("Lobby is locked"); }
      else if (d.t === "config") { if (d.config) { filterSummary = d.config.filterSummary || filterSummary; } renderFilterSummary(); }
      else if (d.t === "bonus") { applyBonus(d); }
      else if (d.t === "bpart") { applyBonusPart(d); }
      else if (d.t === "bcancel") { applyBonusCancel(); }
      // A promoted host cancelled the question that was mid-read when the old
      // host vanished — reset the question area (scores and log are kept).
      // render only when visible — renderRoom borrows the filters panel and
      // must never steal it from a practice screen in the foreground.
      // a bought room: not let in (its password / members only / taken off the list)
      else if (d.t === "denied") { onDenied(d); }
      else if (d.t === "kicked") { leftIntentionally = true; onDenied({ need: "member", kicked: true, text: d.text || "The host took you out of this room." }); }
      else if (d.t === "roominfo") { roomInfo = d; renderRoomInfo(); }
      else if (d.t === "roomop") {
        // a change shown ahead of the server (op below) is taken back when it says no
        if (!d.ok && roomOpUndo) { roomInfo = roomOpUndo; }
        roomOpUndo = null;
        roomOpErr = d.ok ? "" : (d.error || "That didn't work."); renderRoomInfo();
      }
      // the owner / an admin reset the room: a fresh game (seats stay, at 0)
      else if (d.t === "roomreset") { stopClientRead(); stopAutoSub(); current = null; ended = false; pendingBuzzer = null; bonusView = null; paused = false; sessionLog = []; logCollapsed = {}; chatHist = []; qCount = 0; match = null; if (active()) render(); }
      else if (d.t === "qreset") { stopClientRead(); stopAutoSub(); current = null; ended = false; pendingBuzzer = null; bonusView = null; paused = false; if (active()) render(); }
    }

    // ── local actions (sent to host or handled if host) ──
    function requestBuzz() {
      if (!current || ended) return;
      if (players[myId] && players[myId].spec) { ctx.toast("You're spectating \u2014 no buzzing", "error"); return; }
      if (settings.tournament && !(players[myId] && players[myId].team)) { setStatus("Join a team to play"); return; }
      ctx.playSound("buzz");
      if (isHost) hostHandleBuzz(myId); else toHost({ t: "buzz", idx: revealIdx });
    }
    function requestPause() { if (isHost) hostTogglePause(myId); else toHost({ t: "pause" }); }
    function submitAnswer(text) { if (isHost) hostHandleAnswer(myId, text); else toHost({ t: "answer", text: text }); }
    function changeName(name) { myName = name; try { ctx.setSetting("name", name); } catch (e) {} if (isHost) { var old = players[myId].name; players[myId].name = name; sysChat(old + " is now " + name); pushState(); } else toHost({ t: "setName", name: name }); }
    function changeTeam(team) { if (isHost) { players[myId].team = team; pushState(); } else toHost({ t: "setTeam", team: team }); }
    function changeSetting(key, val) { settings[key] = val; if (isHost) { sysChat(myName + " " + describeSetting(key, val)); pushState(); } else toHost({ t: "setSetting", key: key, val: val }); renderSettings(); }
    function teamOf(id) { var p = players[id]; return (p && p.team) || ""; }
    function sendChat(text) {
      if (!text) return;
      if (chatScope === "team") {
        var tm = teamOf(myId);
        if (!tm) { chatScope = "all"; syncChatScope(); ctx.toast("Set a team first to use team chat", "error"); return false; }
        if (isHost) relayTeamChat(myId, myName, text);
        else toHost({ t: "chat", text: text, chan: "team" });
      } else {
        if (isHost) relayChat(myName, text);
        else toHost({ t: "chat", text: text });
      }
    }
    function syncChatScope() {
      if (chatScope === "team" && !teamOf(myId)) chatScope = "all";   // team was cleared
      var cs = body && body.querySelector("#mp-chat-scope");
      var ci = body && body.querySelector("#mp-chat-input");
      if (cs) { cs.textContent = chatScope === "team" ? "Team" : "All"; cs.classList.toggle("mp-scope-team", chatScope === "team"); cs.disabled = chatScope === "all" && !teamOf(myId); cs.title = !cs.disabled ? "Switch between chatting with everyone and only your team" : (players[myId] && players[myId].spec) ? "Spectators can't use team chat" : "Set a team first to use team chat"; }
      if (ci) ci.placeholder = chatScope === "team" ? "Message your team…" : "Message everyone…";
    }

    // ── chat (host relays so every message appears exactly once) ──
    function relayChat(name, text) { var m = { t: "chat", name: name, text: text }; broadcast(m); addChat(name, text); }
    // Team chat: the host sends the message ONLY to that team's members (and
    // shows it itself when it's on the team) — nobody else ever receives it.
    function sendToTeam(team, m) {
      order.forEach(function (x) {
        if (x === myId || !players[x] || players[x].off) return;
        if ((players[x].team || "") !== team) return;
        relayConn(x).send(m);
      });
    }
    function relayTeamChat(fromId, name, text) {
      var team = teamOf(fromId);
      if (!team) { relayChat(name, text); return; }   // no team ⇒ everyone
      var m = { t: "chat", name: name, text: text, chan: "team", team: team };
      sendToTeam(team, m);
      if (teamOf(myId) === team) addChat(name, text, false, true);
    }
    function sysChat(text) { if (!isHost) return; var m = { t: "chat", name: "", text: text, sys: true }; broadcast(m); addChat("", text, true); }
    // Chat history lives in this array, not just the DOM — renderRoom rebuilds
    // the page (host promotion, rejoin, resize) and replays it, so messages
    // survive every re-render.
    var chatHist = [];
    function paintChatMsg(el, c) {
      var r = document.createElement("div");
      r.className = "mp-chat-msg" + (c.s ? " mp-chat-sys" : "") + (c.m ? " mp-chat-team" : "");
      var who = null;
      if (!c.s && c.n && c.n !== ((players[myId] || {}).name || myName)) order.forEach(function (id) { var p = players[id]; if (!who && p && p.name === c.n) who = p; });
      var nameHtml = who ? '<strong class="mp-chat-name" data-user="' + esc(who.handle || "") + '" data-user-name="' + esc(who.name) + '">' + esc(c.n) + ":</strong> " : "<strong>" + esc(c.n) + ":</strong> ";
      r.innerHTML = c.s ? esc(c.x) : (c.m ? '<span class="mp-chat-teamtag">TEAM</span> ' : "") + nameHtml + esc(c.x);
      el.appendChild(r);
    }
    function addChat(name, text, sys, team) {
      chatHist.push({ n: name, x: text, s: !!sys, m: !!team });
      if (chatHist.length > 200) chatHist.shift();
      // A blue dot on the Chat tab when a PLAYER says something (not system lines).
      if (!sys && name && name !== myName && panelTab !== "chat") {
        unreadChat++;
        var dot = body && body.querySelector("#mp-unread"); if (dot) dot.hidden = false;
      }
      var el = body && body.querySelector("#mp-chat"); if (!el) return;
      paintChatMsg(el, chatHist[chatHist.length - 1]);
      el.scrollTop = el.scrollHeight;
    }
    function replayChat() {
      var el = body && body.querySelector("#mp-chat"); if (!el) return;
      el.innerHTML = "";
      chatHist.forEach(function (c) { paintChatMsg(el, c); });
      el.scrollTop = el.scrollHeight;
    }

    // ── top bar (mirrors practice: counter + score pills) ──
    function updateTopBar() {
      if (!page || !page.screenEl) return;
      var titleEl = page.screenEl.querySelector(".top-bar-title");
      if (titleEl) titleEl.textContent = lobby ? ("Multiplayer · Room " + String(lobby).toUpperCase()) : "Multiplayer";
      page.screenEl.classList.toggle("mp-in-room", !!lobby);
      try { if (ctx.host && ctx.host.refreshTopbar) ctx.host.refreshTopbar(); } catch (e) {}
      syncActions();
    }

    // ── rendering ──
    function render() {
      if (!body) return;
      if (!lobby || admitting) renderForm(); else renderRoom();
      updateTopBar();
      try { if (window.qbWebPathSync) window.qbWebPathSync(); } catch (e) {}   // the website's address: /multiplayer/<room>
    }
    function setStatus(m) { var s = body && body.querySelector("#mp-status"); if (s) s.textContent = m; }

    // a player who isn't signed in (website) / hasn't named themselves (app): Player + four digits
    var _guest = null;
    function guestName() { return _guest || (_guest = "Player" + (1000 + Math.floor(Math.random() * 9000))); }
    function renderForm() {
      // The website: an account plays under its display name; a signed-out
      // player is "Player" + four digits (kept for this visit). The app: the name
      // last used here, else the account's display name, else the profile's.
      var st = (ctx.host && ctx.host.getState && ctx.host.getState()) || {};
      var acct = st.account || null, fixedName = !!st.web;
      if (st.web) {
        // never a name saved here before (an old guest one like "unregistered12345" would win)
        myName = acct ? (acct.displayName || acct.handle) : guestName();
        // drawn before the page knew who's signed in: draw it again once it does
        if (!st.accountKnown && ctx.host && ctx.host.whenAccountKnown) ctx.host.whenAccountKnown().then(function () { if (body && !lobby && body.querySelector("#mp-name")) renderForm(); });
      } else {
        var saved = ctx.getSetting("name");
        if (saved && /^unregistered\d*$/i.test(String(saved).trim())) saved = "";   // the old guest names
        myName = saved || (acct && acct.displayName) || st.username || guestName();
      }
      var initial = (String(myName).trim()[0] || "?").toUpperCase();
      var recent = recentRooms();
      // a new room's code, shown in grey in the box: Join/Create with nothing typed opens it
      var suggested = newRoomCode();
      body.innerHTML =
        '<div class="mp-lobby">' +
          '<label class="mp-who"><span class="avatar">' + esc(initial) + '</span><span class="mp-who-txt"><span class="eyebrow">Playing as</span>' +
            '<input id="mp-name" value="' + esc(myName) + '" maxlength="24" autocomplete="off" spellcheck="false" aria-label="Your name"' + (fixedName ? " readonly" : "") + '></span>' +
            (fixedName ? '<span class="qb-info" data-tip="' + (acct ? "Your display name — change it in Account." : "Sign in to play under your own name.") + '">i</span>' : "") + '</label>' +
          '<section class="mp-card mp-join-card">' +
            '<label class="mp-field"><span>Room code <span class="qb-info" data-tip="The grey code is a new room, ready for you: press Join/Create Room to open it, or type another room\u2019s code to join that one. Share the code so others can join.">i</span></span><input id="mp-lobby" class="code-input" maxlength="32" autocomplete="off" spellcheck="false" aria-label="Room code" placeholder="' + esc(suggested) + '"></label>' +
            '<label class="checkbox-row"><input type="checkbox" id="mp-spectate"> Join as spectator</label>' +
            '<button type="button" class="btn btn-lg btn-go" id="mp-join">Join/Create Room</button>' +
          "</section>" +
          '<div class="mp-status" id="mp-status"></div>' +
          '<section class="mp-recent mp-mine" id="mp-my-rooms" hidden><h2 class="eyebrow">Your rooms</h2><div class="list" id="mp-my-list"></div></section>' +
          // Buy a room, sold like its product picture: what you get, the price, the button
          '<section class="mp-shop mp-promo" id="mp-shop" hidden>' +
            '<div class="mp-promo-eyebrow">Rooms of your own</div>' +
            '<h2 class="mp-promo-h">A multiplayer room <span>of your own</span></h2>' +
            '<p class="mp-promo-sub">Your team\u2019s room, kept for good: practice together any time at onlinequiz.net/room/<i>name</i>.</p>' +
            '<ul class="shop-perks mp-promo-perks">' + BUY_PERKS.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>" +
            '<div class="mp-promo-foot"><span class="mp-promo-price"><b id="mp-shop-price">' + priceText() + '</b><small>one payment \u00b7 no subscription</small></span>' +
              '<button type="button" class="btn btn-primary mp-buy-btn" id="mp-buy">Buy a room</button></div>' +
          '</section>' +
          '<section class="mp-recent mp-public" id="mp-public-rooms" hidden><h2 class="eyebrow">Public rooms <span class="qb-info" data-tip="Rooms whose players left them public (Room settings → Public room). Pick one to join.">i</span></h2><div class="list" id="mp-public-list"></div></section>' +
          (recent.length ? '<section class="mp-recent"><h2 class="eyebrow">Recent rooms</h2><div class="list">' + recent.map(function (r) {
            return '<button type="button" class="list-row clickable mp-recent-row" data-code="' + esc(r.code) + '"><b class="mp-rcode">' + esc(String(r.code).toUpperCase()) + '</b><span class="mp-rwho">' + esc(r.players ? r.players + (r.players === 1 ? " player" : " players") : "") + (r.host ? " · you hosted" : "") + '</span><span class="mp-rwhen">' + esc(whenLabel(r.at)) + '</span><span class="mp-rjoin">Rejoin ›</span></button>';
          }).join("") + "</div></section>" : "") +
        "</div>";
      var nameEl = body.querySelector("#mp-name"), codeEl = body.querySelector("#mp-lobby"), joinBtn = body.querySelector("#mp-join");
      // one button: a typed code joins that room (or opens it if nobody is
      // there yet); an empty box makes a new room with a fresh code
      // nothing typed: the room shown in grey
      var goTyped = function () { go(codeEl.value.trim() || suggested); };
      codeEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); goTyped(); } });
      nameEl.addEventListener("change", function () { var v = nameEl.value.trim(); if (v) { myName = v; ctx.setSetting("name", v); var av = body.querySelector(".mp-who .avatar"); if (av) av.textContent = (v[0] || "?").toUpperCase(); } });
      var go = goJoin = function (code) {
        if (door && String(door.code).toLowerCase() !== String(code || "").trim().toLowerCase()) door = null;
        if (admitting) abandonJoin();
        myName = (nameEl.value.trim()) || myName;
        if (!fixedName) ctx.setSetting("name", myName); // remember for next time (the app)
        lobby = String(code || "").trim();
        mySpec = !!body.querySelector("#mp-spectate").checked;
        if (!lobby) { setStatus("Enter a room code."); return; }
        join();
      };
      joinBtn.onclick = goTyped;
      // the game server's public rooms: the preloaded list at once, then refreshed while this form shows
      var paintPublic = function (d) {
        var sec = body && body.querySelector("#mp-public-rooms");
        if (!d || !Array.isArray(d.rooms) || !sec) return;
        sec.hidden = false;
        var list = sec.querySelector("#mp-public-list");
        list.innerHTML = d.rooms.length ? d.rooms.map(function (r) {
          var who = (r.names || []).join(", ") + (r.players > (r.names || []).length ? " +" + (r.players - r.names.length) : "");
          var state = (r.players === 1 ? "1 player" : r.players + " players") + (r.spectators ? " · " + r.spectators + " watching" : "") + (r.questions ? " · Q" + r.questions : " · waiting");
          return '<button type="button" class="list-row clickable mp-recent-row mp-pub-row" data-code="' + esc(r.code) + '"' + (r.summary ? ' title="' + esc(r.summary) + '"' : "") + '><b class="mp-rcode">' + esc(String(r.code).toUpperCase()) + (r.password ? ' <span class="mp-lock" title="Needs its password" aria-label="Needs its password">' + LOCK_SVG + "</span>" : "") + '</b><span class="mp-rwho">' + esc(who) + '</span><span class="mp-rwhen">' + esc(state) + '</span><span class="mp-rjoin">Join ›</span></button>';
        }).join("") : '<p class="mp-pub-empty">No public rooms right now — leave the code empty and press Join/Create Room to start one.</p>';
        list.querySelectorAll(".mp-pub-row").forEach(function (b) { b.onclick = function () { go(b.dataset.code); }; });
      };
      var loadPublic = function () {
        var sec = body && body.querySelector("#mp-public-rooms");
        if (!sec) { clearInterval(pubTimer); pubTimer = null; return; }
        prePublic().then(paintPublic);
      };
      if (pre.pub) paintPublic(pre.pub);
      clearInterval(pubTimer); pubTimer = setInterval(loadPublic, 5000); loadPublic();
      loadShop(body);
      if (admitting && lobby) codeEl.value = lobby;
      if (door) showDoor();
      else if (admitting) {
        var stj = body.querySelector("#mp-status");
        if (stj) { stj.innerHTML = '<span class="mp-joining">Joining <b>' + esc(String(lobby).toUpperCase()) + '</b>\u2026</span> <button type="button" class="btn btn-sm btn-ghost" id="mp-join-cancel">Cancel</button>'; stj.querySelector("#mp-join-cancel").onclick = function () { abandonJoin(); render(); }; }
      }
      try { if (ctx.host && ctx.host.tip) ctx.host.tip(body.querySelector(".mp-lobby"), "mp-lobby"); } catch (e) {}
      body.querySelectorAll(".mp-recent-row").forEach(function (r) { r.onclick = function () { go(r.dataset.code); }; });
    }
    // ── the shop: Buy a room / Your rooms ──
    var LOCK_SVG = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
    var shopInfo = null;
    function loadShop(root) {
      var api = hostApi(); if (!api) return;
      var paint = function () {
        if (!body || !root || !body.contains(root)) return;
        var sh = root.querySelector("#mp-shop");
        if (sh) { sh.hidden = !(shopInfo && shopInfo.on); var b = sh.querySelector("#mp-buy"); if (b) b.onclick = function () { openBuy(""); }; var pr = sh.querySelector("#mp-shop-price"); if (pr) pr.textContent = priceText(); }
      };
      var paintMine = function (d) {
        var sec = root.querySelector("#mp-my-rooms");
        if (!sec || !d || !Array.isArray(d.rooms) || !d.rooms.length || !body || !body.contains(sec)) return;
        sec.hidden = false;
        sec.querySelector("#mp-my-list").innerHTML = d.rooms.map(function (r) {
          var how = r.access === "password" ? "Password" : r.access === "anyone" ? "Open" : "Members only";
          return '<button type="button" class="list-row clickable mp-recent-row mp-mine-row" data-code="' + esc(r.name) + '"><b class="mp-rcode">' + esc(String(r.name).toUpperCase()) + '</b><span class="mp-rwho"><span class="badge">' + esc(ROLE_LABEL[r.role] || r.role) + "</span> " + esc(how) + '</span><span class="mp-rwhen">' + esc(r.players ? (r.players === 1 ? "1 here" : r.players + " here") : "") + '</span><span class="mp-rjoin">Join ›</span></button>';
        }).join("");
        sec.querySelectorAll(".mp-mine-row").forEach(function (b) { b.onclick = function () { if (goJoin) goJoin(b.dataset.code); }; });
      };
      // what the preload already has paints at once; the fresh copy follows
      if (shopInfo) paint();
      if (pre.mine && pre.mineFor === acctKey()) paintMine(pre.mine);
      preShop().then(function () { paint(); if (pre.mine && pre.mineFor === acctKey()) paintMine(pre.mine); });
    }
    // ── preloading: the lobby's lists, the shop and a room ticket are fetched a moment after the app
    //    starts (and again once it knows who's signed in), so Multiplayer opens complete ──
    var pre = { pub: null, mine: null, mineFor: "" };
    function acctKey() { var a = acctOf(); return a ? String(a.handle || a.id || "me") : ""; }
    function prePublic() {
      var base = gameServerUrl();
      if (!base || base === "off") return Promise.resolve(null);
      return fetch(base.replace(/\/$/, "") + "/lobby/_rooms", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && Array.isArray(d.rooms)) pre.pub = d; return pre.pub; }).catch(function () { return pre.pub; });
    }
    function preShop() {
      var api = hostApi(); if (!api) return Promise.resolve();
      var who = acctKey();
      return Promise.all([
        Promise.resolve(api.get("/api/shop/info")).then(function (d) { shopInfo = d && !d.error ? d : { on: false }; }).catch(function () {}),
        who ? Promise.resolve(api.get("/api/shop/rooms")).then(function (d) { if (d && Array.isArray(d.rooms)) { pre.mine = d; pre.mineFor = who; } }).catch(function () {}) : null,
      ]);
    }
    function preloadLobby() { prePublic(); preShop(); if (acctOf()) getTicket(); }
    setTimeout(preloadLobby, 1200);
    if (ctx.host && ctx.host.whenAccountKnown) ctx.host.whenAccountKnown().then(function () { if (acctOf()) { preShop(); getTicket(); } }).catch(function () {});
    // "Questions? support@…" — a mail link on the website; plain (selectable) text in the app
    function supportLine() {
      var s = (shopInfo && shopInfo.support) || "support@onlinequiz.net";
      var web = !window.qbreader && window.QB_WEB;
      return '<br>Questions? ' + (web ? '<a href="mailto:' + esc(s) + '">' + esc(s) + "</a>" : '<span class="shop-mail">' + esc(s) + "</span>");
    }
    // (markup: fixed text with the lead words in bold, as on the product picture)
    var BUY_PERKS = ["<b>Never resets</b> by itself: scores, settings and chat stay", "<b>Members</b> you add by username always get in", "A <b>password</b> for everyone else, or open it to anyone", "<b>Admins</b> you choose, and a Reset button"];
    function priceText() { var c = shopInfo && shopInfo.room && shopInfo.room.price ? shopInfo.room.price : 499; return "$" + (c / 100).toFixed(2); }
    function shopDialog(inner) {
      var old = document.getElementById("mp-buy-dlg"); if (old) old.remove();
      var el = document.createElement("div");
      el.id = "mp-buy-dlg"; el.className = "qb-overlay confirm-overlay shop-overlay";
      el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Buy a room");
      el.innerHTML = '<div class="confirm-box shop-box">' + inner + "</div>";
      var close = function () { clearInterval(el._poll); if (window.QB && window.QB._host && window.QB._host.animateRemove) window.QB._host.animateRemove(el); else el.remove(); };
      el._close = close;
      el.addEventListener("click", function (e) { if (e.target === el) close(); });
      el.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); } });
      document.body.appendChild(el);
      return el;
    }
    var shopHead = function (title, sub) {
      return '<div class="shop-head"><span class="shop-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></span><div><div class="confirm-title">' + title + '</div><div class="shop-sub">' + sub + "</div></div></div>";
    };
    function openBuy(prefill) {
      if (!acctOf()) {
        if (ctx.host && ctx.host.openAccount) ctx.host.openAccount("signin", { reason: "Sign in to buy a room — it's kept with your account." });
        return;
      }
      var el = shopDialog(
        shopHead("Buy a room", '<b class="shop-price">' + priceText() + '</b> USD · one payment, no subscription') +
        // your room as it'll look, with the name you type
        '<div class="shop-preview" aria-hidden="true"><div class="shop-pv-bar"><i></i><i></i><i></i><span>Multiplayer \u00b7 Room</span></div>' +
          '<div class="shop-pv-body"><b class="shop-pv-code" id="shop-pv-code">YOUR-ROOM</b><span class="badge shop-pv-badge">Your room</span></div></div>' +
        '<form id="shop-form">' +
          '<label class="mp-field"><span>Room name</span><input id="shop-name" class="code-input" maxlength="24" autocomplete="off" spellcheck="false" placeholder="e.g. lincoln-hs" aria-describedby="shop-check"></label>' +
          '<div class="shop-check" id="shop-check" aria-live="polite">3–24 letters, numbers and dashes. People join with it, or at <span class="shop-url">onlinequiz.net/room/<b id="shop-prev">…</b></span></div>' +
          '<ul class="shop-perks">' + BUY_PERKS.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>" +
          '<div class="confirm-actions"><button type="button" class="btn btn-ghost" id="shop-no">Cancel</button><button type="submit" class="btn btn-primary" id="shop-pay" disabled>Continue to payment</button></div>' +
          '<div class="shop-fine">You pay on ' + (shopInfo && shopInfo.provider === "lemon" ? "Lemon Squeezy" : "Stripe") + '’s secure page — your card never reaches OnlineQuiz.' + supportLine() + '</div>' +
        "</form>");
      var inp = el.querySelector("#shop-name"), chk = el.querySelector("#shop-check"), pay = el.querySelector("#shop-pay"), prev = el.querySelector("#shop-prev");
      var gen = 0, okName = "";
      var check = function () {
        var v = inp.value.trim().toLowerCase();
        if (inp.value !== v) inp.value = v;
        okName = ""; pay.disabled = true;
        if (prev) prev.textContent = v || "…";
        var pv = el.querySelector("#shop-pv-code"); if (pv) pv.textContent = (v || "your-room").toUpperCase();
        if (!v) { chk.className = "shop-check"; return; }
        var my = ++gen;
        chk.className = "shop-check busy"; chk.textContent = "Checking…";
        clearTimeout(check._t);
        check._t = setTimeout(function () {
          Promise.resolve(hostApi().get("/api/shop/room-available?name=" + encodeURIComponent(v))).then(function (r) {
            if (my !== gen) return;
            if (r && r.ok) { okName = v; pay.disabled = false; chk.className = "shop-check ok"; chk.innerHTML = "<b>" + esc(v.toUpperCase()) + "</b> is yours to take — onlinequiz.net/room/" + esc(v); }
            else { chk.className = "shop-check bad"; chk.textContent = (r && r.error) || "Couldn't check that name."; }
          }).catch(function () { if (my === gen) { chk.className = "shop-check bad"; chk.textContent = "Couldn't check that name — try again."; } });
        }, 300);
      };
      inp.addEventListener("input", check);
      el.querySelector("#shop-no").onclick = el._close;
      el.querySelector("#shop-form").onsubmit = function (e) {
        e.preventDefault();
        if (!okName) return;
        pay.disabled = true; pay.textContent = "Opening payment…";
        Promise.resolve(hostApi().post("/api/shop/checkout", { name: okName })).then(function (r) {
          if (!r || r.error || !r.url) { pay.disabled = false; pay.textContent = "Continue to payment"; chk.className = "shop-check bad"; chk.textContent = (r && r.error) || "Couldn't start the payment — try again."; return; }
          // the website goes to Stripe's page (and comes back to /shop/done); the app opens it in
          // the browser and waits here for the payment to land
          if (!window.qbreader && window.QB_WEB) { location.href = r.url; return; }
          if (ctx.host && ctx.host.openUrl) ctx.host.openUrl(r.url);
          watchOrder(r.order, el, okName);
        }).catch(function () { pay.disabled = false; pay.textContent = "Continue to payment"; chk.className = "shop-check bad"; chk.textContent = "Couldn't start the payment — try again."; });
      };
      if (prefill) { inp.value = prefill; check(); }
      setTimeout(function () { inp.focus(); }, 30);
    }
    // an order's progress: waiting for the payment → the room is ready (Join it)
    function watchOrder(id, el, name) {
      el = el || shopDialog("");
      var box = el.querySelector(".shop-box");
      var paint = function (o) {
        var st = o && o.status;
        if (st === "fulfilled") {
          clearInterval(el._poll);
          box.innerHTML = shopHead("Your room is ready", "<b>" + esc(String(o.item).toUpperCase()) + "</b> is yours — onlinequiz.net/room/" + esc(o.item)) +
            '<ul class="shop-perks shop-next"><li>Set a password or add members in the room’s <b>Room</b> tab</li><li>Share its name (or link) with your team</li></ul>' +
            '<div class="confirm-actions"><button type="button" class="btn btn-ghost" id="shop-close">Close</button><button type="button" class="btn btn-primary" id="shop-go">Go to my room</button></div>';
          box.querySelector("#shop-close").onclick = el._close;
          box.querySelector("#shop-go").onclick = function () { el._close(); if (window.QB && window.QB.mpJoin) window.QB.mpJoin(o.item); };
          return;
        }
        var msg = st === "paid" ? "Payment received — setting up your room…" : st === "expired" || st === "failed" || st === "replaced" ? "That payment didn’t go through. Nothing was charged." : "Waiting for your payment" + (!window.QB_WEB ? " — finish it in your browser." : "…");
        box.innerHTML = shopHead(st === "expired" || st === "failed" || st === "replaced" ? "No payment" : "Almost there", esc(name ? String(name).toUpperCase() : (o && o.item ? String(o.item).toUpperCase() : ""))) +
          '<div class="shop-wait"><span class="shop-spin" aria-hidden="true"></span><span>' + esc(msg) + "</span></div>" +
          '<div class="confirm-actions"><button type="button" class="btn btn-ghost" id="shop-close">Close</button></div>' +
          (st === "expired" || st === "failed" || st === "replaced" ? (supportLine() ? '<div class="shop-fine">' + supportLine().slice(4) + "</div>" : "") : "");
        box.querySelector("#shop-close").onclick = el._close;
        if (st === "expired" || st === "failed" || st === "replaced") clearInterval(el._poll);
      };
      // the payment page sent someone back here without this account signed in (bought in the app,
      // or another browser): their room is safe — say how to see it
      var notMine = function () {
        clearInterval(el._poll);
        box.innerHTML = shopHead("Payment received", "Your room is kept with the account you bought it with") +
          '<ul class="shop-perks shop-next"><li>Bought in the app? Go back to it — your room is under <b>Your rooms</b></li><li>Or sign in here with that account to open it</li></ul>' +
          '<div class="confirm-actions"><button type="button" class="btn btn-ghost" id="shop-close">Close</button><button type="button" class="btn btn-primary" data-acct="signin">Sign in</button></div>' +
          (supportLine() ? '<div class="shop-fine">' + supportLine().slice(4) + "</div>" : "");
        box.querySelector("#shop-close").onclick = el._close;
      };
      paint(null);
      var tick = function () {
        Promise.resolve(hostApi().get("/api/shop/order?id=" + encodeURIComponent(id))).then(function (r) {
          if (r && r.order) paint(r.order);
          else if (r && (r.authRequired || /sign in|no such order/i.test(r.error || ""))) notMine();
        }).catch(function () {});
      };
      clearInterval(el._poll); el._poll = setInterval(tick, 3000); tick();
    }
    window.QB.mpBuy = function (name) { window.QB.showPage("multiplayer::lobby"); setTimeout(function () { if (!lobby) openBuy(name || ""); }, 300); };
    window.QB.mpOrder = function (id) { window.QB.showPage("multiplayer::lobby"); setTimeout(function () { watchOrder(id, null, ""); }, 200); };

    // Room codes: four characters, no look-alikes (0/O, 1/I/L).
    function newRoomCode() {
      var A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", out = "";
      for (var i = 0; i < 4; i++) out += A[Math.floor(Math.random() * A.length)];
      return out;
    }
    function recentRooms() { try { var r = ctx.storage.get("recent"); return Array.isArray(r) ? r.slice(0, 6) : []; } catch (e) { return []; } }
    function rememberRoom() {
      if (!lobby) return;
      try {
        var list = recentRooms().filter(function (r) { return String(r.code).toLowerCase() !== lobby.toLowerCase(); });
        list.unshift({ code: lobby, at: Date.now(), players: order.filter(function (id) { return players[id] && !players[id].spec; }).length || 1, host: !!isHost });
        ctx.storage.set("recent", list.slice(0, 6));
      } catch (e) {}
    }
    function whenLabel(at) {
      if (!at) return "";
      var d = new Date(at), now = new Date();
      var days = Math.floor((new Date(now.getFullYear(), now.getMonth(), now.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
      if (days <= 0) return "Today";
      if (days === 1) return "Yesterday";
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }

    // MP-specific controls injected into the (borrowed) filter panel — kept to
    // just TWO sections (Lobby + Game) to avoid heading clutter.
    function lobbySectionHtml() {
      // Lobby info + your name/team in one section.
      return '<div class="filter-section mp-injected">' +
        '<div class="filter-label">Room ' + esc(String(lobby).toUpperCase()) + (isHost ? ' <span class="badge rh-host">host</span>' : "") + "</div>" +
        '<label class="mode-field"><span>Your name</span><input id="mp-myname" class="mode-input" autocomplete="off"></label>' +
        (mySpec ? '<div class="text-muted" style="font-size:11px">Spectating</div>'
                : '<label class="mode-field"><span>Team</span><input id="mp-myteam" class="mode-input" placeholder="(none)" autocomplete="off"></label>') +
        '<div class="text-muted" id="mp-status" style="font-size:11px;min-height:14px;margin-top:4px"></div>' +
        '<div class="text-muted" id="mp-filter-summary" style="font-size:11px;margin-top:2px"></div>' +
        "</div>";
    }
    function controlsSectionsHtml() {
      // One "GAME" section. The answer timer + rebuzz toggle are editable by
      // EVERY player and kept in sync (clients send setSetting to the host, which
      // re-broadcasts state). Reading the next question is open to everyone too:
      // the host honours reqNext from any non-spectator.
      var tour = !!settings.tournament;
      return '<div class="filter-section mp-injected"><div class="filter-label">Game rules</div>' +
        // tournament: two teams play one packet with its bonuses (game-server rooms keep the scoresheet)
        (serverMode ? '<span class="checkbox-row-wrap"><label class="checkbox-row"><input type="checkbox" id="mp-tourney"' + (tour ? " checked" : "") + '> Tournament</label><span class="qb-info" data-tip="Two teams play one packet in order — pick a set and one packet in Setup → Mode, and join teams in Players. Each correct tossup earns the packet\'s bonus for that team. 15 / 10 / −5; a neg locks the team out; every tossup plays out. The scoresheet is in the side panel.">i</span></span>' : "") +
        '<div class="slider-group"><span style="font-size:11px;min-width:78px" title="Time to type an answer after buzzing">Answer time</span><input type="range" id="mp-ans" min="3" max="30" step="1" value="' + (settings.answerSeconds) + '"><span class="slider-value" id="mp-ans-val">' + (settings.answerSeconds) + "s</span></div>" +
        '<div class="slider-group" style="margin-top:6px"><span style="font-size:11px;min-width:78px" title="Time to buzz once the question finishes reading">Buzz window</span><input type="range" id="mp-bwin" min="3" max="30" step="1" value="' + (settings.buzzWindow || 10) + '"><span class="slider-value" id="mp-bwin-val">' + (settings.buzzWindow || 10) + "s</span></div>" +
        '<label class="checkbox-row"><input type="checkbox" id="mp-rebuzz" ' + (settings.rebuzz ? "checked" : "") + (tour ? " disabled" : "") + "> Allow rebuzzes</label>" +
        '<label class="checkbox-row" title="After every correct tossup, the winner answers a random bonus"><input type="checkbox" id="mp-bonusevery" ' + (settings.bonusEvery ? "checked" : "") + (tour ? " disabled" : "") + "> Bonus after every question</label>" +
        '<label class="checkbox-row"><input type="checkbox" id="mp-stoppow"' + (settings.stopPower ? " checked" : "") + "> Stop on power</label>" +
        '<label class="checkbox-row"><input type="checkbox" id="mp-skips"' + (settings.allowSkips !== false ? " checked" : "") + (tour ? " disabled" : "") + "> Allow skips</label>" +
        // public rooms are listed in everyone's lobby (game server rooms only — the relay has no list)
        (serverMode ? '<span class="checkbox-row-wrap"><label class="checkbox-row"><input type="checkbox" id="mp-public"' + (settings.public !== false ? " checked" : "") + '> Public room</label><span class="qb-info" data-tip="Listed under Public rooms for everyone who opens Multiplayer, so anyone can join. Off: only people with the code or link.">i</span></span>' : "") +
        '<label class="checkbox-row" title="When on, new players cannot join this lobby"><input type="checkbox" id="mp-lock"' + (settings.locked ? " checked" : "") + "> Lock room</label>" +
        "</div>";
    }

    function renderRoom() {
      // Always return any borrowed panel before re-rendering (innerHTML wipes it).
      returnPanel();
      body.innerHTML =
        '<div class="mp-room">' +
          '<div class="room-head">' +
            '<button type="button" class="btn btn-ghost mp-leave-btn" id="mp-leave"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>Leave</button>' +
            '<span class="rh-lbl">Room</span><b class="rh-code" id="mp-code">' + esc(String(lobby).toUpperCase()) + "</b>" +
            '<button type="button" class="btn btn-ghost btn-icon btn-sm" id="mp-copy" title="Copy room code" aria-label="Copy room code"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg></button>' +
            '<span class="badge rh-host" id="mp-hostbadge"' + (amHost() && !roomInfo ? "" : " hidden") + ">You host</span>" +
            '<span class="badge rh-own" id="mp-ownbadge" hidden></span>' +
            (mySpec ? '<span class="badge rh-spec">Spectating</span>' : "") +
            '<span class="spacer"></span>' +
            '<span class="rh-q num" id="mp-qcount"></span>' +
            '<button type="button" class="btn" id="mp-roomset"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>Room settings</button>' +
          "</div>" +
          '<div class="practice-layout mp-layout">' +
            '<main class="question-area">' +
              '<div class="question-placeholder" id="mp-placeholder">' +
              "</div>" +
              '<div class="question-content hidden" id="mp-content">' +
                '<div class="question-meta" id="mp-meta"></div>' +
                '<div class="question-text room-q" id="mp-qtext"></div>' +
              "</div>" +
              '<div class="buzz-area hidden" id="mp-buzz"></div>' +
              '<div class="mp-actions" id="mp-actions">' +
                '<button type="button" class="btn btn-go mp-buzz-btn" id="mp-buzz-btn" hidden>Buzz<kbd>Space</kbd></button>' +
                '<button type="button" class="btn btn-primary mp-next-btn" id="mp-next-btn" hidden>Next<span aria-hidden="true">→</span></button>' +
                '<button type="button" class="btn mp-pause-btn" id="mp-pause-btn" hidden>Pause</button>' +
              "</div>" +
              '<div class="result-area hidden" id="mp-result"></div>' +
              '<div class="history-panel mp-history" id="mp-history-panel" style="display:none">' +
                '<button class="btn" id="mp-history-open">Session history (<span id="mp-history-count">0</span>)</button>' +
              "</div>" +
            "</main>" +
            '<aside class="mp-panel" aria-label="Room">' +
              '<div class="panel-tabs" role="tablist">' +
                '<button type="button" role="tab" data-mptab="players" aria-selected="' + (panelTab === "players") + '">Players</button>' +
                '<button type="button" role="tab" data-mptab="chat" aria-selected="' + (panelTab === "chat") + '">Chat<span class="unread" id="mp-unread"' + (unreadChat && panelTab !== "chat" ? "" : " hidden") + ' aria-label="New messages"></span></button>' +
                '<button type="button" role="tab" data-mptab="sheet" aria-selected="' + (panelTab === "sheet") + '"' + (settings.tournament ? "" : " hidden") + '>Scoresheet</button>' +
                '<button type="button" role="tab" data-mptab="room" aria-selected="' + (panelTab === "room") + '"' + (roomInfo ? "" : " hidden") + '>Room</button>' +
              "</div>" +
              '<div class="panel-body" data-pane="room"' + (panelTab === "room" ? "" : " hidden") + '><div class="mp-roominfo" id="mp-roominfo"></div></div>' +
              '<div class="panel-body" data-pane="players"' + (panelTab === "players" ? "" : " hidden") + '><div class="mp-scores" id="mp-scores"></div></div>' +
              '<div class="panel-body" data-pane="sheet"' + (panelTab === "sheet" ? "" : " hidden") + '><div class="mp-sheet" id="mp-sheet"></div></div>' +
              '<div class="panel-body panel-chat" data-pane="chat"' + (panelTab === "chat" ? "" : " hidden") + '>' +
                '<div class="mp-chat" id="mp-chat"></div>' +
                '<div class="mp-chatrow">' +
                  '<button class="btn btn-sm btn-ghost mp-chat-scope" id="mp-chat-scope" title="Switch between chatting with everyone and only your team">All</button>' +
                  '<input id="mp-chat-input" class="mode-input" placeholder="Message everyone…" autocomplete="off">' +
                "</div>" +
              "</div>" +
            "</aside>" +
          "</div>" +
        "</div>";

      // Chat is always present in the side panel — wire it once.
      var ci = body.querySelector("#mp-chat-input");
      if (ci) ci.addEventListener("keydown", function (e) { if (e.key === "Enter") { if (sendChat(ci.value.trim()) !== false) ci.value = ""; } });
      var cscope = body.querySelector("#mp-chat-scope");
      if (cscope) cscope.onclick = function () {
        if (chatScope === "all") {
          if (!teamOf(myId)) { setStatus("Set a team first to use team chat."); return; }
          chatScope = "team";
        } else chatScope = "all";
        syncChatScope();
        if (ci) ci.focus();
      };
      syncChatScope();
      replayChat();

      body.querySelectorAll("[data-mptab]").forEach(function (b) { b.onclick = function () { showPanelTab(b.dataset.mptab); }; });
      body.querySelector("#mp-leave").onclick = confirmLeave;
      // the website copies the room's link (onlinequiz.net/multiplayer/<room>); the app, its code
      var webLink = !window.qbreader && window.QB_WEB;
      if (webLink) { var cb = body.querySelector("#mp-copy"); cb.title = "Copy room link"; cb.setAttribute("aria-label", "Copy room link"); }
      body.querySelector("#mp-copy").onclick = function () {
        var text = webLink ? location.origin + "/multiplayer/" + encodeURIComponent(lobby) : String(lobby).toUpperCase();
        if (window.qbCopyWithCheck) window.qbCopyWithCheck(this, text);   // a checkmark shows it worked
        else { try { navigator.clipboard.writeText(text); } catch (e) {} }
      };
      body.querySelector("#mp-roomset").onclick = function () { toggleRoomSettings(); };
      body.querySelector("#mp-buzz-btn").onclick = function () { requestBuzz(); };
      body.querySelector("#mp-next-btn").onclick = function () { requestNext(); };
      body.querySelector("#mp-pause-btn").onclick = function () { requestPause(); };

      var histBtn = body.querySelector("#mp-history-open");
      if (histBtn) histBtn.onclick = openMpHistory;

      // The real practice filter panel becomes this room's settings drawer.
      borrowPanel(body.querySelector(".practice-layout"));

      renderScores(); renderSettings(); renderFilterSummary(); renderRoomInfo();
      if (current) { renderQuestion(); renderBuzzes(); }
      renderSessionLog();
      syncActions();
    }
    var panelTab = "players", unreadChat = 0;

    // ── a bought room: its Room tab (the owner and admins run it from here) ──
    var ACCESS_LABEL = { members: "Members only", password: "Password", anyone: "Anyone" };
    var showPw = false;   // the Room tab's password shown in the clear (a new room: hidden again)
    var ROLE_LABEL = { owner: "Your room", admin: "Admin", member: "Member" };
    function renderRoomInfo() {
      if (!body) return;
      var tab = body.querySelector('[data-mptab="room"]'); if (tab) tab.hidden = !roomInfo;
      var badge = body.querySelector("#mp-ownbadge");
      if (badge) { badge.hidden = !(roomInfo && roomInfo.role); badge.textContent = roomInfo && roomInfo.role ? ROLE_LABEL[roomInfo.role] : ""; }
      if (!roomInfo && panelTab === "room") showPanelTab("players");
      var el = body.querySelector("#mp-roominfo"); if (!el) return;
      if (!roomInfo) { el.innerHTML = ""; return; }
      var R = roomInfo, mgr = R.role === "owner" || R.role === "admin", owner = R.role === "owner";
      var keep = document.activeElement && el.contains(document.activeElement) ? document.activeElement.getAttribute("data-k") : null;
      var people = function (title, list, role, canEdit) {
        list = list || [];
        return '<div class="ri-sec"><div class="ri-lbl">' + title + ' <span class="num">' + list.length + "</span></div>" +
          (list.length ? '<div class="ri-list">' + list.map(function (x) {
            return '<span class="ri-chip"><span data-user="' + esc(x.handle) + '">' + esc(x.handle) + "</span>" + (canEdit ? '<button type="button" class="ri-x" data-remove="' + esc(x.uid) + '" aria-label="Take ' + esc(x.handle) + ' off">×</button>' : "") + "</span>";
          }).join("") + "</div>" : '<div class="ri-empty">' + (role === "admin" ? "No admins yet" : "No members yet") + "</div>") +
          (canEdit ? '<form class="ri-row" data-add="' + role + '"><input class="mode-input" data-k="add-' + role + '" placeholder="Their username" maxlength="20" autocomplete="off" spellcheck="false" aria-label="Username to add as ' + role + '"><button class="btn btn-sm" type="submit">Add</button></form>' : "") + "</div>";
      };
      el.innerHTML =
        '<div class="ri-head"><b class="ri-name">' + esc(String(R.name).toUpperCase()) + "</b>" + (R.role ? '<span class="badge">' + esc(ROLE_LABEL[R.role]) + "</span>" : "") + "</div>" +
        '<div class="ri-line">Owner <b data-user="' + esc(R.owner) + '">' + esc(R.owner || "—") + "</b></div>" +
        // the Database's segmented control (one look for every either/or); what each means is in the ⓘ
        '<div class="ri-sec"><div class="ri-lbl">Who can come in <span class="qb-info" data-tip="Members only: the owner, admins and members. Password: members get straight in, anyone else types the password. Anyone: anyone with the room\u2019s name.">i</span></div>' +
          (mgr ? '<div class="seg ri-access" role="group" aria-label="Who can come in">' + ["members", "password", "anyone"].map(function (a) {
            return '<button type="button" data-access="' + a + '" aria-pressed="' + (R.access === a) + '">' + ACCESS_LABEL[a] + "</button>";
          }).join("") + "</div>" : '<div class="ri-line">' + esc(ACCESS_LABEL[R.access] || "") + "</div>") +
          // the owner and admins can read the password any time (Show), and copy it to share
          (mgr && R.hasPassword ? '<div class="ri-pw"><span class="ri-pw-k">Password</span>' + (R.password != null
            ? '<code class="ri-pw-v' + (showPw ? "" : " hidden-pw") + '">' + esc(showPw ? R.password : "\u2022".repeat(Math.max(6, Math.min(12, R.password.length)))) + "</code>" +
              '<button type="button" class="btn btn-sm btn-ghost" id="ri-pw-show" aria-pressed="' + showPw + '">' + (showPw ? "Hide" : "Show") + '</button><button type="button" class="btn btn-sm btn-ghost" id="ri-pw-copy">Copy</button>'
            : '<span class="ri-note">Set it again below to be able to see it here</span>') + "</div>" : "") +
          (mgr ? '<form class="ri-row" id="ri-pass"><input type="password" class="mode-input" data-k="pass" id="ri-pass-in" placeholder="' + (R.hasPassword ? "New password" : "Set a password") + '" maxlength="64" autocomplete="new-password" aria-label="Room password"><button class="btn btn-sm" type="submit">' + (R.hasPassword ? "Change" : "Set") + "</button>" +
            (R.hasPassword ? '<button type="button" class="btn btn-sm btn-ghost" id="ri-pass-clear">Remove</button>' : "") + "</form>" : "") +
        "</div>" +
        (mgr ? people("Members", R.members, "member", true) + people("Admins", R.admins, "admin", owner) : "") +
        (roomOpErr ? '<div class="ri-err" role="alert">' + esc(roomOpErr) + "</div>" : "") +
        (mgr ? '<div class="ri-sec ri-danger"><button type="button" class="btn btn-sm btn-danger" id="ri-reset">Reset room</button><div class="ri-note">Scores, the question log and chat start over. Members, admins, the password and settings stay.</div></div>' : "");
      // Changes show at once (show(R) edits a copy of the room's info); the game server's
      // answer confirms them, or its "no" puts the old info back with the reason.
      var op = function (o, show) {
        roomOpErr = "";
        if (show) { roomOpUndo = roomInfo; roomInfo = JSON.parse(JSON.stringify(roomInfo)); show(roomInfo); renderRoomInfo(); }
        o.t = "roomop"; toHost(o);
      };
      el.querySelectorAll("[data-access]").forEach(function (b) {
        b.onclick = function () {
          var a = b.dataset.access;
          if (a === R.access) return;
          if (a === "password" && !R.hasPassword) {
            var pi = el.querySelector("#ri-pass-in"), v = pi ? pi.value : "";
            if (!v) { roomOpErr = "Type a password first, then choose Password."; renderRoomInfo(); var p2 = el.querySelector("#ri-pass-in"); if (p2) p2.focus(); return; }
            op({ op: "access", access: "password", password: v }, function (X) { X.access = "password"; X.hasPassword = true; X.password = v; }); return;
          }
          op({ op: "access", access: a }, function (X) { X.access = a; });
        };
      });
      var pf = el.querySelector("#ri-pass");
      if (pf) pf.onsubmit = function (e) { e.preventDefault(); var v = el.querySelector("#ri-pass-in").value; if (!v) return; op({ op: "password", password: v }, function (X) { X.hasPassword = true; X.password = v; }); };
      var pws = el.querySelector("#ri-pw-show");
      if (pws) pws.onclick = function () { showPw = !showPw; renderRoomInfo(); };
      var pwc = el.querySelector("#ri-pw-copy");
      if (pwc) pwc.onclick = function () { if (window.qbCopyWithCheck) window.qbCopyWithCheck(pwc, R.password || ""); else { try { navigator.clipboard.writeText(R.password || ""); } catch (e) {} } };
      var pc = el.querySelector("#ri-pass-clear");
      if (pc) pc.onclick = function () { op({ op: "password", password: null }, function (X) { X.hasPassword = false; X.password = null; if (X.access === "password") X.access = "members"; }); };
      el.querySelectorAll("form[data-add]").forEach(function (f) {
        f.onsubmit = function (e) { e.preventDefault(); var v = f.querySelector("input").value.trim(); if (!v) return; op({ op: "addRole", role: f.dataset.add, handle: v }); };
      });
      el.querySelectorAll("[data-remove]").forEach(function (b) { b.onclick = function () { var uid = b.dataset.remove; op({ op: "removeRole", uid: uid }, function (X) { var off = function (l) { return (l || []).filter(function (x) { return String(x.uid) !== uid; }); }; X.members = off(X.members); X.admins = off(X.admins); }); }; });
      var rs = el.querySelector("#ri-reset");
      if (rs) rs.onclick = function () {
        var go2 = function () { op({ op: "reset" }); };
        if (ctx.host && ctx.host.confirm) ctx.host.confirm("Reset " + String(R.name).toUpperCase() + "?", go2, { yes: "Reset", danger: true, detail: "Everyone's score goes back to 0, and the question log and chat are cleared." });
        else go2();
      };
      if (keep) { var k = el.querySelector('[data-k="' + keep + '"]'); if (k) k.focus(); }
    }
    // not let into a bought room: back to the form, which says what it takes
    function onDenied(d) {
      var code = lobby;
      if (d.need === "password" && !d.kicked && admitting && ws) {
        // the room needs its password: ask here, and send it on this same connection
        door = { code: code, need: "password", wrong: !!d.wrong, signedIn: !!d.signedIn, live: true };
        render();
        return;
      }
      admitting = false;
      leave();
      door = { code: code, need: d.need, wrong: !!d.wrong, signedIn: !!d.signedIn, kicked: !!d.kicked, text: d.text || "" };
      showDoor();
    }
    function showDoor() {
      var st = body && body.querySelector("#mp-status");
      if (!st || !door) return;
      var D = door, name = esc(String(D.code).toUpperCase());
      if (D.need === "password") {
        st.innerHTML = '<form class="mp-door" id="mp-door"><div class="mp-door-t"><b>' + name + "</b> needs its password</div>" +
          (D.wrong ? '<div class="mp-door-err" role="alert">That password isn\u2019t right.</div>' : "") +
          '<div class="mp-door-row"><input type="password" id="mp-door-pass" class="mode-input" maxlength="64" autocomplete="off" placeholder="Room password" aria-label="Room password"><button type="submit" class="btn btn-primary">Join</button>' + (D.live ? '<button type="button" class="btn btn-ghost" id="mp-door-cancel">Cancel</button>' : "") + "</div>" +
          (D.signedIn ? "" : '<div class="mp-door-note">A member? <button type="button" class="btn btn-sm btn-ghost" data-acct="signin">Sign in</button> and you won\u2019t need it.</div>') + "</form>";
        var f = st.querySelector("#mp-door"), pi = st.querySelector("#mp-door-pass");
        var dc = st.querySelector("#mp-door-cancel"); if (dc) dc.onclick = function () { door = null; abandonJoin(); render(); };
        setTimeout(function () { if (pi) pi.focus(); }, 30);
        f.onsubmit = function (e) {
          e.preventDefault();
          if (!pi.value) { pi.focus(); return; }
          myPassword = pi.value; myPasswordFor = String(D.code).toLowerCase();
          if (D.live && admitting && ws) {
            // still connected: the password goes in a new hello; the room shows when it lets us in
            var sb = f.querySelector("button[type=submit]"); if (sb) { sb.disabled = true; sb.textContent = "Checking\u2026"; }
            var er = f.querySelector(".mp-door-err"); if (er) er.remove();
            toHost(helloMsg());
            return;
          }
          door = null;
          if (goJoin) goJoin(D.code);
        };
      } else {
        st.innerHTML = '<div class="mp-door">' + (D.kicked ? esc(D.text || "You were taken off this room.") :
          "<b>" + name + "</b> is for its members. Ask its owner or an admin to add your username" + (D.signedIn ? "." : " — and sign in first.")) +
          (D.signedIn ? "" : ' <button type="button" class="btn btn-sm" data-acct="signin">Sign in</button>') + "</div>";
      }
    }

    // ── tournament: the scoresheet (the game server keeps it and sends it with the state) ──
    var match = null;
    function matchTeams() {
      var seen = [];
      var add = function (t) { if (t && seen.indexOf(t) < 0) seen.push(t); };
      order.forEach(function (id) { var p = players[id]; if (p && !p.spec) add(p.team); });
      (match ? match.rows : []).forEach(function (r) { r.buzzes.forEach(function (b) { add(b.team); }); if (r.bonus) add(r.bonus.team); });
      return seen;
    }
    // per team: points, tossup points, bonuses heard and their points; per row: the running totals
    function matchTally() {
      var teams = matchTeams(), t = {}, run = [];
      teams.forEach(function (tm) { t[tm] = { pts: 0, tu: 0, bHeard: 0, bPts: 0 }; });
      (match ? match.rows : []).forEach(function (r) {
        r.buzzes.forEach(function (b) { var x = t[b.team] || (t[b.team] = { pts: 0, tu: 0, bHeard: 0, bPts: 0 }); x.pts += b.pts; x.tu += b.pts; });
        if (r.bonus) { var y = t[r.bonus.team] || (t[r.bonus.team] = { pts: 0, tu: 0, bHeard: 0, bPts: 0 }); y.pts += r.bonus.pts; if (r.bonus.done) { y.bHeard++; y.bPts += r.bonus.pts; } }
        var snap = {}; Object.keys(t).forEach(function (k) { snap[k] = t[k].pts; }); run.push(snap);
      });
      return { teams: teams, t: t, run: run };
    }
    function playerLines() {
      var m = {}, list = [];
      (match ? match.rows : []).forEach(function (r) { r.buzzes.forEach(function (b) {
        var k = b.team + "|" + b.name;
        if (!m[k]) { m[k] = { name: b.name, team: b.team, p: 0, g: 0, n: 0, pts: 0 }; list.push(m[k]); }
        var x = m[k];
        if (b.pts >= 15) x.p++; else if (b.pts > 0) x.g++; else if (b.pts < 0) x.n++;
        x.pts += b.pts;
      }); });
      return list.sort(function (a, b) { return b.pts - a.pts; });
    }
    var signed = function (n) { return (n > 0 ? "+" : "") + n; };
    function renderScoresheet() {
      if (!body) return;
      var tab = body.querySelector('[data-mptab="sheet"]'); if (tab) tab.hidden = !settings.tournament;
      if (!settings.tournament && panelTab === "sheet") showPanelTab("players");
      var el = body.querySelector("#mp-sheet"); if (!el) return;
      if (!settings.tournament) { el.innerHTML = ""; return; }
      var tally = matchTally();
      var head = '<div class="ms-teams">' + (tally.teams.length ? tally.teams.map(function (tm) { return '<div class="ms-team"><b class="num">' + ((tally.t[tm] || {}).pts || 0) + "</b><span>" + esc(tm) + "</span></div>"; }).join("") : '<div class="ms-empty">No teams yet</div>') + "</div>";
      var info = match && match.set ? '<div class="ms-info">' + esc(match.set) + " · Packet " + esc(match.packet) + (match.over ? " · Final" : match.rows.length ? " · Tossup " + match.rows.length + "/" + (match.total || "?") : "") + "</div>" : "";
      var rows = match && match.rows.length ? match.rows.slice().reverse().map(function (r) {
        var chips = r.buzzes.map(function (b) { return '<span class="ms-chip ' + (b.pts > 0 ? "pos" : b.pts < 0 ? "neg" : "") + '">' + esc(b.name) + " " + signed(b.pts) + "</span>"; }).join("");
        if (!chips && r.answer) chips = '<span class="ms-chip dead">Dead</span>';
        var bonus = r.bonus ? '<span class="ms-chip bon">Bonus ' + r.bonus.pts + "</span>" : "";
        return '<div class="ms-row"><span class="ms-n num">' + r.n + '</span><span class="ms-body"><span class="ms-chips">' + chips + bonus + "</span>" + (r.answer ? "<small>" + esc(r.answer) + "</small>" : "") + "</span></div>";
      }).join("") : '<div class="ms-empty">No tossups yet</div>';
      el.innerHTML = head + info + '<div class="ms-rows">' + rows + '</div><button type="button" class="btn btn-sm ms-open" id="mp-sheet-open">Full scoresheet</button>';
      el.querySelector("#mp-sheet-open").onclick = function () { openMatchSheet(); };
    }
    // the whole sheet: every tossup with each team's points and bonus, running totals,
    // player lines and bonus averages; copy as text or save as CSV
    function matchSheetData() {
      var tally = matchTally(), teams = tally.teams, rows = match ? match.rows : [];
      var header = ["Tossup", "Answer"];
      teams.forEach(function (tm) { header.push(tm + " TU", tm + " bonus", tm + " total"); });
      var table = rows.map(function (r, i) {
        var line = [r.n, r.answer || ""];
        teams.forEach(function (tm) {
          var tu = r.buzzes.filter(function (b) { return b.team === tm; }).map(function (b) { return b.name + " " + signed(b.pts); }).join(", ");
          line.push(tu, r.bonus && r.bonus.team === tm ? String(r.bonus.pts) : "", String((tally.run[i] || {})[tm] || 0));
        });
        return line;
      });
      return { tally: tally, teams: teams, header: header, table: table, players: playerLines() };
    }
    function matchSheetText(d) {
      var lines = ["Scoresheet — " + (match && match.set ? match.set + ", Packet " + match.packet : "")];
      lines.push(d.teams.map(function (tm) { return tm + " " + ((d.tally.t[tm] || {}).pts || 0); }).join("  ·  "), "");
      d.table.forEach(function (row) { lines.push(row.join(" | ")); });
      lines.push("", "Players (15 / 10 / −5, tossup points)");
      d.players.forEach(function (x) { lines.push(x.name + " (" + x.team + "): " + x.p + " / " + x.g + " / " + x.n + ", " + x.pts); });
      lines.push("", "Bonuses (heard, points, per bonus)");
      d.teams.forEach(function (tm) { var x = d.tally.t[tm] || {}; lines.push(tm + ": " + (x.bHeard || 0) + ", " + (x.bPts || 0) + ", " + (x.bHeard ? (x.bPts / x.bHeard).toFixed(2) : "—")); });
      return lines.join("\n");
    }
    function matchSheetCsv(d) {
      var q = function (v) { v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
      return [d.header].concat(d.table).map(function (r) { return r.map(q).join(","); }).join("\n") + "\n";
    }
    function openMatchSheet() {
      if (!match) return;
      var old = document.getElementById("mp-matchsheet"); if (old) old.remove();
      var d = matchSheetData();
      var el = document.createElement("div");
      el.id = "mp-matchsheet"; el.className = "qb-overlay confirm-overlay ms-overlay";
      el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", "Scoresheet");
      var teamsHtml = d.teams.map(function (tm) { var x = d.tally.t[tm] || {}; return '<div class="ms-big"><b class="num">' + (x.pts || 0) + "</b><span>" + esc(tm) + "</span><small>" + (x.bHeard ? (x.bPts / x.bHeard).toFixed(1) + " per bonus" : "") + "</small></div>"; }).join("");
      var thead = "<tr><th>#</th><th>Answer</th>" + d.teams.map(function (tm) { return '<th colspan="3">' + esc(tm) + "</th>"; }).join("") + "</tr><tr><th></th><th></th>" + d.teams.map(function () { return "<th>TU</th><th>B</th><th>Total</th>"; }).join("") + "</tr>";
      var tbody = d.table.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td" + (i === 1 ? ' class="ms-ans"' : "") + ">" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") || '<tr><td colspan="' + (2 + d.teams.length * 3) + '">No tossups yet</td></tr>';
      var pl = d.players.map(function (x) { return "<tr><td>" + esc(x.name) + "</td><td>" + esc(x.team) + "</td><td>" + x.p + "</td><td>" + x.g + "</td><td>" + x.n + "</td><td>" + x.pts + "</td></tr>"; }).join("");
      el.innerHTML = '<div class="ms-box" role="document">' +
        '<header class="ms-head"><div><h2>' + (match.over ? "Final" : "Scoresheet") + "</h2><small>" + esc(match.set || "") + (match.packet != null ? " · Packet " + esc(match.packet) : "") + (match.rows.length && !match.over ? " · Tossup " + match.rows.length + "/" + (match.total || "?") : "") + "</small></div>" +
          '<span class="ms-actions"><button type="button" class="btn btn-sm" data-ms="copy">Copy</button><button type="button" class="btn btn-sm" data-ms="csv">CSV</button><button type="button" class="btn btn-ghost btn-icon btn-sm" data-ms="close" aria-label="Close">\u2715</button></span></header>' +
        '<div class="ms-scroll"><div class="ms-bigs">' + teamsHtml + "</div>" +
          '<div class="ms-tablewrap"><table class="ms-table"><thead>' + thead + "</thead><tbody>" + tbody + "</tbody></table></div>" +
          (pl ? '<h3>Players</h3><div class="ms-tablewrap"><table class="ms-table ms-players"><thead><tr><th>Player</th><th>Team</th><th>15</th><th>10</th><th>−5</th><th>Pts</th></tr></thead><tbody>' + pl + "</tbody></table></div>" : "") +
        "</div></div>";
      var close = function () { document.removeEventListener("keydown", onKey, true); var h = window.QB && window.QB._host; if (h && h.animateRemove) h.animateRemove(el); else el.remove(); };
      var onKey = function (ev) { if (ev.key === "Escape" && el.isConnected) { ev.stopPropagation(); ev.preventDefault(); close(); } };
      document.addEventListener("keydown", onKey, true);
      el.addEventListener("click", function (ev) { if (ev.target === el) close(); });
      el.querySelector('[data-ms="close"]').onclick = close;
      el.querySelector('[data-ms="copy"]').onclick = function () { var txt = matchSheetText(d); if (window.qbCopyWithCheck) window.qbCopyWithCheck(this, txt); else try { navigator.clipboard.writeText(txt); } catch (e) {} };
      el.querySelector('[data-ms="csv"]').onclick = function () {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([matchSheetCsv(d)], { type: "text/csv" }));
        a.download = "scoresheet-" + String((match.set || "match") + "-packet-" + (match.packet || "")).replace(/[^A-Za-z0-9-]+/g, "-") + ".csv";
        document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      };
      document.body.appendChild(el);
    }
    function showPanelTab(t) {
      if (t !== "players" && t !== "chat" && !(t === "sheet" && settings.tournament) && !(t === "room" && roomInfo)) t = "players";
      panelTab = t;
      if (t === "chat") unreadChat = 0;
      if (!body) return;
      body.querySelectorAll("[data-mptab]").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.mptab === t)); });
      body.querySelectorAll(".mp-panel [data-pane]").forEach(function (p) { p.hidden = p.dataset.pane !== t; });
      var dot = body.querySelector("#mp-unread"); if (dot) dot.hidden = !(unreadChat && t !== "chat");
      if (t === "chat") { var el = body.querySelector("#mp-chat"); if (el) el.scrollTop = el.scrollHeight; var ci2 = body.querySelector("#mp-chat-input"); if (ci2) ci2.focus(); }
    }
    function toggleRoomSettings(open) {
      var panel = borrowedPanel; if (!panel) return;
      var on = open == null ? !panel.classList.contains("open") : !!open;
      panel.classList.toggle("open", on);
      var rb = body && body.querySelector("#mp-roomset"); if (rb) rb.setAttribute("aria-expanded", String(on));
    }
    // BUZZ while a tossup reads; Next once it is over (or before the first).
    function syncActions() {
      if (!body) return;
      var b = body.querySelector("#mp-buzz-btn"), n = body.querySelector("#mp-next-btn"), p = body.querySelector("#mp-pause-btn");
      var reading = !!current && !ended && !bonusView;
      var answering = !!(body.querySelector("#mp-ans-input") || body.querySelector(".mp-binput"));
      if (b) { b.hidden = !reading || mySpec || answering; b.disabled = !!pendingBuzzer; }
      if (n) n.hidden = mySpec || (reading || (bonusView && !bonusView.done));
      if (p) { p.hidden = !reading || mySpec || answering; p.textContent = paused ? "Resume" : "Pause"; }
      var qc = body.querySelector("#mp-qcount"); if (qc) qc.textContent = qCount ? "Question " + qCount : "";
      var hb = body.querySelector("#mp-hostbadge"); if (hb) hb.hidden = !(amHost() && !roomInfo);   // a bought room shows its role badge instead
    }

    // Wire the MP control sections (lobby/you/timer/next) wherever they live.
    // Mirror a GAME-section checkbox onto the real practice OPTIONS checkbox
    // (which lives in the host's DOM) so app settings + persistence stay true.
    function bindMirror(mpId, realId) {
      var el = body.querySelector("#" + mpId);
      if (!el) return;
      el.addEventListener("change", function () {
        var real = document.getElementById(realId);
        if (real) { real.checked = el.checked; real.dispatchEvent(new Event("change")); }
      });
    }

    function wireControls() {
      var nameInp = body.querySelector("#mp-myname");
      if (nameInp) { nameInp.value = (players[myId] || {}).name || myName; nameInp.addEventListener("change", function () { changeName(nameInp.value.trim() || myName); }); }
      var teamInp = body.querySelector("#mp-myteam");
      if (teamInp) { teamInp.value = (players[myId] || {}).team || ""; teamInp.addEventListener("change", function () { changeTeam(teamInp.value.trim()); }); }
      var an = body.querySelector("#mp-ans");
      if (an) { an.addEventListener("input", function (e) { body.querySelector("#mp-ans-val").textContent = e.target.value + "s"; }); an.addEventListener("change", function (e) { changeSetting("answerSeconds", parseInt(e.target.value) || 10); }); }
      var bw = body.querySelector("#mp-bwin");
      if (bw) { bw.addEventListener("input", function (e) { body.querySelector("#mp-bwin-val").textContent = e.target.value + "s"; }); bw.addEventListener("change", function (e) { changeSetting("buzzWindow", parseInt(e.target.value) || 10); }); }
      var rb = body.querySelector("#mp-rebuzz");
      if (rb) rb.addEventListener("change", function (e) { changeSetting("rebuzz", e.target.checked); });
      var be = body.querySelector("#mp-bonusevery");
      if (be) be.addEventListener("change", function (e) { changeSetting("bonusEvery", e.target.checked); });
      var sp2 = body.querySelector("#mp-stoppow");
      if (sp2) sp2.addEventListener("change", function (e) { changeSetting("stopPower", e.target.checked); });
      var sk2 = body.querySelector("#mp-skips");
      if (sk2) sk2.addEventListener("change", function (e) { changeSetting("allowSkips", e.target.checked); });
      var lk = body.querySelector("#mp-lock");
      if (lk) lk.addEventListener("change", function (e) { changeSetting("locked", e.target.checked); });
      var pub = body.querySelector("#mp-public");
      if (pub) pub.addEventListener("change", function (e) { changeSetting("public", e.target.checked); });
      var tny = body.querySelector("#mp-tourney");
      if (tny) tny.addEventListener("change", function (e) { changeSetting("tournament", e.target.checked); });
      var nx = body.querySelector("#mp-next"); if (nx) nx.onclick = function () { requestNext(); };
    }

    // Move the real practice filter panel into the multiplayer layout (host only).
    function borrowPanel(layout) {
      if (!layout) return;
      try { if (ctx.host && ctx.host.ensureFiltersLoaded) ctx.host.ensureFiltersLoaded(); } catch (e) {}
      var panel = document.getElementById("filters-panel");
      if (!panel) return;
      // Practice-only bits don't apply here: MP's GAME timers rule the room,
      // and packet-game is a solo mode.
      var gameOpt = document.querySelector('#mode-select option[value="game"]');
      if (gameOpt) { gameOpt.hidden = true; gameOpt.disabled = true; }
      if (!panelHome) panelHome = { parent: panel.parentNode, next: panel.nextSibling };
      panel.classList.add("mp-borrowed");
      panel.classList.remove("open");
      layout.insertBefore(panel, layout.firstChild);
      borrowedPanel = panel;
      var ft = panel.querySelector(".fp-title"); if (ft) ft.textContent = "Room settings";
      var fs = panel.querySelector("#btn-drawer-start"); if (fs) fs.textContent = "Done";
      // inject MP sections: YOU + lobby at top, controls at bottom
      var top = document.createElement("div"); top.innerHTML = lobbySectionHtml();
      var head = panel.querySelector(":scope > .fp-head"), at = head ? head.nextSibling : panel.firstChild;
      while (top.firstChild) panel.insertBefore(top.firstChild, at);
      var bottom = document.createElement("div"); bottom.innerHTML = controlsSectionsHtml();
      while (bottom.firstChild) panel.appendChild(bottom.firstChild);
      wireControls();
      // Log the host's filter changes (categories, difficulty, year, strictness…)
      // to chat and re-sync the summary to everyone.
      panel.addEventListener("change", onAnyFilterChange, true);
      panel.addEventListener("input", onAnyFilterChange, true);
    }
    var _filterTimer = null;
    // Human name of a category-tree row ("Fine Arts > Music" below level 1).
    function catRowName(el) {
      var node = el && el.closest && el.closest(".cat-node");
      if (!node) return "";
      var own = node.querySelector(":scope > .cat-row .cat-name");
      var nm = own ? own.textContent.trim() : "";
      var par = node.parentElement && node.parentElement.closest(".cat-node");
      var pn = par && par.querySelector(":scope > .cat-row .cat-name");
      return (pn && nm ? pn.textContent.trim() + " > " : "") + nm;
    }
    // Describe a specific control change for the chat log, e.g.
    // "Warren changed Mythology to true" or "Warren changed difficulty to 2,3,4".
    function describeFilterChange(t) {
      if (!t) return "";
      var diffs = function () { return [].slice.call(document.querySelectorAll("#difficulty-filters .diff-checkbox:checked")).map(function (c) { return c.value; }).join(","); };
      if (t.classList && (t.classList.contains("diff-checkbox"))) return "changed difficulty to " + (diffs() || "none");
      // Category tree: the box's value is a node id — name the row instead
      // (with its parent, since names repeat across the tree: "Music").
      if (t.classList && t.classList.contains("cat-checkbox")) return "changed " + (catRowName(t) || "category") + " to " + (t.checked ? "true" : "false");
      if (t.classList && t.classList.contains("cat-weight")) return "changed " + (catRowName(t) || "weight") + " to " + t.value;
      if (t.id === "category-filters") return "cleared categories";
      if (t.id === "year-min" || t.id === "year-max") { var lo = document.getElementById("year-min"), hi = document.getElementById("year-max"); var a = parseInt(lo.value), b = parseInt(hi.value); return "changed years to " + Math.min(a, b) + "-" + Math.max(a, b); }
      if (t.id === "strictness-slider") return "changed strictness to " + t.value;
      if (t.id === "panel-speed-slider") return "changed reading speed to " + (window.qbSpeedLabel && window.qbSpeedMs ? window.qbSpeedLabel(window.qbSpeedMs(t.value)) : t.value);
      if (t.id === "enable-cat-weights") return "changed weights to " + (t.checked ? "true" : "false");
      if (t.id === "filter-standard") return "changed standard-only to " + (t.checked ? "true" : "false");
      if (t.id === "filter-powermark") return "changed powermarked-only to " + (t.checked ? "true" : "false");
      if (t.id === "mode-select") return "changed mode to " + t.value;
      if (t.id === "mode-set-name") return "changed set to " + (t.value || "(none)");
      if (t.id === "mode-packet") return "changed packet to " + (t.value || "all");
      return "";
    }
    // Anyone can edit the filters. The host stores them as roomConfig and uses
    // them for the next question; a client sends its config to the host.
    // Mirror the room's toggle-style filters into this client's borrowed panel,
    // so a later local edit doesn't silently clobber them (the classic case:
    // the host's "Powermark only" being wiped by any client filter tweak).
    var _applyingRemote = false;
    // Mirror the room's FULL panel selection (categories, subcategories,
    // alternate subcategories, difficulties, years, toggles) into this
    // player's panel via the base's lossless snapshot API. Newer snapshot
    // arriving mid-apply wins (the base serializes on its own generation).
    function applyRemoteSel(sel) {
      if (isHost || !sel) return;
      if (!(ctx.host && ctx.host.applyFilterSelectionSnapshot)) return;   // older base: roomFilters fallback already ran
      // The base serializes overlapping applies itself (newest wins), and the
      // apply fires no events — nothing to guard here.
      Promise.resolve(ctx.host.applyFilterSelectionSnapshot(sel)).catch(function () {});
    }
    function applyRoomFiltersToPanel(f) {
      if (isHost || !f) return;
      _applyingRemote = true;
      try {
        var pm = document.getElementById("filter-powermark"); if (pm) pm.checked = !!f.powermarkOnly;
        var st = document.getElementById("filter-standard"); if (st) st.checked = !!f.standard;
        var so = document.getElementById("filter-starred"); if (so) so.checked = !!f.starredOnly;
        if (f.yearMin != null) { var ym = document.getElementById("year-min"); if (ym) ym.value = f.yearMin; }
        if (f.yearMax != null) { var yx = document.getElementById("year-max"); if (yx) yx.value = f.yearMax; }
        if (Array.isArray(f.difficulties)) {
          var want = f.difficulties.map(String);
          document.querySelectorAll("#difficulty-filters .diff-checkbox").forEach(function (cb) { cb.checked = want.indexOf(String(cb.value)) >= 0; });
        }
      } catch (e) {}
      _applyingRemote = false;
    }
    function onAnyFilterChange(e) {
      // No remote-apply suppression here: applyFilterSelectionSnapshot fires
      // NO events, so any change/input landing during a remote apply is a REAL
      // user edit — swallowing it would desync that player's panel for good.
      if (e && e.target && e.target.closest && e.target.closest(".mp-injected")) return; // ignore MP's own controls
      var msg = describeFilterChange(e && e.target);
      clearTimeout(_filterTimer);
      _filterTimer = setTimeout(function () {
        if (!ctx.host || !ctx.host.getPracticeConfig) return;
        var cfg; try { cfg = ctx.host.getPracticeConfig(); } catch (e2) { return; }
        var sel = null;
        try { sel = ctx.host.getFilterSelectionSnapshot ? ctx.host.getFilterSelectionSnapshot() : null; } catch (e2) {}
        if (sel) _lastSelJson = JSON.stringify(sel);   // our own edit — don't re-apply it when it echoes back
        if (isHost) {
          roomConfig = cfg;
          filterSummary = cfg.filterSummary || "All categories";
          mpPre.q = null;               // the prefetched tossup no longer matches…
          mpPrefetchNext(cfg.filters || {});   // …so queue one for the NEW filters now
          if (msg) sysChat(myName + " " + msg);
          broadcast(stateMsg()); renderFilterSummary();
        } else {
          toHost({ t: "setConfig", config: roomConfigOf(cfg, sel), change: msg });
        }
      }, 400);
    }
    // What a room needs from this player's panel. Server rooms also get the
    // mode, weighting, how questions are read, and an imported packet.
    function roomConfigOf(cfg, sel) {
      var c = { filters: cfg.filters, strictness: cfg.strictness, revealSpeed: cfg.revealSpeed, hidePron: cfg.hidePron, filterSummary: cfg.filterSummary, sel: sel };
      if (serverMode) {
        var st = {}; try { st = (ctx.host && ctx.host.getState && ctx.host.getState()) || {}; } catch (e) {}
        c.mode = realMode();
        c.weighted = weightedOn();
        c.hideNotes = st.hideNotes !== false;
        if (st.hidePronunciations) c.hidePron = true;
      }
      return c;
    }
    // The first player in a new server room hands it their (reset) practice setup.
    function sendRoomConfig(fresh) {
      if (!serverMode) return;
      if (fresh) { try { if (ctx.host && ctx.host.resetPracticeFilters) ctx.host.resetPracticeFilters(); } catch (e) {} }
      setTimeout(function () {
        if (!serverMode || !lobby || !ctx.host || !ctx.host.getPracticeConfig) return;
        var cfg; try { cfg = ctx.host.getPracticeConfig(); } catch (e) { return; }
        var sel = null; try { sel = ctx.host.getFilterSelectionSnapshot ? ctx.host.getFilterSelectionSnapshot() : null; } catch (e) {}
        if (sel) _lastSelJson = JSON.stringify(sel);
        toHost({ t: "setConfig", config: roomConfigOf(cfg, sel), silent: true });
      }, 150);
    }
    // Put the panel back where it belongs and strip the injected MP sections.
    function returnPanel() {
      var gameOpt = document.querySelector('#mode-select option[value="game"]');
      if (gameOpt) { gameOpt.hidden = false; gameOpt.disabled = false; }
      if (!borrowedPanel) return;
      borrowedPanel.removeEventListener("change", onAnyFilterChange, true);
      borrowedPanel.removeEventListener("input", onAnyFilterChange, true);
      borrowedPanel.querySelectorAll(".mp-injected").forEach(function (n) { n.remove(); });
      borrowedPanel.classList.remove("mp-borrowed");
      borrowedPanel.classList.remove("open");
      var ft = borrowedPanel.querySelector(".fp-title"); if (ft) ft.textContent = "Practice setup";
      var rb = body && body.querySelector("#mp-roomset"); if (rb) rb.setAttribute("aria-expanded", "false");
      if (panelHome) { panelHome.parent.insertBefore(borrowedPanel, panelHome.next); }
      borrowedPanel = null;
    }

    function renderFilterSummary() {
      var el = body && body.querySelector("#mp-filter-summary"); if (!el) return;
      if (isHost && ctx.host && ctx.host.getPracticeConfig) { try { filterSummary = ctx.host.getPracticeConfig().filterSummary || "All categories"; } catch (e) {} }
      el.textContent = filterSummary || "All categories";
    }

    // Players tab: your own name and team are edited in place (click them); another
    // team's row has Join. The list holds still while you type (scoresEditing).
    var scoresEditing = false, scoresDirty = false;
    function editInPlace(btn, value, max, placeholder, commit) {
      scoresEditing = true;
      var inp = document.createElement("input");
      inp.className = "mode-input mp-edit-in"; inp.value = value || ""; inp.maxLength = max; inp.placeholder = placeholder || ""; inp.setAttribute("aria-label", placeholder || "Edit");
      btn.replaceWith(inp); inp.focus(); inp.select();
      var done = false;
      var finish = function (save) {
        if (done) return; done = true; scoresEditing = false;
        var v = inp.value.trim();
        if (save && v !== (value || "")) commit(v);
        scoresDirty = false; renderScores();
      };
      inp.addEventListener("keydown", function (e) { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); finish(true); } else if (e.key === "Escape") { e.preventDefault(); finish(false); } });
      inp.addEventListener("blur", function () { finish(true); });
    }
    function renderScores() {
      var el = body && body.querySelector("#mp-scores"); if (!el) return;
      if (scoresEditing) { scoresDirty = true; return; }
      var teams = {}, specs = [];
      order.forEach(function (id) {
        var p = players[id];
        if (p.spec) { specs.push(p); return; }
        (teams[p.team || ""] = teams[p.team || ""] || []).push(p);
      });
      var COLORS = ["#8957e5", "#1f6feb", "#bf4b8a", "#2ea043", "#d29922", "#0e7490", "#db6d28"];
      var colorOf = function (id) { var h = 0; for (var i = 0; i < String(id).length; i++) h = (h * 31 + String(id).charCodeAt(i)) >>> 0; return COLORS[h % COLORS.length]; };
      var row = function (p) {
        var you = p.id === myId;
        var initial = (String(p.name || "?").trim()[0] || "?").toUpperCase();
        var nameHtml = you ? '<button type="button" class="mp-edit mp-edit-name" title="Change your name">' + esc(p.name) + ' <small>(you)</small><span class="mp-pen" aria-hidden="true">✎</span></button>' : "<b>" + esc(p.name) + "</b>";
        var subHtml = p.off ? "offline" : p.spec ? "spectating"
          : you ? '<button type="button" class="mp-edit mp-edit-team" title="' + (p.team ? "Change your team" : "Join or make a team") + '">' + (p.team ? "team " + esc(p.team) : "+ Add team") + "</button>"
          : (p.team ? "team " + esc(p.team) : (p.avatar ? esc(p.avatar) : "&nbsp;"));
        return '<div class="mp-player' + (you ? " mp-you" : "") + (p.off ? " mp-off" : "") + '"' + (you ? "" : ' data-user="' + esc(p.handle || "") + '" data-user-name="' + esc(p.name) + '" data-mp-pid="' + esc(p.id) + '"') + '><span class="avatar" style="background:' + (you ? "var(--accent-strong)" : colorOf(p.id)) + '">' + esc(initial) + '</span>' +
          '<span class="nm">' + nameHtml + "<span>" + subHtml + "</span></span>" +
          (p.spec ? "" : '<span class="sc num">' + (p.score || 0) + "</span>") + "</div>";
      };
      var html = "";
      Object.keys(teams).sort().forEach(function (tn) {
        var roster = teams[tn].sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
        if (tn) {
          var tot = roster.reduce(function (s2, p) { return s2 + (p.score || 0); }, 0);
          var me = players[myId], canJoin = me && !me.spec && (me.team || "") !== tn;
          html += '<div class="mp-team-row"><span>' + esc(tn) + '</span><span class="mp-team-r">' + (canJoin ? '<button type="button" class="btn btn-sm mp-join-team" data-team="' + esc(tn) + '">Join</button>' : "") + '<strong class="num">' + tot + "</strong></span></div>";
        }
        roster.forEach(function (p) { html += row(p); });
      });
      if (specs.length) { html += '<div class="eyebrow" style="margin-top:8px">Spectators</div>'; specs.forEach(function (p) { html += row(p); }); }
      el.innerHTML = html || '<div class="text-muted">—</div>';
      var nb = el.querySelector(".mp-edit-name");
      if (nb) nb.onclick = function () { editInPlace(nb, (players[myId] || {}).name || myName, 24, "Your name", function (v) { if (v) { changeName(v); var mi = body.querySelector("#mp-myname"); if (mi) mi.value = v; } }); };
      var tb = el.querySelector(".mp-edit-team");
      if (tb) tb.onclick = function () { editInPlace(tb, (players[myId] || {}).team || "", 24, "Team name (empty: no team)", function (v) { changeTeam(v); var ti = body.querySelector("#mp-myteam"); if (ti) ti.value = v; }); };
      el.querySelectorAll(".mp-join-team").forEach(function (b) { b.onclick = function () { changeTeam(b.dataset.team); var ti = body.querySelector("#mp-myteam"); if (ti) ti.value = b.dataset.team; }; });
      syncChatScope();   // team changes can invalidate the "Team" chat scope
    }

    // keep the left-panel rule controls in sync with shared settings
    function renderSettings() {
      if (!body) return;
      var an = body.querySelector("#mp-ans"); if (an && document.activeElement !== an) { an.value = settings.answerSeconds; var av = body.querySelector("#mp-ans-val"); if (av) av.textContent = settings.answerSeconds + "s"; }
      var bw2 = body.querySelector("#mp-bwin"); if (bw2 && document.activeElement !== bw2) { bw2.value = settings.buzzWindow || 10; var bv = body.querySelector("#mp-bwin-val"); if (bv) bv.textContent = (settings.buzzWindow || 10) + "s"; }
      var rb = body.querySelector("#mp-rebuzz"); if (rb) rb.checked = !!settings.rebuzz;
      var be = body.querySelector("#mp-bonusevery"); if (be) be.checked = !!settings.bonusEvery;
      var sp3 = body.querySelector("#mp-stoppow"); if (sp3) sp3.checked = !!settings.stopPower;
      var sk3 = body.querySelector("#mp-skips"); if (sk3) sk3.checked = settings.allowSkips !== false;
      var lk3 = body.querySelector("#mp-lock"); if (lk3) lk3.checked = !!settings.locked;
      var pb3 = body.querySelector("#mp-public"); if (pb3) pb3.checked = settings.public !== false;
      var tour = !!settings.tournament;
      var tn3 = body.querySelector("#mp-tourney"); if (tn3) tn3.checked = tour;
      ["#mp-rebuzz", "#mp-bonusevery", "#mp-skips"].forEach(function (sel) { var x = body.querySelector(sel); if (x) x.disabled = tour; });
      renderScoresheet();
    }

    function renderQuestion() {
      setTimeout(syncActions, 0);
      clearPauseUi();   // a new question must never inherit the paused grey
      var ph = body && body.querySelector("#mp-placeholder"); if (ph) ph.classList.add("hidden");
      var content = body && body.querySelector("#mp-content"); if (content) content.classList.remove("hidden");
      var meta = body && body.querySelector("#mp-meta"); if (meta) meta.textContent = "";   // category stays hidden while reading
      // a new question starts at the top, without the room a long one before it added (app.js followReading)
      var qa = body && body.querySelector(".question-area"); if (qa) { qa.style.minHeight = ""; qa._followKey = null; }
      if (body && matchMedia("(max-width: 760px)").matches) body.scrollTop = 0;
      applyReveal(revealIdx);
      var buzz = body && body.querySelector("#mp-buzz"); if (buzz) { buzz.className = "buzz-area hidden"; buzz.innerHTML = ""; }
      var res = body && body.querySelector("#mp-result"); if (res) { res.className = "result-area hidden"; res.innerHTML = ""; }
    }

    // Character-based reveal with (#) buzz marks — identical to practice.
    // Render the revealed text with (#) buzz marks. Your own buzzes use one
    // (themeable) color, everyone else's use another.
    function renderWithMarks(text, upTo, marks, powerEnd) {
      var list = (marks || []).filter(function (m) { return m.pos >= 0 && m.pos <= upTo; })
        .map(function (m) { return { pos: m.pos, html: '<span class="buzz-mark ' + (m.by === myId ? "buzz-self" : "buzz-other") + '">(#)</span>' }; });
      // Once the question is over, the power mark shows at its real spot.
      if (powerEnd != null && powerEnd > 0 && powerEnd <= upTo) list.push({ pos: powerEnd, rank: 2, html: '<span class="mp-power-mark">(*)</span>' });
      // Question over: everything before the power mark reads in bold, exactly
      // like solo practice. rank orders same-position inserts so the bold closes
      // before the (*) and any buzz mark, which keep their own colours.
      if (powerEnd != null && powerEnd > 0 && powerEnd <= upTo) {
        list.push({ pos: 0, rank: -1, html: '<strong class="pre-power">' });
        list.push({ pos: powerEnd, rank: 0, html: "</strong>" });
      }
      list.sort(function (a, b) { return a.pos - b.pos || (a.rank == null ? 1 : a.rank) - (b.rank == null ? 1 : b.rank); });
      var out = "", last = 0;
      list.forEach(function (m) {
        out += esc(text.substring(last, m.pos)) + m.html;
        last = m.pos;
      });
      out += esc(text.substring(last, upTo));
      return out;
    }
    var endedPowerEnd = 0;   // set from the result payload; shown only after the end
    function applyReveal(idx) {
      var qt = body && body.querySelector("#mp-qtext"); if (!qt || !current) return;
      var text = current.text;
      var out = renderWithMarks(text, idx, buzzCharMarks, ended && endedPowerEnd > 0 ? endedPowerEnd : -1);
      // The unread text stays invisible, exactly as in practice (it holds the
      // layout; masked so highlighting can't read it). Server rooms send the
      // text just ahead of the reading, so the part not here yet is held by an
      // invisible stand-in of the question's full length (q.len) — the box
      // doesn't grow as the question streams in.
      // the stand-in keeps spaces and line-break characters (hyphens, dashes, slashes) so it
      // wraps like the real text; server rooms send the whole question's shape up front
      var tail;
      if (typeof current.shape === "string" && current.shape.length >= idx) tail = current.shape.substring(idx);
      else {
        tail = text.substring(idx).replace(/[^\s\-\u2010-\u2015\/]/g, "\u00b7");
        if (current.len && current.len > text.length) { var pad = ""; while (pad.length < current.len - text.length) pad += "······ "; tail += pad.slice(0, current.len - text.length); }
      }
      var rest = esc(tail);
      qt.innerHTML = '<span class="revealed">' + out + "</span>" + (rest ? '<span class="unrevealed" aria-hidden="true">' + rest + "</span>" : "");
      if (!ended && window.qbFollowReading) window.qbFollowReading(qt.querySelector(".revealed"));   // long questions scroll along
    }

    function applyBuzz(id, name, idx, deadline) {
      setTimeout(syncActions, 0);
      var buzz = body && body.querySelector("#mp-buzz"); if (!buzz) return;
      if (id === myId) {
        buzz.className = "buzz-area";
        buzz.innerHTML =
          '<div class="buzz-prompt"><span class="prompt-symbol">&gt;</span>' +
          '<input type="text" id="mp-ans-input" placeholder="type answer and press Enter..." autocomplete="off" autocorrect="off" spellcheck="false"></div>' +
          '<div class="buzz-hints">You buzzed — <span id="mp-timer"></span></div>' +
          '<div class="mp-timer-bar"><div id="mp-timer-fill"></div></div>';
        var inp = buzz.querySelector("#mp-ans-input");
        var grab = function () { try { inp.focus({ preventScroll: true }); } catch (e2) { inp.focus(); } };
        grab(); requestAnimationFrame(grab); setTimeout(grab, 120);
        resetTyping();
        inp.addEventListener("input", function () { sendTyping(inp.value); });
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { stopAutoSub(); inp.disabled = true; submitAnswer(inp.value.trim()); } });
        armAutoSub(inp, deadline, submitAnswer);
      } else {
        buzz.className = "buzz-area";
        buzz.innerHTML = '<div class="buzz-prompt"><span class="prompt-symbol">&gt;</span> <em id="mp-live-ph">' + esc(name) + " is answering…</em><span id=\"mp-live\" class=\"mp-live\"></span></div>" +
          '<div class="buzz-hints"><span id="mp-timer"></span></div>' +
          '<div class="mp-timer-bar"><div id="mp-timer-fill"></div></div>';
      }
      startTick(deadline);
    }

    function applyPrompt(id, name, ask, deadline) {
      var buzz = body && body.querySelector("#mp-buzz"); if (!buzz) return;
      if (id === myId) {
        buzz.className = "buzz-area";
        buzz.innerHTML =
          '<div class="buzz-prompt"><span class="prompt-symbol">&gt;</span>' +
          '<input type="text" id="mp-ans-input" placeholder="answer again…" autocomplete="off" autocorrect="off" spellcheck="false"></div>' +
          '<div class="buzz-hints"><span style="color:var(--yellow);font-weight:700">PROMPT' + (ask ? ":</span> " + esc(ask) : "</span>") + ' — <span id="mp-timer"></span></div>' +
          '<div class="mp-timer-bar"><div id="mp-timer-fill"></div></div>';
        var inp = buzz.querySelector("#mp-ans-input"); inp.focus();
        resetTyping();
        inp.addEventListener("input", function () { sendTyping(inp.value); });
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { stopAutoSub(); inp.disabled = true; submitAnswer(inp.value.trim()); } });
        armAutoSub(inp, deadline || answerDeadline, submitAnswer);
      } else {
        buzz.className = "buzz-area";
        buzz.innerHTML = '<div class="buzz-prompt"><span class="prompt-symbol">&gt;</span> <em id="mp-live-ph">' + esc(name) + " is being prompted…</em><span id=\"mp-live\" class=\"mp-live\"></span></div>" +
          '<div class="buzz-hints"><span style="color:var(--yellow);font-weight:700">PROMPT' + (ask ? ":</span> " + esc(ask) : "</span>") + ' <span id="mp-timer"></span></div>' +
          '<div class="mp-timer-bar"><div id="mp-timer-fill"></div></div>';
      }
      startTick(deadline || answerDeadline);
    }

    // ── live typing: everyone watches the answerer type ──
    // The typer's input is COALESCED (one send per 150ms, whole value, capped
    // at 120 chars) and only flows while an answer window is open: the host
    // rebroadcasts it only from the current buzzer / bonus winner, so stale or
    // spoofed typing dies at the host.
    var _typeTimer = null, _typeLast = "", _typeSentAt = 0;
    function resetTyping() { if (_typeTimer) { clearTimeout(_typeTimer); _typeTimer = null; } _typeLast = ""; _typeSentAt = 0; }
    function _typeSend() {
      _typeSentAt = Date.now();
      if (isHost) broadcast({ t: "typing", id: myId, text: _typeLast });
      else toHost({ t: "typing", text: _typeLast });
    }
    function sendTyping(text) {
      text = String(text || "").slice(0, 120);
      if (text === _typeLast) return;
      _typeLast = text;
      var now = Date.now();
      // LEADING edge: the first keystroke (and any keystroke 150ms after the
      // last send) goes out synchronously — no timer, so background-tab timer
      // throttling can't delay it. Rapid typing coalesces via the trailer.
      if (now - _typeSentAt >= 150) { _typeSend(); return; }
      if (_typeTimer) return;
      _typeTimer = setTimeout(function () { _typeTimer = null; _typeSend(); }, Math.max(20, 150 - (now - _typeSentAt)));
    }
    function applyTyping(id, text) {
      var live = body && body.querySelector("#mp-live");
      var ph = body && body.querySelector("#mp-live-ph");
      if (!live) return;
      text = String(text || "").slice(0, 120);
      live.textContent = text;
      if (ph) ph.style.display = text ? "none" : "";
    }

    // ── timeout auto-submit (the answering machine owns the typed text) ──
    function stopAutoSub() { if (autoSubTimer) { clearTimeout(autoSubTimer); autoSubTimer = null; } }
    function armAutoSub(inp, deadline, submit) {
      stopAutoSub();
      var ms = Math.max(0, deadline - Date.now() - 150);   // beat the host's fallback
      autoSubTimer = setTimeout(function () {
        if (inp && !inp.disabled && document.contains(inp)) { inp.disabled = true; submit(inp.value.trim()); }
      }, ms);
    }

    function startTick(deadline, totalMs) {
      if (tickTimer) clearInterval(tickTimer);
      var total = totalMs || (settings.answerSeconds || 10) * 1000;
      function paint() {
        var t = body && body.querySelector("#mp-timer");
        var left = Math.max(0, deadline - Date.now());
        if (t) t.textContent = Math.ceil(left / 1000) + "s";
        var bar = body && body.querySelector("#mp-timer-fill");
        if (bar) bar.style.width = Math.max(0, Math.min(100, (left / total) * 100)) + "%";
      }
      paint();
      tickTimer = setInterval(paint, 100);
    }

    var _endedCategory = "";
    function applyResult(d) {
      setTimeout(syncActions, 0);
      stopAutoSub(); resetTyping();
      if (d.ended) clearPauseUi();
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
      if (d.ended) {
        _endedCategory = d.category || "";
        endedPowerEnd = d.powerEnd != null ? d.powerEnd : (isHost ? curPowerEnd : 0);
        var meta = body && body.querySelector("#mp-meta");
        if (meta && _endedCategory) meta.textContent = _endedCategory;
      }
      if (typeof d.index === "number" && !d.noBuzz && d.id && !buzzCharMarks.some(function (m) { return m.pos === d.index && m.by === d.id; })) buzzCharMarks.push({ pos: d.index, by: d.id });
      // Each client records ITS OWN buzz to local stats — every ATTEMPT counts
      // (powers, tens, AND negs), exactly like solo play. Questions this
      // player never buzzed on are not recorded (there is no attempt to log).
      if (d.id && d.id === myId && current && current.id && !d._recorded) {
        d._recorded = true;
        ctx.playSound(d.correct ? "correct" : "incorrect");
        var _cel = (current.text && current.text.length) ? Math.max(0, Math.min(1, (d.index || 0) / current.text.length)) : 0;
        try {
          ctx.api.post("/api/check-tossup", {
            // origIndex = the host's mapping into question_sanitized (with "(*)")
            questionId: current.id, answer: d.given || "", buzzPosition: typeof d.origIndex === "number" ? d.origIndex : (d.index || 0),
            sessionId: mpSession(), overriding: true, correct: !!d.correct,
            isPower: (d.points || 0) >= 15, points: d.points || 0, celerity: _cel,
          });
        } catch (e) {}
      }
      var buzz = body && body.querySelector("#mp-buzz"); if (buzz) { buzz.className = "buzz-area hidden"; buzz.innerHTML = ""; }
      applyReveal(d.ended ? (current ? current.text.length : revealIdx) : revealIdx);
      var res = body && body.querySelector("#mp-result"); if (!res) { renderBuzzes(); return; }
      if (d.ended) {
        res.className = "result-area";
        var banner = d.correct
          ? '<div class="result-banner correct">' + esc(d.name) + " — +" + d.points + " pts</div>"
          : d.noBuzz
            ? '<div class="result-banner incorrect">Time! Nobody buzzed.</div>'
            : '<div class="result-banner incorrect">Nobody got it — everyone is locked out</div>';
        res.innerHTML =
          banner +
          '<div class="result-answer">ANSWER: <span class="actual">' + ansHtml(d.answerRaw, d.answer || "") + "</span></div>";
        var n2 = res.querySelector("#mp-next2"); if (n2) n2.onclick = function () { requestNext(); };
      } else {
        res.className = "result-area hidden"; res.innerHTML = "";
      }
      renderBuzzes();
    }

    // ── bonus phase (everyone): rendered under the tossup result. Parts are
    // revealed one at a time; only the winner gets an input box. Chat is in a
    // separate panel and stays fully usable throughout. ──
    function submitBonusAnswer(text, k) { if (isHost) hostHandleBonusAnswer(myId, text, k); else toHost({ t: "banswer", text: text, k: k }); }
    function applyBonus(d) {
      var parts = d.parts || [];
      // Older hosts send no values: every part is worth 10.
      var values = parts.map(function (_, i) { var v = d.values && +d.values[i]; return v > 0 ? v : 10; });
      var max = +d.max > 0 ? +d.max : values.reduce(function (a, v) { return a + v; }, 0);
      bonusView = { leadin: d.leadin, parts: parts, values: values, max: max, winner: d.winner, name: d.name, k: 0, got: 0, pts: 0, done: false, results: [] };
      renderBonusArea(d.secs);
    }
    function applyBonusPart(d) {
      if (!bonusView) return;
      bonusView.results[d.k] = d;
      bonusView.k = d.k + 1;
      bonusView.got = d.got;
      bonusView.pts = typeof d.pts === "number" ? d.pts : (d.got || 0) * 10;
      bonusView.done = !!d.done;
      renderBonusArea(d.done ? 0 : d.secs);
    }
    function applyBonusCancel() {
      if (bonusView) { bonusView.done = true; renderBonusArea(0); }
    }
    function renderBonusArea(secs) {
      setTimeout(syncActions, 0);
      var res = body && body.querySelector("#mp-result"); if (!res || !bonusView) return;
      res.className = "result-area";
      var el = res.querySelector("#mp-bonus");
      if (!el) { el = document.createElement("div"); el.id = "mp-bonus"; el.className = "mp-bonus"; res.appendChild(el); }
      var mine = bonusView.winner === myId;
      var html = '<div class="filter-label">BONUS \u2014 ' + esc(bonusView.name) + (mine ? " (you)" : "") + " answers</div>" +
        (bonusView.leadin ? '<div class="question-text" style="font-size:13px;min-height:0">' + esc(bonusView.leadin) + "</div>" : "");
      for (var k = 0; k < bonusView.parts.length && k <= bonusView.k; k++) {
        html += '<div class="mp-bpart"><div class="bonus-part-text">[' + ((bonusView.values && bonusView.values[k]) || 10) + "] " + esc(bonusView.parts[k]) + "</div>";
        var r = bonusView.results[k];
        if (r) {
          html += '<div style="font-size:12px">' + (r.ok ? '<span class="bonus-verdict correct">\u2713 </span>' : '<span class="bonus-verdict incorrect">\u2717 </span>') +
            (r.given ? "\u201c" + esc(r.given) + "\u201d \u2014 " : "") + 'ANSWER: <span class="ans">' + ansHtml(r.answerRaw, r.answer) + "</span></div>";
        } else if (k === bonusView.k && !bonusView.done) {
          html += mine
            ? '<div class="buzz-prompt"><span class="prompt-symbol">&gt;</span><input type="text" class="mp-binput" placeholder="your answer\u2026 (Enter)" autocomplete="off" autocorrect="off" spellcheck="false"></div>'
            : '<div class="text-muted" style="font-size:12px"><em id="mp-live-ph">' + esc(bonusView.name) + " is answering\u2026</em><span id=\"mp-live\" class=\"mp-live\"></span></div>";
          html += '<div class="buzz-hints"><span id="mp-timer"></span></div><div class="mp-timer-bar"><div id="mp-timer-fill"></div></div>';
        }
        html += "</div>";
      }
      if (bonusView.done) html += '<div class="result-banner ' + (bonusView.got > 0 ? "correct" : "incorrect") + '" style="margin-top:2px">BONUS: ' + (bonusView.pts || 0) + "/" + (bonusView.max || bonusView.parts.length * 10) + "</div>";
      el.innerHTML = html;
      var inp = el.querySelector(".mp-binput");
      var myK = bonusView.k;   // pinned: a late submit must carry the part it answered
      if (inp) {
        inp.focus();
        resetTyping();
        inp.addEventListener("input", function () { sendTyping(inp.value); });
        inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { stopAutoSub(); inp.disabled = true; submitBonusAnswer(inp.value.trim(), myK); } });
      }
      if (bonusView.done) { stopAutoSub(); if (tickTimer) { clearInterval(tickTimer); tickTimer = null; } }
      else if (secs) {
        var bd = Date.now() + secs * 1000;
        startTick(bd, secs * 1000);
        if (inp) armAutoSub(inp, bd, function (tx) { submitBonusAnswer(tx, myK); });
      }
    }

    function clearPauseUi() {
      var qt = body && body.querySelector("#mp-qtext"); if (qt) qt.classList.remove("paused-text");
      var ov = body && body.querySelector("#mp-pause-overlay"); if (ov) ov.remove();
    }
    function applyPause(p) {
      setTimeout(syncActions, 0);
      var qt = body && body.querySelector("#mp-qtext"); if (qt) qt.classList.toggle("paused-text", p);
      var area = body && body.querySelector(".question-area");
      var ov = body && body.querySelector("#mp-pause-overlay");
      if (p && area && !ov) {
        ov = document.createElement("div");
        ov.className = "pause-overlay"; ov.id = "mp-pause-overlay";
        ov.textContent = "PAUSED";
        area.appendChild(ov);
      } else if (!p && ov) ov.remove();
      var meta = body && body.querySelector("#mp-meta"); if (meta && current) meta.textContent = !p && ended && _endedCategory ? _endedCategory : "";
    }

    function buzzBadge(b) {
      return b.correct
        ? '<span class="pill pill-green">+' + b.points + "</span>"
        : (b.points < 0 ? '<span class="pill pill-red">' + b.points + "</span>" : '<span class="pill">' + b.points + "</span>");
    }

    // (The per-question buzz Log tab is gone; renderBuzzes still keeps the
    // action buttons in step wherever it used to run.)
    function renderBuzzes() {
      var el = body && body.querySelector("#mp-buzzes"); if (!el) { syncActions(); return; }
      if (!buzzHistory.length) { el.innerHTML = '<div class="text-muted mp-log-empty">No buzzes yet this question</div>'; syncActions(); return; }
      el.innerHTML = buzzHistory.map(function (b) {
        var col = b.correct ? ((b.points || 0) >= 15 ? "var(--yellow)" : "var(--green)") : (b.points < 0 ? "var(--red)" : "var(--muted)");
        return '<div class="mp-logrow"><span class="nm"><b>' + esc(b.name) + '</b><span>' + esc(b.given || "(no answer)") + '</span></span><b class="num" style="color:' + col + '">' + (b.points > 0 ? "+" : "") + (b.points || 0) + "</b></div>";
      }).join("");
      syncActions();
    }

    // Session history now uses the app's OWN overlay, so it looks and behaves
    // exactly like tossups/bonuses. This function only keeps the button's count
    // in sync; the list itself is built on demand by openMpHistory().
    var logCollapsed = {};   // kept for older call sites; the overlay owns view mode now
    var _qRowCache = {};     // question id -> full DB row (for real metadata + power mark)

    function renderSessionLog() {
      if (!body) return;
      var panel = body.querySelector("#mp-history-panel");
      var count = body.querySelector("#mp-history-count");
      if (count) count.textContent = String(sessionLog.length);
      if (panel) panel.style.display = sessionLog.length ? "" : "none";
    }

    // Turn one shared log entry into the shape the app's history overlay wants.
    // `me` is this client's own buzz on that question, if any \u2014 the card shows
    // YOUR result, matching how solo history reads.
    function mpEntryToHistory(e, q) {
      var buzzes = e.buzzes || [];
      var me = null;
      for (var i = 0; i < buzzes.length; i++) if (buzzes[i].name === myName) { me = buzzes[i]; break; }
      var shownLen = (e.text || "").length || 1;
      // MP reads a transformed string ((*) removed, whitespace collapsed), so a
      // raw index would not line up with the original. Carry the FRACTION over
      // instead and re-project onto the real question text.
      var frac = me && typeof me.index === "number" ? Math.max(0, Math.min(1, me.index / shownLen)) : 0;
      var realText = (q && q.question_sanitized) || "";
      var realLen = realText.length || 0;
      var pts = me ? (me.points || 0) : 0;
      // Newer hosts log the exact mapped index into question_sanitized (with its
      // "(*)"), the same coordinates the app's history cards use.
      var exact = me && typeof me.orig === "number" && q ? Math.max(0, Math.min(realLen, me.orig)) : null;
      return {
        id: e.qid || "",
        type: "tossup",
        points: pts,
        correct: !!(me && me.correct),
        isPower: pts >= 15,
        celerity: frac,
        buzzPosition: exact != null ? exact : (me && realLen ? Math.round(frac * realLen) : (me && !q && typeof me.index === "number" ? me.index : 0)),
        userAnswer: me ? (me.given || "") : "(no buzz)",
        answer: (q && q.answer_sanitized) || e.answer || "",
        question: q || {
          // No DB row (imported packet, or the fetch failed): fall back to what
          // the wire gave us so the card still renders.
          question_sanitized: e.text || "",
          answer: e.answerRaw || "",
          answer_sanitized: e.answer || "",
          category: e.category || "",
          category_path: e.categoryPath || "",
          difficulty: e.difficulty,
        },
      };
    }

    async function openMpHistory() {
      if (!(ctx.host && ctx.host.openSessionHistory)) {
        ctx.toast("Session history needs a newer app version", "error");
        return;
      }
      // Pull the real question rows once each \u2014 that is what gives the cards
      // their power mark, subcategory, set name and year, exactly like solo.
      var need = [];
      sessionLog.forEach(function (e) {
        if (e.qid && !(e.qid in _qRowCache) && need.indexOf(e.qid) < 0) need.push(e.qid);
      });
      if (need.length) {
        await Promise.all(need.map(function (id) {
          return ctx.api.get("/api/tossups/" + encodeURIComponent(id))
            .then(function (d) { _qRowCache[id] = (d && d.tossup) || null; })
            .catch(function () { _qRowCache[id] = null; });
        }));
      }
      var entries = sessionLog.map(function (e) { return mpEntryToHistory(e, e.qid ? _qRowCache[e.qid] : null); });
      ctx.host.openSessionHistory(entries, { title: "MULTIPLAYER HISTORY" });
    }

    function leave() {
      markBusy(false);
      leftIntentionally = true;
      mpSessId = ""; // next game records to a fresh local stats session
      var dc = body && body.querySelector("#mp-disconnect"); if (dc) dc.remove();
      returnPanel();
      restoreSoloPanel();
      stopReveal(); stopAnswerTimer(); stopBonusTimer(); stopClientRead(); stopAutoSub();
      stopBuzzWindowTimer(); stopTick();   // a stale buzz-window timeout must never fire into the NEXT lobby
      chatScope = "all"; mpPre = { key: "", q: null, busy: false }; _lastSelJson = ""; chatHist = [];
      bonusState = null; bonusView = null; bonusPending = false;
      try { if (ws) { ws.onclose = null; ws.onmessage = null; ws.close(); } } catch (e) {}
      ws = null; _relayConns = {};
      isHost = false; serverMode = false; current = null;
      players = {}; order = []; lobby = ""; qCount = 0; sessionLog = [];
      render();
    }

    // The website's addresses (app.js webRoute / webPathNow): /multiplayer/<room>
    // opens the lobby and joins that room; leaving the address leaves the room.
    window.QB.mpRoom = function () { return lobby || ""; };
    window.QB.mpLeave = function () { if (lobby) leave(); };
    window.QB.mpJoin = function (code) {
      code = String(code || "").trim().slice(0, 32);
      window.QB.showPage("multiplayer::lobby");
      if (!code || (lobby && lobby.toLowerCase() === code.toLowerCase())) return;
      if (lobby) leave();
      var codeEl = body && body.querySelector("#mp-lobby"), joinBtn = body && body.querySelector("#mp-join");
      if (codeEl && joinBtn) { codeEl.value = code; joinBtn.click(); }
    };


  }

  if (!window.QB || !window.QB.registerBuiltin) return;
  window.QB.registerBuiltin({
    id: "multiplayer",
    name: "Multiplayer",
    version: "9.0.0",
    author: "OfflineQuiz",
    description: "Play together over a relay (works on any network) or P2P.",
    onEnable: __qbMain,
    onDisable: function (ctx) { if (ctx._cleanup) ctx._cleanup(); },
  });
})();


;/* ── judge.js (bundled by build-update) ── */
// GENERATED by scripts/build-judge.mjs from src/main/answerChecker.js and src/main/scoring.js — do not edit.
// The practice page judges answers with this (app.js "client-side judging"); the server records them.
window.QBAnswerChecker = (function () {
"use strict";
// Answer checker: parses a quizbowl answer line and judges a player's response.
//
// Built to taxonomy_work/answerline/answerline_spec.md (the build document): the parse half is a faithful
// port of the reference parser scripts/spec_parse.py (P1–P25; lexicon.py + segment.py), verified identical on
// 594 answer lines; the judge follows the spec's order J1–J14 (§8) with the rules of judging_rules.md.
// Tested against the spec suite taxonomy_work/answerline/tests.jsonl (see tests/answerChecker*.test.js).
//
// Public API (unchanged shapes; additions are optional):
//   evaluateAnswer(response, answerHtml, answerText, strictness = 10, opts = {})
//     -> { status: "accept" | "prompt" | "reject", matchedAnswer, prompt: { target, ask } | null,
//          antiprompt?: true, unsure?: true, rule?: "J5"…, via?: "line" | "hidden", note?: string }
//     opts: readText / fullText / readLen   read position (no position = end of the question, J3)
//           jointPieces  [[pieceA, pieceB], …] from the JOINTLY_REQUIRED_PIECES flag (one required portion)
//           hidden       { accept: [], prompt: [], antiprompt: [], reject: [] } (hidden_answers_spec.md)
//           previous     earlier response(s) on this question (prompt follow-up: reply, first+reply, reply+first)
//           isKnownAnswer(normalisedText) -> bool   optional corpus lexicon for the J10 collision guard
//   parseDirectives(answerHtml, answerText)  legacy summary { accept, prompt, reject, antiprompt, qualifiers,
//           wordForms, mainAnswer } plus { forms, rules }
//   checkAnswer / checkBonusPart / checkBonus, primaryAnswer, healAnswerline, normalizeText, frequencyKey, …

function stripTags(text) {
  return text.replace(/<[^>]+>/g, "").trim();
}

// Umlaut folding mode: the standard pass keeps the German transliteration
// (ö→oe, ü→ue — "goering" for Göring). evaluateAnswer's second pass flips
// this to the plain English-keyboard form (ö→o — "mjolnir" for Mjölnir).
let _plainUmlauts = false;

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/ö/g, _plainUmlauts ? "o" : "oe")
    .replace(/ü/g, _plainUmlauts ? "u" : "ue")
    .replace(/[áàâäãå]/g, "a")
    .replace(/[éèêë]/g, "e")
    .replace(/[íìîï]/g, "i")
    .replace(/[óòôõø]/g, "o")
    .replace(/[úùû]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[ýÿ]/g, "y")
    .replace(/[š]/g, "s")
    .replace(/[ž]/g, "z")
    .replace(/[œ]/g, "oe")
    .replace(/[æ]/g, "ae")
    .replace(/[ł]/g, "l")
    .replace(/[ß]/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/(^|[\s([{"“”'‘’])[-−–](?=\d)/g, "$1minus ")
    .replace(/(^|[\s([{"“”'‘’])\+(?=\d)/g, "$1plus ")
    .replace(/[-–—‐]/g, " ")
    .replace(/[^\p{L}\p{N}\s+#]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingArticle(text) {
  return text
    .toLowerCase()
    .replace(/^(a|an|the|el|la|los|las|le|les|il|lo|l'|un|une|der|die|das)\s+/i, "")
    .trim();
}

function parseAnswerline(answerline) {
  const raw = answerline || "";
  const stripped = stripTags(raw).trim();
  const results = { answers: [], required: [] };

  const requiredRegex = /<b>\s*<u>([^<]+)<\/u>\s*<\/b>/gi;
  let match;
  const requiredParts = new Set();
  while ((match = requiredRegex.exec(raw)) !== null) {
    requiredParts.add(match[1].trim());
  }
  const fullRequired = [...requiredParts].join(" ");

  if (fullRequired) {
    results.required.push(fullRequired.trim());
  }

  const orRegex = /\[or\s+([^\]]+)\]/gi;
  while ((match = orRegex.exec(raw)) !== null) {
    const alts = match[1].trim().split(/\s+or\s+|\s*,\s*/);
    for (const alt of alts) {
      const cleaned = stripTags(alt).trim();
      if (cleaned && !results.answers.includes(cleaned)) {
        results.answers.push(cleaned);
      }
    }
  }

  for (const req of results.required) {
    if (!results.answers.includes(req)) results.answers.push(req);
  }

  if (results.answers.length === 0) {
    results.answers.push(stripped);
    if (stripped) results.required.push(stripped);
  }

  return results;
}

function parseSanitizedAnswerline(sanitized) {
  const text = sanitized || "";
  const results = { answers: [], required: [] };

  const bracketRegex = /\[(or|accept|prompt on|do not accept|do not prompt on)\s+([^\]]+)\]/gi;
  let match;
  const bracketAlternatives = [];
  while ((match = bracketRegex.exec(text)) !== null) {
    const directive = match[1].toLowerCase();
    const content = match[2].trim();
    if (directive === "or" || directive === "accept") {
      for (const a of content.split(/\s+or\s+|\s*,\s*/)) {
        const alt = a.trim();
        if (alt) bracketAlternatives.push(alt);
      }
    }
  }

  const firstBracket = text.search(/\[(?:or|accept|prompt|do not)/i);
  const mainAnswer = firstBracket > 0 ? text.substring(0, firstBracket).trim() : text.trim();

  if (mainAnswer) {
    results.required.push(mainAnswer);
    results.answers.push(mainAnswer);
  }
  for (const alt of bracketAlternatives) {
    if (!results.answers.includes(alt)) results.answers.push(alt);
  }

  if (results.answers.length === 0 && text.trim()) {
    results.answers.push(text.trim());
    results.required.push(text.trim());
  }

  return results;
}

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (a === b) return 0;
  let prev = new Uint8Array(b.length + 1);
  let curr = new Uint8Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

function stripQuotes(s) {
  return (s || "").replace(/^["“”'']+|["“”'']+$/g, "").trim();
}

function underlineSpans(html) {
  let vis = "";
  const spans = [];
  let depth = 0, spanStart = -1;
  const re = /<[^>]+>|[^<]+/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tok = m[0];
    if (tok[0] === "<") {
      if (/^<u(\s|>)/i.test(tok)) { if (depth === 0) spanStart = vis.length; depth++; }
      else if (/^<\/u\s*>/i.test(tok)) {
        depth = Math.max(0, depth - 1);
        if (depth === 0 && spanStart >= 0) { spans.push([spanStart, vis.length]); spanStart = -1; }
      }
    } else {
      vis += tok;
    }
  }
  if (depth > 0 && spanStart >= 0) spans.push([spanStart, vis.length]);
  const merged = [];
  for (const sp of spans) {
    const prev = merged[merged.length - 1];
    if (prev && sp[0] - prev[1] <= 1 && /^['’\u2019-]?$/.test(vis.slice(prev[1], sp[0]))) prev[1] = sp[1];
    else merged.push([sp[0], sp[1]]);
  }
  return { vis, spans: merged };
}

const WORD_CHAR = /[A-Za-z0-9'’]/;

// ── Tag-split word repair ────────────────────────────────────────────────
// Packet markup routinely ends an underline mid-word ("<b><u>pulsar</u></b>s"),
// which phraseTerms already handles by expanding to the word boundary. But part
// of the upstream dump strands the inflection behind a SPACE the markup
// introduced: "<b><u>pulsar</u> </b>s", "<u>neutron star</u> s" — the DB row
// literally reads "pulsar s [prompt on neutron star s until read]". Heal it at
// the source so terms, mainAnswer, primaryAnswer and the displayed answerline
// all see one word.
//
// Three guards keep this off genuine multi-word answers:
//   1. a formatting-tag run must sit between the word and the space, so plain
//      prose is never glued;
//   2. the tail must be a bound morpheme from a closed list, AND must be
//      plausible for the STEM it would attach to (this is what keeps
//      "<u>Dar</u> es Salaam", "log n" and "2 to the n" intact);
//   3. nothing word-like may follow the tail, looking THROUGH tags, so
//      "is<u> n</u>ot" stays split.
const SPLIT_SUFFIX = /^(?:['’]?s|es|n|ns|ic|ics|ism|isms|ian|ians|ata|ae|ing|er|ers|ly|ness)$/;
const SPLIT_STEM_RE = /[\p{L}\p{N}'’]+$/u;
const TAG_SPLIT_RE = /(?<=[\p{L}\p{N}'’])((?:<\/?[A-Za-z][^>]*>)+)[ \t]+((?:<\/?[A-Za-z][^>]*>)*)(['’]?[a-z]{1,4})(?!(?:<\/?[A-Za-z][^>]*>)*[\p{L}\p{N}'’-])/gu;
const TEXT_SPLIT_RE = /(?<=[\p{L}\p{N}'’])[ \t]+(['’]?[a-z]{1,4})(?![\p{L}\p{N}'’-])/gu;
// "-es" only attaches to a sibilant or -o stem ("gases", "churches", "potatoes"),
// so "Dar es Salaam" / "La vida es sueno" stay split. "-n"/"-ns" is the demonym
// split ("Persia n", "Maya ns") and needs a vowel-final stem of >= 4 chars,
// which keeps "log n", "2 to the n", "ln n", "mod n" and "escalier n" intact.
function splitSuffixOk(stem, suf) {
  if (!SPLIT_SUFFIX.test(suf)) return false;
  if (suf === "es") return /(?:s|x|z|ch|sh|o)$/i.test(stem);
  if (suf === "n" || suf === "ns") return stem.length >= 4 && /[aeiou]$/i.test(stem) && !/^(?:the|una|une|ide|ode|are)$/i.test(stem);
  return true;
}
function healAnswerline(answerline, sanitizedAnswerline) {
  const src = String(answerline || "");
  const healed = new Set();
  const stemBefore = (str, off) => ((stripTags(str.slice(0, off)).match(SPLIT_STEM_RE) || [""])[0]);
  const html = src.includes("<")
    ? src.replace(TAG_SPLIT_RE, (m, t1, t2, suf, off, str) => {
        const lo = suf.toLowerCase();
        if (!splitSuffixOk(stemBefore(str, off), lo)) return m;
        healed.add(lo);
        return t1 + t2 + suf;
      })
    : src;
  let text = String(sanitizedAnswerline || "");
  // The sanitized line has no tags to anchor on, so only repair the exact
  // suffixes the tagged line proved were split — never guess from text alone.
  if (healed.size && text) {
    text = text.replace(TEXT_SPLIT_RE, (m, suf, off, str) => {
      const lo = suf.toLowerCase();
      return healed.has(lo) && splitSuffixOk(stemBefore(str, off), lo) ? suf : m;
    });
  }
  return { answerline: html, sanitized: text };
}

function isDirectiveInner(inner) {
  return /\b(accept|prompt|reject|do not|anti-?prompt)\b/i.test(inner) || /^\s*or\b/i.test(inner);
}

function findContainers(s) {
  const out = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== "[" && c !== "(") continue;
    const close = c === "[" ? "]" : ")";
    let depth = 1, j = i + 1;
    while (j < s.length && depth > 0) {
      if (s[j] === c) depth++;
      else if (s[j] === close) depth--;
      j++;
    }
    out.push({ start: i, text: s.slice(i, j) });
    i = j - 1;
  }
  return out;
}

const STOPWORDS = new Set(["the", "a", "an", "of", "and", "or", "de", "la", "le", "el", "il"]);
function singularize(w) {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 4 && /(s|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 2 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}
function contentWords(norm) {
  return norm.split(/\s+/).filter((w) => w && !STOPWORDS.has(w)).map(singularize);
}

function primaryAnswer(raw, sanitized) {
  ({ answerline: raw, sanitized } = healAnswerline(raw, sanitized));
  const src = (raw && raw.trim()) ? raw : (sanitized || "");
  const containers = findContainers(src);
  const firstDir = containers.find((c) => isDirectiveInner(c.text.slice(1, -1)));
  const mainRaw = firstDir ? src.slice(0, firstDir.start) : src;
  const { vis, spans } = underlineSpans(mainRaw);
  if (spans.length) {
    const fulls = [];
    for (const [s0, e0] of spans) {
      let a = s0, b = e0;
      while (a > 0 && WORD_CHAR.test(vis[a - 1])) a--;
      while (b < vis.length && WORD_CHAR.test(vis[b])) b++;
      const w = vis.slice(a, b).trim();
      if (w) fulls.push(w);
    }
    const joined = fulls.join(" ").trim();
    if (joined) return joined;
  }
  return stripQuotes(stripTags(mainRaw).trim());
}

function frequencyKey(answer) {
  return normalizeText(answer || "").split(/\s+/).filter(Boolean).map(singularize).join(" ");
}

function stemKey(answer) {
  return normalizeText(answer || "")
    .split(/\s+/).filter(Boolean).map(singularize)
    .map((w) => (w.length > 5 ? w.replace(/(ing|ed|ment|ness|tion)$/, "") : w))
    .join("");
}

function answersSimilar(a, b) {
  return similarKeysMatch(similarityKeys(a), similarityKeys(b));
}
// The two normalized forms answersSimilar compares, computed once per answer
// so a frequency merge over thousands of answers doesn't redo them per pair.
function similarityKeys(answer) {
  return { k: frequencyKey(answer).replace(/\s+/g, ""), stem: stemKey(answer) };
}
function similarKeysMatch(x, y) {
  const ka = x.k, kb = y.k;
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  if (x.stem === y.stem) return true;
  const min = Math.min(ka.length, kb.length);
  if (min < 5) return false;
  // A shared stem only counts on longer words: at five letters it was three
  // characters, which folded Chile, Chicago and Chinook into "China".
  if (min >= 8 && ka.slice(0, min - 2) === kb.slice(0, min - 2) && Math.abs(ka.length - kb.length) <= 3) return true;
  const max = Math.max(1, Math.floor(min / 5));
  if (Math.abs(ka.length - kb.length) > max) return false;   // the distance is at least the length gap
  return levenshtein(ka, kb) <= max;
}
// ======================================================================
// Parser: JS port of answerline/scripts/{lexicon,segment,spec_parse}.py (parse half of answerline_spec.md).
const R = String.raw;

// EXT: this module's extensions beyond the reference parser (multi-answer "AND", conditions, mid-list timing,
// several "in place of" slots, glued-damage repairs, ...). Off = byte-for-byte reference behaviour (parity tests).
let EXT = true;
function setParserExt(v) { EXT = !!v; }

// ---------------------------------------------------------------- lexicon
const B = R`(?<![a-z0-9])`;
const E = R`(?![a-z0-9])`;
const DONT = R`(?:under\s+no\s+circumstances(?:\s+(?:should\s+you|should\s+one|may\s+you))?|be\s+careful\s+(?:not\s+to|to\s+not)|do(?:es)?\s+not|do\s*n't|dont|do\s+no|never|should\s+not|shouldn't|must\s+not|may\s+not|cannot|can't|will\s+not|won't|please\s+do\s+not)`;
const ACC = R`(?:accept|acept|accep|acccept|accpet|aceept|accet|accecpt|acceept|accefpt|acceot|accepte|acceptt)`;
const PRO = R`(?:prompt|promt|prmpt|promptt)`;
const ON = R`(?:\s+on)?`;

// [id, type, role, regex]
const KW_DEFS = [
  ["neg_accept_or_prompt", "REJECT_NOPROMPT", "opener", B + DONT + R`\s+(?:ever\s+|otherwise\s+)?(?:` + ACC + R`|take|allow)\s+(?:,\s*)?(?:or|nor|and)\s+(?:anti-?\s?)?` + PRO + R`(?:\s+on)?` + E],
  ["neg_prompt_or_accept", "REJECT_NOPROMPT", "opener", B + DONT + R`\s+` + PRO + R`(?:\s+on)?\s+(?:or|nor)\s+` + ACC + R`(?:\s+on)?` + E],
  ["neg_neither_nor", "REJECT_NOPROMPT", "opener", B + R`neither\s+` + ACC + R`\s+nor\s+` + PRO + ON + E],
  ["neg_no_credit_or_prompt", "REJECT_NOPROMPT", "opener", B + R`no\s+(?:credit|points)\s+(?:or|nor)\s+prompt(?:\s+(?:on|for))?` + E],
  ["neg_do_not_accept", "REJECT", "opener", B + DONT + R`\s+(?:ever\s+|otherwise\s+|yet\s+|actually\s+)?(?:` + ACC + R`|take|allow|award|count|credit|reward)` + E],
  ["neg_do_not_prompt", "NOPROMPT", "opener", B + DONT + R`\s+(?:ever\s+|otherwise\s+)?` + PRO + R`(?:\s+(?:the\s+)?(?:player|team)s?)?` + ON + E],
  ["neg_no_prompt", "NOPROMPT", "opener", B + R`no\s+prompt(?:ing)?(?:\s+(?:on|for))?` + E],
  ["neg_no_need_to_prompt", "NOPROMPT", "opener", B + R`no\s+need\s+to\s+prompt` + ON + E],
  ["neg_reject", "REJECT", "opener", B + R`(?:reject|rejct|rejects|rejected)` + E],
  ["neg_no_credit", "REJECT", "opener", B + R`no\s+(?:credit|points)\s+(?:for|on)` + E],
  ["neg_not_acceptable", "REJECT", "postfix", B + R`(?:(?:is|are)\s+)?(?:not\s+(?:acceptable|accepted|allowed|correct|sufficient|enough|good\s+enough)|unacceptable|insufficient|incorrect)` + E],
  ["neg_but_not", "REJECT", "connector", B + R`but\s+not` + E + R`(?!\s+(?:before|until|after|once|if|when|just|only|necessarily|limited|always))`],
  ["neg_no_other", "REJECT", "postfix", B + R`no\s+other\s+(?:answers?|words?|names?)\s+(?:is\s+|are\s+)?(?:acceptable|accepted|allowed)` + E],
  ["neutral_do_not_reveal", "NEUTRAL", "opener", B + DONT + R`\s+(?:otherwise\s+)?(?:reveal|read(?:\s+out)?|say|mention|tell|announce|repeat|give\s+away|volunteer)` + E + R`(?!\s+(?:accept|prompt))`],
  ["anti_prompt", "ANTIPROMPT", "opener", B + R`anti\s*-?\s*p?` + PRO + R`(?:s|ed|ing)?` + ON + E],
  ["reverse_prompt", "ANTIPROMPT", "opener", B + R`reverse\s*-?\s*prompt` + ON + E],
  ["ask_less_specific", "ANTIPROMPT", "opener", B + R`(?:ask(?:\s+(?:them|the\s+player|the\s+team))?|` + PRO + R`(?:\s+(?:them|the\s+player))?)\s+(?:for|to\s+be)\s+(?:a\s+)?(?:less\s+specific(?:ity)?|more\s+general)(?:\s+answer)?` + ON + E],
  ["prompt_partial", "PROMPT_PARTIAL", "opener", B + PRO + R`\s+on\s+(?:any\s+|a\s+)?(?:partial|incomplete)(?:\s+answers?)?` + E],
  ["prompt_less_specific", "PROMPT_PARTIAL", "opener", B + PRO + R`\s+on\s+(?:any\s+)?(?:less\s+specific|more\s+general|vaguer|general)(?:\s+answers?)?` + E],
  ["directed_prompt", "PROMPT", "opener", B + R`directed\s+prompt` + ON + E],
  ["prompt_with", "PROMPT", "opener", B + PRO + R`\s+with` + E],
  ["prompt_on", "PROMPT", "opener", B + PRO + R`(?:s|ed|ing)?(?:\s+(?:the\s+)?(?:player|team|reader)s?)?\s*on` + E],
  ["prompt_bare", "PROMPT", "opener", B + PRO + R`(?:s|ed)?` + E],
  ["ask_more_specific", "PROMPT", "opener", B + R`ask(?:\s+(?:them|the\s+player|the\s+team|for))?\s+(?:for\s+|to\s+be\s+)?(?:a\s+)?more\s+(?:specific|information|detail)` + E],
  ["ask_for", "PROMPT", "opener", B + R`ask\s+(?:them\s+)?for` + E],
  ["ask_spell", "PROMPT", "opener", B + R`(?:ask|have)\s+(?:the\s+)?(?:players?|them|teams?|the\s+team)?\s*(?:to\s+)?(?:spell|for\s+(?:a\s+|the\s+)?spelling)` + E],
  ["cond_if", "CONDITIONAL", "opener", B + R`if\s+(?:they|someone|somebody|anyone|a\s+player|the\s+player|players|a\s+team|the\s+team|the\s+answerer)\s+(?:\w+\s+){0,2}?(?:answers?|says?|gives?|buzz(?:es)?|responds?|offers?|provides?|mentions?)` + E],
  ["portion_either", "PORTION", "opener", B + R`(?:(?:also|and)\s+)?` + ACC + R`\s+(?:either|any|each)\s+(?:one\s+)?(?:of\s+the\s+)?(?:underlined|bolded|bold(?:ed)?\s*(?:and|/)?\s*underlined|capitali[sz]ed)\s+(?:portions?|parts?|names?|answers?|words?|terms?|sections?|pieces?|halves|half|items?|options?|segments?|components?|elements?|ones?)?`],
  ["portion_either_part", "PORTION", "opener", B + ACC + R`\s+(?:either|any)\s+(?:one\s+)?(?:of\s+the\s+)?(?:portions?|parts?|names?|halves|half|words?|surnames?)(?:\s+alone)?` + E + R`(?=\s*(?:$|[,;.)\]]|or\s+both|(?:is|are)\s|alone|by\s+itself|(?:but|and)\s))`],
  ["portion_postfix", "PORTION", "postfix", B + R`(?:either|any|each)\s+(?:one\s+)?(?:of\s+the\s+)?(?:underlined\s+)?(?:portions?|parts?|names?|answers?|words?|one|is)\s+(?:(?:is|are|alone\s+is)\s+)?(?:acceptable|fine|ok|okay|sufficient|enough|accepted|good|correct)` + E],
  ["portion_both_required", "PORTION", "requirement", B + R`(?:both|all|all\s+(?:two|three|four|five))\s+(?:of\s+the\s+)?(?:underlined\s+|bolded\s+)?(?:portions?|parts?|names?|answers?|words?|terms?|pieces?|halves|items?|people|persons|countries|elements|components)?\s*(?:are\s+|is\s+)?(?:required|needed|necessary|must\s+be\s+(?:given|said|mentioned))` + E],
  ["portion_ref", "PORTION", "scope", B + R`(?:non-?\s?)?underlin(?:ed|e|ing)` + E],
  ["req_accept_either_order", "REQUIREMENT", "opener", B + ACC + R`\s+(?:(?:the\s+)?(?:names?|answers?|parts?|terms?|words?|items?|them)\s+)?(?:(?:given|said)\s+)?(?:in\s+)?(?:either|any|reverse(?:d)?)\s+order` + E],
  ["req_both", "REQUIREMENT", "requirement", B + R`(?:(?:both|all\s+(?:two|three|four|five|of\s+them)|each)\s+(?:\w+\s+){0,2}(?:are\s+|is\s+)?(?:required|needed|necessary)|(?:need|needs|require|requires|must\s+(?:give|name|say|get|include|have|mention))\s+(?:both|all|each)|both\s+must\s+be)` + E],
  ["req_either_order", "REQUIREMENT", "requirement", B + R`(?:(?:in|at)\s+)?(?:either|any)\s+order|order\s+(?:does\s+not|doesn't|is\s+not|isn't)\s+(?:matter|important|required)|(?:may|can)\s+be\s+(?:given\s+)?(?:reversed|in\s+(?:either|any)\s+order)|(?:order|number)\s+(?:is\s+)?not\s+important|(?:order|number)\s+(?:does\s+not|doesn't)\s+matter|reversed` + E],
  ["req_fixed_order", "REQUIREMENT", "requirement", B + R`(?:must|should)\s+be\s+(?:given\s+)?in\s+(?:that|this|the\s+correct|the\s+right|order)|order\s+(?:must|should)\s+be\s+correct|in\s+(?:that|this)\s+order` + E],
  ["req_any_n", "REQUIREMENT", "requirement", B + R`(?:any|name|give)\s+(?:one|two|three|four|five|2|3|4|5)\s+(?:of|from)` + E],
  ["req_exact", "REQUIREMENT", "requirement", B + R`(?:exact|full|complete|specific)\s+(?:answer|phrase|wording|title|name|term|words?)\s+(?:is\s+|are\s+)?(?:required|needed|necessary)|(?:answer|response)\s+must\s+(?:be|contain|include)|the\s+words?\s+"[^"]+"\s+(?:is|are)\s+(?:required|needed)` + E],
  ["req_do_not_need", "REQUIREMENT", "opener", B + R`(?:(?:do|does)\s*(?:not|n't)\s+(?:need|require)|no\s+need\s+for|need\s+not\s+(?:say|give|include)|only\s+need(?:s)?)` + E],
  ["req_not_needed", "REQUIREMENT", "postfix", B + R`(?:is|are|isn't|aren't)?\s*(?:not\s+)?(?:needed|required|necessary)\s+(?:after|once|if|when)` + E],
  ["acc_word_forms", "ACCEPT_CLASS", "scope", B + R`word[- ]?forms?` + E],
  ["acc_equivalents", "ACCEPT_CLASS", "scope", B + R`(?:(?:obvious|reasonable|clear|clear-knowledge|close|logical|descriptive|equivalent|other|similar|exact|direct|phonetic|translated|foreign(?:-language)?|english|any|technical|near|synonymous)\s+)*(?:equivalents?|equivalences?|equivalent\s+(?:answers?|descriptions?|terms?|phrases?|names?))` + E],
  ["acc_synonyms", "ACCEPT_CLASS", "scope", B + R`synonyms?` + E],
  ["acc_descriptions", "ACCEPT_CLASS", "scope", B + R`(?:descriptions?|descriptive\s+answers?|descriptive\s+equivalents?|description\s+(?:is\s+)?(?:acceptable|accepted|ok|okay|fine))` + E],
  ["acc_answers_mentioning", "ACCEPT_CLASS", "scope", B + R`(?:answers?|anything|responses?|things?|descriptions?)\s+(?:that\s+(?:mention|involve|include|indicate|imply|describe|refer|contain|reference|explain|convey|suggest|show|specify|capture|say|identify|name)s?|(?:mentioning|involving|including|indicating|implying|describing|referring\s+to|containing|referencing|explaining|conveying|suggesting|specifying|about|regarding|related\s+to|relating\s+to|to\s+the\s+effect|along\s+the\s+lines|with)|like|such\s+as)` + E],
  ["acc_similar", "ACCEPT_CLASS", "scope", B + R`(?:similar(?:\s+answers?)?|anything\s+similar|the\s+like|etc\.?|and\s+so\s+on|so\s+forth)` + E],
  ["acc_specific", "ACCEPT_CLASS", "scope", B + R`(?:more\s+specific|specific\s+(?:types?|kinds?|examples?|answers?|instances?|forms?|varieties|names?))` + E],
  ["acc_translation", "ACCEPT_CLASS", "scope", B + R`(?:translations?|translated|transliterations?|(?:original[- ]language|foreign[- ]language|native[- ]language)\s+(?:titles?|names?|forms?|equivalents?))` + E],
  ["acc_spellings", "ACCEPT_CLASS", "scope", B + R`(?:alternate\s+|alternative\s+|variant\s+|other\s+)?(?:spellings?|misspellings?|transliterations?)` + E],
  ["acc_abbrev", "ACCEPT_CLASS", "scope", B + R`(?:abbreviations?|acronyms?|initialisms?|symbols?)` + E],
  ["acc_also", "ACCEPT", "opener", B + R`(?:also|likewise|additionally|further|similarly)\s+` + ACC + E + "|" + B + ACC + R`\s+also` + E],
  ["acc_accept", "ACCEPT", "opener", B + ACC + R`(?:s|ed|ing)?` + E],
  ["acc_or", "ACCEPT", "opener", B + R`or(?=[\s:,"']|$)`],
  ["acc_accept_glued", "ACCEPT", "opener", B + R`accept(?!(?:able|ably|ance|ances|ed|ing|s|or|ors|ation|ations|ability)(?![a-z]))(?=[a-z])`],
  ["prompt_on_glued", "PROMPT", "opener", B + R`prompt\s?on(?!(?:ly|e|es|ce)(?![a-z]))(?=[a-z])`],
  ["acc_take", "ACCEPT", "opener", B + R`take` + E],
  ["acc_allow", "ACCEPT", "opener", B + R`allow` + E],
  ["acc_count", "ACCEPT", "opener", B + R`(?:give\s+(?:credit|points)\s+(?:for|to)|award\s+(?:points|credit)\s+(?:for|to)|count\s+as\s+correct)` + E],
  ["acc_postfix", "ACCEPT", "postfix", B + R`(?:(?:is|are)\s+(?:also\s+)?(?:acceptable|fine|ok|okay|allowed|good(?:\s+enough)?|sufficient|correct|accepted)|acceptable|(?:ok|okay|fine)(?=\s*(?:$|[,;.)\]])))` + E],
  ["acc_acceptable_lead", "ACCEPT", "opener", B + R`(?:other\s+)?acceptable\s+(?:\w+\s+)?(?:include|are)` + E],
  ["len_be_lenient", "LENIENCY", "opener", B + R`be\s+(?:very\s+)?(?:lenient|generous|liberal|forgiving|flexible)(?:\s+(?:with|on|about|in|regarding|toward|towards|for))?` + E],
  ["len_pronunciation", "LENIENCY", "scope", B + R`(?:pronunciations?|phonetic(?:ally)?|mispronunciations?|pronounced)` + E],
  ["note_moderator", "NOTE", "note", B + R`(?:\*?\s*note\s+(?:to|for)\s+(?:the\s+)?(?:moderators?|readers?|scorekeepers?|mods?)|(?:moderator|reader)(?:'s|s')?\s*note|moderator\s*:|reader\s*:)` + E],
  ["note_players", "NOTE", "note", B + R`note\s+(?:to|for)\s+(?:the\s+)?(?:players?|teams?|contestants?)` + E],
  ["note_editor", "NOTE", "note", B + R`(?:(?:ed|eds|editor|editors|writer|writers|author|authors|setter|packet)(?:'s|s'|s)?\s*\.?\s*note|ed\.\s*note)` + E],
  ["note_generic", "NOTE", "note", B + R`(?:\*?note\*?\s*[:\-]|n\.\s?b\.?|nb\s*:)`],
  ["pron_pronounced", "PRONUNCIATION", "pron", B + R`(?:pronounced|pronunciation|pron\.|rhymes\s+with|sounds\s+like|say\s+it\s+as)` + E],
  ["expl_clue_ref", "EXPLANATION", "explanation", B + R`(?:the\s+)?(?:first|second|third|fourth|fifth|sixth|last|final|early|earlier|opening|previous|other|unnamed|unmentioned|described|mentioned|referenced|quoted|former|latter|lead-?in)\s+(?:\w+\s+){0,2}(?:clues?|lines?|sentences?|parts?|works?|novel|poem|play|story|book|film|painting|piece|essay|song|character|author|artist|composer|quote|quotation|passage|excerpt|person|figure|one|is|was|are|refers?|describes?)` + E],
  ["acc_range", "ACCEPT_CLASS", "scope", B + R`(?:(?:any\s+)?(?:single\s+)?(?:numbers?|values?|answers?|years?|dates?|times?|time\s+periods?|figures?)\s+(?:between|from)\s+[\d.,]+\s*(?:and|to|-)\s*[\d.,]+|between\s+[\d.,]+\s+and\s+[\d.,]+|within\s+[\d.,]+\s*%?\s+of)` + E + R`|(?:±|\+/-)\s*[\d.]+`],
];
KW_DEFS.push(["acc_acceptable_lead_ext", "ACCEPT", "opener", B + R`(?:other\s+)?acceptable\s+(?:\w+\s+){1,2}(?:include|are)` + E]);
const KW = {};
const OPENERS = [];
for (const [id, type, role, rx] of KW_DEFS) {
  const e = { id, type, role, rx, y: new RegExp(rx, "iy"), g: new RegExp(rx, "ig") };
  KW[id] = e;
  if (role === "opener") OPENERS.push(e);
}
const WEAK_START_ONLY = new Set(["acc_accept_glued", "prompt_on_glued", "acc_or", "acc_take", "acc_allow", "prompt_bare", "ask_for", "cond_if", "len_be_lenient", "neutral_do_not_reveal", "req_do_not_need"]);

// regex helpers mirroring Python's re.match(s, pos, end) / re.search(s, a, b)
function sub(s, end) { return end != null && end < s.length ? s.slice(0, end) : s; }
function matchAt(re, s, pos, end) { // re: sticky
  re.lastIndex = pos;
  const m = re.exec(sub(s, end));
  return m;
}
function searchIn(re, s, a, b) { // re: global
  re.lastIndex = a || 0;
  return re.exec(sub(s, b));
}
function* findIter(re, s, a, b) {
  const str = sub(s, b);
  re.lastIndex = a || 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    yield m;
    if (m[0].length === 0) re.lastIndex++;
  }
}
const mEnd = (m) => m.index + m[0].length;
const isSpace = (c) => c != null && /\s/.test(c);
const isAlnum = (c) => c != null && /[\p{L}\p{N}]/u.test(c);
const strip = (s) => s.replace(/^\s+|\s+$/g, "");
const words = (s) => strip(s).split(/\s+/).filter(Boolean);

// norm(): curly quotes -> straight, NBSP -> space, dashes -> "-", lower-case one char at a time (length preserving)
const NORM_MAP = { "“": '"', "”": '"', "„": '"', "″": '"', "‘": "'", "’": "'", "`": "'", " ": " ", " ": " ", "–": "-", "—": "-" };
function normKw(s) {
  let out = "";
  for (const ch of s) {
    const m = NORM_MAP[ch];
    if (m !== undefined) { out += m; continue; }
    const l = ch.toLowerCase();
    out += l.length === ch.length ? l : ch;
  }
  return out;
}

// ---------------------------------------------------------------- styles (fmt/markup.py)
const TAG_RE = /<(\/?)([buiBUI])>/g;
function styleMap(html) {
  html = html || "";
  let text = "";
  const b = [], u = [], it = [], tb = [];
  const stack = [];
  let pos = 0, m, pend = false;
  TAG_RE.lastIndex = 0;
  const push = (seg) => {
    const fb = stack.includes("b"), fu = stack.includes("u"), fi = stack.includes("i");
    for (let k = 0; k < seg.length; k++) { b.push(fb); u.push(fu); it.push(fi); tb.push(k === 0 && pend); }
    pend = false;
    text += seg;
  };
  while ((m = TAG_RE.exec(html)) !== null) {
    if (m.index > pos) push(html.slice(pos, m.index));
    pos = m.index + m[0].length;
    if (/[bu]/i.test(m[2])) pend = true;
    const name = m[2].toLowerCase();
    if (m[1]) {
      const i = stack.lastIndexOf(name);
      if (i >= 0) stack.splice(i, 1);
    } else stack.push(name);
  }
  if (pos < html.length) push(html.slice(pos));
  return { text, b, u, it, tb };
}

// ---------------------------------------------------------------- segment.py
const LEADIN_RX = new RegExp(R`\s*(?:(?:but|and|also|however,?|otherwise,?|then,?|so,?|thus,?|still,?|even|just|only|additionally,?|finally,?|further(?:more)?,?|` +
  R`(?:very,?\s+)*(?:generously|grudgingly|begrudgingly|grudingly|reluctantly|leniently|liberally|happily|enthusiastically|cheerfully|gladly|charitably|kindly)|` +
  R`i\s+guess|i\s+suppose|i\s+think|(?:you|we|moderators?|readers?)\s+(?:can|could|may|might|should)(?:\s+also)?|we'll|go\s+ahead\s+and|feel\s+free\s+to|please|sure,?|ok,?|` +
  R`let's\s+be\s+(?:generous|nice|lenient)\s+and|be\s+careful\s+and|roll\s+your\s+eyes\s+(?:and|as\s+you)|might\s+as\s+well|to\s+be\s+(?:nice|safe|fair|generous),?|apparently(?:\s+you\s+can(?:\s+also)?)?|basically,?|generally,?|specifically,?|definitely|obviously,?|` +
  R`as\s+always,?|as\s+usual,?|of\s+course,?|be\s+(?:very\s+)?(?:lenient|generous|liberal|nice|kind),?\s+and|` +
  R`\*+|-+|:|,|\.)(?![a-z0-9]))+`, "iy");
const FRONT_TIMING_RX = new RegExp(R`\s*(?:(?:before|until|till|after|once|prior\s+to|on|in|during|for|in\s+place\s+of|instead\s+of|if)\s+[^,;]{1,80}?,)\s*(?=(?:also\s+|generously\s+|just\s+|only\s+)?(?:accept|prompt|reject|do\s+not|don't|anti|or\b|take\b|allow\b))`, "iy");
const NOTE_START = new RegExp(R`\s*(?:\*+\s*)?(?:` + KW.note_moderator.rx + "|" + KW.note_players.rx + "|" + KW.note_editor.rx + "|" + KW.note_generic.rx + ")", "iy");
const PRON_START = /\s*(?:it'?s\s+|often\s+|roughly\s+|usually\s+)?(?:pronounced|pronunciation|pron\.|rhymes\s+with|sounds\s+like)/iy;
const EXPL_START = new RegExp(R`\s*` + KW.expl_clue_ref.rx, "iy");
const PROSE_VERB = /\b(?:is|are|was|were|refers?|referred|refer|mean(?:s|t)?|denotes?|comes?|came|played|appears?|occurs?|happened|wrote|written|contains?|includes?|depicts?|describes?|described|has|have|had|represents?|stands?|stars?|features?|took|made|lived|called|named|known|by)\b/i;
const ANY_KW = new RegExp(B + R`(?:acc?c?e?c?pt\w*|prompt\w*|promt|reject\w*|anti-?\s?prompt\w*|do\s+not|don't|dont|never|underlined|equivalents?|word\s+forms?|required|either\s+order)` + E, "i");
const PRON_GUIDE = /^\s*"?[a-z'\- ]{1,40}"?\s*$/i;

function findGroups(s) {
  const pairs = { "]": "[", ")": "(", "}": "{" };
  const st = [], out = [];
  let stray = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "[" || ch === "(" || ch === "{") st.push([ch, i]);
    else if (ch === ")" || ch === "]" || ch === "}") {
      if (st.length && st[st.length - 1][0] === pairs[ch]) {
        const [o, j] = st.pop();
        if (!st.length) out.push({ open: o, start: j, end: i + 1, istart: j + 1, iend: i, closed: true });
      } else if (st.length && st.some((x) => x[0] === pairs[ch])) {
        while (st.length && st[st.length - 1][0] !== pairs[ch]) st.pop();
        const [o, j] = st.pop();
        if (!st.length) out.push({ open: o, start: j, end: i + 1, istart: j + 1, iend: i, closed: true });
      } else stray++;
    }
  }
  if (st.length) {
    const [o, j] = st[0];
    out.push({ open: o, start: j, end: s.length, istart: j + 1, iend: s.length, closed: false });
  }
  out.sort((x, y) => x.start - y.start);
  return [out, stray];
}

function splitTop(s, a, b, seps = ";") {
  const out = [];
  let d = 0, cs = a;
  for (let i = a; i < b; i++) {
    const ch = s[i];
    if (ch === "[" || ch === "(" || ch === "{") d++;
    else if (ch === "]" || ch === ")" || ch === "}") d = Math.max(0, d - 1);
    else if (seps.includes(ch) && d === 0) { out.push([cs, i]); cs = i + 1; }
  }
  out.push([cs, b]);
  return out;
}

function matchOpener(s, pos, end, atStart = true) {
  let best = null;
  for (const e of OPENERS) {
    if (!atStart && WEAK_START_ONLY.has(e.id)) continue;
    if (!EXT && e.id === "acc_acceptable_lead_ext") continue;
    const m = matchAt(e.y, s, pos, end);
    if (m && (best === null || mEnd(m) > mEnd(best[1]))) best = [e, m];
  }
  return best || [null, null];
}

function stripLeadins(s, pos, end) {
  const leadins = [];
  for (;;) {
    let m = matchAt(FRONT_TIMING_RX, s, pos, end);
    if (m && mEnd(m) > pos) {
      const txt = strip(s.slice(pos, mEnd(m)));
      const kind = txt.startsWith("if ") ? "conditional" : (/^(?:in\s+place\s+of|instead\s+of|for)\s/.test(txt) ? "substitution" : "front_timing");
      leadins.push([kind, txt]);
      pos = mEnd(m);
      continue;
    }
    m = matchAt(LEADIN_RX, s, pos, end);
    if (m && mEnd(m) > pos && strip(s.slice(pos, mEnd(m)))) {
      leadins.push(["leadin", strip(s.slice(pos, mEnd(m)))]);
      pos = mEnd(m);
      continue;
    }
    break;
  }
  while (pos < end && ' \t"*'.includes(s[pos])) {
    if (s[pos] === '"' && !/^"\s*(?:accept|prompt|reject|do\s+not|or\b|anti)/.test(s.slice(pos, pos + 12))) break;
    pos++;
  }
  return [pos, leadins];
}

const SWITCH_SCAN = new RegExp(B + R`(?:acc?c?e?c?pt|prompt|promt|reject|anti|reverse|directed|do|don't|dont|never|neither|no|also|ask)`, "ig");
function findSwitches(s, pos, end) {
  const out = [];
  let i = pos;
  // EXT: a keyword inside quotes is part of the quoted answer (reject “willingness to accept” or “WTA”)
  const qr = EXT ? maskQuotes(s, pos, end) : null;
  while (i < end) {
    const m = searchIn(SWITCH_SCAN, s, i, end);
    if (!m) break;
    if (qr && inRuns(qr, m.index + (m[0].length - m[0].trimStart().length))) { i = mEnd(m); continue; }
    const [e, mm] = matchOpener(s, m.index, end, false);
    if (e !== null && e.type !== "ACCEPT_CLASS") { out.push([e, mm]); i = mEnd(mm); }
    else i = mEnd(m);
  }
  return out;
}

function classifyGroup(s, g) {
  const a = g.istart, b = g.iend;
  const inner = s.slice(a, b);
  if (g.open === "[" && inner.startsWith("[") && inner.endsWith("]")) return "pron";
  if (g.open === "{") return "tag";
  if (!strip(inner)) return "empty";
  for (const [cs, ce] of splitTop(s, a, b)) {
    const [p] = stripLeadins(s, cs, ce);
    const [e] = matchOpener(s, p, ce);
    if (e !== null) return "directive";
  }
  if (EXT && ["portion_postfix", "acc_postfix", "neg_not_acceptable", "req_both", "req_either_order", "portion_both_required", "req_exact", "neg_no_other"].some((id) => { const re = KW[id].g; re.lastIndex = 0; return re.test(inner); })) return "directive";
  if (matchAt(NOTE_START, inner, 0)) return "note";
  if (matchAt(PRON_START, inner, 0)) return "pron";
  if (ANY_KW.test(inner)) return "directive";
  const ws = words(inner);
  const before = g.start > 0 ? s[g.start - 1] : " ";
  const after = g.end < s.length ? s[g.end] : " ";
  if ((isAlnum(before) || isAlnum(after)) && ws.length <= 4) return "optional";
  if (PRON_GUIDE.test(inner) && (inner.includes('"') || /[a-z]-[a-z]/.test(inner)) && ws.length <= 4) return "pron";
  if (matchAt(EXPL_START, inner, 0) || (ws.length >= 4 && PROSE_VERB.test(inner))) return "explanation";
  const rest = s.slice(g.end);
  if (ws.length <= 3 && g.end < s.length && strip(rest) && !/^\s*[\[(]/.test(rest)) return "optional";
  if (ws.length > 6) return "explanation";
  return "bare_alt";
}

const POSTFIX_IDS = ["portion_postfix", "acc_postfix", "neg_not_acceptable", "req_both", "req_either_order", "portion_both_required", "req_exact", "req_not_needed", "neg_no_other"];
function segParse(s) {
  const out = { label: "", head: null, groups: [], clauses: [], stray_closers: 0 };
  const m = /^\s*(?:answers?|ans\.?)\s*:\s*/i.exec(s);
  const start = m ? m[0].length : 0;
  if (m) out.label = strip(s.slice(0, m[0].length));
  let [groups, stray] = findGroups(s);
  groups = groups.filter((g) => g.start >= start);
  out.stray_closers = stray;
  let firstDir = null;
  for (const g of groups) {
    g.kind = classifyGroup(s, g);
    if (g.kind === "directive" && firstDir === null) firstDir = g.start;
  }
  out.groups = groups;
  out.head = [start, firstDir !== null ? firstDir : s.length];
  groups.forEach((g, gi) => {
    if (!["directive", "note", "bare_alt", "explanation"].includes(g.kind)) return;
    for (const [cs, ce] of splitTop(s, g.istart, g.iend)) {
      if (!strip(s.slice(cs, ce))) continue;
      const [p, leadins] = stripLeadins(s, cs, ce);
      const [e, mm] = matchOpener(s, p, ce);
      const cl = { g: gi, gkind: g.kind, start: cs, end: ce, text: s.slice(cs, ce), leadins, opener: null, type: null, body_start: p, switches: [], postfix: [] };
      if (e !== null) {
        let oid = e.id;
        if (oid === "acc_accept" && leadins.length && leadins[leadins.length - 1][1].replace(/,+$/, "").endsWith("also")) oid = "acc_also";
        cl.opener = oid; cl.type = e.type; cl.body_start = mEnd(mm);
      } else if (matchAt(NOTE_START, s, cs, ce)) cl.type = "NOTE";
      else if (matchAt(PRON_START, s, cs, ce)) cl.type = "PRONUNCIATION";
      else if (g.kind === "explanation" || matchAt(EXPL_START, s, cs, ce)) cl.type = "EXPLANATION";
      cl.switches = findSwitches(s, cl.body_start, ce);
      for (const pid of POSTFIX_IDS) {
        const pm = searchIn(KW[pid].g, s, cl.body_start, ce);
        if (pm) cl.postfix.push([pid, pm.index, mEnd(pm)]);
      }
      if (cl.type === null) {
        if (EXT && cl.postfix.length) {
          const neg = cl.postfix.find(([pid]) => pid === "neg_not_acceptable" || pid === "neg_no_other");
          if (neg) cl.postfix = [neg].concat(cl.postfix.filter((x) => x !== neg));
          if (/^\s*no\s+other\b/.test(s.slice(cs, ce))) cl.postfix = [["neg_no_other", cl.body_start, cl.body_start]].concat(cl.postfix);
        }
        if (cl.postfix.length) cl.type = KW[cl.postfix[0][0]].type;
        else if (g.kind === "bare_alt") cl.type = words(s.slice(cs, ce)).length <= 6 ? "BARE_ALTERNATE" : "EXPLANATION";
        else if (g.kind === "note") cl.type = "NOTE";
        else cl.type = "UNTYPED";
      }
      out.clauses.push(cl);
    }
  });
  return out;
}

// ---------------------------------------------------------------- spec_parse.py
const KIND_OF_TYPE = {
  ACCEPT: "accept", BARE_ALTERNATE: "accept", PORTION: "portion", PROMPT: "prompt", PROMPT_PARTIAL: "prompt_partial",
  ANTIPROMPT: "antiprompt", REJECT: "reject", REJECT_NOPROMPT: "reject_noprompt", NOPROMPT: "noprompt", REQUIREMENT: "requirement",
  LENIENCY: "lenient", CONDITIONAL: "conditional", NEUTRAL: null, NOTE: "note", EXPLANATION: null, PRONUNCIATION: null, UNTYPED: null,
};
const NEG = new Set(["reject", "reject_noprompt", "noprompt"]);

const W = R`[\p{L}\p{N}_]`;
const TIMING_KW = new RegExp(B + R`(?:before|until|till|'til|til|up\s+(?:to|until)|prior\s+to|after|once|as\s+soon\s+as)` + E, "ig");
const SELF_MARK = new RegExp(R`\s*(?:(?:it|they|each|both|either|these|those|this|that|the\s+(?:name|word|term|answer)s?|its|their|his|her)\s+)?` +
  R`(?:(?:is|are|'s|'re|has\s+been|have\s+been|being|gets|get|was|were)\s+)?` +
  R`(?:read|mentioned|mention|said|given|stated|named|revealed|clued|spoken|heard|uttered|metioned)` + E +
  R`|\s*(?:its|their|his|her|respective)\s+(?:mention|name|reading)s?` + E +
  R`|\s*(?:mention|reading)` + E, "iy");
const QUOTED_MARK = /\s*(?:the\s+words?\s+|(?:the\s+)?(?:first\s+)?(?:mention|reading)\s+of\s+(?:the\s+words?\s+)?)?(?:"[^"]{1,80}"|'[^']{1,60}')(?:\s*(?:is|are|has\s+been|have\s+been)?\s*(?:read|mentioned|said|given|stated|named|revealed))?/iy;
const CLUE_MARK = new RegExp(R`\s*(?:the\s+)?(?:end(?:\s+of\s+(?:the\s+)?(?:question|tossup|bonus|clue|part|(?:first|second|third|last|final|opening)\s+(?:line|sentence|clue)))?|giveaway|ftp|for\s+(?:10|ten)\s+points|\(\*\)|\*|power(?:\s*mark)?|` +
  R`(?:first|second|third|fourth|last|final|opening)\s+(?:line|sentence|clue)s?|lead-?in)` + E + R`(?:\s+(?:is|are|has\s+been)\s+(?:read|reached|said))?|\s*"for\s+(?:10|ten)\s+points,?"`, "iy");
const BARE_MARK = new RegExp(R`\s*(?:(?:the\s+)?(?:first\s+)?mention\s+of\s+[\p{L}\p{N}_'\-.]+(?:\s+[\p{L}\p{N}_'\-.]+){0,3}(?=\s*$|\s*[,;)\]]|\s+(?:and|but|or|by|with)\b)|[\p{L}\p{N}_'\-.]+(?:\s+[\p{L}\p{N}_'\-.]+){0,4}?\s+(?:is|are|has\s+been|have\s+been)\s+(?:read|mentioned|said|given|stated|named)` + E + ")", "iuy");
const BARE_WORDS = /\s*[\p{L}\p{N}_'\-.]+(?:\s+[\p{L}\p{N}_'\-.]+){0,3}\s*(?=$|[,;)\]]|\s+(?:and|but|or|by|with|then)\b)/iuy;
const NOMARK_TIMING = new RegExp(B + R`(?:afterwards?|thereafter|after\s+that|after\s+this|from\s+then\s+on|subsequently|at\s+any\s+(?:point|time|stage)|at\s+all\s+times|` +
  R`(?:(?:during|in|on)\s+the\s+(?:first|second|third|opening|last|final)\s+(?:line|sentence|clue)s?)|even\s+at\s+the\s+end|early(?:\s+buzz(?:es|ing)?)?(?=\s*(?:$|[,;.)\]]|\s(?:on|in\s+the|before|if|but|and)\b)))` + E, "ig");
const DIRECTED = new RegExp(B + R`(?:by\s+(?:asking|saying|requesting)|asking|and\s+ask|ask|with(?:\s+the\s+(?:question|prompt))?)\s*[:,]?\s*(?=["']|(?:what|which|who|whom|whose|where|when|how|why|for)\b)`, "ig");
const SCOPE_PRE = /^\s*(?:just|only|merely|solely|simply)\s+/i;
const SCOPE_POST = /\s+(?:alone|by\s+itself|by\s+themselves|on\s+its\s+own|on\s+their\s+own)\s*$/i;
const SUBST = new RegExp(B + R`(?:in\s+place\s+of|instead\s+of|in\s+lieu\s+of|for)\s+("[^"]+"|'[^']+'|[\p{L}\p{N}_\-]+(?:\s+[\p{L}\p{N}_\-]+){0,2})`, "igud");
const COMMENTARY_CUT = new RegExp(B + R`(?:unless|since|because|as\s+long\s+as|so\s+long\s+as|provided|even\s+though|although)` + E, "ig");
const TRAIL_HEDGE = /\s+(?:i\s+guess|i\s+suppose|grudgingly|begrudgingly|reluctantly|if\s+you\s+must|i\s+think)\s*[.!]?\s*$/i;
const CONTAIN = new RegExp(R`^\s*(?:[\p{L}\p{N}_-]+\s+){0,3}?(?:answers?|anything|responses?|descriptions?|things?|equivalents?|terms?|phrases?)\s+` +
  R`(?:that\s+(?:[\p{L}\p{N}_]+\s+)?(?:mention|involve|include|indicate|imply|describe|refer|contain|reference|explain|convey|suggest|show|specify|capture|say|identify|name)s?(?:\s+to)?|` +
  R`(?:which|who)\s+(?:mention|indicate|describe|refer)s?(?:\s+to)?|` +
  R`mentioning|involving|including|indicating|implying|describing|referring\s+to|containing|referencing|explaining|conveying|suggesting|specifying|` +
  R`about|regarding|related\s+to|relating\s+to|to\s+the\s+effect\s+(?:of|that)|along\s+the\s+lines\s+of|with|of)` + E, "iu");
const EXAMPLES = new RegExp(B + R`(?:such\s+as|like|e\.g\.,?|including|for\s+example|for\s+instance|i\.e\.,?)` + E, "ig");
const BARE_SW = /(?:,|\band\b|\bbut\b|\bthen\b|\botherwise\b)\s+(prompt)(?=\s+(?:afterwards?|after|before|until|thereafter|if|when|once|later|otherwise)\b|\s*[,;.)\]]|\s*$)/igd;
const PARTIAL_WORD = new RegExp(B + R`(?:partial|incomplete)(?:\s+(?:last\s+|first\s+)?(?:answers?|names?|titles?|credit|responses?))?` + E, "i");
const PARTIAL_WORD_G = new RegExp(PARTIAL_WORD.source, "ig");
const LESS_SPECIFIC = new RegExp(B + R`(?:less\s+specific|more\s+general|vaguer|general)(?:\s+answers?)?` + E, "i");
const CLASSY = /^\s*(?:and\s+|or\s+)?(?:any\s+|other\s+|all\s+|similar\s+|reasonable\s+|obvious\s+|clear(?:-knowledge)?\s+|rough\s+|close\s+|logical\s+|generic\s+|general\s+|vague\s+|broad\s+|partial\s+|incomplete\s+|less\s+specific\s+|more\s+specific\s+)*(?:equivalents?|word\s*forms?|synonyms?|descriptions?|answers?|anything|similar|translations?|specific|abbreviations?|forms?|variants?|etc\b|the\s+like|so\s+on|misspellings?|spellings?|things\s+like|terms?\s+(?:like|for|such))/i;

const OPEN_RX = /\b(?:equivalents?|synonyms?|descriptions?|descriptive|translations?|similar|variations?|paraphrases?|abbreviations?|nicknames?|(?:in|into)\s+(?:french|spanish|german|italian|latin|greek|russian|chinese|japanese|arabic|hebrew|portuguese|dutch|english|any\s+(?:other\s+)?language)|reasonable\s+(?:answers?|equivalents?|descriptions?)|clear-knowledge|close\s+equivalents?)\b/;
function maskQuotes(s, a, b) {
  const out = [];
  let i = a;
  while (i < b) {
    const ch = s[i];
    if (ch === '"') {
      const j = s.indexOf('"', i + 1);
      if (j < 0 || j >= b) break;
      out.push([i, j + 1]); i = j + 1; continue;
    }
    if (ch === "'" && (i === a || !isAlnum(s[i - 1])) && i + 1 < b && isAlnum(s[i + 1])) {
      let j = i + 1;
      while (j < b) {
        if (s[j] === "'" && (j + 1 >= b || !isAlnum(s[j + 1])) && s[j - 1] !== " ") break;
        j++;
      }
      if (j < b && j - i < 80) { out.push([i, j + 1]); i = j + 1; continue; }
    }
    i++;
  }
  return out;
}
const inRuns = (runs, k) => runs.some(([qs, qe]) => qs <= k && k < qe);

class Line {
  constructor(html) {
    this.html = html;
    const st = styleMap(html || "");
    this.text = st.text;
    this.s = normKw(st.text);
    const n = this.text.length;
    this.bu = []; this.uOnly = []; this.bOnly = []; this.it = st.it; this.tb = st.tb;
    for (let k = 0; k < n; k++) {
      this.bu.push(st.b[k] && st.u[k]);
      this.uOnly.push(st.u[k] && !st.b[k]);
      this.bOnly.push(st.b[k] && !st.u[k]);
    }
    let hasBu = false, hasU = false, hasB = false;
    for (let k = 0; k < n; k++) {
      if (!strip(this.text[k])) continue;
      if (this.bu[k]) hasBu = true;
      if (this.uOnly[k]) hasU = true;
      if (this.bOnly[k]) hasB = true;
    }
    this.reqStyle = hasBu ? "bu" : hasU ? "u" : hasB ? "b" : "none";
    this.issues = [];
  }
  issue(code, detail = "") { this.issues.push([code, String(detail).slice(0, 160)]); }
  req(k) {
    return this.reqStyle === "bu" ? this.bu[k] : this.reqStyle === "u" ? (this.uOnly[k] || this.bu[k]) : this.reqStyle === "b" ? (this.bOnly[k] || this.bu[k]) : false;
  }
  styled(k) { return this.bu[k] || this.uOnly[k] || this.bOnly[k]; }
  runs(a, b, pred) {
    const out = [];
    let k = a;
    while (k < b) {
      if (pred(k) && strip(this.s[k] || "")) {
        let j = k;
        while (j < b && pred(j)) j++;
        out.push([k, j]);
        k = j;
      } else k++;
    }
    return out;
  }
}

function spanMask(L) {
  const s = L.s.split("");
  const t = L.s;
  const mends = [[/\bdonot(?=\s)/g, "dont "], [/\bdo\s?not(accept|prompt)/g, null], [/\bacceptor(?=\s+prompt)/g, "accep or"]];
  for (const [rx, rpl] of mends) {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(t)) !== null) {
      const len = m[0].length;
      const nw = rpl !== null ? rpl : "dont" + " ".repeat(len - 4 - m[1].length) + m[1];
      if (nw.length === len) for (let k = 0; k < len; k++) s[m.index + k] = nw[k];
    }
  }
  let openQ = false;
  for (let k = 0; k < s.length; k++) {
    const ch = s[k];
    if (ch === '"') {
      if (k > 0 && ";,".includes(s[k - 1]) && openQ) { s[k] = s[k - 1]; s[k - 1] = '"'; }
      openQ = !openQ;
    } else if (ch === "[" || ch === "]") openQ = false;
  }
  for (let k = 0; k < s.length; k++) {
    const ch = s[k];
    if ("[](){}".includes(ch) && (L.bu[k] || L.uOnly[k])) {
      if (k > 0 && k + 1 < s.length && (L.bu[k - 1] || L.uOnly[k - 1]) && (L.bu[k + 1] || L.uOnly[k + 1])) s[k] = "([{".includes(ch) ? "\x01" : "\x02";
    }
  }
  return s.join("");
}

const SEP_RX = /,\s*(?:or|and|nor)\s+|,\s*|\s+(?:or|nor|as\s+well\s+as)\s+|\s+and\s+|\s*\/\s*/iy;
// EXT: ". Capital" ends an item only when what follows reads as prose ("[or X. This refers to …]"), not inside a
// title ("Faust. Eine Tragödie", italics) or after an abbreviation ("Ware v. Hylton", "John F. Kennedy")
const PROSE_WORD = /\b(?:is|are|was|were|this|that|these|those|it|its|they|their|refers?|referred|because|which|who|whom|has|have|had|not|be|been|should|would|can|could|will|may|might|note|answer|question|clue|we|you|he|she|his|her|did|does|do)\b/i;
function proseCut(L, a, at, end) {
  const before = L.text.slice(Math.max(a, at - 6), at);
  if (L.styled(at) || (L.it && (L.it[at] || L.it[at + 2]))) return false;
  if (/(?:\b[A-Za-z]|\bMt|\bSt|\bDr|\bNo|\bOp|\bvs?|\bal|\bInc|\bCo|\bCorp|\bLtd|\bJr|\bSr|\bMr|\bMrs|\bMs|\bed|\bvol|\bch)$/.test(before)) return false;
  const rest = L.text.slice(at + 1, end);
  return rest.trim().split(/\s+/).length >= 3 && PROSE_WORD.test(rest);
}

function splitItems(L, a, b, qruns, kind) {
  const s = L.s;
  const seps = [];
  let d = 0, k = a;
  while (k < b) {
    const ch = s[k];
    if ("([{".includes(ch)) d++;
    else if (")]}".includes(ch)) d = Math.max(0, d - 1);
    if (d === 0 && !inRuns(qruns, k)) {
      let m = matchAt(SEP_RX, s, k, b);
      if (m) {
        for (let j = m.index; j < mEnd(m); j++) if ((L.styled(j) || L.it[j]) && strip(s[j])) { m = null; break; }
      }
      if (m && mEnd(m) > k && !(strip(m[0]) === "/" && (k === a || !isAlnum(s[k - 1])))) {
        const word = m[0].replace(/^[ ,]+|[ ,]+$/g, "");
        if (EXT) {
          const rawSep = L.text.slice(k, mEnd(m));
          const inNoSplit = L.noListSplit && L.noListSplit[0] <= k && k < L.noListSplit[1] && /^\s*,?\s*(?:and|or)?\s*$/i.test(rawSep);
          if (/\bAND\b/.test(rawSep) || (/^(?:,\s*)?and$/i.test(word) && L.andJoin) || inNoSplit) { k = mEnd(m); continue; }
        }
        seps.push([k, mEnd(m), word]);
        k = mEnd(m);
        continue;
      }
    }
    k++;
  }
  const cuts = [a];
  for (const sp of seps) cuts.push(sp[0], sp[1]);
  cuts.push(b);
  const pieces = [];
  for (let i = 0; i < cuts.length; i += 2) pieces.push([cuts[i], cuts[i + 1]]);
  const joins = seps.map((sp) => sp[2]);
  let marked = false;
  for (let j = a; j < b; j++) if (strip(s[j]) && L.styled(j)) { marked = true; break; }
  const hasAnchor = ([pa, pb]) => {
    for (let j = pa; j < pb; j++) if (strip(s[j]) && L.styled(j)) return true;
    return qruns.some(([qs, qe]) => qs >= pa && qe <= pb + 1);
  };
  let out = [];
  pieces.forEach((p, i) => {
    const txt = strip(s.slice(p[0], p[1]));
    if (!txt) return;
    const j = i > 0 ? joins[i - 1] : null;
    let glue = false;
    if (out.length) {
      const prev = out[out.length - 1];
      if (j === "and" && !(hasAnchor(p) && hasAnchor(prev)) && !CLASSY.test(txt)) {
        glue = true;
        if (hasAnchor(p) || hasAnchor(prev)) L.issue("AND_KEPT_IN_ITEM", s.slice(prev[0], p[1]).slice(0, 50));
      } else if (EXT && marked && !hasAnchor(p) && joins[i] === "and" && pieces[i + 1] && hasAnchor(pieces[i + 1]) && !CLASSY.test(txt)) {
        // "or The 1967 International and Universal <u>Exposition</u>": the unmarked piece opens the next item
        glue = false;
      } else if (marked && !hasAnchor(p) && !CLASSY.test(txt)) {
        glue = true;
        L.issue("UNMARKED_PIECE_KEPT", txt.slice(0, 50));
      } else if (j === "/" && !(hasAnchor(p) && hasAnchor(prev)) && txt.split(/\s+/).length === 1) glue = true;
    }
    if (glue) out[out.length - 1] = [out[out.length - 1][0], p[1]];
    else out.push(p);
  });
  if (marked && out.length > 1 && !hasAnchor(out[0]) && !CLASSY.test(s.slice(out[0][0], out[0][1]))) {
    out[1] = [out[0][0], out[1][1]];
    out = out.slice(1);
  }
  const res = [];
  for (const [pa, pb] of out) {
    const m = searchIn(EXAMPLES, s, pa, pb);
    if (m && !inRuns(qruns, m.index) && !L.styled(m.index) && hasAnchor([mEnd(m), pb])) {
      if (strip(s.slice(pa, m.index))) res.push([pa, hasAnchor([pa, m.index]) ? m.index : mEnd(m)]);
      res.push([mEnd(m), pb]);
      L.issue("CLASS_OPEN_WITH_EXAMPLES", s.slice(pa, mEnd(m)).slice(0, 50));
    } else res.push([pa, pb]);
  }
  return res;
}

function makeItem(L, a, b, kind, qruns) {
  const s = L.s;
  const txt = s.slice(a, b);
  const it = { kind, start: a, end: b, text: strip(L.text.slice(a, b)), R: [], P: [], quoted: null, scope: null, cls: null, ca: a, cb: b };
  let m = SCOPE_PRE.exec(txt);
  let a2 = a;
  if (m) { it.scope = "bare"; a2 = a + m[0].length; }
  let b2 = b;
  const sb = s.slice(a2, b);
  m = SCOPE_POST.exec(sb);
  if (m) { it.scope = "bare"; b2 = a2 + m.index; }
  m = TRAIL_HEDGE.exec(s.slice(a2, b2));
  if (m) b2 = a2 + m.index;
  const q = qruns.filter(([qs, qe]) => qs >= a2 && qe <= b2 + 1);
  if (q.length) it.quoted = q.map(([qs, qe]) => L.text.slice(qs + 1, qe - 1));
  if (CLASSY.test(s.slice(a2, b2))) {
    let anyReq = false;
    for (let k = a2; k < b2; k++) if (L.req(k)) { anyReq = true; break; }
    if (!anyReq) it.cls = strip(s.slice(a2, b2));
  }
  if (kind === "accept" || kind === "portion") it.R = L.runs(a2, b2, (k) => L.req(k)).map(([x, y]) => L.text.slice(x, y));
  else if (kind === "prompt" || kind === "antiprompt" || kind === "prompt_partial") {
    const pr = L.runs(a2, b2, (k) => L.uOnly[k] || L.bu[k] || (L.reqStyle === "b" && L.bOnly[k]));
    it.P = pr.map(([x, y]) => L.text.slice(x, y));
  }
  it.core = strip(L.text.slice(a2, b2));
  it.ca = a2; it.cb = b2;
  return it;
}

function slotsOf(L, a, b, pred) {
  const runs = L.runs(a, b, pred || ((k) => L.req(k)));
  const slots = [];
  runs.forEach(([x, y], i) => {
    const gap = i ? L.s.slice(runs[i - 1][1], x) : "";
    if (i && (/^[\p{L}\p{N}_'-]*["']?\s*(?:,\s*(?:or\s+)?|or\s+|\/\s*)(?:the\s+|a\s+|an\s+)?["']?[\p{L}\p{N}_'-]*$/u.test(gap) || /(?:^|[\s,])or\s/.test(gap))) slots[slots.length - 1].push(L.text.slice(x, y));
    else slots.push([L.text.slice(x, y)]);
  });
  return slots;
}

function containForm(L, kind, a, b, qruns, win, ask, subst) {
  const pred = kind === "accept" ? (k) => L.req(k) : (k) => L.uOnly[k] || L.bu[k];
  let sl = slotsOf(L, a, b, pred);
  if (NEG.has(kind) || !sl.length) {
    const qq = qruns.filter(([x]) => x >= a && x < b);
    const q = qq.map(([x, y]) => L.text.slice(x + 1, y - 1));
    if (q.length) {
      let joinedAnd = false;
      for (let i = 0; i + 1 < qq.length; i++) if (/\band\b/.test(L.s.slice(qq[i][1], qq[i + 1][0]))) joinedAnd = true;
      sl = joinedAnd && !NEG.has(kind) ? q.map((x) => [x]) : [q];
    }
  }
  return { kind, src: "class", start: a, end: b, text: strip(L.text.slice(a, b)), R: [], P: [], quoted: null, scope: null, cls: "contain", slots: sl, window: win, ask, subst_for: subst, ca: a, cb: b };
}

function timingOf(L, a, b, qruns) {
  const s = L.s;
  const depth = {};
  let d = 0;
  for (let k = a; k < b; k++) {
    if (s[k] === "(" || s[k] === "[") d++;
    else if (s[k] === ")" || s[k] === "]") d = Math.max(0, d - 1);
    depth[k] = d;
  }
  for (const m of findIter(TIMING_KW, s, a, b)) {
    if (inRuns(qruns, m.index) || L.it[m.index] || L.styled(m.index) || (depth[m.index] || 0) > 0) continue;
    const restA = mEnd(m);
    const kw = m[0].replace(/\s+/g, " ");
    const side = ["after", "once", "following", "as soon as"].includes(kw) ? "after" : "before";
    for (const [shape, rx] of [["clue", CLUE_MARK], ["quoted", QUOTED_MARK], ["self", SELF_MARK], ["words+verb", BARE_MARK]]) {
      const mm = matchAt(rx, s, restA, b);
      if (mm) {
        const w = { side, kw, shape, marker: strip(L.text.slice(restA, mEnd(mm))), end: mEnd(mm), kwStart: m.index };
        if (EXT && shape !== "clue") {
          const ms = /^\s*in\s+the\s+(last|final|first|second|third|opening)\s+(?:sentence|line|clue)/.exec(s.slice(w.end, b));
          if (ms) { w.inSent = ms[1]; w.end += ms[0].length; }
        }
        return [m.index, w];
      }
    }
    if (/^\s*(?:that|this|it|wards?)?\s*(?:$|[,;.)\]]|\s(?:and|but|or|by|with)\b)/.test(s.slice(restA, b))) return [m.index, { side, kw, shape: "previous", marker: "", end: restA, kwStart: m.index }];
    const mm = matchAt(BARE_WORDS, s, restA, b);
    if (mm) return [m.index, { side, kw, shape: "bare", marker: strip(L.text.slice(restA, mEnd(mm))), end: mEnd(mm), kwStart: m.index }];
    L.issue("TIMING_MARKER_UNKNOWN", s.slice(m.index, Math.min(b, m.index + 60)));
  }
  let m = searchIn(NOMARK_TIMING, s, a, b);
  if (!m && EXT) {
    m = searchIn(/(?<![a-z0-9])(?:during|in|on)\s+(?:the\s+)?(?:first|second|third|opening|last|final)\s+(?:line|sentence|clue)s?(?![a-z0-9])/g, s, a, b);
  }
  // "X is the one referred to in the first sentence" explains a clue; it is not a window (§6.2)
  if (m && EXT && /(?:refers?|referred|referring|mentioned|clued|described|alluded|named)\s+(?:to\s+)?$/.test(s.slice(Math.max(a, m.index - 24), m.index))) m = null;
  if (m && !inRuns(qruns, m.index) && !L.it[m.index]) {
    const w = m[0].replace(/\s+/g, " ");
    const kind = /^(?:after|thereafter|from|subsequently)/.test(w) ? "previous_flipped" : /^(?:at|even)/.test(w) ? "whole_question" : w.startsWith("early") ? "early" : "sentence";
    return [m.index, { side: kind, kw: w, shape: "none", marker: "", end: mEnd(m), kwStart: m.index }];
  }
  return [null, null];
}

function askOf(L, a, b, qruns) {
  const s = L.s;
  for (const m of findIter(DIRECTED, s, a, b)) {
    if (inRuns(qruns, m.index)) continue;
    const e = mEnd(m);
    const q = qruns.filter(([qs]) => qs >= e - 1 && qs <= e + 1);
    if (q.length) {
      const [qs, qe] = q[0];
      let end = qe;
      let m2 = /^\s*(?:or|,)\s*(?=["'])/.exec(s.slice(end, b));
      while (m2) {
        const q2 = qruns.filter(([x]) => x === end + m2[0].length);
        if (!q2.length) break;
        end = q2[0][1];
        m2 = /^\s*(?:or|,)\s*(?=["'])/.exec(s.slice(end, b));
      }
      return [m.index, L.text.slice(qs + 1, end - 1), end];
    }
    return [m.index, strip(L.text.slice(e, b)), b];
  }
  return [null, null, null];
}

function recordRule(L, out, txt) {
  const t = txt.toLowerCase();
  const r = out.rules;
  const t1 = (id) => { const re = KW[id].g; re.lastIndex = 0; return re.test(t); };
  if (t1("portion_either") || t1("portion_either_part") || t1("portion_postfix")) r.either_portion = true;
  if (t1("portion_both_required") || t1("req_both")) r.all_required = true;
  if (t1("req_either_order") || t1("req_accept_either_order")) r.order = "free";
  if (t1("req_fixed_order")) r.order = "fixed";
  if (t1("req_exact")) r.exact = true;
  if (t1("req_not_needed") || t1("req_do_not_need")) r.optional_after = t.slice(0, 80);
  if (EXT) {
    if (/\b(?:take|accept|allow)\s+any\s+(?:one\s+)?of\s+(?:the\s+)?(?:names|parts|portions|words)\b/.test(t) || /\baccept\s+either\s*(?:,|;|\)|\]|$)/.test(t) || /\bonly\s+need\s+one\s+(?:part|name)\b/.test(t)) r.either_portion = true;
    if (/\bprompt\s+on\s+either\s+(?:part|name|half|portion|word)s?\b/.test(t)) { r.prompt_either_part = true; r.partial_policy = r.partial_policy || "prompt"; }
    if (/\bprompt\s+on\s+(?:any\s+of\s+)?the\s+other\s+names\b/.test(t)) r.prompt_other_names = true;
  }
}

function buildRef(html) {
  const L = new Line(html);
  let s = L.s;
  const out = { text: L.text, forms: [], rules: {}, issues: L.issues, reqStyle: L.reqStyle, L };
  if (!strip(s)) { L.issue("EMPTY"); return out; }
  if (L.reqStyle !== "bu") L.issue("LEGACY_MARKUP", L.reqStyle);
  const sm = spanMask(L);
  s = sm.split("").map((c2, k) => (c2 === "\x01" || c2 === "\x02" ? s[k] : c2)).join("");
  L.s = s;
  const P = segParse(sm);
  const groups = P.groups, clauses = P.clauses;
  let [headA, headB] = P.head;
  const qall = maskQuotes(s, 0, s.length);
  out.qall = qall; out.groups = groups; out.sm = sm;
  if (EXT) {
    let andMain = false;
    const hr = L.runs(headA, headB, (k) => L.req(k));
    for (let i = 0; i + 1 < hr.length; i++) if (/(?:^|\s)(?:and|&)(?:\s|$)/i.test(L.text.slice(hr[i][1], hr[i + 1][0]))) andMain = true;
    L.andJoin = andMain || /\bAND\b/.test(L.text) || /\b(?:both|all|two|three|four)\b[^;\])]{0,40}\b(?:required|needed)\b/i.test(L.text);
  }
  if (P.stray_closers) L.issue("STRAY_CLOSER", String(P.stray_closers));
  for (const g of groups) if (!g.closed) L.issue("UNCLOSED_GROUP", s.slice(g.start, g.start + 40));
  // unbracketed directives inside the head
  const strong = new RegExp(R`(?:^|[;,.:]\s*|\s)(?=(?:also\s+)?(?:accept|prompt|reject|do\s+not|don't|anti-?\s?prompt)` + E + ")", "ig");
  let mh = null;
  for (const m of findIter(strong, s, headA, headB)) {
    const e = mEnd(m);
    if (m.index > headA && !inRuns(qall, e) && !L.styled(e) && !groups.some((g) => g.start <= e && e < g.end)) { mh = m; break; }
  }
  const virtual = [];
  if (mh) {
    L.issue("UNBRACKETED_DIRECTIVE", s.slice(mh.index, mh.index + 50));
    const va = mEnd(mh);
    for (const [cs, ce] of splitTop(sm, va, headB)) if (strip(s.slice(cs, ce))) virtual.push([cs, ce]);
    headB = mh.index;
  }
  // unmarked "[or X]" before the first required span
  const dirs = groups.filter((g) => g.kind === "directive" && g.start >= headB);
  const anyReq = (x, y) => { for (let k = x; k < y; k++) if (L.req(k)) return true; return false; };
  if (dirs.length && L.reqStyle === "bu" && !anyReq(headA, headB)) {
    const g0 = dirs[0];
    const nx = groups.find((g) => g.start >= g0.end);
    const nxt = nx ? nx.start : s.length;
    if (anyReq(g0.end, nxt) && !anyReq(g0.istart, g0.iend)) {
      g0.kind = "optional";
      L.issue("INLINE_OR_GROUP", s.slice(g0.start, g0.end).slice(0, 50));
      headB = dirs.length > 1 ? dirs[1].start : s.length;
    }
  }
  // main answer
  const headGroups = groups.filter((g) => headA <= g.start && g.start < headB);
  for (const g of headGroups) {
    const inner = s.slice(g.istart, g.iend);
    if ((g.kind === "optional" || g.kind === "bare_alt") && /^\s*"[^"]{1,60}"\s*$/.test(inner)) g.kind = "pron";
    if ((g.kind === "bare_alt" || g.kind === "optional") && /^\s*(?:s|es|e|n|a|i|ae|\d{1,2}|dw|jm|dl|ar|sj|joc)\s*$/.test(inner)) g.kind = /^[a-z]+$/i.test(strip(inner)) && strip(inner).length <= 2 ? "suffix" : "tag";
    if (g.kind === "bare_alt" && L.reqStyle === "bu" && !anyReq(g.istart, g.iend)) g.kind = "optional";
    if (g.kind === "pron" && anyReq(g.istart, g.iend)) g.kind = "bare_alt";
  }
  for (const g of headGroups) if (["explanation", "note", "bare_alt", "optional", "pron"].includes(g.kind)) L.issue("HEAD_GROUP_" + g.kind.toUpperCase(), s.slice(g.start, g.end).slice(0, 60));
  const drop = headGroups.filter((g) => ["pron", "explanation", "note", "tag", "empty", "bare_alt"].includes(g.kind)).map((g) => [g.start, g.end]);
  out.headDrop = drop;
  const inDrop = (k) => drop.some(([x, y]) => x <= k && k < y);
  let altCuts = [];
  let d = 0;
  for (let k = headA; k < headB; k++) {
    if (inDrop(k)) continue;
    const ch = sm[k];
    if ("([{".includes(ch)) d++;
    else if (")]}".includes(ch)) d = Math.max(0, d - 1);
    // spec B3: styling on the spaces around a separator is ignored; its own letters must be plain (EXT)
    let sk = k;
    if (EXT && /\s/.test(s[k])) { while (sk < headB - 1 && /\s/.test(s[sk])) sk++; }
    if (d || inRuns(qall, k) || L.styled(sk) || L.it[sk] || (!EXT && (L.styled(k) || L.it[k]))) continue;
    const m = /^(?:\s+or\s+|\s*\/\s*|,\s*(?:or\s+)?|;\s*(?:or\s+)?)/.exec(s.slice(k, headB));
    if (m && m[0].length > 0 && (k === headA || s[k - 1] !== " " || m[0][0] !== " ")) {
      if (/^[,;]\s*or\s*,/.test(s.slice(k, k + 6))) continue;
      altCuts.push([k, k + m[0].length]);
    }
  }
  const hasOrAfter = (x) => altCuts.some(([c0, c1]) => c0 > x && /\bor\b|\//.test(s.slice(c0, c1)));
  altCuts = altCuts.filter(([x, y]) => !(s[x] === "," && !/\bor\b/.test(s.slice(x, y))) || hasOrAfter(x));
  const pieces = [];
  let pa = headA;
  const sortedCuts = [...new Map(altCuts.map((c) => [c.join(","), c])).values()].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  for (const [x, y] of sortedCuts) {
    if (x < pa) continue;
    pieces.push([pa, x]); pa = y;
  }
  pieces.push([pa, headB]);
  const anchored = ([x, y]) => { for (let k = x; k < y; k++) if (strip(s[k]) && !inDrop(k) && L.req(k)) return true; return false; };
  const merged = [];
  for (const p of pieces) {
    if (!strip(s.slice(p[0], p[1]))) continue;
    if (merged.length && !(anchored(p) && anchored(merged[merged.length - 1]))) merged[merged.length - 1] = [merged[merged.length - 1][0], p[1]];
    else merged.push(p);
  }
  if (L.reqStyle === "none" && /\s(?:or|\/)\s/.test(s.slice(headA, headB))) L.issue("MAIN_OR_UNMARKED", s.slice(headA, headB).slice(0, 80));
  for (const p of merged) {
    const runs = L.runs(p[0], p[1], (k) => L.req(k)).filter((r) => !inDrop(r[0]));
    const f = { kind: "accept", src: "main", start: p[0], end: p[1], text: strip(L.text.slice(p[0], p[1])), R: runs.map(([x, y]) => L.text.slice(x, y)), P: [], quoted: null, scope: null, cls: null, window: null, ask: null, ca: p[0], cb: p[1], drop };
    if (!runs.length) { f.R = [strip(L.text.slice(p[0], p[1]))]; L.issue("MAIN_NO_REQUIRED_SPAN", f.text.slice(0, 60)); f.wholeRequired = true; }
    out.forms.push(f);
  }
  const later = groups.filter((g) => g.kind === "directive" && g.start >= headB);
  for (const g of later) {
    const x = g.end;
    const nx = groups.find((h) => h.start >= x);
    const y = nx ? nx.start : s.length;
    const runs = L.runs(x, y, (k) => L.req(k));
    if (runs.length && EXT && /^\s*or\s/.test(s.slice(x, y))) {
      // "X (or Y) or Z or W": more alternatives of the main answer, not a second answer (EXT)
      const cuts = [];
      const rx = /\s*\bor\s+/g;
      let mm;
      const t = s.slice(x, y);
      while ((mm = rx.exec(t)) !== null) {
        const at = x + mm.index + mm[0].search(/o/);
        if (!L.styled(at) && !L.it[at] && !inRuns(qall, at)) cuts.push([x + mm.index, x + mm.index + mm[0].length]);
      }
      let pa = x;
      for (const [c0, c1] of cuts.concat([[y, y]])) {
        const pa0 = pa, pb0 = c0;
        pa = c1;
        const pr = L.runs(pa0, pb0, (k) => L.req(k));
        if (!pr.length) continue;
        out.forms.push({ kind: "accept", src: "main", start: pa0, end: pb0, text: strip(L.text.slice(pa0, pb0)), R: pr.map(([p0, p1]) => L.text.slice(p0, p1)), P: [], quoted: null, scope: null, cls: null, window: null, ask: null, ca: pa0, cb: pb0 });
      }
      L.issue("MAIN_ALTERNATIVES_AFTER_GROUP", strip(L.text.slice(x, y)).slice(0, 50));
      continue;
    }
    // EXT: a line with no markup at all ("endoplasmic reticulum [or ER] AND Golgi apparatus [..]"): the text after
    // the group is the next answer, whole
    const am = EXT && !runs.length && L.reqStyle === "none" ? /^\s*(?:and|&)\s+(?=\S)/i.exec(L.text.slice(x, y)) : null;
    if (am && strip(L.text.slice(x + am[0].length, y))) {
      const t0 = x + am[0].length;
      out.forms.push({ kind: "accept", src: "main_next", start: t0, end: y, text: strip(L.text.slice(t0, y)), R: [strip(L.text.slice(t0, y))], P: [], quoted: null, scope: null, cls: null, window: null, ask: null, ca: t0, cb: y, wholeRequired: true });
      L.issue("ANSWER_BETWEEN_GROUPS", strip(L.text.slice(x, y)).slice(0, 50));
      out.rules.multi = true;
      continue;
    }
    if (runs.length) {
      out.forms.push({ kind: "accept", src: "main_next", start: x, end: y, text: strip(L.text.slice(x, y)), R: runs.map(([p0, p1]) => L.text.slice(p0, p1)), P: [], quoted: null, scope: null, cls: null, window: null, ask: null, ca: x, cb: y });
      L.issue("ANSWER_BETWEEN_GROUPS", strip(L.text.slice(x, y)).slice(0, 50));
      if (/^\s*(?:AND|and|&)\b/.test(L.text.slice(x, y))) out.rules.multi = true;
    }
  }
  if (merged.length > 1) L.issue("MAIN_ALTERNATIVES", merged.map(([x, y]) => strip(L.text.slice(x, y)).slice(0, 30)).join(" | "));
  if (L.text.slice(headA, headB).split(/\s+/).includes("AND")) out.rules.multi = true;
  // clauses
  const todo = clauses.map((cl) => ({ ...cl, virtual: false }));
  const have = new Set(clauses.map((cl) => cl.g));
  groups.forEach((g, gi) => {
    if (g.kind === "bare_alt" && !have.has(gi)) todo.push({ g: gi, gkind: "bare_alt", start: g.istart, end: g.iend, text: s.slice(g.istart, g.iend), leadins: [], opener: null, type: "BARE_ALTERNATE", body_start: g.istart, switches: [], postfix: [], virtual: false });
  });
  todo.sort((x, y) => x.start - y.start);
  for (const [cs, ce] of virtual) {
    const [pp, leadins] = stripLeadins(sm, cs, ce);
    const [e, mm] = matchOpener(sm, pp, ce);
    todo.push({ g: -1, gkind: "directive", start: cs, end: ce, text: s.slice(cs, ce), leadins, opener: e ? e.id : null, type: e ? e.type : "UNTYPED", body_start: e ? mEnd(mm) : pp, switches: findSwitches(sm, e ? mEnd(mm) : pp, ce), postfix: [], virtual: true });
  }
  const prevType = {};
  let lastItems = [];
  for (let cl of todo) {
    const g = cl.g;
    let ctype = cl.type;
    if (!cl.virtual && ["suffix", "tag", "pron", "optional"].includes(groups[g].kind)) continue;
    if (EXT && !cl.virtual && groups[g].kind === "bare_alt" && cl.start >= headB && L.reqStyle === "bu" && !anyReq(cl.start, cl.end)) continue;
    if (cl.start < headB && !cl.virtual && groups[g].kind !== "directive") {
      if (ctype !== "BARE_ALTERNATE" && !(EXT && groups[g].kind === "note")) continue;
    }
    if (["EXPLANATION", "PRONUNCIATION", "NOTE", "UNTYPED"].includes(ctype)) {
      const limit = ["NOTE", "PRONUNCIATION"].includes(ctype) ? cl.end : Math.min(cl.end, cl.start + 60);
      let hit = null;
      const seg = sm.slice(cl.start, limit);
      const rxw = /(?<![a-z0-9'])[a-z]/g;
      let mw;
      while ((mw = rxw.exec(seg)) !== null) {
        const pos = cl.start + mw.index;
        if (inRuns(qall, pos) || (pos < cl.body_start && ctype !== "UNTYPED")) continue;
        const [e2, m2] = matchOpener(sm, pos, cl.end, false);
        if (e2 !== null && !["NEUTRAL", "CONDITIONAL", "LENIENCY", "ACCEPT_CLASS", "REQUIREMENT", "PORTION"].includes(e2.type)) { hit = [e2, m2]; break; }
      }
      if (hit) {
        const [e2, m2] = hit;
        L.issue(["NOTE", "PRONUNCIATION"].includes(ctype) ? "NOTE_INSTRUCTION" : "LEADIN_FALLBACK", s.slice(cl.start, mEnd(m2)).slice(0, 60));
        ctype = e2.type;
        if (EXT && ctype === "ACCEPT" && /\b(?:do\s+not|don't|dont|never|not)\s+$/.test(sm.slice(Math.max(cl.start, m2.index - 14), m2.index))) ctype = "REJECT";
        const pre = s.slice(cl.start, m2.index);
        const mt = /(?:before|until|after|once|at\s+the\s+end|in\s+the\s+first\s+(?:line|sentence))[^,]*,\s*$/.exec(pre);
        cl = { ...cl, type: ctype, opener: e2.id, body_start: mEnd(m2), switches: findSwitches(sm, mEnd(m2), cl.end), leadins: cl.leadins.concat(mt ? [["front_timing", mt[0]]] : []) };
      }
    }
    if (ctype === "UNTYPED") {
      const body = s.slice(cl.start, cl.end);
      const markedCl = anyReq(cl.start, cl.end);
      if (!markedCl && ((words(body).length > 6 && PROSE_VERB.test(body)) || (L.reqStyle === "bu" && words(body).length > 6))) {
        ctype = "EXPLANATION";
        L.issue("UNTYPED_PROSE", body.slice(0, 50));
      }
    }
    if (ctype === "UNTYPED") {
      if (g in prevType) { ctype = prevType[g]; L.issue("UNTYPED_INHERITS", `${ctype}: ${s.slice(cl.start, cl.end).slice(0, 50)}`); }
      else {
        ctype = anyReq(cl.start, cl.end) || words(s.slice(cl.start, cl.end)).length <= 6 ? "BARE_ALTERNATE" : "EXPLANATION";
        L.issue("UNTYPED_GROUP_START", `${ctype}: ${s.slice(cl.start, cl.end).slice(0, 50)}`);
      }
    }
    if (EXT && /^\s*(?:they|you|players?|teams?)\s+(?:only\s+)?needs?\b/.test(s.slice(cl.start, cl.end))) {
      const nr = L.runs(cl.start, cl.end, (k) => L.req(k));
      if (nr.length) { out.rules.needWords = nr.map(([x, y]) => L.text.slice(x, y)); if (cl.opener === null || cl.opener === undefined) cl = { ...cl, needOnly: true }; }
    }
    if (ctype === "EXPLANATION" || ctype === "PRONUNCIATION") continue;
    if (ctype === "NOTE") { L.issue("NOTE", s.slice(cl.start, cl.end).slice(0, 70)); continue; }
    prevType[g] = ctype;
    recordRule(L, out, s.slice(cl.start, cl.end));
    for (const [k2, txt] of cl.leadins) if (k2 === "conditional") L.issue("CONDITIONAL", txt.slice(0, 60));
    const segs = [];
    let curT = ctype, curA = cl.body_start;
    const sw = cl.switches.map(([e, mm]) => [e, mm.index, mEnd(mm)]);
    for (const m of findIter(BARE_SW, s, cl.body_start, cl.end)) {
      const st1 = m.indices[1][0], en1 = m.indices[1][1];
      if (!inRuns(qall, st1) && !sw.some(([, x, y]) => x <= st1 && st1 < y)) sw.push([KW.prompt_bare, st1, en1]);
    }
    for (const m of findIter(KW.neg_but_not.g, s, cl.body_start, cl.end)) {
      if (!inRuns(qall, m.index) && !sw.some(([, x, y]) => x <= m.index && m.index < y)) sw.push([{ ...KW.neg_but_not, type: "REJECT" }, m.index, mEnd(m)]);
    }
    sw.sort((x, y) => x[1] - y[1]);
    for (const [e, st, en] of sw) {
      if (e.type === "NEUTRAL") continue;
      segs.push([curT, curA, st]);
      curT = e.type; curA = en;
    }
    segs.push([curT, curA, cl.end]);
    const front = cl.leadins.filter(([k2]) => k2 === "front_timing").map(([, t]) => t);
    if (EXT && (cl.opener === "cond_if" || cl.leadins.some(([k2]) => k2 === "conditional"))) conditionTargets(cl, segs);
    segs.forEach(([t, a0, b], si) => segment(t, a0, b, si, cl, front));
    if (EXT && cl.cond && !cl.condUsed) {
      const dm = /\b(anti-?\s?prompt|reverse\s+prompt|prompt|accept|reject|ask)\b/.exec(s.slice(cl.condEnd, cl.end));
      if (dm) {
        const kw2 = dm[1];
        const kind2 = /anti|reverse/.test(kw2) ? "antiprompt" : kw2 === "accept" ? "accept" : kw2 === "reject" ? "reject" : "prompt";
        const qa = /\b(?:ask(?:ing)?|by\s+asking)\s*[:,]?\s*"([^"]+)"/.exec(s.slice(cl.condEnd, cl.end));
        const askTxt = qa ? L.text.slice(cl.condEnd + qa.index + qa[0].indexOf('"') + 1, cl.condEnd + qa.index + qa[0].length - 1) : null;
        for (const [x, y, scope] of cl.cond) {
          const txt = strip(L.text.slice(x, y)).replace(/[,.;:]+$/, "");
          if (!txt) continue;
          out.forms.push({ kind: kind2, src: "condition", start: x, end: y, text: txt, R: kind2 === "accept" ? [txt] : [], P: kind2 === "accept" ? [] : [txt], quoted: [txt], scope: scope || null, cls: null, window: null, ask: askTxt, subst_for: null, ca: x, cb: y, wholeRequired: true, core: txt });
        }
      }
    }
  }
  function conditionTargets(cl, segs) {
    let condA = cl.body_start;
    if (cl.opener !== "cond_if") {
      // the condition was a lead-in: it sits before the opener
      condA = cl.start;
      const dm0 = /\b(?:anti-?\s?prompt|reverse\s+prompt|prompt|accept|reject|ask|do\s+not)\b/.exec(s.slice(cl.start, cl.end).replace(/^\s*if\s+(?:they|someone|somebody|anyone|a\s+player|the\s+player|players|a\s+team|the\s+team)\s+\S+/, (x) => " ".repeat(x.length)));
      const condEnd0 = dm0 ? cl.start + dm0.index : cl.body_start;
      const qs0 = qall.filter(([x, y]) => x >= condA && y <= condEnd0 + 1);
      const r0 = qs0.map(([x, y]) => [x + 1, y - 1, /\b(?:just|only)\s*$/.test(s.slice(Math.max(condA, x - 8), x)) ? "bare" : null]);
      if (r0.length) { cl.cond = r0; cl.condEnd = condEnd0; cl.condLead = true; }
      return;
    }
    let condEnd = segs.length > 1 ? segs[1][1] : cl.end;
    const dm = /\b(?:anti-?\s?prompt|reverse\s+prompt|prompt|accept|reject|ask|do\s+not)\b/.exec(s.slice(condA, condEnd));
    if (dm) condEnd = condA + dm.index;
    let stop = condEnd;
    const rt = /\b(?:rather\s+than|instead\s+of)\b/.exec(s.slice(condA, condEnd));
    if (rt) stop = condA + rt.index;
    const qs = qall.filter(([x, y]) => x >= condA && y <= stop + 1);
    const ranges = [];
    for (const [x, y] of qs) {
      const before = s.slice(Math.max(condA, x - 8), x);
      ranges.push([x + 1, y - 1, /\b(?:just|only)\s*$/.test(before) ? "bare" : null]);
    }
    if (!ranges.length) {
      const mt = /\b(?:says?|answers?|gives?|with|responds?)\s+(.+?)\s*,?\s*$/.exec(s.slice(condA, condEnd));
      if (mt) {
        const x = condA + mt.index + mt[0].indexOf(mt[1]);
        ranges.push([x, x + mt[1].length, null]);
      }
    }
    if (ranges.length) { cl.cond = ranges; cl.condEnd = condEnd; }
  }
  function segment(t, a, b, si, cl, front) {
    if (cl.needOnly && si === 0) return;
    let kind = KIND_OF_TYPE[t];
    const segTxt = s.slice(a, b);
    if (t === "ACCEPT_CLASS") kind = "accept";
    if ([undefined, null, "lenient", "requirement", "portion", "conditional", "note"].includes(kind)) {
      if (t === "REQUIREMENT" || t === "PORTION") recordRule(L, out, s.slice(cl.start, cl.end));
      if (t === "LENIENCY") {
        out.rules.lenient = true;
        const m = new RegExp(B + R`(?:and\s+)?(accept|prompt\s+on|prompt)` + E, "d").exec(segTxt);
        if (m) { kind = m[1] === "accept" ? "accept" : "prompt"; a = a + m.index + m[0].length; }
        else return;
      } else return;
    }
    const mnr = searchIn(KW.neutral_do_not_reveal.g, s, a, b);
    if (mnr && !inRuns(qall, mnr.index)) {
      const a2 = mEnd(mnr);
      if (/^\s*,?\s*$/.test(s.slice(a, mnr.index).replace(/but/g, "").replace(/,/g, ""))) a = a2;
    }
    let earlyWin = null;
    if (EXT) {
      const fs = /\.\s+(?=[A-Z][a-z])/g;
      fs.lastIndex = a;
      let mf;
      while ((mf = fs.exec(L.text)) !== null && mf.index < b) {
        if (inRuns(qall, mf.index) || !proseCut(L, a, mf.index, b)) continue;
        b = mf.index;
        break;
      }
      const mo = /^\s*[\])]\s*(?:on\s+)?/.exec(s.slice(a, b));
      if (mo) a += mo[0].length;
      const me = /^\s*(?:an?\s+)?early\s+(?:(?:answers?|buzz(?:es)?)\s+(?:of\s+)?)?(?=\S)/.exec(s.slice(a, b));
      const ei = me ? a + me[0].search(/early/) : -1;
      if (me && (kind === "accept" || kind === "prompt" || kind === "antiprompt") && /^early/.test(L.text.slice(ei)) && !L.styled(ei)) { a += me[0].length; earlyWin = { side: "early", kw: "early", shape: "none", marker: "", end: a }; }
    }
    if (EXT && (kind === "accept" || kind === "prompt" || kind === "antiprompt" || kind === "prompt_partial") && OPEN_RX.test(s.slice(a, b))) {
      (out.rules.open_class = out.rules.open_class || []).push(`${kind}:${(OPEN_RX.exec(s.slice(a, b)) || [""])[0]}`);
    }
    const qruns = qall.filter(([x, y]) => x >= a && y <= b + 1);
    let ask = null;
    let m = /^\s*(?:with\s+)?("[^"]+"|\([^)]*\)|\[[^\]]*\])\s*on\s+/.exec(s.slice(a, b));
    if (m && (kind === "prompt" || kind === "antiprompt")) {
      const g1s = m[0].indexOf(m[1]);
      ask = L.text.slice(a + g1s + 1, a + g1s + m[1].length - 1);
      a = a + m[0].length;
    }
    m = /^\s*on\s+/.exec(s.slice(a, b));
    if (m) a += m[0].length;
    let [ts, win] = timingOf(L, a, b, qruns);
    if (front.length) win = win || { side: "front", kw: front[0].split(/\s+/)[0], shape: "fronted", marker: front[0], end: a };
    if (earlyWin && !win) win = earlyWin;
    let [ds, dask, dend] = ["prompt", "antiprompt", "prompt_partial"].includes(kind) ? askOf(L, a, b, qruns) : [null, null, null];
    if (dask !== null) ask = ask || dask;
    if (ds !== null && /^[\s,;:(\[]*(?:i\.e\.|e\.g\.|that\s+is|namely)?[\s,;:(\[]*$/.test(s.slice(a, ds))) {
      const mon = /^[\s,)\]]*on\s+/.exec(s.slice(dend, b));
      if (mon) {
        a = dend + mon[0].length;
        [ts, win] = timingOf(L, a, b, qruns);
        ds = null;
      }
    }
    const ends = [ts, ds].filter((x) => x !== null);
    let argB = ends.length ? Math.min(...ends) : b;
    if (EXT && si === 0 && cl.opener === null && cl.postfix && cl.postfix.length) {
      const pf = cl.postfix.filter(([, x]) => x >= a).map(([, x]) => x);
      if (pf.length) argB = Math.min(argB, ...pf);
    }
    if (EXT) {
      const fs = /\.\s+(?=[A-Z][a-z])/g;
      fs.lastIndex = a;
      let mf;
      while ((mf = fs.exec(L.text)) !== null && mf.index < argB) {
        if (inRuns(qruns, mf.index) || !proseCut(L, a, mf.index, argB)) continue;
        argB = mf.index;
        break;
      }
    }
    const mc = searchIn(COMMENTARY_CUT, s, a, argB);
    if (mc && !inRuns(qruns, mc.index) && !L.styled(mc.index)) {
      if (/^(?:as|so)\s+long\s+as/.test(mc[0])) {
        const cond = strip(L.text.slice(mc.index, argB));
        L.issue("CONDITION_AS_LONG_AS", cond.slice(0, 60));
        (out.conditions = out.conditions || []).push(cond);
      }
      argB = mc.index;
    }
    if (win && win.shape !== "fronted" && (win.end || 0) < b) {
      const tail = s.slice(win.end, b);
      if (tail.replace(/^[ ,.;)]+|[ ,.;)]+$/g, "") && !/^\s*(?:,?\s*(?:by\s+asking|asking|with)|,?\s*(?:and|but)\b)/.test(tail)) {
        if (ds === null || ds < win.end) L.issue("TEXT_AFTER_TIMING", tail.slice(0, 50));
      }
    }
    let arg = s.slice(a, argB);
    if (EXT && cl.cond && (si > 0 || cl.condLead) && !arg.replace(/^[ ,.:;]+|[ ,.:;]+$/g, "")) {
      for (const [x, y, scope] of cl.cond) {
        const txt = strip(L.text.slice(x, y)).replace(/[,.;:]+$/, "");
        if (!txt) continue;
        const f = { kind: kind === "prompt_partial" ? "prompt" : kind, src: "condition", start: x, end: y, text: txt, R: kind === "accept" ? [txt] : [], P: kind === "accept" ? [] : [txt], quoted: [txt], scope: scope || null, cls: null, window: win, ask, subst_for: null, ca: x, cb: y, wholeRequired: true, core: txt };
        out.forms.push(f);
      }
      cl.condUsed = true;
      return;
    }
    if (EXT && lastItems.length && /^\s*(?:it|them|this|that|these|those)\s*$/i.test(arg)) arg = "";
    if (!arg.replace(/^[ ,.:;]+|[ ,.:;]+$/g, "")) {
      if (lastItems.length && (win || ask)) {
        for (const it of lastItems) out.forms.push({ ...it, kind, window: win, ask, src: "inherited-arg" });
        return;
      }
      if (kind === "prompt_partial") { out.rules.partial_policy = "prompt"; return; }
      L.issue("NO_ARGUMENT", `${t}: ${segTxt.slice(0, 50)}`);
      return;
    }
    if (kind === "prompt_partial" && cl.opener === "prompt_partial" && si === 0) out.rules.partial_policy = "prompt";
    if (NEG.has(kind)) {
      const mexc = new RegExp(B + R`(?:other\s+than|except(?:\s+for)?|besides|apart\s+from)` + E).exec(arg);
      if (mexc && !inRuns(qruns, a + mexc.index)) {
        const exc = qruns.filter(([x]) => x >= a + mexc.index && x < argB).map(([x, y]) => L.text.slice(x + 1, y - 1));
        out.forms.push({ kind: "exception", src: "clause", start: a + mexc.index, end: argB, text: strip(L.text.slice(a + mexc.index, argB)), R: [], P: [], quoted: exc.length ? exc : [strip(L.text.slice(a + mexc.index + mexc[0].length, argB))], scope: null, cls: null, window: win, ask: null });
        L.issue("NEG_EXCEPTION", arg.slice(mexc.index).slice(0, 50));
        argB = a + mexc.index; arg = s.slice(a, argB);
      }
    }
    if (PARTIAL_WORD.test(strip(arg)) && new RegExp("^" + PARTIAL_WORD.source, "i").test(strip(arg)) || (kind === "prompt_partial" && PARTIAL_WORD.test(arg))) {
      const pol = kind === "prompt" || kind === "prompt_partial" ? "prompt" : NEG.has(kind) ? "reject" : null;
      if (pol) {
        out.rules.partial_policy = pol;
        const pm = searchIn(PARTIAL_WORD_G, s, a, argB);
        const rest = s.slice(pm ? mEnd(pm) : a, argB);
        if (!rest.replace(/^[ ,.;]+|[ ,.;]+$/g, "")) return;
      }
    }
    if (kind === "prompt_partial" && new RegExp("^" + LESS_SPECIFIC.source, "i").test(strip(arg))) {
      out.rules.prompt_less_specific = true;
      kind = "prompt";
      L.issue("CLASS_LESS_SPECIFIC", arg.slice(0, 60));
    }
    if (EXT && /\b(?:if\s+)?(?:all\s+(?:two|three|four|five|of\s+them)|both)\b[^;]*?\b(?:are\s+|is\s+)?(?:given|said|named|stated|required|needed|mentioned)\b/i.test(s.slice(a, b))) L.noListSplit = [a, b];
    if (EXT) {
      // several "in place of “X”" slots in one clause: each chunk carries its own substitution
      const subs = [];
      for (const m2 of findIter(SUBST, s, a, argB)) {
        if (inRuns(qruns, m2.index) || !(/^(?:in |instead|in lieu)/.test(m2[0]) || /^["']/.test(m2[1]))) continue;
        subs.push(m2);
      }
      if (subs.length > 1) {
        let ca = a;
        for (const m2 of subs) {
          let x = ca;
          const lead = /^\s*(?:,\s*)?(?:or|and)?\s*/.exec(s.slice(x, m2.index));
          if (lead) x += lead[0].length;
          if (x < m2.index) processArg(kind, x, m2.index, win, ask, qruns, m2[1].replace(/^["']+|["']+$/g, ""), cl, si, t, segTxt);
          ca = mEnd(m2);
        }
        L.noListSplit = null;
        return;
      }
    }
    processArg(kind, a, argB, win, ask, qruns, undefined, cl, si, t, segTxt);
    L.noListSplit = null;
    // a timing modifier in the middle of a list binds to the item(s) before it; later items have their own window
    if (EXT && win && win.shape !== "fronted" && ts !== null && argB === ts && win.end < (ds !== null ? ds : b)) {
      const tb = ds !== null ? ds : b;
      const mt = /^\s*,?\s*(?:or|and|,)\s+/.exec(s.slice(win.end, tb));
      const tailA = mt ? win.end + mt[0].length : tb;
      let anchor = qall.some(([x, y]) => x >= tailA && y <= tb + 1);
      for (let k = tailA; k < tb && !anchor; k++) if (L.styled(k) && strip(s[k])) anchor = true;
      if (L.reqStyle === "none" && mt && /[\p{L}]{3,}/u.test(s.slice(tailA, tb)) && !/^\s*(?:but|and|or|then|otherwise)\b/.test(s.slice(tailA, tb))) anchor = true;
      if (mt && anchor) {
        const ta = win.end + mt[0].length;
        const qr2 = qall.filter(([x, y]) => x >= ta && y <= tb + 1);
        const [ts2, win2] = timingOf(L, ta, tb, qr2);
        processArg(kind, ta, ts2 !== null ? ts2 : tb, win2, ask, qr2, undefined, cl, si, t, segTxt);
      }
    }
  }
  function processArg(kind, a, argB, win, ask, qruns, substGiven, cl, si, t, segTxt) {
    let arg = s.slice(a, argB);
    let subst = null;
    if (substGiven !== undefined) subst = substGiven;
    const msub = substGiven !== undefined ? null : searchIn(SUBST, s, a, argB);
    if (msub && msub.index < argB && !inRuns(qruns, msub.index) && (/^(?:in |instead|in lieu)/.test(msub[0]) || /^["']/.test(msub[1]))) {
      subst = msub[1].replace(/^["']+|["']+$/g, "");
      argB = msub.index; arg = s.slice(a, argB);
    }
    let mcont = CONTAIN.exec(arg);
    if (!mcont && EXT && kind === "accept") {
      const ma = /^\s*(?:anything|any\s+answer)\s+(?=\S)/.exec(arg);
      if (ma && L.styled(a + ma[0].length)) mcont = ma;
    }
    if (mcont) {
      const mex0 = searchIn(EXAMPLES, s, a + mcont[0].length, argB);
      const cend = mex0 && !inRuns(qruns, mex0.index) ? mex0.index : argB;
      const f = containForm(L, kind, a, cend, qruns, win, ask, subst);
      if (!f.slots.length) L.issue("CLASS_OPEN", `${kind}: ${arg.slice(0, 60)}`);
      else L.issue("CLASS_CONTAIN", `${kind}: ${arg.slice(0, 60)}`);
      const mex = searchIn(EXAMPLES, s, a, argB);
      if (mex && !inRuns(qruns, mex.index)) {
        f.end = mex.index;
        for (const [x, y] of splitItems(L, mEnd(mex), argB, qruns, kind)) {
          const it = makeItem(L, x, y, kind, qruns);
          Object.assign(it, { src: "example", window: win, ask, subst_for: subst });
          out.forms.push(it);
        }
      }
      out.forms.push(f);
      lastItems = [f];
      return;
    }
    if (searchIn(KW.acc_range.g, arg, 0)) L.issue("NUMERIC_RANGE", arg.slice(0, 60));
    const items = splitItems(L, a, argB, qruns, kind);
    const cur = [];
    for (const [x, y] of items) {
      let it = makeItem(L, x, y, kind, qruns);
      Object.assign(it, { src: "clause", window: win, ask, subst_for: subst });
      if (CONTAIN.test(s.slice(x, y)) && !/^\s*(?:other\s+)?word\s*forms?/.test(s.slice(x, y))) {
        const f = containForm(L, kind, x, y, qruns, win, ask, subst);
        L.issue(f.slots.length ? "CLASS_CONTAIN" : "CLASS_OPEN", `${kind}: ${s.slice(x, y).slice(0, 60)}`);
        out.forms.push(f); cur.push(f);
        continue;
      }
      if (it.cls && PARTIAL_WORD.test(it.cls)) {
        const pol = kind === "prompt" || kind === "prompt_partial" ? "prompt" : NEG.has(kind) ? "reject" : null;
        if (pol) out.rules.partial_policy = pol;
        continue;
      }
      if (kind === "prompt_partial") {
        it.kind = "prompt";
        if (!it.P.length) it.P = it.quoted ? [it.quoted[0]] : [it.core];
      }
      if (it.cls) {
        const word = it.cls.toLowerCase();
        const mex = searchIn(EXAMPLES, s, x, y);
        if (/word\s*forms?/.test(word)) {
          const mof = /word\s*forms?\s+of\s+(.+)$/d.exec(s.slice(x, y));
          const target = mof ? strip(L.text.slice(x + mof.indices[1][0], y)) : (cur.length ? (cur[cur.length - 1].core || cur[cur.length - 1].text) : "MAIN");
          (out.rules.word_forms = out.rules.word_forms || []).push(`${kind}:${target.slice(0, 40)}`);
        } else if (/equivalent|synonym|description|similar|anything|answers?|translation|spelling|specific|abbreviation|the like|etc|variant|forms?/.test(word)) {
          (out.rules.open_class = out.rules.open_class || []).push(`${kind}:${word.slice(0, 40)}`);
          L.issue("CLASS_OPEN", `${kind}: ${word.slice(0, 60)}`);
        }
        if (mex) {
          for (const [x2, y2] of splitItems(L, mEnd(mex), y, qruns, kind)) {
            const it2 = makeItem(L, x2, y2, kind, qruns);
            Object.assign(it2, { src: "example", window: win, ask, subst_for: subst });
            out.forms.push(it2); cur.push(it2);
          }
        }
        continue;
      }
      let firstStyled = y;
      for (let k = x; k < y; k++) if (L.styled(k) && strip(s[k])) { firstStyled = k; break; }
      const lead = s.slice(x, firstStyled);
      if (firstStyled < y && CLASSY.test(lead) && searchIn(EXAMPLES, lead, 0) && !/word\s*forms?/.test(lead)) {
        (out.rules.open_class = out.rules.open_class || []).push(`${kind}:${strip(lead).slice(0, 40)}`);
        L.issue("CLASS_OPEN_WITH_EXAMPLES", `${kind}: ${strip(lead).slice(0, 50)}`);
      }
      const mwf = /word\s*forms?/.exec(s.slice(x, y));
      if (mwf && !it.cls) {
        (out.rules.word_forms = out.rules.word_forms || []).push(`${kind}:${cur.length ? (cur[cur.length - 1].core || cur[cur.length - 1].text).slice(0, 40) : "MAIN"}`);
        const mex = searchIn(EXAMPLES, s, x, y);
        if (mex) {
          it = makeItem(L, mEnd(mex), y, kind, qruns);
          Object.assign(it, { src: "example", window: win, ask, subst_for: subst });
        }
      }
      if (kind === "accept" && !it.R.length) {
        it.R = [it.core];
        it.wholeRequired = true;
        if (!(it.quoted || L.reqStyle !== "bu")) L.issue("ACCEPT_ITEM_UNMARKED", it.core.slice(0, 60));
      }
      if ((kind === "prompt" || kind === "antiprompt") && !it.P.length) { it.P = it.quoted ? [it.quoted[0]] : [it.core]; it.wholeRequired = true; }
      if (NEG.has(kind) && !it.quoted) L.issue("REJECT_UNQUOTED", it.core.slice(0, 60));
      const mn = /\(([^()]*)\)/d.exec(s.slice(x, y));
      if (mn && !it.window) {
        const n0 = x + mn.indices[1][0], n1 = x + mn.indices[1][1];
        const [, w2] = timingOf(L, n0, n1, qruns.filter(([q1]) => q1 >= n0));
        if (w2) { it.window = w2; L.issue("NESTED_TIMING", mn[0].slice(0, 40)); }
      }
      out.forms.push(it); cur.push(it);
    }
    if (cur.length) lastItems = cur;
  }
  const nexts = out.forms.filter((f) => f.src === "main_next").map((f) => f.start).sort((x, y) => x - y);
  if (nexts.length) {
    out.rules.multi = true;
    const dgroups = groups.filter((g) => g.kind === "directive");
    for (const f of out.forms) {
      f.answer = nexts.filter((x) => x <= f.start).length;
      for (let gi2 = 1; gi2 < dgroups.length; gi2++) {
        const g = dgroups[gi2], prev = dgroups[gi2 - 1];
        if (g.istart <= f.start && f.start < g.iend && !strip(s.slice(prev.end, g.start))) f.answer = "line";
      }
    }
  }
  return out;
}

// ======================================================================
// Judging (answerline_spec.md §8, J1–J14; judging_rules.md)
// ======================================================================

// ---------------------------------------------------------------- J1 normalisation
const SPECIAL_FOLD = new Map(Object.entries({
  "ß": "ss", "ẞ": "ss", "æ": "ae", "Æ": "ae", "œ": "oe", "Œ": "oe", "ø": "o", "Ø": "o", "ł": "l", "Ł": "l",
  "đ": "d", "Đ": "d", "ð": "d", "Ð": "d", "þ": "th", "Þ": "th", "ı": "i", "ʻ": "", "ʼ": "", "ʿ": "", "ʾ": "",
}));
const UMLAUT_STD = new Map(Object.entries({ "ö": "oe", "ü": "ue", "ä": "ae", "Ö": "oe", "Ü": "ue", "Ä": "ae" }));
const GREEK = new Map(Object.entries({
  "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "ε": "epsilon", "ζ": "zeta", "η": "eta", "θ": "theta", "ι": "iota",
  "κ": "kappa", "λ": "lambda", "μ": "mu", "ν": "nu", "ξ": "xi", "ο": "omicron", "π": "pi", "ρ": "rho", "σ": "sigma", "ς": "sigma",
  "τ": "tau", "υ": "upsilon", "φ": "phi", "χ": "chi", "ψ": "psi", "ω": "omega", "Δ": "delta", "Σ": "sigma", "Ω": "omega",
  "Π": "pi", "Φ": "phi", "Ψ": "psi", "Γ": "gamma", "Λ": "lambda", "Θ": "theta",
}));
const SYMBOL_WORD = new Map(Object.entries({ "&": "and", "%": "percent", "°": "degrees", "♭": "flat", "♯": "sharp", "♮": "natural" }));
const APOS_RX = /['’ʼ`´‘]/;
const ALNUM_RX = /[\p{L}\p{N}]/u;
const LETTER_RX = /\p{L}/u;
const FOLD_CACHE = [new Map(), new Map()];

function foldChar(ch, plain) {
  const cache = FOLD_CACHE[plain ? 1 : 0];
  let f = cache.get(ch);
  if (f !== undefined) return f;
  f = SPECIAL_FOLD.get(ch);
  if (f === undefined && !plain) f = UMLAUT_STD.get(ch);
  if (f === undefined) f = GREEK.get(ch);
  if (f === undefined) f = ch.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase();
  cache.set(ch, f);
  return f;
}

// Tokenise text into folded word tokens. attr(k) -> { r: required?, run: tag-run id, tb: tag boundary before k } or null (skip).
function tokenize(text, attr, plain) {
  const out = [];
  let cur = null;
  const n = text.length;
  let prevA = null;
  const flush = () => { if (cur && cur.t) out.push(cur); cur = null; };
  const add = (str, k, a, origCh) => {
    if (!cur) cur = { t: "", r: [], runs: [], cap: /\p{Lu}/u.test(origCh), orig: "", k0: k, k1: k + 1, dotted: false };
    for (const c of str) { cur.t += c; cur.r.push(!!(a && a.r)); cur.runs.push(a && a.r ? a.run : -1); }
    cur.orig += origCh;
    cur.k1 = k + 1;
  };
  const sym = (w, k) => { const a = attr ? attr(k) : null; const r = !!(a && a.r); flush(); out.push({ t: w, r: [...w].map(() => r), runs: [...w].map(() => (r ? a.run : -1)), cap: false, orig: w, k0: k, k1: k + 1, sym: true }); };
  for (let k = 0; k < n; k++) {
    const ch = text[k];
    const a = attr ? attr(k) : null;
    if (a === null && attr) { flush(); continue; }
    if (APOS_RX.test(ch)) {
      // "1930's" is the decade "1930s" (J§8.4)
      if (cur && /^\d+$/.test(cur.t) && /^[sS]$/.test(text[k + 1] || "") && !ALNUM_RX.test(text[k + 2] || "")) continue;
      // a possessive 's / ’s at the end of a word is dropped; any other apostrophe joins (O'Connor -> oconnor)
      if (cur && /^[sS]$/.test(text[k + 1] || "") && !ALNUM_RX.test(text[k + 2] || "")) { cur.poss = true; k++; continue; }
      continue;
    }
    if (ch === "." && cur && (cur.t.length === 1 || cur.dotted) && LETTER_RX.test(text[k + 1] || "") && !ALNUM_RX.test(text[k + 2] || "")) { cur.dotted = true; continue; }
    if ((ch === "-" || ch === "−" || ch === "–") && !cur && /\d/.test(text[k + 1] || "") && !(k > 0 && ALNUM_RX.test(text[k - 1]))) { sym("minus", k); continue; }
    if (ch === "+" && !cur && /\d/.test(text[k + 1] || "")) { sym("plus", k); continue; }
    if (ch === "+" && cur) { add("plus", k, a, ch); continue; }
    // "A*", "GNI*", "m*": a star ending a short symbol-like word is part of it ("A-star"); not emphasis ("*not*")
    // and not a censored word ("M*A*S*H")
    if (ch === "*" && cur && !ALNUM_RX.test(text[k + 1] || "") && text[cur.k0 - 1] !== "*" && (cur.t.length <= 3 || (cur.t.length <= 4 && /^[A-Z0-9]+$/.test(cur.orig)))) { add("star", k, a, ch); continue; }
    if ((ch === "-" || ch === "−") && cur && !ALNUM_RX.test(text[k + 1] || "")) { add("minus", k, a, ch); continue; }
    if (ch === "#" && cur && /^[a-g]$/.test(cur.t)) { flush(); sym("sharp", k); continue; }
    if (ch === "," && cur) { cur.comma = true; flush(); continue; }
    const sw = SYMBOL_WORD.get(ch);
    if (sw) { sym(sw, k); continue; }
    const f = foldChar(ch, plain);
    if (f === "" && LETTER_RX.test(ch)) continue;
    if (f && /^[\p{L}\p{N}]+$/u.test(f)) {
      // a tag boundary between a lower- and an upper-case letter splits glued words ("<u>Nick</u><u>Carraway</u>")
      if (cur && a && a.tb && a.r && prevA && prevA.r && /\p{Ll}/u.test(text[k - 1] || "") && /\p{Lu}/u.test(ch)) flush();
      add(f, k, a, ch);
      prevA = a;
    } else flush();
  }
  flush();
  return out;
}

// ---------------------------------------------------------------- numbers
const CARD = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40,
  fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11,
  twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19,
  twentieth: 20, thirtieth: 30, fortieth: 40, fiftieth: 50, sixtieth: 60, seventieth: 70, eightieth: 80, ninetieth: 90, hundredth: 100 };
const DECADE = { tens: 10, twenties: 20, thirties: 30, forties: 40, fifties: 50, sixties: 60, seventies: 70, eighties: 80, nineties: 90 };
const SCALE = { hundred: 100, thousand: 1000, million: 1000000 };
const ROMAN_RX = /^(?=[mdclxvi]+$)m{0,3}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/;
function romanVal(s) {
  if (!ROMAN_RX.test(s)) return null;
  const v = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) { const a = v[s[i]], b = v[s[i + 1]] || 0; total += a < b ? -a : a; }
  return total;
}
function numInfo(t) {
  let m;
  if ((m = /^(\d+)$/.exec(t))) return { v: Number(m[1]), kind: "digit" };
  if ((m = /^(\d+)(st|nd|rd|th)$/.exec(t))) return { v: Number(m[1]), kind: "ord" };
  if ((m = /^(\d+)s$/.exec(t))) return { v: Number(m[1]), kind: "digit", decade: true };
  if (t in CARD) return { v: CARD[t], kind: "card" };
  if (t in ORD) return { v: ORD[t], kind: "ord" };
  if (t in DECADE) return { v: DECADE[t], kind: "card", decade: true };
  if (t in SCALE) return { v: SCALE[t], kind: "card" };
  return null;
}
// digits and Roman numerals equal any number word; cardinal words are not ordinal words ("Two Treatises" ≠ "Second Treatise")
function numEq(a, b) {
  if (!a || !b || a.v !== b.v || !!a.decade !== !!b.decade) return false;
  return a.kind === b.kind || a.kind === "digit" || b.kind === "digit" || a.kind === "roman" || b.kind === "roman";
}
// Merge runs of number words ("nineteen forty eight", "eighteen forties", "two thousand five") into one numeric token.
function mergeNumbers(toks) {
  const isW = (t) => t && !t.sym && /^[a-z]+$/.test(t.t) && (t.t in CARD || t.t in ORD || t.t in DECADE || t.t in SCALE);
  const out = [];
  for (let i = 0; i < toks.length; i++) {
    if (!isW(toks[i])) { out.push(toks[i]); continue; }
    let j = i;
    while (j < toks.length && (isW(toks[j]) || (toks[j].t === "and" && j > i && toks[j - 1].t in SCALE && toks[j + 1] && toks[j + 1].t in CARD))) j++;
    const run = toks.slice(i, j).filter((t) => t.t !== "and").map((t) => t.t);
    if (run.length === 1) { out.push(toks[i]); continue; }
    const val = parseNumberWords(run);
    if (!val) { out.push(...toks.slice(i, j)); i = j - 1; continue; }
    const first = toks[i], last = toks[j - 1];
    const t = String(val.v) + (val.decade ? "s" : val.kind === "ord" ? "th" : "");
    const req = first.r.some(Boolean) || last.r.some(Boolean);
    const nm = { v: val.v, kind: val.kind, decade: !!val.decade };
    // "One <u>Hundred</u> Years of Solitude": the required words alone are a number too ("Hundred Years of Solitude")
    const words = toks.slice(i, j).filter((x) => x.t !== "and");
    const reqW = words.filter((x) => x.r.some(Boolean));
    if (reqW.length && reqW.length < words.length) {
      const rv = reqW.length === 1 ? numInfo(reqW[0].t) : parseNumberWords(reqW.map((x) => x.t));
      if (rv && rv.v !== val.v) nm.alt = { v: rv.v, kind: rv.kind, decade: !!rv.decade };
    }
    out.push({ t, r: [...t].map(() => req), runs: [...t].map(() => (req ? first.runs.find((x) => x >= 0) ?? -1 : -1)), cap: false,
      orig: toks.slice(i, j).map((x) => x.orig).join(" "), k0: first.k0, k1: last.k1, numMerged: nm });
    i = j - 1;
  }
  return out;
}
function parseNumberWords(run) {
  const last = run[run.length - 1];
  const kind = last in ORD ? "ord" : "card";
  const decade = last in DECADE;
  const val = (w) => (w in CARD ? CARD[w] : w in ORD ? ORD[w] : w in DECADE ? DECADE[w] : null);
  if (run.some((w) => w in SCALE)) {
    let total = 0, curv = 0;
    for (const w of run) {
      if (w in SCALE) { if (SCALE[w] === 100) curv = (curv || 1) * 100; else { total += (curv || 1) * SCALE[w]; curv = 0; } }
      else { const v = val(w); if (v === null) return null; curv += v; }
    }
    return { v: total + curv, kind, decade };
  }
  const chunks = [];
  for (let i = 0; i < run.length; i++) {
    const v = val(run[i]);
    if (v === null) return null;
    const nx = i + 1 < run.length ? val(run[i + 1]) : null;
    if (v >= 20 && v % 10 === 0 && nx !== null && nx > 0 && nx < 10) { chunks.push(v + nx); i++; }
    else chunks.push(v);
  }
  if (chunks.length === 1) return { v: chunks[0], kind, decade };
  if (chunks.length === 2 && chunks[0] >= 10 && chunks[1] < 100) return { v: chunks[0] * 100 + chunks[1], kind, decade };
  return null;
}

// ---------------------------------------------------------------- word equivalences
const ARTICLES_EN = new Set(["the", "a", "an"]);
const ARTICLES_ALL = new Set(["the", "a", "an", "le", "la", "les", "l", "el", "los", "las", "il", "lo", "gli", "der", "die", "das", "den", "dem", "des", "het", "een"]);
const CONNECTIVES = new Set(["of", "and", "de", "di", "da", "du", "del", "della", "dei", "des", "van", "von", "der", "den", "ter", "ten", "y", "et", "und", "e", "by", "al", "el", "bin", "ibn"]);
const HONORIFICS = new Set(["saint", "st", "sir", "dame", "king", "queen", "emperor", "empress", "pope", "president", "general", "dr", "doctor",
  "captain", "mr", "mrs", "ms", "professor", "prof", "sultan", "tsar", "czar", "chancellor", "senator", "admiral"]);
// generic class nouns: "name this war" makes "war" optional in a required span and an accounted extra word (J§4.8)
const GENERIC_NOUNS = new Set(("war wars battle battles river rivers dynasty empire treaty peace accord acid law laws effect sea island islands city " +
  "mountain mountains lake ocean country nation state kingdom republic god goddess deity author poet composer painter novel poem play opera " +
  "symphony painting sculpture film movie book story company theory process reaction element compound molecule protein enzyme organ cell " +
  "region province language festival holiday event conflict revolution rebellion revolt movement party team ship vessel submarine building " +
  "church temple cathedral bridge canal desert forest planet star galaxy constellation ruler family order phenomenon disease syndrome device " +
  "instrument technique method equation constant particle force council siege massacre crisis incident affair act bill case doctrine system " +
  "museum university college school prize award journal magazine newspaper album song series show character hero figure saint culture " +
  "civilization period era age style genre tribe people dance game sport ballet suite concerto sonata cantata mass requiem oratorio work").split(/\s+/));
const NEVER_ACCOUNTED = new Set(["or", "nor", "not", "no", "never", "andor", "isnt", "wasnt", "neither"]);
const ABBREV = new Map(Object.entries({ st: "saint", mt: "mount", ft: "fort", no: "number", nos: "numbers", op: "opus", vs: "versus", v: "versus",
  dr: "doctor", jr: "junior", sr: "senior", gen: "general", mtn: "mountain", mts: "mountains", pres: "president", univ: "university", bros: "brothers" }));
const IRREGULAR = [["mouse", "mice"], ["man", "men"], ["woman", "women"], ["child", "children"], ["foot", "feet"], ["tooth", "teeth"],
  ["goose", "geese"], ["ox", "oxen"], ["person", "people"], ["datum", "data"], ["medium", "media"], ["criterion", "criteria"],
  ["phenomenon", "phenomena"], ["genus", "genera"], ["corpus", "corpora"], ["louse", "lice"]];
const IRR_MAP = new Map();
for (const [a, b] of IRREGULAR) { IRR_MAP.set(a, b); IRR_MAP.set(b, a); }
const SUFFIX_PAIRS = [["us", "i"], ["um", "a"], ["on", "a"], ["a", "ae"], ["is", "es"], ["ex", "ices"], ["ix", "ices"], ["man", "men"], ["f", "ves"], ["fe", "ves"], ["y", "ies"], ["o", "oes"], ["os", "oi"]];

// Number inflection (J§7.1): may the response token r stand for the form word f? A proper noun that heads its form
// (fProt) never loses a final s ("Mars" is not "Mar").
function inflEq(f, r, fProt) {
  if (f === r) return true;
  if (f.length < 2 || r.length < 2) return false;
  if (IRR_MAP.get(f) === r) return true;
  if (r.length > f.length) {
    if (r === f + "s" || r === f + "es") return true;
  } else if (!fProt && (f === r + "s" || f === r + "es")) return true;
  if (f.length >= 4 && r.length >= 3) {
    for (const [sg, pl] of SUFFIX_PAIRS) {
      if (f.endsWith(sg) && r.endsWith(pl) && f.length - sg.length >= 2 && f.slice(0, -sg.length) === r.slice(0, -pl.length)) return true;
      if (!fProt && f.endsWith(pl) && r.endsWith(sg) && r.length - sg.length >= 2 && f.slice(0, -pl.length) === r.slice(0, -sg.length)) return true;
    }
  }
  return false;
}
function abbrevEq(a, b) { return ABBREV.get(a) === b || ABBREV.get(b) === a; }
// British / American spelling variants are the same word, not a typo (sulphuric/sulfuric, sabre/saber, flavour/flavor)
function spellKey(s) {
  return s.replace(/our(?=s?$|ed|ing|ite|ful|less|ism)/, "or").replace(/([^aeiou])re(s?)$/, "$1er$2").replace(/ae/g, "e").replace(/ph/g, "f")
    .replace(/is(e|ed|es|ing|ation|ations)$/, "iz$1").replace(/ys(e|ed|es|ing)$/, "yz$1").replace(/ogue$/, "og");
}
function spellEq(a, b) { return a.length >= 5 && b.length >= 5 && a !== b && spellKey(a) === spellKey(b); }

// Optimal string alignment (Damerau) distance, capped: returns max + 1 when over.
function osa(a, b, max) {
  if (a === b) return 0;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > max) return max + 1;
  let p2 = new Array(lb + 1).fill(0), p1 = new Array(lb + 1), cur = new Array(lb + 1);
  for (let j = 0; j <= lb; j++) p1[j] = j;
  for (let i = 1; i <= la; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(p1[j] + 1, cur[j - 1] + 1, p1[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    [p2, p1, cur] = [p1, cur, p2];
  }
  return p1[lb];
}

// Consonant skeleton for "be lenient with pronunciation / spelling" lines (judging_rules §11.3, §15.4).
function phonKey(s) {
  let t = String(s).toLowerCase().replace(/[^a-z]/g, "");
  if (!t) return "";
  t = t.replace(/ph/g, "f").replace(/x/g, "ks").replace(/ck/g, "k").replace(/q/g, "k").replace(/c(?=[eiy])/g, "s").replace(/c/g, "k")
    .replace(/sch|sh|zh/g, "s").replace(/z/g, "s").replace(/th/g, "t").replace(/w/g, "v").replace(/j/g, "y")
    .replace(/([bdfgklmnprstvz])h/g, "$1");
  const head = t[0];
  return (head + t.slice(1).replace(/[aeiouy]/g, "")).replace(/(.)\1+/g, "$1");
}

// ---------------------------------------------------------------- collision lexicon (J10 guard, judging_rules.md §11.2)
// Answer words of the app's own question corpus (data/questions.db, preview build 2026-10) that occur in the required
// span of at least 10 answer lines and lie within the J10 typo budget of another answer word. Each entry is the word
// followed by its count in base 36 (two characters, capped at 1295). Built once from the corpus; parsed on first use.
// A fuzzy match is blocked when its fuzzed token is the only required token of its span (nothing corroborates it)
// and is itself a frequent answer word (count >= 10 and at least a quarter as frequent as the target word):
// "Manet" for Monet, "Lakshmi" for Lakshman, "Austria" for Australia, "cytokine" for cytosine. Rare variant spellings
// ("Tutankhamen", "Pharoah") still pass. The app can supply a fuller lexicon as opts.isKnownAnswer(normalised).
const CONFUSABLE_SRC = "aaron1n ababa0c abbasid2w abbott0j abdication0b abduction10 abdul0p abelian0i aberration10 ablation0a ablution0a abolition17 aboriginal19 aborigine16 aborigines1a abortion2p abraham34 absinthe0h absolute24 absorption0e academic16 acadia0q acceleration2o accelerator0s accident0n accidental0h according0q accordion0j acetate0e acetic1s acetyl1d achaean0b achaemenid0t acharnians0a acheson0e achilles45 acidification0a ackroyd0d acres0d acrostic0c actin2d acting0g action5l activated0b activation2b active0y actor1k adamse1 adaptive0x addams0n adderley0c addiction0n addis0e addition0l adele0b adenine0q adenosine0r adhesion0b adiabatic2e adieux0a adler1t administration12 adolf0a adolphus22 adonais0j adonis1o adoration0k adrenal17 adrenaline0r adrian0t adsorption1u adventist0q adventure0n adventures19 aegir0j aegis0f aegospotami0m aeolian0c aesop17 aesthetic0t aesthetics0x aether0f affinity14 affluent0p affordable0e afonso0g africaga african3m africanus0q after2e afternoon2t again10 agassiz0a agatha0b agent0x agincourt18 aging0i agnes0x agnew0y agnus0a agonistes0d agreement0o agricultural0j agriculture16 agrippa0h agrippina0j aharonov0n ahmad0c ahmadinejad0a ahmadiyya0b ahmed0f ahura19 ailey0l aires19 airplane0f aisha0d akbar2c akhenaten1h akhnaten0b akutagawa3i aland0c alaska4k alban0m albania36 albanian0t albans0h albany1i albee3c albers0g albert2t alberta0z alberti0p albertine0a album18 alcatraz0r alcestis0i alchemist17 alchemy0p alcoholism0b alcohols0f alcott1d alcuin0i alder2a aldol1a aldous0a aleksandr0c alexandere1 alexandria33 alexandrine0d alexei0e alexie0q alexievich0b alexios0d alexis0a alexius0g alfonso19 alfred4w algae0s algebra1n algebraic0e alger0b algeria3o algerian0l algonquin0f algorithm0j alice2v alien1t alighieri1v alignment0f alison0a alium0a alive0n aliyah0b alkan0b alkane0j alkene32 alkenes0d alkyne22 alkynes0d allah0h allegiance0e allegri0a allegro0d allele0d allen29 allende4q alley0w alliance3l allison0l alliteration0l allosteric0e allotrope0o alloy0z allport0f almanac0f alone10 along0g alpha67 alpine0g altai0c altar0h alternate0a alternating0q alternation0c alternative0f altitude0c altruism1g aluminum32 alvin0c amado0n amahl0a amarna0s amaru0n amazon4l amazons0c amber0k ambersons0a amelia0b americae4 americanm2 americans0z americas0a amerika0g amide0n amiens0e amine1q amino38 amish0n amistad0j ammit0i ammonia3s amoeba0d among17 amphitryon0c amphoteric0m amrit0c amsterdam16 amusement0b amylase0n anabaptist0m analysis1n analytic1e anansi2c anarchism16 anarchist0k anarchy3a anatolia0b anatomy1r anchorage0g ancient2n andalusia0a andersen1g anderson41 andes2f andre0w andrea0t andreas0e andrei0d andrew1p andrews0x andric0e andromache0e andromeda23 andros0r anecdote0b anemia0k angel5d angela0c angeles6e angelica0c angelico0o angelou2w angels4e angelus0d anger1r angiogenesis0e angiosperm11 angle33 angler0c anglican0t anglo14 angola23 angra0b angry21 anhydrase0i aniline0m anima0f animal48 animals2q anjou0l ankara0a annabel0u annales0m annals0e annelid0e annelida0d annie15 annihilation0w annus0c anomalous0e another0s anouilh0p anova0k anscombe14 anselm14 antaeus0c antarctica2j anthem1w anthology13 anthony3h antibodies2w antibody0q antigen0d antigone2d antigonid0c antigonus0d antilles0a antimatter0k antimony0e antioch11 antiochus0h antoine0q anton0x antonia17 antonin0n antoninus0f antonio1h antonioni0h antony27 anxiety0r anyon0b anyone0k aorta12 apartheid2e aphasia0b apical0b apocalypse16 apollinaire0n apologia0a apophis0a apoptosis32 apotheosis0o appalachia0c appalachian2w appian0i apples0y appleseed0b approximation0c april0s aqaba0c aquitaine0p arabia2m arabian24 arabic3z araby0o arachne0i arafat0i aragon1l arbitrage0b arbus14 arcade0k arcadia2g archaea0u archer0t archery0i archimedes1p architecture16 archive0j arcimboldo0d arden0j arena0g arendt27 areopagitica0i argentina9v arginine0q argon0t argonaut0o argonauts12 argos0v argus0a arhat0g ariadne1j arian0r arianism0a ariel10 aristaeus0a aristotle6e arius0a arjun0u arjuna11 arles0l armada1a armadillo0b armed0a armenia1z armenian2c armor0a armory0u arnold4p aromatic2h arpad0i arpeggio0a array17 arrhenius33 arrowsmith0f arsenic1e arslan0c artemio18 artemis39 artesian0c arthropod0h arthropoda0e articles10 artificial1o artist3y aruba0b ascending0j ascension0g aschenbach0a asclepius13 ascomycota0h ashanti1d ashbery0q ashcan11 ashoka2j ashura0l ashurbanipal10 asian0l asians0c aslan0c asoka0b assad0w assassin1a assassination5s assassins0i assembly0t assis0i assisi0j assist0a association17 assyria1o assyrian0x astana0a asterisk0e asteroid21 astor0o astronomer0o astronomy0a astrophel0a astros0i aswan0j asymmetric0d asymmetry0e asymptote0d asymptotic0x atalanta25 athabasca0c atheism1q athena30 athens7f athos0e atlanta3a atlantic39 atlantis10 atman0p atmosphere0i atomic3b atreus0g attack1b attempt0b attempted0g attendant0a attention1b attic0g attica0d attila27 attitude0a attlee10 attorney11 attractor0j attribution0t attucks0a atwood4l auction12 auden4f audubon0e auger0t augie0l augmented0l august1s augusta0d auguste0m augustine44 augustus3o aurangzeb1g aurea0a aurelian0k aureliano0f aureus0c aurora1r austen3v auster0c austerlitz17 austin1y australiahv australian0y austria4t austrian20 austro0c author3a automat0b automata0e avalokitesvara0b avery0a avesta12 awake0e awaken0f awami0a axiom0l axion0n ayers0e aymara0d ayutthaya0q ayyubid0e azeotrope1i azerbaijan0z azhar0b azide11 azores0f aztec60 baath0c babbitt16 babel2f babies0p babington0f babur11 babylon51 bacchus12 bachelors0c backward0q bacon5z bacteria0o bactria0e baden0j badge1v baeyer0h baghdad36 bahai49 bahrain0i baikal12 bailey0l baker2b bakke0c balaam0b balaclava0l balance1k balanchine18 balboa0e balcony0p balder0l baldr1p baldur0m balkan0x balla0a ballad22 ballade0i ballads1l ballard0k ballet2a ballets0b balliol0a ballistic0b balloon1h ballot0f balls0b balmer0h baltic1o baltimore3d bambi0a banana35 bananafish0t bandit0c bandung0j bandura1f bangladesh2f banjo0y banking0h bankruptcy0a banks0y banksy10 banner0t bantu14 baptism2e baptist30 barabbas0d baraka0y barbados15 barbara1v barbarian0f barbarians0v barbarossa23 barbary13 barber3w barbie0f barca0f barcarolle0e barge0c barium0k barkley0c barley0b barlow0f barnes16 barnum0k barometer0a baron1q barons0d baroque1i barque0j barre0r barrel0m barrett0i barrie0b barrier19 barry1b barth1a barthelme0j bartholdi0e bartholomew1g bartleby1b bartok3p barton0q baruch0l baryon12 basal0j basalt1u baseball3e basel0f bases0i bashir0f basho2u basic0w basie0l basil1o basin0b basis0x basket0c basketball12 basmala0a basque1u bastard0b batavia0a bates0a bateson0l bathory0e bathsheba0j batista0u batman0w baton0c batter0b batteries0n battery0w battle6l battles0a battuta13 baudelaire4g baudolino0g baudrillard0f bauer0l baumer0a bavaria1j bavarian0a bayer0a bayes1w bayeux0p bayezid0i bayle0g bayonet0e bayreuth0g beach63 beagle0i beard1o bearers0d bears0s beast1c beata0a beatles1m beatrix0d beatty0a beauregard0g beautiful26 beauty59 beaver1d beccaria0c becker0f becket14 beckett43 becquerel0f bedford0a beecher12 beetle0p begin0l behavior0j behavioral0p behaviorism0v behead0d beheading0o being8y belafonte0b belgian0c believe0m believer0g believers0a bella0c belle12 bellman0e bellow1x bellows0y bells0z belly0b bender0f bending0a beneath0c beneatha0a benedict4q benet0q bengal1m bengali16 bengals0a benin1e bennet0h bennett0r benso0f benton0t benzene4n beowulf4i berber0u berenger0r berger0f bergere0r bergman1j beria0e bering0w berio0a berkeley46 berlin8i bernadotte0f bernard13 bernarda0y bernhard0c bernice0f bernoulli35 bernstein36 berry16 berserker0a bertha0q bertrand0n betancourt0b bethe0j betrothed0j better0j beveridge0m bhagavad14 bharatiya0a biafra0p bible20 biden0q bieber0b bikini0d bilbao0q billiards0x billion0i bills0e billy2q binding1j binet0m biographies0a biography0e bipyramidal0m birch16 birches0f birdland0c birds2w birefringence0p birth7l birthday2c bismarck49 bison0i bitches0e bizet1z blackzz blackbeard0m blackbird13 blackbody0r blackwell0c blade0v blaine1h blake56 blakey0a blanc0x blanche10 bland0o blank0l blast0v blaue0r blazers0a blazing0c bleaching0d bleak0z blenheim0r bless0h bletchley0c bligh0i blind3n blindness24 blink0j bliss0k blithe0q bloch1p block15 blonde0h bloodek bloody2e bloom24 bloomd0y blows0g bluebeard0q blues3g bluest12 board17 boating0x bobby0e boccioni0s bodhidharma0g bodhisattva18 boeing0o boethius0u bogart0b boheme1o bohemia17 bohemian0h boiling1k boise0d bolano17 bolero1b bolivia2s bologna0z bolshevik0b bolton0c boltzmann5b bolzano0d bombay0e bonaparte2w bondage0q bonding0c bonds0g bones1b bonfire0m bongo0c boniface0w bonnard0b bonnie0l bonus11 boogie0y booker2a books1f boole0d boone0g boost0b booth1l boots0e borden0f border16 boreas0f borel0i borges6v boris1v borobudur0d borodin1r borodino0r boron3g bosch2g bosnia0v bosnian0d boson20 bossa0j boston8n bostonians0b botero0f botticelli2q bottle16 botulism0c boucher0z boudica0o boudicca0o bough1b boulanger19 boule0s boulevard0k boulez0e bound27 boundary1o bounded0g bourbon1m bourdieu0t bourgeois0o bourke0v bowen1e bower0a bowers0b bowie1c bowler0k bowling10 bowman0c boxer27 boxing0y boyar0f boyle1m boyne0m bradford0r bradley0w brady1k braganza0x bragg1q bragi0i brahe0m brahma1o brahman0d brahmaputra0g brahmin0s brahms77 braille0a brain3e bramante0f branch1h brancusi3k brand0m brandeis0q brandenburg2c brando0j brandt17 brant0b braque14 brasileiras0f brasilia0q brass0g brathwaite0k braun0f brautigan0b brave3f brazilg3 bread21 break19 breaking1o breast0u breath0q breathing0d breda0v breed0g bremsstrahlung0r bresson0u brest0v breton0z brett0a bretton0d breughel0d brewed0a brexit0u brian0q briand0m brick0q bride2s brideshead19 bridgec9 bridgerton0b bridges11 brief0j brigade1x briggs0r bright0o brigid0b brilliant0f bring0l brink0b brisingamen0a bristol0a britain4d britannia0g british4j britten3w broad0a broca0g brodie0x brokeback0c broken1p bromine1c bronco0a bronsted0c bronte3x bronx0a bronze5d brook0h brooke0w brooks33 brother2b browncx browne0k browning5o browns0a bruce1c bruch0p brucke0u bruckner2b bruegel24 brueghel0v bruges0c brunei0d brunel0a bruno0j brush0a brute0d brutus1s bryan2h bryant2l bryce0a bubble2d buber0a buchner0v bucket0b buckley0u buddha4s buddhism4s buddhist0u buffer27 buffett0a buhari0a build0z builder0u bukhara0m bulba0g bulgar14 bulgaria2t bulgarian0c bulge0y bullet12 bullfight0i bullfighter0u bulls0h bulow0b bulwer0n bumppo0i bundle0o bunin0a bunker14 bunny0c bunraku0q bunyan1n buonarroti11 burana1g burckhardt0b burden0x bureaucracy0e buren1d burger17 burgess1f burghers0g buried16 burke1t burma1y burne0e burned0f burner0j burney0e burning3m burns2p burnt0a burroughs14 burst0n burton0z burundi0f burying0j busoni0e buster0c butler53 butter0t byatt0i byblos0c byron4c byzantine3d byzantium1d cabal0f cabeza0a cable0t cabot0l cabral0m cache10 cactus0c cacus0b cadherin0c cadmus1r caesar4z caine0b cairo3m cajal0f cakes0b calaveras0o calcutta0z calder2g caldera0h caledonia0k calendar1c calgary0k californiac4 caligari0k called0j calling1a calliope0b callisto0o callixtus0c calorimeter12 calorimetry11 calvin3w calvinism0c calvino4e calydon0b calydonian0m calypso0y cambodia2s cambrai0s cambrian1k cambridge1x camden0d camel16 camera1n cameron1s cameroon13 camilla0f camino0b camoes0f campaign0k campbell1u campion0e campo0d camps0b camus3v canaan0a canadaaj canadian17 canal5b canaletto0h canary10 cancer3v candida0e candide3d candle22 candomble0g candy0n caning0a cannery0m cannes0t cannibal0z cannibalism0u canning0l cannizzaro0d cannon14 canoe0m canon2b canonical0y canonization0h canova1j canto18 canton0u cantonese0a cantor1q cantos0z cantus0d canute0g canyon1t capacitor36 capacity3z capek1y capet0l capital41 capitalism1u capitol0p capone0t capote26 capra0b capriccio0g caprices0e caprichos0g caprivi0g captive0a captivity0c caracalla0f caravaggio4w caravel0d carbond7 carbonari0i carbonate14 carbonyl1g carboxyl0d carboxylase0b carboxylic1a cardenas0j cardinal0q cardinals0t cards11 carey2k cargo0j caribbean1a carlisle0b carlist0r carlo1a carlos1x carlsen0e carlyle15 carmen3j carmina1g carnap0m carnatic0k carnation14 carnaval0u carnival35 carnot1m carol1k carolina6v caroline0v carpe0g carpentaria0a carpenter0w carpentier0y carpet0q carracci0j carraway0k carre0e carrey0b carriage0f carrie0w carried0w carrier0t carrington0j carroll26 carry0f carson1u carta1r cartel0h carter4f cartesian0e carthage41 cartier1d cartilage0k carton0a cartoon0q carver1e casablanca1g casals0h casanova0e casas0z cascade15 casey0l casino0e casparian0e caspian1f cassandra13 cassatt24 cassava0b cassini11 caste0t castile1f castle66 castling0a castor0t castorp0i castration0f castrato0c castro2g catalan18 catalogue0g catalonia19 catalysis0b catalyst2w catalysts0c catalytic0c catastrophe0h catch3k catcher1x catfish0e cathar0x catharsis0e cathedral3j cather33 catherine6f catholic49 catholicism0n cathy0c catiline0t cation0i cattle2a caulfield0p causal0d causation15 cause10 cavalier0t cavaliers0c cavalleria0r cavell0c cavitation0c cayley0e cayman0b ceausescu1k cecil0q cecilia0f cedar0g celan0h celebrated0n celesta0o celeste0d celestial0m celia0g celiac0f celine0f cellar0h cellini1m cello6c cells11 cellulose1e cemetery0v census0s centaur28 centauri0d central6f centre0l centrifugal0p centrifugation0r centrifuge0g cepheid1f ceres19 cervix0a cesaire1c cesare0h cesium0n cetshwayo0f chabon0u chaco14 chaeronea0f chain41 chair2q chairs0o chakri0b chalcedon0o chalk18 challenger14 chamber31 chambered0b chamberlain28 chambers0b champa0f champagne0j champions0r champlain13 chance0r chandler0t chandrasekhar10 chanel0m chang0n changan0a change28 changeling0f changes0a changing0v channel27 chant16 chaos2k chapel1t chapelle0p chaperone0j chaplin1c chapo0c character0k chardin0n charge8i chargers0a chariot3b charity0u charleshu charleston19 charli0b charlie1k charlotte1n charm0n charon10 charter15 chartism0r chartist0a chartres0q chase2d chatelier1p chatterley1q chatterton0d chechen0a checkers0g cheese1c chekhov5c chelation0n chemical3b cheney0k cherenkov1e cherubini0e chesnutt0e chess3e chest0f chesterton10 chiang1w chiapas0a chicagoh7 chichen0r chickamauga0t chicken2f chief2m chien0s chihuahua0l child4m childe0v chile8c chili0i chimp0i chinale chinese8r ching1z chios0k chips0a chirac0k chiral2t chirality0s chiron0s chitin11 chloe0w chloride19 chlorine1j chloroplast19 choir0e chola0w cholesterol2l chopin8o choral0i chord0k chordata0p chorus11 chosen0a choson0h chris0d christ7c christian6d christianity2d christie30 christina20 christine0f christmas53 christo0y christophe0g christopher11 chromatic10 chromatin0w chromatography5e chronicle20 chronicles0t chrysippus0b chrysler0g chulainn2d chung0c churchland0a churchyard1l cibber0f cilia0l cincinnati18 cincinnatus0e cinnamon0f circadian12 circassian0a circe1l circle6o circulation0r circumcision17 circumnavigation0b circus1o cirque0g cirrus0g cisplatin0b citadel0a citium0b civilca civilizations0a clade0d clair0x claisen0v clamp0d clapeyron1p clara0e clare0o clarissa11 clark2n clarke17 clash0k class3n classic0q classical1a classification0l claude17 claudel0p claudio0d claudius2b clausius2d clavier19 clayton0t clean0k clear13 cleisthenes10 clemens0g clement0t clementi0r cleveland3l cleves0i click0p client0h clinic17 clinton4o clive0q clock3o clone0b cloning0k close18 closed10 closet0a closing0k closure0i cloth0r clothes0d clotting0d cloud72 clouds1w clove0f clovis1o clown17 clowns0a cluster1j clyde0v cnidaria1w coach0m coalition0b coase1d coast2a coates0o cocaine0r cochlea0u cocoa0b coconut0v cocteau0g codex0j coding0a codominance0b codon0i coelacanth0a coffee2c coffin0y cognitive22 cohen11 coherence0w coherent0h coleman0y colette0f collage12 collagen2e collar0q collection0s collective17 college25 collider0k collins2z collision1m colloid2x colombia4m colon0l colonel10 colonial0b colonies0d colonization0o colony1o color8d colorado4r colored0i colors0c colosseum0u colossus12 colts0a columbia42 columbian0r columbine0b columbus2y combination0g combine0g comedian0a comedy58 comes1g comet2a cometh20 comfort0a comic1i coming2v comma0a command0e commander0e commedia0u commission1e committee1e commune17 communication0a communion10 communism15 communist2z communities0j community1c commutative14 commutator0g companion0a comparative1e compare0a compatibilism0b competition1m competitive0o complement11 complementary0c complete1o complex41 complexity0b composer0g composite0h composition0d compostela0g compression18 compson0h compton2m compulsive0c computer1q comte1y conan0h concept11 conception0g concerning3h concert11 concertobp concertos1e conch0l concierto0b conclave0d concord1a concrete1q conde0d condensation1d condition17 conditional0n conditions0f condon0g condor19 condottieri0d conduct0c conduction0q conductor0z coney0t confederacy14 confederate1c confederation1e conference0v confession0t confessional0h confessions24 confessor0k confidence0h configuration0d confirmation0q conformal0h conformity14 confucian0z confucius37 congestion0b congo5f congruence0d conic0h conjugate18 conjugation1n conkling0f connally0b connected0d connection0a conquer1p conqueror21 conscience0b conscious0i conscription0n consent0g conservation26 conservatism0m conservative30 consider0a consistency0b consolation0m constable1e constance11 constant65 constantine40 constitution2m constitutional0n constitutions0f constraint0a construction0e consul0y consumer0f contact1a containment0f contest0l context0p continental2e contingency0a continuity2f continuous0z continuum10 contra1u contraception0a contract37 contraction1b contradiction0k contrast0e controller0e convection2f convention1n converge0z convergence1i convergent11 conversation13 conversion1a convert0e converter0b converting0m convict0c convolution0p conway1c cooke0e cookie0k coole0d cooley0q cooling0r cooper4i coordinate0q coordination0o copeland0c copernicus0u copland4s copley1c coppelia0i copper4q copperfield13 coral2i cordelia0h cordoba14 corea0e corey19 corinna0b corinthian0c coriolanus0k coriolis2q cornea0j corneille11 cornell0f corner14 corners0g cornwall10 cornwallis14 corona1c coronado0e coronation1l corporation0i corps0w corpse0v corpus1x corral0b correction0c correggio0b correlation1b correspondence0e corrupted0e cortes17 cortex0i cortez0s cortisol0h cosby0b cosimo0i cosine1f cosmic2s cosmicomics0e costa15 costello0t cotton3d count4e countable0b counter10 countryak county1h couperin1t couple0l coupled0r couplet0p coupling0y courier0a course1l court4z courthouse0c cousin0t covariance0b covenant0z covent0b cover16 covid0p coward17 cowley0c coxey0q crack0r crafts1e craig0f crake0t cramer0i crane5y cranes0f cranmer0j crash1o crater1j crawford0q crazy16 creatine0c creating0i creation2z creative0f creed0v creek3j creep0j cremation0t creon0g crescendo0b crescent0g cressida0c crest0h crete2a creutzfeldt0i crick0u crime4k crimea1w crimean2c crisis2t crispr15 cristo27 critic0o critical3v criticism0y critics0f crito0v crittenden0h croatia24 croce0a crocodile14 croesus0a crohn0a crome0i cromwell46 cronus0t crosby0e cross9o crossing49 crossroad0a crossword0h crowd23 crowley0h crown2r crucifix0a crucifixion2u cruise0k crumb0j crusade5u crusoe2u crust0k crypto0d crystal5l cthulhu0q cuban1x cubas0e cubism25 cuchulainn1a cullen0h cultural24 cumhaill0g cuomo0d curacao0c curie35 curling0b curry13 curse0u curtain0o curtis0x curvature1e curve21 cusco0e custer0x cutter0b cuzco0p cycle3h cyclic29 cyclin0r cyclohexane1b cyclopes0k cyclops11 cyclotron0v cygnus0b cynic16 cyprus2m cyrano13 cyrus2m cythera0p cytochrome19 cytokine0g cytokinesis0s cytokinin0l cytosine0l czechoslovakia20 czerny0h dacia0j daddy1j dagger0k daily0i daisy29 dakar0f dalai1z dalembert0r daley0g dalit0j dallas1n dalton1e damnation0d damned0a damon0f damping10 danae0l dance5v dancer0u dances14 danger0i dangerous1a daniel41 danish0d dannunzio0e danse19 dante3w dantes0h danton0m danube2i daphnis0o darcy17 darien0m dario1r darkling0t darling0c dartagnan0u darwinism0b darwish0v darya0c dasein0k dating0o daughter2v daughters16 dauphin0a daviddb davidson0z davies0x davis7o davisson11 dawes15 dayton0l dazai0a deacon0b deadlock0b deathzz debussy53 decameron3f decatur0k decay1k deccan0m decembrist0w declaration28 deconstruction0a deemter0b deepavali0b defect0o defence0c defense1x deficit0a defoe20 degas2d degeneracy0p degenerate13 degeneration0e degree0u degrees1b deianira0a deirdre0q dejection0c dekker0l delano0a delft1b delhi28 delian0y delilah0e delius0s delivered0g della19 dellarte0n delos0f delphi10 delta4e demeter2a demian0i democracy32 democrat13 democratic53 democritus0p demoiselles0z demon2h demons0e denali0u dendritic0b denis0u denisovich12 dennis0c dentist0b denver15 department0k dependent0i deposition0z depression3l depth0y depths0n derby0q derek0i dervish0a desalination0f descartes61 descending0y descent1n description0j desert2q deserted0b desertion0c designated0d designator0a desire33 desiree0i desmond0e destiny1j destroy0b destruction0z detection0f detective24 detector0c determinant2o determinism0g deucalion0m deuteronomy0p deuterostome0e development1o deviance0d deviation1k devil5c devolution0k dewar0b dhaka0c dharma1q dialectic1k dialogue0i dialysis0b diamagnetism0n diana1c dianetics0d diary3a dicke0a dickinson6x dictator1i dictionary1w diego1m dielectric1n diels27 diene0f dietrich0d difference14 different0j differentiable0e differential1y differentiation1k diffusion4m digambara0j digital0t dignity0k dijkstra1f dilation1d dilution0e dimension1q dimensional0t dimer0b dindy0c dinesen1p dinner16 dinoflagellate0b diode2j diogenes1v dionysius0h dionysus3y diphthong0e diplomacy0l diplomatic0b dirac3j direct0m direction0h director0l directory0t dirichlet0x disaster0f disasters0f discipline0v disco0o discount0d discourse0z discovery0x discus0k disgrace16 dislocation0c disorder0z dispersion2a displacement1p disputation0a dissipation0m dissociation0w distribution0v disulfide0n divan0a diver0b divergence0y divergent0g diversity0s divide0p divided0k dividend0b divination0n divine24 diving0l division1p divorce1g diwali2t dixie0m dixon0s djenne0h djinn0j dmitri1a dmitry0f dobson0g doctor83 doesburg0g dogen0a dogma0a doktor0d dolce0i dollar18 dollfuss0a dolls0a dolly0t dolomite0d domestic0d dominance0j dominant1a dominica0i dominican23 dominion0t domino0b domitian0m donation0l donatism0a donelson0g donna0g donne4c donner0d doolittle14 doomed0j doping0s doppelganger0a dorado0s doria0g dorian2c doric0f dorma0m dorothea0i dorset0d dostoevsky2c dostoyevsky26 double7s doubling0b dover2o doyle1g draco0s draft1a dragon6g drake2s drakensberg0d drang14 dravidian0g dreamde dreaming0c dreiser1h dress0r dreyer0d dreyfus22 drift32 drina0b drink0r drinkard0a drinking0v drive1m driver19 driving0l drone0v drosophila28 drown1l drowning0n drude0a drugs0d druid0s drums0r drunk0n druze1o dualism1r duarte0e dublin26 ducks0a dufay0b duffy0s dukas0m dukkha0a dulce14 dulles15 dulong0i dumas2f dunbar1e dunces0s dunes0s dunning0b dupin0k dupont0d durand0n durant0g duras0e durbervilles0t durer3o durga18 durham0g durrell0g dutch3o dutchman10 dvorak4i dwight0e dying2y dylan1z dynamic1g dynamics0o dynasty0n dynein0a dystrophy0j eagle2c eagleton0d eakins1z earhart0j early0k earnest28 earring19 earth8d earthquake3v easing0c easter68 eastern0n eater0e eaters17 eating15 eaton0l ebert0i ebola0v echidna0k eclipse1c eclogues0b economic18 economics0y economist0a ecuador28 eddington0n edgar11 edmond0f edmund0u education31 edvard0e edwardag edwin0j effect40 effective19 effendi0d efficiency1m efficient0c egmont0c egyptcv eight4g eighteen0b eighteenth0f eighth0s eighty21 eilish0h einstein9p eisenstein0o either1b ekman0o elagabalus0c elastic1k elasticity1a elder2z elders0g election1s elective0c elector0a electoral0d electra12 electric5l electrocardiogram0c electrode0t electrolysis1m electrolyte0b electromagnetic0f electronaf electronic0j electrons0i electrophilic0f elegans1u elegies1x elektra0g element19 elemental0f elementary0y elements0r eleusinian0c elevation0b elevator0u elgar3q elgin0k elias0j elimination1j eliot8i elisa0c elisabeth0c elise0d elish0e elisha0f elite10 elixir0e eliza14 elizabeth7n ellen0s ellington2q elliot0b ellipse1j elliptic13 elliptical0q ellis19 ellison1h ellsworth0d elmer0l elves0f elvis0i emanuel0e emerald0i emergency0t emerson31 emile0x emilia0c emily1v emmanuel16 emmett0b emotion1h empirical0b empiricism24 empiricus0g empress0i emulsion0s enantiomer0s enclosure0v encomienda0t encyclopedia0z ender0k endless0q endlessly0g endocytosis0f endosperm0b endosymbiosis0a endosymbiotic0d endymion0k energyfn engels19 engineers0a england8q enlil0o enoch1b enquiry15 enrico0e enron0g ensor0l entente0e entertainer0j entropy77 entry0v enver0a environmental0g ephesus0x epicenter0b epicurean0o epicurus12 epidermis0e epiphyte0a episode0a epistasis0n epistle0c epistolary0k epithalamion0a epithelial0f equal1u equation1x equations0p equestrian0s equilibrium7p equivalence1y equus0d erikson1z eritrea0q ernest0y ernst1o eroica15 error1d escape14 escher0v esker0a esmeralda0e esophagus0l espagnol0c espagnole0g esperanto0i essay2o essays0u essence0q essex0f estado0o ester2t esterhazy0j esters0c esther2f estonia12 estrogen0o eternal18 ethan1f ethanol1k ether3f ethers0d ethic11 ethica0e ethical0c ethics4r ethiopia7t ethiopian0j ethnography0i ethylene1n euclidean0g eudaimonia0e eugene42 eugenics0c eugenie0e euler6b eumenides0e euphoria0b euridice0a euripides2f europa1r europe16 eurydice0t eutectic12 evangeline0s evaporation0o event1k everest12 everett0d evers0i every0r everyman0j everything1d evolution26 evolutionary0d exception0b exchange3d exclamation0b exclusion2x exclusive0f execution0z executioner0h executive0g exemplary0i exhibition2w exile0r existence13 exorcism0i exorcist0a exothermic0n expansion1q expedition0x experience1v experiment1n explosion10 exposition0o express1l expression0s expressionism28 expulsion0q externalism0b externality0h extinction1x extra0h extraction12 exxon0d faber0f fabian0c faces0l facing0d faction0e factor5s factorial2t factory13 faerie1c fagin0a fahrenheit1r fairfax0d fairy21 faisal0d faith2c faithful0d falcon1q falconet0f falcons0b falkland1c falklands1e falla1c fallacy0h fallen0n falling0v fallout0c falls2q falstaff12 familia0z families0e fancy0b fanny0m fanon14 fantasia0z fantastic0r fantastique27 farabi0g faraday46 farah0b fargo0k farmer1e farming0a farnese0m faroe0d farquhar0b farrell0d fascism19 fassbinder0c fasting0w fatal0b fates0w father30 fathers1y fatima0l fatimah0d fatimid0z fatty0p faubus0b fault1d faure1g faust45 faustus1m fauvism1f favorite0m fawkes0h feast2r feather1z federalist22 federation0i federico0c feeling0l feminism1t feminist0b fence0e fences1x fenian0f fenrir1g ferber0a ferdinand42 ferguson0z fermat4u fermi3y fermion1g fernando0a ferrara0g ferrell0e ferris0w ferro0e ferrocene0t ferromagnet0t ferromagnetism2f ferry1g fertility12 fever1p feynman3o fiber0u fibonacci2a ficciones0i fiction1x fiddler0t fidelio0y fierro0h fifteen0d fifth3t fifty0n fight1g figure12 figures0b files0a filial0t filibuster0m filipino0d fille0c filter10 filtration0t final1j finance0c financial0f finch10 finding0l finger1c finite1h finland6o finlandia0s finnegans0z finney0e finnish0j fionn14 firework0a fireworks0p firing0g firmus0a firstgd fischer2g fisher2s fishers0d fishing11 fission1r fiume0c fixation1g fixed1h fjord0l flagella18 flagellum0i flagstaff0b flame13 flamenco0q flamingo0d flanders1p flapper0a flare0b flash1l flask0a flavor0k fleece0r fleet0o fleming14 flesh0l fletcher0o fleurs1t flies3p flight2f flinders0f flint0j flood4j floor0m florence5t florentine0c flores0a florida74 flory0d floss0v flower6l flowering0b floyd0x fluctuation0n fluid1g fluorescence22 fluorescent0v fluorine2e flute7a flying26 flynn0m focal1b fodor0n folding16 foley0a folia0b folic0b folies0w folio0e follette0s following0c folly11 foner0a fontainebleau11 fools0r football1t forbidden0s forbidding0o force4k forces0c foreign0p forest3x forge0i forget0c forking19 forks0c formal0v formalism0c formation1e formic0c formio0c forms0z forrest0m forster3h forsyte0a fortas0e fortnite0b fortuna0j fortune0x forty13 fosse0m foster1n foucault5b found0c foundation0t founder0u fourier3m fourteen0n fourteenth0k fourth4f fowler0a fowles0f foxes0x fraction0o fractional0i frame1d francaise0b francelx frances0b francesca0q francia0a francis5l franciscan0e francisco70 franck1r franco5f francois0u frank3y frankfurt1v frankl0e franks0c franny0c franz4g franzen0r fraser0c fraunhofer0l frazer0p frederic0y frederick6j fredericksburg0h freedmen0n freeman0y freeze0c freezing1a frege1p freire0b frequency3b fresco0t fresh0l freud6c freya17 freyja12 frick0j friction54 friday2v fried0g friedan0u friedel15 friedman2y friedmann0b friedrich38 friend18 friends1b friendship0b fries0e frieze13 frigg0y frisch0d frome13 fromm0j fronde0t front4g frontier18 frost68 frozen0e fuego17 fugue37 fujita0i fujiwara0c fuller1b fullerene14 function42 functional1s functionalism0m fundamental2w fundy0b funes0b fungus0g funny0e furan0h furies0x furioso0w future1l futurism2j futurist0b fuzzy0b fyodor0h gabler1v gables17 gabon0j gabriel3d gabriela0b gachet0b gaddafi1m gaiman0i gaius0h galactic0q galatea0y galatians0h galaxy25 galba0c galen0s galicia0i galilee0j galilei12 galileo22 gallery0s gallic0g gallipoli19 galsworthy0i galvanic0q galveston0p gambia0o gambit0i gambler0c games1h gamma3y ganesh2z ganesha0g ganga0a ganges1i gantry0h garbage1j garcia79 gardenah gardens16 gardner0y garfield1o garfunkel0e garibaldi2g garland13 garner0c garuda13 gases0c gaskell0u gaspard0h gaspee0o gates3i gatha0a gatsby3d gattamelata0i gaucho0s gaudens0j gaudi1g gaugamela0e gauge1a gauguin2b gauls0b gauss4u gawain2f gebelawi0g gehry2g geiger0u geisha0h gender31 genealogy0x generalb4 generalized0e generation2v generations0g generator0b genet1o genetic1k geneva20 genius0k genome13 genovese0k genre0b gentile0a gentileschi1v gentle10 gentleman0o gentlemen0u geodesic0n geographic0f geography0i geomagnetic0i geometric0u geometry0w georg0e georgec6 georges0z georgia7m georgian0c gerais0c germain0m german7h germania0a germanic0e germanicus0a germanyf4 germer11 germinal0s germination0h gerome0j gerontion0c gerontius0e gerry0i geryon13 gesar0a gethsemane0f gettier0x ghana46 ghazal0x ghazali0u ghent20 ghosh0a ghost5h giant5d giants1m gibberellin0v gibberellins0c gibbon0v gibbons0s gibran0p gibson11 gideon1a giffen0j gilbert20 giles0i gilligan0c gilman12 ginkgo0a ginsberg31 ginsburg0j ginzburg0m gioachino0b gioconda0a giorgione13 giotto1z gipsy0c girls2a giscard0g giselle0v gitanjali1z giubba0c giuliani0d giuseppe0h giver0i glacier3c gladstone1p gland0c glasgow0x glassf0 glasses0b glenn0l glissando0a global0w globe0n glomerulus0g gloriosus0f glorious1y glove0l glover0f gluck1i glutamate0s glutamic0c glycol0j glycolysis27 glycosylation0r goats0c gobind0o goblet0e godard15 goddess0h godel1p godfather0w godot36 godoy0c godwin0e godwinson0l goethe6c gogol4r going1j goldeni1 goldfinch0j goldin0d golding1k goldman1c goldsmith1o goldstein0b goldstone0c golgi2y goliad0h gomez0a gonna0b gonzaga0j gonzalez0i goodall0n goodman2l google1c goose11 gordan0b gordon3h gorges0g gorgias0k gorgon0b gorilla0k gorillaz0b goriot0s gorky2g gorman0d goryeo0k gotha0e gotham0e gothic63 gouges0j gould21 gourd0b governess0a gower0f gracchus13 grace2l graces0e graduate0a gradus0b graeae0b graffiti1h graham3d grail12 grain18 grainger0r grammar1b grammatology0n granada12 grand78 grande33 grandet0b grandfather0d grandmother0p grange0q grant3s granth1q grape0y grapes1x graph2f graphic14 grass6m grating0a grave0q graves1w gravis0c gravitation0f gravitational3z grease0b greatzz greater0t grecian1e greco2u greece6w greedy0p greek7h greene6 greenberg0q greene3r greenland1u greenville0b greenwich0i greenwood0k greeny0c gregor0p gregorian0y gregory3i grenada1f grendel25 gretel0f grice0b grieg3j griffin0n grimes11 grimke0e grimm1x griot0u gropius0o gross18 grosse0a grosso0v grotius0n group4v groups0g grove0y grover0o grozny0a grunewald0d grunwald0f guadalupe0u guanine0w guano0r guarani0l guard1k guardia0i guardian0i guardians0c guatemala2a guerrero0b guest0s guevara19 guiana0l guide2e guido0b guild0u guilford0h guillaume0i guillotine0q guilt0a guise0d guitarist0b gujarat0k gulistan0a gunga0e gunner0b gupta16 gurdwara0p gurion0q gustav1w gustavus1w gutenberg1g guyana0z guzman0e gwendolyn0b gyges0g gypsy0n gyroscope0j habeas0l haber2i habsburg1m hades1s hadid14 hadith28 hadley0o hadrian2j hadron11 hafez0e hagar0s hague0s haifa0j haiku35 haile0v hainan0c hairy0i haiti5e hakim0n halakha0a halal0f haley0j halley0v halsey0a halting0n haman0j hamas0b hamburg0j hamid0l hamlet52 hammarskjold0g hammer1h hammett0x hammon0c hammond0n hampton17 hamsun0q hanafi0c handel5x handke0b handling0a hands23 hanks0b hanna0g hannah0p hanoi0j hanover0p hansa0d hansel0f hansen0c hanson0e hanukkah0y hanuman1o happen0l happiness0x happy1r hapsburg0o harald0w haram12 haraway0e harden0c harding1c hardness0q hardrada0f hardy85 haring0m harlan0n harlem47 harley0d harlow0x harmonia0n harmonic5x harmonica0h harmonious0e harmonium0n harmony1b harold4p harper12 harpsichord2g harriet0g harrington0a harrison2o harry1z harrying0a harte1f hartley0l harun0m harvard27 harvest0b harvey11 hasdrubal0d hashanah1f hasid0a hasidic0g hasidism0g hassan0b hasselbach0d hasselbalch1d hatch0b haunting0b hauptmann0o hausa0m hausdorff0p haussmann0e havana1g havel1h haven0m having0f hawai0a hawaii59 hawking1v hawkins0p hawks0c hawley0u hawthorne5a hayden0m haydn6z hayek22 hayes1d hayne0b haywood0i hayworth0e hazard0x headless0l heads0k health1l heard10 hearing0q hearst0x heartdf heartbreak0k hearts0q heath0l heathcliff0s heathen0b heaven4k heavy13 hebrides0r hecate0n hecht0d heckscher0i hector1p hegel4u hegemony0k heidegger4l height0e heike0e heimdall2f heine1n heinrich0j heinz0e heisenberg29 helen31 helena0y helens0h helga0d helicopter0f heliocentrism0b helios1a helium40 helix1m heller0w hellman1t hello0j helmer0a helmet0l helmholtz2h helot0v hemans0a hemophilia0h henderson2d hendrix0b henle0p henri1g henrik0k henryok henrys0c hephaestus27 hepworth0c heracles48 heraclitus1o heraclius0g herbert1y hercule0d herder0g herero0i heritability0e heritage0h herman0b hermann0k hermes3k hermione0i hermit0h hermite0a herod0m herodotus1q heroes0p heroic0b heron0w herpes0l herring0b herrmann0a herschel0i hershey0i hertzsprung1c herzog1a hesse45 hester0l hetero0d heterogeneous0e heterozygote0c heterozygous0g hexagon0p hexagonal0a hezbollah0k hicks0s hidden18 hideyoshi0q hieroglyph0d hijab0j hijra0f hilary0e hilbert24 hillary0c hillel0n hills1e hilton0e himalaya0o himes0b hindu2k hippo0h hippocampus1g hippocrates0i hippolyta0f hippolytus0l hiroshige0q hiroshima1g hirst0y hispania0j hispaniola0v histamine0n histidine0p historian0p historical0h histories0a hitchhiker0l hitler3i hitter0a hoare0a hobbes2z hobby0f hobson0f hockey0l hockney10 hoffa0c hoffman0z hoffmann1w hofmann0o hofstadter0p hohmann0c holberg0h holden1a holder0h holes16 holiday1b holland0g hollande0b holliday0d holly0g hollywood0u holmes4y holography0b holomorphic0e holst2f holstein0l homage0l homecoming0h homeland0g homer5e homestead1f homme0a homogeneous0h homologous0f homology0b homotopy0a honegger0t honey1v honor0n honshu0p hooke3m hooker0l hooks0l hoover2t hopkins30 hopper3b horace2v horatii15 horde1s horla0e horney0n horseck horseman3o horsemen0m horses1e horton0l horus3l hosea0c hospital1k hospitaller0q hotel3f hotelling0i hotspot0j houdini0g houdon0a hound19 hours0z housesu houses0e houston3c houyi0b howard1s huang1i huascar0i huayna0a hubble3k hudson59 huffman0j huggins0d hughes6l huitzilopochtli1n hulagu0m humaine0j humanax humanism0v humans0a humbert0k humidity0d hummel0m humphrey0s hundred7w hungarian2f hungarya1 hunger2r hungry0d hunter2a hunters0s hunting12 huntington1v huron0j hurrian0a hurricane20 hurricanes0a hurston2h husband18 husbands0f hussein1i hutcheson0h hutchinson1g huxley34 huygens1d hwang0f hyacinth0g hydra1p hydrazine0x hydride0r hydrochloric0w hydrogencr hydrophobic0s hydroxide0v hydroxyl0v hymns0f hypatia0e hyperbola0t hyperbolic13 hyperfine0c hypha0e hyphae0h hypothalamus1a hypothesis1j hysteresis1d iapetus0d iberia0n ibrahim10 icarus1x iceland47 iconoclasm0w icosahedron0b ideal5r ideas0q ideology0n idiot1j idomeneo0c ignorance0o iguana0u iliad1d illuminated0q illusion0t ilmarinen0d ilyich11 image1m imaginary1q imagine0b imagined0d imagism0w imidazole0d imine0x imitation0c immigration0n immolation0e immoralist0b immortal1g immortality1f immortals0p immunoglobulin0g imperative1n implicit0d importance2d impression1a impressionism2a incan0a incest0i inchon0c incident0z inclined0b incoherence0a indentured0a independence62 independent1z index54 indiaju indian5x indiana2a indians0f indicator14 indies0e indigo0m indira0a indole0k indonesia7w indra2a induced0i induction36 inductive0o inductor16 indulgence0d indus2y industrial23 inelastic11 inequality1u inert0c inertia4p inertial0n infant0i infante0c infection0a inferior0b infernal0h infinite32 infinity1o inflammation0x inflation4d inflection0a influence0i influenza0l inhibitor0c initiation0f injection0d inner1g innocence23 innocent1k innocents0f inoculation0b inquisition1d inquisitor0d insect0i insertion0a inside0r inspector18 institution0k institutional0b instrument0t instrumental0d instruments0a insular0b insulator1f insurance0s integrable0a integral2g integration3v intel0d intellectual0d intelligence3u intensity0b intention0j intentional0f inter0h interaction0i interest25 interferometer19 interferon0d interior0y intermolecular0a internal1w international3a internet13 internment13 interpolation0p interpretation1b interpreter1b intersection0b intersectional0e interstate0p interval0k intervention0c interview0a intestine1p intolerable0e introduction0h intron0n intuition0f invariance0b invariant0c invasion2o invention0x inverse23 inversion1x investigation0e invisibility0i invisible4h invitation0k iodide0d iodine29 iolaus0e ionesco3v ionian0l ionic17 iphigenia0r irelandby irene0r irony0x iroquois2l irrational0r irrawaddy0l irving3j isaac1h isabel0q isabella2l isaiah18 isaurian0d isherwood0p ishmael1i isidore0d ising1g islam63 islanddg islands2i islets0c ismail0l isoelectric0g isolation0b isomer1d isomorphism0e isostasy0g isothermal0b isotope1q israel6h issus0p italian4q italyf1 ithaca0u izanagi1h izanami0q jabbar0f jabberwocky0t jacinto0o jacket0h jacob28 jacobi11 jacobian0l jacobin0c jacobins0d jacobites0a jacobs1d jacqueline0b jacquerie0r jacques1b jagiello0a jaguar0r jahan0w jakob0m jakobson0k jaleo0c jamaica42 jamesjy jameson13 jamestown25 janissaries1h janus2b japanlr japanese5t jarry0b jason2q jeanne0m jeffers0e jefferson3v jelly0h jenkins10 jenner0f jenny0f jepsen0a jerry0g jerusalem5t jesse0k jester0f jesus8a jewel23 jewels0p jimmu0l jimmy0f jinnah0o joanna0i joaquin0a johann13 johnny0o johnsone1 johnston0q johnstown0c joker0l jonah1m jonathan10 jones96 jonson3n jorge0m jormungand0r jormungandr0g josef0l joseon1n josquin0q journalism0u journalist0f joust0a juana1b judah0s judaism28 judas23 judgement0h judgment2c judicial0h judith27 juice0f jules0h julia2n julian1y julie2e julien0c juliet3y julius3k jumping0y jungle3k junker0a junta0a jupiter5o juries0a justice4l justin0m justine0g justinian3y kaaba1a kabbalah1g kabila0c kadar0g kadare0a kaddish16 kadesh1s kafka6u kagame0b kalam0g kalidasa1m kalinga0q kaliningrad0f kalki0d kalmar19 kamakura1d kanagawa0k kandinsky1r kansas57 kanye11 kaposi0a kappa0q karakoram0e karakum0a karamazov27 karbala0e karenin0h karenina2r karlowitz0f karma1j karman0h karna0c karst0v kartikeya0j karyotype0c katanga0q katrina0p katyn0e kauffman0l kaufman0k kavanaugh0a kazakhstan1s kazan0s kazantzakis1h kearney0b keaton0j kebra0c keller0u kellogg0o kells0j kelly2h kelvin21 kemal12 keneally0v kennan0k kenneth0g kenning0c kente0c kentucky2s kenya5h kepler3l kerala0h kerensky0t kernel0z kerouac1i kerry0e ketone1a kevin0m keynes3v khaldun0n khali0g khalifa0h khartoum0k khayyam14 khrushchev1y khyber0g kidnapping0i kievan0e killed0i killer14 killing1q kills0c kilwa0k kinesin0c kinetic44 kings2n kipling3t kippur3g kirchhoff1k kirchner0m kirchoff0e kirkwood0c kishner0l kissinger0q kitchen1x kitchener10 kitsch0c kitty0q kleene0a klein34 kleine0f klimt27 knicks0a knife0u knight6w kochel0a kohlberg13 kondo0j kongo1b koniggratz0a konigsberg0m konstantin0g koolhaas0m kooning1u koons0r koreacv korean37 koresh0b korsakov3n koschei0b kosciuszko0l kosher0p kossuth0v kraken0j krakow0f kramer0g krapp0l krebs1o kreutzer0y kripke14 krishna3l kristallnacht0e kristin0f kroll0d kronig0g kronstadt0g kruger0w krupp0a kuala0d kubla1h kublai1s kuiper1n kumbh0c kundera32 kuomintang12 kursk0v kusanagi0f kushan0i kushner0s kutta0f kvasir0d kwanzaa0c kyoto1g kyrie0h laban0b laberinto0a labor4w labour2b labov0p labyrinth27 lacan17 lactate0e lactone0a lactose0q ladder14 laden0u ladon0d lagos10 lagrange2v lagrangian21 laika0d lakers0k lakes0m lakoff0c lakshmi18 lamar1e lament0t lamia0g laminar0u lancaster0o lancelot1p landau1u landing0k lands0b landscape2c lange29 lanier0e lanka4f lantern0n lanthanide1d laocoon18 laozi0t lapis0r lapith0j lapse0j lares0b large21 largo0g larry0c larsen0c laser42 lasso0a latent0k lateral0j lateran0p latin3v latour0h latter0v lattice24 latvia0k laughter0q laura1l laurence0a laurent0n laurier0l laval0h lawrence82 lawyer0o layer26 layla0d lazarillo0q leach0c leader0j leading1j leakey0e leander0e learnd0e learned0w learning1g lease0c least0v leave0k leaves34 leaving0h lebesgue0n lebron0j lechfeld0b leech0d lefty0n legal0b legba0r legend1t legendre0s legends0w leger0f leibniz3p leibovitz0n leiden0d leigh0p leisler0f lemma0c lemnos0f lemon0p lenin2g lennard0x lennie0c lennon0n lenore0a lensing0p leonard0s leonardo2b leonardoda0h leone15 leopard18 leopardi0m leopold2p leptin0d lepton0i lerner0d lesbia0m lesbian0j leskov0c lesser0c lessing1y lesson2d lethal0a lethe0g letter7i level18 leveller0c lever0l leverkuhn0b leviathan3e levin0c lewin0g lewinsky0a lewisbn lexington0f leyster0f leyte0c lhopital0e liaisons0h libation0h libel0j liberal31 liberalism0b liberation1m liberator0a liberia1s libertarian0e liberty6c libeskind0a libraries1f libya2d license0c lichtenstein1z lieberman0a liechtenstein0f lieder0b lienard0c lieutenant0y ligase0n ligeia0f lightdm lightning2n likud0a lilies0t lilith0f liliuokalani0f lilliput0g limbic0b limbo0d limit2h lindsay0x linear4i lines0t linga0a linkage0w linked17 linus0d linux0k lions0k lipid0z lippi0i lippmann0d lisbon2k liszt5d literary0b literature13 lithuania24 lithuanian0i litovsk0t lived0r liver3m lives1w living12 livingston0a livingstone0j livonian0e lizzo0a llywelyn0c lobby0j lobos13 local18 locke5i locking0b locus0d locust0v loess0f loftus0l logan0v logarithm0n logic2x logico10 logos0i lollard0k loman0m lombard1o londong6 lonely23 longer0u longue0b looking29 lopez2b lorca5k lorde1a lords0o lorelei0g lorentz3u lorenz1s lorenzo10 lorrain0o lorraine0p loser0b losing0a lotka0s lotus35 louhi0a louisht louisbourg0a louise0i louverture13 louvre1n loved0h lover2r lovers15 loves0j loving14 lower1b lowry0v luanda0f lubeck0r lucan0i lucas1i lucia1b lucian0i lucifer0j lucinda0p lucky1h lucretia0f lucretius0l ludendorff0a ludmila0b ludovico0e lukacs0a lullaby0l lully11 lunar0h lunch0u luncheon20 lundy0e lungs0a lupus0o luria0m lushan10 lusiads0y luther4s luxembourg0v luxemburg0f lydia14 lying0t lyman0k lynch1j lyndon0m lyotard0e lyric0w lysippos0h lysis0h lysistrata1b lysosome2d lytic0e lyudmila0a maasai0k mabinogi0c mabinogion0p macau0n macaulay0c macaw0g maccabees0c macchu0f maccool0n macdonald29 macedon1i macedonia0r macedonian0e machiavelli2m machina0g machine5y machines0g machu15 mackenzie1e macmillan10 macondo0w macquart0h macron0y macula0f macular0d madama0o madame4w madden0m madding14 madeleine0a mademoiselle0i madero0r madison2j madman15 madras0d madrid1t maduro0p maesta0b mafia16 mafic0c magazine0h magdalena0b magdalene12 magellan1e magellanic0l maggie1b magic8s magma0v magna22 magnesium2s magnet0q magnetica7 magnetism0g magneto0b magnetohydrodynamics0e magnificat0c magnificent15 magnum0a magnus0x magpie0e magyar0o mahabharat0f mahabharata25 mahal12 mahavira14 mahdi14 mahfouz46 mahler66 mahmud0a maiden1j maids0o mailer18 maillard0h maine47 mainz0e maize1m major6q making0l malachi0c malaria28 malay0h malaysia2d malcolm25 maldon0f malevich0r malfi0l malinowski2w malley0a malone0e malta2w maltese0r mambo0e mamet1o mamluk1g mammal0c manager13 manaus0k manchester1p manchu0w manchuria0w manco0i mandaeism0a mandala0v mandalay0e mandela2j mandelbrot0r mandelstam0f mandolin0g manet2s manga0d manganese11 mango1a manhattan2c manichaeism17 manifest0o manifesto2p manila1h manitoba0y mannerheim0q mannerism1o mannheim0o manning10 manon0d mansa0g manse0d mansfield3k mansion0o manson0b mantel0y mantinea0c mantle2t mantra0n mantua0g manual0c manuel0l manzikert0j manzoni0e maori4k maple0z marat1s maratha0w marble1p marburg0l marbury16 marcel0h marcellus0r march6e marche0g marco0r marcos1d marcus35 marcuse0r marcy0a margaret2f margarita21 margin23 marguerite0c maria4g marian0c mariana0n marianne0a marie31 marijuana0s marin0b marine0j mariner23 mariners0e marino0i mario1y marion0h marius1e market2u markov1z markovnikov0r marley0p marlow0h marlowe3k marne0p marner17 maroon11 marquez4o marquis0a marriage6y married0e marrow0m marry0f marsalis0p marseillaise0g marsh13 marshall47 marshmallow0m marsupial0h martel1k martha14 marti1t martial13 martian0t martin5o martinez0g martinique0d martyr0g marvel0c marvell2q maryam0a maryland1z masada0j masaryk0d maser0a masks0s maslow23 mason27 masonic0i masque0v massachusetts4j massacre3p masses0f massif0b massive0d master7d masters15 match0v mater0r materialism0h mathematica0z mathematical0c mather0s mathis0f matilda1h matisse2o matrix44 matsuo0p matter42 matthews0c matthias0p matzo0b mauberley0f mauna0j maupassant4a maurice19 mauritania0i mauritius0u maurya20 mauryan0f mausoleum0e maxim0b maximilian1q maximum0r maximus0n maxwell61 mayakovsky0f mayan0j maybe0a mayer0b mayor2z maysville0a mazarin0r mazda1c mazurka0q mazzini0q mccain0v mccarthy4z mcconnell0g mccormick0c mccullers17 mcculloch0o mcdonald18 mcgee0a mckay13 mckinley23 mcmahon0e mcpherson0i meade0k meaning10 means0h meany0b mecca2i mechanical1e mechanics0b mechanism0i medal0g medea2y medellin0d medes0b media0t median14 medical0g medici38 medicine23 medina19 meditation1b meditations27 medulla0i medusa3s meeting0h megan0c mehmed17 mehmet0f meier0b meiji3q meissner16 meister0o meitner0e melancholy15 melanchthon0g melanin0l melanogaster0h melatonin0j meleager0r melencolia0g melisande0i melisma0a mellon0i melos0g melting1c melville4c member0e memnon0j memoir0a memoirs0q memorial15 memoriam0v memories0f memory67 menace0f menander0t menard0b menchu0d mencken0n mendel1e mendeleev0w mendelssohn5u mending0x menelaus0q mengele0b meningitis0c menshevik0d menstruation0b mental0x menten14 mephistopheles0h merci0g mercia0r mercutio0d mercy0i merge0n merger0c merisi0h merkel13 merlin1h merode0b meroe0g merovingian16 merrill0l merry15 merton1l meselson0o meson19 mesopotamia0v mesozoic0g message0g messenger15 messiah2p messier0m messina0e metabolism0a metal2r metallica0g metalloid0a metamorphic0j metamorphism0f metamorphoses0v metamorphosis31 metaphysical0z metaphysics1p metastasis0j meteor0j meter0d methane26 methanol0i method2r methodism15 methodist0c metis0s metric15 metro10 metroid0b metronome0c metropolis0x mexican43 meyer0e micelle0x michael50 michaelis15 michel0g michelangelo4h michelin0a michelle0a michelson1k mickey0n micro0e microscope11 microscopy1d microsoft0q microstate0f microwave2m midaq0d midas1c middle39 middleton0f middletown0h midgard0p midlothian0h midsummer2l midway1c might0c mighty0q mikhail0o mikrokosmos0h mikveh0a milady0c milan2x milankovitch0a miles1w miletus0l military1n milky1t millais11 millay2d mille0l millennium0n miller8n millet1c millikan0i million11 millionaire0c mills2i milosevic14 milosz0b milton4x mimic0c mimir0g minaj0h minamoto0g minas0f mindanao0g minds0k miner0y mines0a mingus1i minimal18 minimalism1q mining16 minister30 minkowski0w minoan19 minor50 minos17 minuet11 minus1f minute0r mirabilis0b miranda1x miriam0k mirth0x misanthrope0l miser0k misfit0e mishnah0d missa0f mississippi67 mississippian0e mister0b mistral2k mistry0b misty0d mitch0a mitchell1l mitford0h mithra0k mithras0p mithridates0w mitochondria40 mitochondrial0d mitochondrion15 mitre0a mitterrand13 mitty0l mixed0i mixing0p mjollnir0h mjolnir13 mobile1e mobility0f mobius1p moche0e moctezuma0h modal0m model3a moderator0a modern41 modernism0d modernismo0g modest1d modular0a modulation0a modulus1v modus0g mohammad0b mohammed0e mohism0g moivre0f moksha0s molality0h molar0k molarity0c molecular4y molecule0a molina0d mollusc0a mollusca0y mollusk0b molly0t moment6c monaco0n monad0y monarch0n monarchy0b monastery0c mondale0d monde0b monet2s money4w mongol35 mongolia1s monism0k monitor0c monkey5u monkeys0b monks0b monoamine0a monopole1h monopoly21 monopsony0i monroe3j monster2c monsters10 montage0b montagu0l montaigne14 montale0i monte3r montenegro0a montesquieu1i monteverdi2w montezuma0m month0c monticello0c monty0n monument0r moons0n moonstone0u moore63 moose0a moraine18 moral30 morales0h morality17 morals12 moran0c morant0b moravia0h mordred0u moreau12 morel0d morgan4u morley1l mormon54 mormons0b morning2j moroni0t morricone0g morrill0f morris1v morrison46 morse0z mortal0f morte0d morton0p morty0b mosaic26 moseley0d moses58 mosley0f mosque24 mosses0a mosul0b motet1c mother8s motion30 motivation0d motors0k mound0t mount46 mountaincu mountains16 mourning1d mouse2p mouth12 moveable0c movement1s movie1b movies0c moving0j mower0e mozambique1v mtsensk0d mubarak0f mucus0i muerte0b mughal42 muhammad55 muisca0d mukherjee0h mulan0g muller1u mullerian0h mullerin0b mulligan0i mulliken0b multi0b multiple1j multiplication1i multiplier0q mumbai0w mummies0i munch2w mundi0f munich26 munro21 munster0f murad0h mural14 murat0a murder3k murders0w murdoch13 murillo0e murphy0o murray1l murti0a musee0k muses10 music7w musical1a musicians0d musil0b musket0p mussorgsky1z mutation1o mutiny0s mutual0q muwatalli0a myanmar33 mycenae12 mycorrhiza0h mycorrhizae0a myers0r myron0g myself1i mysteries1a mysterious0v mysterium0c mystic0o mythologies0g nabis0g nabokov3t nacht0f nadar0e nader0i nadir0c nafta0o nagast0b nagel17 nahuatl0k naked1m named29 names1d namib0j namibia17 nanak1f nancy0o nanjing12 nanking0t naomi0d naples25 napoleon96 napoleonic0a narayan0x narcissus11 narmer0g narnia0n narrative0z narrator0t narrow18 narva0a nasser25 nation3y national8q nationalism0e nations46 native49 nativity0j natta17 natty0i natura0c natural5a naturalism0h naturalist0h nature3n nauru0f nausea0y naval0b navarre0w navas0m navier2h navigation0j navigator14 naxos0l nazca1a neanderthal0q neapolitan0b nebula1q necessary0i necessity12 necrosis0d needs0p nefertiti0u negative4o negev0d negligence0a negro1j neighbors0b nelson22 nematoda0t nematode0b nemean0w neoclassicism0p neoptolemus0j nepal1k nephthys0g nerva0c nessun0m nessus0f nestorian0m netflix0r netherlandish0d netherlands7y neural1k neuron2h neurons0d neutral17 neutrality0n neutrino4w neutrinos0c neutron5a never2x newman1z newsom0e newtonian0x niagara1a nicaragua3d niche0t nicholas3q nicholson0c nicolas0a nicomachean0x nicopolis0a nicotine0j nidhogg0q nidre0j nielsen1b nietzsche5a niger1k nigeria8u nigerian0b nightp4 nightingale36 nightmare11 nights46 nigra0f nihon0h nijinsky0q nikolai0o nimrod0j nineteen1d nineteenth0f nineveh12 ninja0m nirvana1v nitrate0m nitride0b nitrile0l nixon56 nobel2o noble3x noche0b nocturne1m nodes0a noether1k noise2l nolan0l nolde0d norma0n normal5x norman1v normandy1m norse0h northea northumbria0k northwest1x norwegian11 norwich0a nostra0a notes1s nothing3b notochord0d notre3h notting0e nouveau13 novel2g novella0a novels0o novum0j nsaid0a nubia0p nuclei0z nucleic0a nucleolus0n nucleophile0f nucleophilic0g nucleotide0t nucleus4c number67 numidia0d nuova0f nuremberg1c nurse0l nutation0d nyame0j oasis0b oates1e obama26 oberon0d obrien1v obscene0e obscure19 observatory0l obsessive0c occitan0g occupation0r oceanic0a oceanus0d oconnell0f oconnor47 octahedral1b octane0b octave0i octavian0a octopus11 odessa0h odets0t offering0w office24 officer0c ogden0k ohara0x ohlin0j oisin0d okazaki0q okeeffe23 oldenburg0v olduvai0k olefin0k olenska0c olive1h oliver2o olivier0c olmsted0q olorun0h olson0h olympia1t olympic27 olympics12 omega14 oneal0d oneill4c onion0s online0h operating0j operation0p operational0i operon1e opium2y oppenheim0b oppenheimer1r oprah0j optical1y optics0g optimal0b optimism0b optimist0a option0p orange5x oration0f orban0e orbis0h orbit1g orchestra25 order59 ordinance0g oregon35 oresteia0i organ4v organization1b organon0c orgaz15 orientalism0p origen0b origin1m orion2f orisha13 orlov0g ornans0j orphan0k orphism0p orsini0b orthodox1o osaka0n osborne0l oscar1x osceola0p oscillation15 oscillator35 oskar0s osman0a ossian0f osteoclast0c ostwald19 oswald0v otello0b othello1v other2z ottawa0p otter0a ought0a outer0w outsiders0g overture3o owens0a oxford34 oxidation2x oxide1t pablo0w pachacuti0e pacific4r pacifico0c pacis0a packers0f packing0j padua0d pagan0n paganini30 pagliacci18 paine1a paint0u painted0c painter1f painting29 paintings0q pairs0d pakistan4e palace38 palatine0h palestine0v palestinian0m palestrina29 palette0b palin0d palladio0v palladium1u palma0b palme0p palmer12 pampas0c panama3y panay0a pancreas1r panda0x pandava0c pangu0c panic25 pankhurst0z pantagruel0s pantheism0d pantheon0p panther2o panthers0l pants0b panza0w papal0o paper34 papers1i papua12 parabola1u parabolic0a parade0t paradigm0h paradise4k paradiso0k paraguay2d paramagnetism1a parameter0o paramo0f parana0h parasite0s parasitism0v parent0b parents0j parisf0 parity12 parker4p parks1z parliament22 parma1b parmigianino10 parnassum0d parnassus0m parnell12 parrish0e parsifal0i parsing0c parsley0f parson0e parsons19 parte0a parthenon1m parthia16 parthian0e partial14 particle2w parties13 partita0d partition39 parts0j party8k parzival0a pascal43 pasha0g pashtun0g pasiphae0c passage2g passing0h passos10 pastoral24 patagonia12 pataliputra0a patch0o patel0a patent0k pater0c paterson17 paths1h patient0z paton1v patriarch0m patrick1o patriot0e patriots0p patroclus0o pattern0t patton0v pauli31 pauling1j paulo0z pauper0b pavarotti0f pavia0q pavilion1h pavlov17 pavlova0i paxton0g payne0n pazzi0m peace5t peach1j peaks0g peale0l peano0f pearl6h pearson11 peasant1g peasants1s pecos0h pedal0e pedro35 peele0i pegasus1j peirce1s peisistratus0b peking0c peleus0l pelli0d peloponnesian2h penal16 penderecki13 penguins0g peninsula0i peninsular0n penny0o penrose0i pentagon0x pentatonic0o pentecost0w pentecostal0u penthesilea0g pentheus0c pentose0h penzance0n peopleam pepin0r pepper0s pepsi0d pepsin0c peptide0v pepys10 pequod0a pequot0m perce0h perception14 perceval0i percival0k percussion13 percy1e perec0e perez0k perfect3e pericles23 pericyclic0a periodic1o peripatric0a perkins0r perlman0i permanence0k permanent0a permian0x permutation17 peron2m perot0o peroxide2b peroxisome1g perpendicular0p perpetual0n perry2a persecution0d perseus31 pershing0v persia23 persian4j persistence16 person2s persona0i personal0w persons0e persuasion0m perth0i perun0z peterbl peters0b petersburg2o peterson0p petit0p petition0m petra0n petrarca0e petrarch3x petri0k petroleum0q petronius0h petrushka0w phaedo0x phaethon0n phage1i pharaoh1g pharsalia0b pharsalus0g phase6s phedre0g phenol19 phenomenology2g phenotype0e phidias14 philadelphia6d philip9r philippe1j philippine0b philippines7f philistine0c phillies0h phillip0j phillips1h philonous0i philosopher13 philosophers0p philosophical1b philosophicus11 philosophy3t phineas0g phoenicia0x phoenician0q phone0u phonology0a phonon1o phosphate2p phosphine0b phosphorus2j photo1n photoelectric24 photograph0i photographer0e photography15 photon3z phrygian0c physics0q piaget39 pianokk piazza0i picard0b picaresque0w picchu1k pickett0h picking0c picot0l picture24 piece0n pieces0u pierce10 piero0v pierre1x piers0p pieta1c piety0w pigeon10 pigeonhole0k piggy0k pilate0p pillar0t pilot0o pincher0c pindar16 pineal0l pines11 pinker0v pinter4i pious0e pipeline0k piper0c pippi0a pirandello36 pirate2h pirates17 pirithous0m pissarro0l pistons0b pitch0q pitcher0k pittsburgh2u pixar0b pixel0d pizan0l pizarro18 pizza0i place23 places0l plague3k plain0t plains0t planar1m planck3x plane2z planet2p planetary0i planets2f plant1i plantation0l plantinga0n plants0c plasma56 plasmid1q plasmodium0m plasmon0i plastic1h plasticity0g plata0x plate25 plates0f plath4v plato3v platonic0i platonism0d platt0i platyhelminthes0m plautus1c playboy16 player12 players0q playing0n playstation0g pleiade0b pleiades0t plein0c pleiotropy0b plessy0y plowman0n plurality0a pluripotent0a plutarch0m pluto1r plutonium0c pocket0f poems1l poetica0k poetics0y poetry2l poets0i point8i pointe0r pointed0c pointer11 pointillism1k points0v poiseuille0q poison1k poisson33 poker1i polar2b polaris0c polarizability0g polarization30 police2u policeman0d policy0k polio16 polish2n political0p politics1f politicus0l polka0h pollen0t pollock3l polonium0a polonius0c polykleitos0f polymerase1k polymerization0z polymers0b polymorphism0r polynesia0c polynesian0a polyphemus12 polyphony0t polyploid0b polyploidy0d polyprotic0d pomerania0b pomona0a pompadour0e pompeii19 pompey1e pompidou16 ponce0h pontchartrain0b pontus0d ponty0u popish0g popol13 poppea0i popper1q poppy0a popul0i popular12 populist0z porgy16 porifera16 porphyria0g porphyrin0o porphyry0r portal0p porter1y portia0d portland1a portman0a portrait6s portraits0j portuguese3f position15 positivism1h positron1k posner0h possessed0g possession0r possibility0d postal0n poster0f posthumous0e postman0d postmodern17 postmodernism0j postulate0c potato3v potemkin1b potlatch0p potok0c potter0t pottery12 powder0g power9f poynting1l practical0g practice0e prada0i prado0i praetorian0n pragmatic0w pragmatism3k prague62 pratt0c pravda0d prayer39 praying0d precession2e predation0c predator1e predators0a prediction0c prefer0o preference0b pregnancy0w prelog0e prepared0i presence0c present0f presentation0k president3v presidente0f presidential17 presley0b press1a pressburg0d pressure9c prester0m pretoria0c pretty1c priam0j price3h pricing0b pride30 priestley0l prima0b primate0a primavera0y prime7l primer0p priming0b primitive1b primo0j prince7z princes0f princess1t princip0g principal0x principia1l principle2l principles0k print0v printing0t prion1c prior0o priori0m prism0o prison79 prisons0a private1b prize0k probe0c process1l processing0c procrustes0k proctor0d producers0a production20 profane0x profession0l professor13 profit0f program0r progress2x progressive10 project24 projection0s projective0g prokofiev43 prolactin0d proline0z prometheus3e promoter0e propagator0c proper0h propertius0k property16 prophet1k prose0s proserpina0a prospect0v prosperity0b prospero0i prostate0k protease0i proteasome0f protecting0h protection0u protest0d protestant1e proteus0i protist0d proto0z proton3w proud0o proudhon0e proust2h providence0f prussia1z prussian2g psalms16 psyche1o psycho1k psychoanalysis0e psychology0s ptolemaic0a public3d publius0b puebla0h pueblo1l puerto3a pugachev0t puget0f pulitzer1g pulley0p pulse0t punch0u punic2o punish0w punjab0i purana0c purcell2f purchase10 purgatorio0h purgatory0a purge0c purim2d purine0c puritan0o pushkin48 putin1a pylori0j pylos0a pynchon36 pyramid31 pyramidal0f pyramids0i pyridine0k pyrimidine0e pythagoras1s pythagorean1h python20 qaeda0p qatar0u qianlong0g qibla0h qizilbash0b quadratic1h quadruple0a quadrupole0i quake11 quaker1q quakers0k qualities0j quantifier0e quantitative0r quarter0o quartet7b quartets1e quartz30 quasar1p quasi10 quechua0b queen73 queene19 queens0e queer0l quest12 questions0b quetzalcoatl3q quiet3r quilt0x quince0a quincey15 quincy0d quine2t quinine0m quinn0f quintet1m quipu0h quixote6j quran3j rabbi0p rabbit48 rabies0w rabin0j rachel0x rachmaninoff3w rachmaninov0d racine1u racing13 racket0c radcliffe13 radetzky0e radial0n radiation2q radical46 radio4m radioactive0d radium0g radius2d raffles0a rahman0j raiders0e rainey0o rainier0c rains0a rainy0b raisin34 raising0v raleigh0z ramadan2r raman22 ramanujan0g ramayan0a ramayana1g rameau1i ramesses18 ramona0a ramsay0s ramses1k ramsey0u randall0d random32 range0z ranger0k rangers0k rankin0b rankine0l ranks0a ransom1b ranvier0a raoult23 raphael4c raphaelite2p rapid0a rappaccini0w rapture0e rashi0d rashid0l rastafari1o ratatosk0g ratchet0j ratio26 rational2m rationality0c ravana0p ravel53 raven45 rawls2f rayleigh34 raymond0n reactance0a reaction3b reactor0o reader0x reading2c ready0d reagan3j realism4h reaper0b rebecca1c rebel0j rebellion2l receptor0r recession0n recessive0j reciting0i reconstruction2c record0n recovery0l recreation0a rectification0d recurrence0e recursion1p recursive0j redcrosse0e redemption0c redon0g redox16 redshift1i reduced0e reduction34 reference0z referendum0a reflect0a reflection39 reflections0h reflex0c reflux0k reform1u reformation11 refraction48 refractive0o refrigerator0k refugee0f regeneration0a regia0h regina0e regionalism0b register0t regression1n regular17 regulation0d regulator0d reich2f reign0e reinhardt0i reiter0q relation0m relations0z relative0g relativism0m relativity5t relaxation0n release0b reliance0q relic0e relief0p religion2f religious13 remains0x rembrandt4k remembrance0b remington0r remote0f removal0i remus11 renaissance2z renin0a renoir2c reparation0a repeat0c repetition0a repin0x replication22 report16 representation17 reproduction0o republice8 republican23 rerum0n reservation11 reserve1i residence0d resident0i residential0e resignation0a resistance4a resolution0v resonance4x respiration0g response0p restitution0l restoration24 restriction1h resurrection1p retention0m reticulum2u retina1s retrograde0f revelation2n revenge0k revenue0b revere1n reversal0x reverse27 revisited1c revolt2i revolts0c revolutionfd revolutionary1j revolutions0t reynard0a rhapsodies0j rhapsody32 rheingold0h rhetoric0r rheumatoid0j rhine2d rhino0g rhode24 rhone0c rhyme0q rhyolite0d ribbentrop0f ribera0e ribosome2b rican0e ricardo2j ricci0s richard8s richards0c richardson1l richler0d richter1b rickshaw0a riddle0o rider21 riders1o ridge1y ridgway0a riding0m rienzi0e rifle0e right52 rigoletto1o riley12 rilke4v rimsky3q rings1f riots0k ripper0h rises1s rising1q rivals0l riverd9 rivera3e rivers1s rizal0s roach0d roads0z roaring0l robbe0a robben0e robber0j robbers1r robbery0b robbins0g robert5z roberts0s robertson0f robeson0e robie0b robin1t robot2j robots0b roche0p rocket2e rockets0f rocking1c rocks0l rocky1h rococo2k rodeo0p roderick0j rodgers0w rodin3p rodion0e rodriguez0e roger1k rogers26 rogue0a roland3g rolfe0c rolle0f roller0b rolling1e rollins0h rollo0f roman5i romance3y romania52 romanian0b romano0n romanov0z romans17 romanticism0r romeo40 romero0a romney0m ronald0z ronaldo0e rondo12 ronin0j rooms0d rooney0d rooster0l roots0r rorschach0n rosary0p rosas0j rosencrantz1s rosenkavalier0p roses25 rosetta0s rosie0l rossetti2o rossini2n rostam0j rotation34 rotten0l rouen0m rouge20 rough0s rousseau5b route0i rover0h rowlandson0f rowling0e roxana0b royal4f royale0k royce0k rubaiyat2r rubber2a rubens2y rubik0f rubin0k rubinstein0i rublev0a rugby0l ruins0n ruisdael0g rules14 runaway0l runge0p runner2k rupert0b rurik0t rusalka0d rushd0c ruskin15 ruslan0n russell86 russes0g russiads russian4o russo1g rustin0a ruthenium0c rutledge0c rwanda1y rwandan0o ryder0l ryukyu0h sabato0a sabbath0t sabine1n sabrina0b sacagawea0h sacco0w sachs1v sacks0a sacrament0f sacramento0s sacraments0a sacred24 sacrifice21 sadat0x saens3d safavid24 sagan0g sahara2l sahib0h saigon0l sailing0u saintdr sainte0k saints1r sakharov0g salah0q salamis1e salat0z saleem0k saleh0a salem1b salesman3x salic0j salicylic0f salieri0x salinger32 saliva0l sallust0h sally0g salman0g salmon1i salome1p salon16 saloon0f saltation0f salton0b salvador2a salvation0k samaritan11 samarkand1f samarra0f samba0a samberg0c samoa21 samos0b sampo0f samsa0j samsara0w samson1t samuel23 samuelson0x samurai24 sanatorium0e sancho1e sanction0v sanctuary0a sandal0h sandburg1k sanders1k sandinista0k sandman0y sands0n sandstone0a sandy0n sanger16 sangha0c sankara0g santa44 santayana1v santeria24 sapir1l sappho3w sarabande0f sarah14 sarasate0i saraswati0i sardanapalus0w sardinia16 sargasso0x sargent2a sargon1h sarin0a sarmiento0e sarto10 sassanian0b sassanid1h satan26 satie2h satire11 satori0a satrap0d satyagraha0l satyr0v satyricon12 saudi28 saunders0p sausage0c savage1q savannah1a savart0p saved0d saving10 savonarola19 savoy1k savoye0c saxon11 saxony0p scala0e scalar0j scale1g scalia0d scandal11 scanning0m scare0f scarlatti1t scarlet3f scarlett0b scathach0a scatter0j scattering37 scene0u scenes0f schechter0g scheherazade1r scheherezade0h schelling0p schenck0n scherzo0n schiele0e schiller32 schindler1i schism0r schizophrenia1o schlenk0e schlieffen0i schliemann0e schmalkaldic0b schmidt0y schmitt0o schoenberg44 scholasticism0d scholes0h schone0b school9f schopenhauer3a schroder0d schrodinger4g schubert5t schulz0h schuman0c schumann5l schutz0b schwartz0q schwarz0j schwarzschild18 scientist0g sclerosis0t scoop0e scopes11 score0v scorpion0n scotia0n scots0x scott7y scotus11 scout0g scrabble0a scream2b screen16 screw1o scrivener0t scroll0t sculpture0b scythian0k scythians0a seafloor1b seamus0c seance0b search5l searle0y sears0b season2j sebastian1h secession0n secondk3 secondary17 seconds0d secret38 secretary2k section1p secular0i securities0h security1q sedan0p seder0q sedgwick0d sedition0t sedna0t seeger0a seeing0d seine0d seinfeld0j sejanus0f sekhmet0p selection2m selena0b seleucid0r selim0o seljuk0y sellars0q selma0j semantics0d semele0n semiotics0e semitic0d senate0z sennacherib0o senor0d sense4c sensibility1g sensing0v sentences0i sentimental12 sentiments0p separate0i separation0v septimius0m sequence2b sequoia0d serbia1g serfs0e sergei15 serial0o serine0q serotonin1t serpent2u serra0u service2i servius0a sestina0g seuss0k sevastopol0l sevenc1 seventeen0g seventh2b severan0f severn0a seville25 seward1i sewer0v sextet0a sexton0w sextus0q sexuality0h shabaab0e shabbat0w shade0e shades0g shadow2c shaffer0h shahada0r shahadah0c shahnameh1e shaka1s shake0d shaker0g shakers0f shakespeare5z shakti0a shakuntala0r shale0v shall12 shalott0m shaman16 shamash0f shame0o shandy1k shang1h shanghai20 shankar0f shannon0v shanter0c shaolin0f shape0t shapiro0m shapley0c share0a sharer0e sharia1a shark3m sharon0g sharp1q sharpe0b sharpless0h shavuot0l shays13 shear11 sheba0p sheep2a sheet10 shell2e shema0f shepard15 shepherd2g sheridan1r sherif0h sherlock26 sherwood0j shielding0a shift2w shiloh1h shine0c shining14 shinto43 ships0o shipwreck0p shire0a shirk0i shirt0n shiva4m shivaji0e shock26 shockley0b shoes0m shofar0o shogun12 shoki0d shona0l shoot0y shooting1f shore1f short2j shorter0c shortest0m shoshone0h shostakovich54 shotgun0g shout0b shower0e shrek0a shrew0z shrine0k sibelius47 siberia1n siberian0c sibyl0q sicilian11 sickle1e sickness15 siddhartha1p sidgwick0f sidney1i siege1e siegfried18 siena1b sienkiewicz0v sierpinski0i sierra1x sieve0s sight0a sigismund0r sigma1w sigmund0e signac0l signal0u signature0a sigurd1d sigyn0a silence21 silent3b silica0e silicon3b silko0d silla0x silver6u silvia0p simbel0f simmel0u simmons0m simnel0b simon3y simone0r simons0a simple2s simplex0c simpson1t simulation0b simurgh0d sinai12 sinbad16 singapore38 singer3n singh1b singin0c singing12 single1c sings0w singularity0p sinking0p sinners0j siren0m sirens0d sirius0p sisley0d sister1k sisters21 sistine21 sisyphus2d sitting0n situation0d sixteen0a sixteenth0e sixth10 sizwe0b skadi0p skanderbeg0h skating0n skeleton10 skeptic0i skepticism1c sketches1i skinner24 skull2o skunk0j slater17 slaveac slavery2l slaves0t slavic0f slayer0h sleep3h sleeping25 sleepwalk0e sleepy12 slide0b slime0f sloan0c slope0r sluys0b small5i smart0i smash0p smashing0b smell0i smetana21 smile0f smiley0c smiling0c smithd0 smoke0n smoking0r smoky0b smollett0t smoot0y smooth0z smuts0e snake5r snakes0f snare0s snark0d snell24 snowball0i snowden0q snows0i snowy0p soames0e sobek0v social7s socialism10 socialist1g society5p sociological0k sociology0p socotra0c socrates3t sodom0r sofia0b solar37 soldier3v solenoid0l solid13 soliloquy0d solitary0d solomon4n solon1d solow0n solubility1e solution0t solvation0d somali0a somalia25 something0p somoza0k songhai2b songs3m sonic0v sonnet57 sonny0d soong0d sophia19 sophie0f sophist0k sorel0l sorites0c souls2b sousa1i southern2o southey0j sovereignty0g space7o spaceship0a spacex0a spade0f spades0q spainh9 spangled0l spanishct spanning0n spark0t sparta3w spartacist0b spartacus21 speak0u speaker10 speaks0e spear2e specific1t spectator0i spectral0r spectrometry0k spectrophotometry0h spectroscopy0z speeches0a speed7j speer0c spelling0g spencer1h spenser1w spherical19 sphincter0d sphinx15 spice0v spider5a spiegel0b spike0i spill0b spinal0i spine0b spinning0q spinoza3u spiral2h spirited0d spirits2x spiritual18 splicing16 split0m splitting0k spock0h spoke0l sponge0k spoon1f spore0e sports0j sportsman0m sprach16 spratly0b spreading19 springd3 springfield0l springs0z sprung0k spurs0k squad0o square9z squared1x squares0f squid15 srebrenica0f stability0r stable0p stack2a stacking0a stadium0s stael0a staff0r stage1l stages0k stagflation0c stagnation0a stahl0q stain0v stair0d stalin40 stalker0a stamen0m stamford0p stamp1d stand15 standard4s standing15 stanford48 stanislavski0b stanley23 stanton17 staph0f starch0g stark1d starr0f starry1c stars2a start0h starving0k statefo staten0b statescx static10 station2n stations0a statistics0e statius0h statue1v status0a steady0w steal0n stealing0i steam1g steel4o steele0a steelers0d steen0g steerage0d stefan0o stefano0c stegner0d stein2b steinbeck3c steiner0e stella1e stellar0g stendhal22 stephen4v stephens0d stephenson0c steppenwolf1m steps0x sterilization0c stern1i sterne0v steroid0p steven0g stevens53 stevenson3g stewart1c stick0n sticky0b stieglitz2g stiglitz0o stigma0j stijl1f still1x stilwell0b stimson0p stimulated0b stirling0z stock16 stocking0a stoic2e stoichiometry0i stoker0m stokes4m stokowski0f stolen0r stoma0f stomata0e stone7o stones0x stoning0h stono0i stool0t stoops17 stopping0o store0j stories1y storm2d storming0c stormy0h story6a stowe1n strabo0c straight0i strain1w strait10 strand0g strange36 stranger3p strasbourg0m strategic0i stratosphere0x strauss9l stravinsky56 straw0i stream3d strecker0g street7c stress42 strict0c strike3b strikes0k strindberg3d stringb5 strings12 strip1g stripes0d stripped0d stroke0g strong40 stroop0i structural0x structure39 structures0j struggle0e stuart1w studies0k study0y stuff0l stupa0i sturm1c style19 styles0e subduction1e substance0c substantia0e substitute0a suburb0b succession5g suckling0j sucre0n sucrose0a sudan36 sudetenland0b sufficient0s suffrage2f sufism0g sugano0f sugar4c suite1t sukarno1i sukkot1k suleiman1n sulfate0o sulfide0g sulla1c sullivan3m sultan0u sultanate0b sumatra0p sumer0s sumerian0i summa1g summer3o summers0c sumner1m sumter0l sunday4p sunnah0c sunni0z sunny0e sunset0j sunstone0z sunyata0a super2l superbus0o supercell0i superconduct0b superconductor28 superfluid1q superfluous0i superior0v supernova2h superstar0c supersymmetry0u supper42 suppressor0i supreme2p surah0d suriname0n surprise0y surrealism29 surrender0l survey0f surya0l susan0q susanna0i susanoo1u sutherland0e sutra22 sutter0e swahili1b swamp0g swann0x swans0q swastika0e sweat10 sweden8r sweep0n sweeper0f sweet19 sweyn0e swift4v swimmer0g swing37 swiss0q switch0x switching0o switzerland62 sydney2d sykes0o sylow0a sylvester0o sylvia0c symbiosis0b symbolic0q symbolism19 symmetric13 symmetry2f sympatric0a symphonic0o symphonie2j symphonies3o symphonyba symposium1r syncretism0e synge0x syntactic0d synth0e synthase0o synthesis15 synthesizer0e synthetic0u syracuse15 syria27 syrian0d table4g tables0a tablet0m taboo0q tabula0m tagus0e taiga0m tailleferre0f taino0o taiping1j taisho0e taken0y taking0d taklamakan0f talas0e talent0b tales6d taliban0t taliesin1k talking0i tallis1n talmud1l talos0l tamar0g tamburlaine0i tamerlane19 tamil2u taming0z taney15 tangent0r tango1k tanka0c tannenberg0i tanner0g tantalus18 tantra0g taoism12 tapestry12 tarantino0h taras0h tarkington0h tarkovsky0m tarleton0b tarot0g tarquin0q tarquinius0n tarski0w tarzan0g tasman0s tasmania17 tasso0g taste0w taurus0n taxes0e taylor5q teacher1p tears1l tectonic0f teeth3d tehran0r telegram0k telegraph0r telemachus0u teleological0d telephone0f teller1t telomerase0k telomere1g tempera0h temperance0r temperature8h temple6l temples0a tempo0e temporal0g temptation0x tenant0i tender10 tenebrism0e tengri0m tennessee35 tennis2f tenor17 tensor1l tenth10 tenure0e terence1i teresa13 terminal0t termination0f terra0u terror11 terrorism0a terry0f tertius0k tertullian0l tesla19 teton0a tetrahedral1g tetrahedron0b tetris0g tetrode0g tetroxide0c teutoburg0f teutonic1e tewkesbury0b tewodros0a texas7k tezcatlipoca1u thackeray1h thais0c thaler0b thales15 thames1n tharp0d theaetetus0f theater1w thebes4j their3g theme1f themis0a theodicy0c theodora0m theodore0u theodoric0t theodosius0o theologica14 theologico0m theology0k theorem3w theoretical0b theravada1f there1k theresa2k therese0f thermal18 thermidor0f thermidorian0b thermo0d thermohaline0c thermopylae17 theses0t theseus3t theta0x thetis0s thiamine0l thiazi0a thick0j thief1a thiers0m thing20 things95 think1a thinker1c thinking0n thiol0w third9t thirteen15 thirteenth0b thirty4w thomasaq thompson1u thomson2w thorn0e thorns0a thorpe0b thoth2j thrace0l thread17 threat0b threelh throat0s throne0y through1b throw0p thrush0v thrust0a thumb0i thunderstorm0a thymine0d thyrsis0g tiber0i tiberius0r tibet3t tidal0s tierra17 tiger48 tigers1c tigris0n tikal0j tilbury0c tilden0o tilly0i timber0b times4e timon0d timor13 timur1v tinker0t tintin0e tippett0c tiresias1p tirthankar0n tirthankara0t tisha0l tishrei0a titan2w titanic1l titans0k tithonus0r titian38 title0d titration42 titus1m tobias0b tobin0g tobit0g tocqueville0s today0d toibin0c tokarczuk0f tokyo2h tolkien1o tolls0t tolman0b toltec0h tomato0c tombs0b tommy0g tomography0c tonga0p tongue0u tongues0e toole0a tooth0c topological0h topology0k torah27 torch0l tordesillas0h torii11 tormes0p torres0k torricelli0e torsion0r torso0j torus1c total20 totec0b totem18 touch0y toulouse1e tours1n toussaint0f tower5c towers0v townshend0o toxic0c trace15 tracing0m track0e tracking0e trade4s tradition0f traffic0s tragedy4v tragic0x trail1m train5m trains0p trajan1p trans21 transaction0f transcendentalism0j transcription2l transfer2c transfiguration0q transform2h transformation1q transformer0z transistor2i transit0s transition64 transitive0b translating0l translation3j transmigration0c transpiration0g transplant0c transport1r transportation0f transpose0b transposon12 transtromer0d transubstantiation0r transverse0m trapezoid0q trauma0b travel1i traveler1m traveling19 traveller0g travelling0a travels1n travesties0d treachery0d tread0h treasure1k treasury0s treatise0z treatises0b treaty1i trees1c trembling1n trent1q trenton0m trevi0f triad0f trial4u trials0m triangular0r tribe0i tribune0x tribute0s trick0k trickster0m trieste0b trigger0e trill0m trilobite0g trilogy0v trinity1q triomphe0c tripitaka0h triple6a triplet0j triptolemus0a tristan2b triste0e tritium0a triton19 tritone0s triumph16 triumvirate0l trobriand0n trojan2e troll0a trolley1j trompe0a trophic0i tropic0g tropical0a troposphere0t troubadour0u trouble0s troubles23 trout1y trovatore0p troyes0f truck0f truffaut0p trump20 trumpet4h trung0p truss0g trust0t truth59 tryst0b tsukuyomi0g tsvetaeva0b tuareg0f tuatha0d tuchman0i tudor0m tully0b tulsa0u tumor11 tuning0m tunis0a tunnel1z tunneling1n tuonela0u turangalila0b turban1l turbidity0k turbine0h turbulence1h turbulent13 turgot0a turin0l turing4x turkey6c turks0j turned0l turner6b turning0p turnus0r turtle2z tuscany0b tutankhamun0q tutsi0n tutte0u tutuola0b twain4u tweed0v twelve38 twelvers0b twice0g twinkle0a twins1r twist1u twisted0c twitter0k tyger1d tyler2a tylor0i tyndall1a typee0a types0b typhon11 tyrant0m tyrants0g tyrone0s tyrosine19 ubermensch0c ultimate0d umayyad25 unbearable2s unbound0c uncertainty2n under38 underground30 underwood0b underworld3c unfinished18 unfortunate0c unicorn16 unionbn unique0o unitary0d unitedjy unity0q universal2j universe1i university18 unknown0k unready0k uranus1o urban1n uriah0a urine0z ursula0d uruguay24 usher0y ustase0e uther0b utopia2t utzon0f uyghur0h vacuole0j vagina0j vague0c vainamoinen19 vajrayana0a valdez0g valence1b valencia0e valentine0o valera0k valery0p valkyrie13 valkyries0r valley4n valse0b value34 valve0r vampire2w vancouver1l vandals0f vanir0i vanities0l vanity2j vanya1h vapor1t varangian0r variation0t variational0h variations2l varieties0c varna0f varuna0a vascular0f vatican2b vaughan30 vaughn0c vault0e vector4c vedas0e vegas2c vegetarian17 velazquez36 velvet1k venezuela3w venturi0k venusb6 verde10 verdi3v verdun1t vergil15 verne27 vernon0b verona0v verrocchio0o verse12 verses22 vertex0f vertical0m vertices0c vertumnus0a vesicle0p vesta0x vestal0g vesti0d vibration0r vibrato0a vicar0w vichy1s victims0b victoire0d victor1n victoria5e victorian0f victory1v vidal0w vidar0a video1e vienna8h vijayanagar0d villa3m villi0d vinci34 viola2i violation0m violence1n violencia0d violent0a violet0e virgil2m virgin38 virginia9a virgins0k virgo0f virial1u virtual1u virtue1y virus1l visit0v vista0c vital0a vitale0f vitruvius0h vitus0b vladimir21 vocation0f vodou1g vogue0v voice1l voices0m volcanic0f volga1h volta0s voodoo3e vortex0n vortices0f vorticity0i vowel2h voyage15 voyager0o vritra0g vronsky0e waals41 wager0d wages0c wagner5y wagon0g wahhab0e wahhabi0g wainwright0t waiter1f waiting4p wakefield0z waking0d walcott3d walden1l waldstein0b wales4z walesa0l walker4v walking1d walks0y wallace6l wallachia0c wallenstein0s waller0f walls0d walras0e walrus0b walser0a walsh0d walsingham0g walter1y walton1c wanderer1b wanderers0a wandering0i wants0b warhol4a warming0f warner0o warren4p warring0x washing0i washingtonh4 waste31 watch3f watchmaker0a watchman0d watchmen0p waterig waterfall0f waterfowl0g waterfront0a waters0r watership0l watling0b watson4e watts0v waverley0d waves1v wayland0f wealth1h weary0r weather1f weathering0a weaving0p webber0r weber56 webern0o wedding7a wedgwood0f weekend0f weeknd0i weeks0g weems0a weierstrass16 weight1a weimar23 weinberg1y weinstein0b weiss0l welch0d welcome0d welles1f wellesley18 wellington1g wells2y welsh10 welty1e werewolf0d werther27 wesley0w wessex1c western8s westminster11 weston0f westphalia1c weyden0n whale2l wheatstone0m where2t whiskey24 whistler2w whitetb whitehead1a whitewater0h whitman56 whole0p whore0p whorf1b whyte0a wicked16 widor0a widow0k wieland0a wiesel0v wigner0s wikipedia0k wilde5b wilder3a wildfire0a wiley0e wilfred0b wilhelm34 wilkes0p wilkins0d wilkinson0p willamette0e willebrand0f williamsfw williamson0m willie0o willis0g willy0y wilmington0d wilson9p windermere0t windhover0d window28 windows0w winds0c winged0w wings17 winkle10 winner12 winnie0h winston0s winter6t winterreise0p winterson0e witch4b witches0r within0g witness1e witte0e wives1r wodehouse0i wolfe2x wolff14 wolfgang0h wolof0c wolseley0a wolsey0j woman7a womenca wonder0v wonderful0q wonders0b woods2c woodstock0t woolf7v words1h wordsworth3w worker0d workhouse0a works16 worldzz worlds19 worms1j worth0h would0s wozzeck0i wrath21 wreck1c wrestling12 wright7d wrinkle0c write0q writing1v written1h wundt0i wuthering2k wycliffe0c xerxes12 xiongnu0l xxiii0f yahoo0e yakub0d yalta0g yamamoto0e yamato0e yankees0w yanomamo0c yaroslav0l yasna0d yazidi0l yazoo0d yearsdl yeast0z yeats65 yemen2g yerma0k yevgeny0b yevtushenko0m yggdrasil28 yokai0c yorker14 youngex younger2a youtube0g yugoslavia2c yukon0w yvain0a zadig0e zadok0g zaitsev0j zakat15 zambezi0y zapotec0n zealand8c zechariah0a zelda0j zelenskyy0b zener0c zenger0e zhang0p zheng1g zhuangzi10 ziegler1b zimbabwe45 zimmer0a zimmerman0k zinoviev0c zionism0o zodiac0x zohar0i zombie1a zoroaster0v zoroastrianism2f zuckerman0a zurbaran0j";
let CONFUSABLE = null;
function corpusCount(t) {
  if (!CONFUSABLE) {
    CONFUSABLE = new Map();
    for (const e of CONFUSABLE_SRC.split(" ")) if (e.length > 2) CONFUSABLE.set(e.slice(0, -2), parseInt(e.slice(-2), 36));
  }
  return CONFUSABLE.get(t) || 0;
}
// is the fuzzy reading of token t (for form word w) blocked by the collision guard?
function knownCollision(t, w) {
  const nt = corpusCount(t);
  if (nt < 10) return false;
  const base = w.kind === "O" ? w.t : w.segs.filter((x) => x[0]).map((x) => x[1]).join("");
  const nc = Math.max(corpusCount(w.t), corpusCount(base));
  return nt >= 0.25 * nc;
}

// ---------------------------------------------------------------- line compilation
const LINE_CACHE = new Map();
const LINE_CACHE_MAX = 500;

function getLine(html, sanitized) {
  const key = String(html || "") + "\u0001" + String(sanitized || "");
  let P = LINE_CACHE.get(key);
  if (P) { LINE_CACHE.delete(key); LINE_CACHE.set(key, P); return P; }
  P = compileLine(html, sanitized);
  LINE_CACHE.set(key, P);
  if (LINE_CACHE.size > LINE_CACHE_MAX) LINE_CACHE.delete(LINE_CACHE.keys().next().value);
  return P;
}

// Import damage in the HTML (spec §4.18): keywords glued to tags or to the next word.
function healHtml(h) {
  return String(h)
    .replace(/\bprompton(?=[\s“”"'‘’<]|$)/gi, "prompt on")
    .replace(/\bprompton(?=[A-Za-z])/gi, "prompt on ")
    .replace(/(<\/[bui]>)(before|after|until|alone|once|or|and)(?=[\s"“”,;:.)\]<]|$)/gi, "$1 $2")
    .replace(/(^|[\s;,(\[])(accept|or|prompt on|prompt|reject)((?:<[bui]>)+)(?=\S)/gi, "$1$2 $3")
    .replace(/(<\/u>(?:<\/b>)?)(e?s)(and|or)(\s+(?:<b>)?<u>)/g, "$1$2 $3$4")
    .replace(/([\p{L}.,!?])(["”])(after|before|until|is|are)\b/gu, "$1$2 $3");
}

const GUIDE_INNER = /^\s*"[^"]{0,80}"\s*$/;
const DIRECTIVE_WORD = /\b(?:accept|prompt|reject|do\s+not|don't|anti-?prompt|before|until|after|once|read|mention(?:ed)?|note|pronounced)\b/i;
const NOTE_IN_HEAD = new RegExp(R`(?:^|[\s.;,])(?:` + KW.note_players.rx + "|" + KW.note_moderator.rx + "|" + KW.note_editor.rx + "|" + KW.note_generic.rx + ")", "i");
const LENIENT_SPELL = /\b(?:pronunciations?|phonetic(?:ally)?|spellings?|spelling\s+variations?|vowels?|transliterations?)\b/;

// Inline HTML other than b/u/i (qbreader imports): subscripts glue ("H<sub>2</sub>O" -> "H2O"), <em>/<strong>
// are italics/bold, line breaks and entities are spaces. The cleaned DB lines carry only b/u/i.
function inlineTags(h) {
  if (!h || h.indexOf("<") < 0 && h.indexOf("&") < 0) return h;
  return String(h)
    .replace(/<\/?(?:sub|sup|span|font|small|big|a|mark|ins)\b[^<>]*>/gi, "")
    .replace(/<(\/?)em>/gi, "<$1i>").replace(/<(\/?)strong>/gi, "<$1b>")
    .replace(/<br\s*\/?>|<\/?p\b[^<>]*>/gi, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

// "(also called the <b><u>Huang He</u></b>)", "also spelled <b><u>X</u></b>", "a.k.a. <b><u>X</u></b>": an alternate,
// like "or", when the phrase opens a group or follows a marked answer and a marked answer follows it
const AKA_RX = /((?:^|[(\[;,])\s*|<\/u>(?:<\/b>)?(?:<\/i>)?[”"’]?\s*,?\s*)(?:also\s+(?:called|known\s+as|spelled|termed|referred\s+to\s+as)|otherwise\s+known\s+as|a\.k\.a\.?|aka)\s+(?=(?:(?:the|a|an)\s+)?(?:<i>)?<[bu]>)/gi;
function akaToOr(h) {
  return h && /also|a\.?k\.?a|otherwise/i.test(h) ? String(h).replace(AKA_RX, "$1or ") : h;
}

// "<i>The<b><u>Metamorphosis</u></b></i>": a leading article glued to the marked title by a tag
const GLUED_ARTICLE = /(^|[\s>(\[“"])(The|A|An|Les|Le|La|Die|Der|Das|El|Il|Los|Las)((?:<[bui]>)+)(?=\p{Lu}\p{Ll})/gu;

// vulgar fractions are written out ("½" = "1/2")
const VULGAR = { "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4", "⅕": "1/5", "⅖": "2/5", "⅗": "3/5", "⅘": "4/5", "⅙": "1/6", "⅚": "5/6", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8" };
const VULGAR_RX = /[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g;
const VULGAR_TEST = /[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/;
const vulgar = (t) => (t && VULGAR_TEST.test(t) ? String(t).replace(VULGAR_RX, (c) => " " + VULGAR[c] + " ") : t);

// emphasis asterisks ("do *not* accept", "**For alternate answers …**", "<u>ER</u> *and* Golgi") are not text;
// an emphasised "and" between answers means both are required
const emphasis = (t) => (t && t.indexOf("*") >= 0
  ? String(t).replace(/\*\*([^*]{1,200})\*\*/g, "$1").replace(/(^|[^\p{L}\p{N}*])\*(\p{L}[^*<>]{0,40}?\p{L}|\p{L})\*(?=[^\p{L}\p{N}*]|$)/gu, (m0, pre, w) => pre + (/^and$/i.test(w) ? "AND" : w))
  : t);

function compileLine(html, sanitized) {
  html = vulgar(emphasis(akaToOr(inlineTags(html))));
  sanitized = vulgar(emphasis(sanitized));
  // punctuation-only text after the last group ("… [Fyodor Mikhaylovich <u>Dostoevsky</u>] .") is not an answer
  if (html) html = String(html).replace(/([\])])\s*[.,;:]+\s*$/, "$1");
  if (html && html.indexOf("“") >= 0) html = String(html).replace(/“\s+“/g, "“");   // a doubled opening quote (import damage)
  if (html && /<[bu]>/.test(html)) html = String(html).replace(GLUED_ARTICLE, "$1$2 $3");
  const healed = healAnswerline(html, sanitized);
  let src = healed.answerline && String(healed.answerline).trim() ? healed.answerline : (healed.sanitized || "");
  src = healHtml(String(src).replace(/&lt;[^&<>]{0,40}&gt;\s*$/g, " ").replace(/<(?![\/]?[buiBUI]>)[A-Z][^<>]{0,30}>/g, " ").replace(/ /g, " "));
  const ref = buildRef(src);
  const L = ref.L;
  const rules = ref.rules;
  const P = { src, ref, L, rules, text: ref.text, notes: [] };
  const s = L.s;
  // notes inside the main answer ("gongs Note to players: description acceptable.") carry line rules (P9, brief §8)
  for (const f of ref.forms) {
    if (f.src !== "main" && f.src !== "main_next") continue;
    const m = NOTE_IN_HEAD.exec(s.slice(f.start, f.end));
    let marked = false;
    // a marked "note" is the answer itself ("the author’s <u>note</u> to …"), not a note
    if (m) for (let k = f.start + m.index; k < f.start + m.index + m[0].length; k++) if (L.styled(k) && /\S/.test(L.text[k])) { marked = true; break; }
    if (m && !marked) {
      const at = f.start + m.index + (/^[\s.;,]/.test(m[0]) ? 1 : 0);
      f.drop = (f.drop || []).concat([[at, f.end]]);
      P.notes.push(L.text.slice(at, f.end));
    }
  }
  if (P.notes.length) {
    const nt = normKw(P.notes.join(" "));
    if (/descriptions?\s+(?:is\s+|are\s+)?acceptable|accept\s+descriptions/.test(nt)) (rules.open_class = rules.open_class || []).push("accept:description acceptable");
    if (/exact\s+(?:spelling|answer|wording)\s+required/.test(nt)) rules.exact = true;
    if (/(?:two|three|four|both|all)\s+(?:answers|parts)\s+(?:are\s+)?required/.test(nt)) rules.multi = true;
  }
  if (/exact\s+spelling\s+required/.test(s)) rules.exact = true;
  if (/no\s+other\s+(?:answers?|words?|names?)\s+(?:is\s+|are\s+)?(?:acceptable|accepted|allowed)/.test(s)) rules.closed = true;
  const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  let m;
  if ((m = /\b(?:accept|take|allow)\s+(?:any|all)\s+(one|two|three|four|five|2|3|4|5)\s+(?:of|from)\b/.exec(s))) rules.any_n = NUMW[m[1]] || Number(m[1]);
  if ((m = /\bprompt\s+(?:on\s+)?(?:any|all)\s+(one|two|three|four|five|2|3|4|5)\s+(?:of|from)\b/.exec(s))) rules.prompt_any_n = NUMW[m[1]] || Number(m[1]);
  // "accept either first or last name", "accept either first name or surname", "accept first or last name"
  {
    const rx = /\b(?:(?:either|any)\s+(?:the\s+)?|(?:accept|take|allow)\s+(?:either\s+)?(?:the\s+|his\s+|her\s+|their\s+)?)(?:(?:first|given)\s+(?:names?\s+)?or\s+(?:the\s+)?(?:last|family|sur)\s*-?names?|(?:last|family|sur)\s*-?(?:names?\s+)?or\s+(?:the\s+)?(?:first|given)\s+names?)\b/g;
    let e;
    // applies to the parts that are one person's name (matchForm): "Edna Pontellier committing suicide" or
    // "Snape and Lily Evans" with "accept first or last name(s)" still need the rest of the answer
    while ((e = rx.exec(s))) {
      const cl = s.slice(Math.max(s.lastIndexOf(";", e.index), s.lastIndexOf("[", e.index), s.lastIndexOf("(", e.index), s.lastIndexOf(",", e.index)) + 1, e.index);
      if (!/\b(?:prompt|reject|not|n't)\b/.test(cl) && !markedRange(L, e.index, e.index + e[0].length)) { rules.either_name = true; break; }
    }
  }
  if (/\b(?:no\s+(?:credit|points)|do\s+not\s+(?:accept|prompt)[a-z\s]*)\s+(?:for\s+)?(?:getting\s+)?(?:just\s+)?(?:only\s+)?one\s+(?:correct|right|answer|part)/.test(s)) rules.partial_policy = "reject";
  if (/\bmust\s+be\s+in\s+order\b|\border\s+must\s+be\s+correct\b|\bin\s+(?:that|this|the\s+correct)\s+order\b/.test(s)) rules.order = "fixed";
  if ((rules.lenient && LENIENT_SPELL.test(s)) || /\b(?:similar|close|alternat(?:e|ive))\s+(?:phonetic\s+)?(?:pronunciations?|spellings?)\b|\bphonetic(?:ally)?\s+(?:reasonable|spellings?|equivalents?)\b/.test(s)) rules.lenientSpell = true;
  // "“X” is not needed after it is read", "do not require “X” after it is read", "accept answers without “X” after …"
  P.optional = [];
  const opt = [
    /"([^"]+)"\s+(?:is|are)\s+(?:not\s+)?(?:needed|required|necessary)\s+(?:after|once)\s+([^;)\]]*)/g,
    /\b(?:do\s+not|don't|does\s+not|doesn't)\s+(?:need|require)\s+"([^"]+)"\s+(?:after|once)\s+([^;)\]]*)/g,
    /\banswers\s+without\s+"([^"]+)"(?:\s+or\s+"[^"]+")*\s+(?:after|once)\s+([^;)\]]*)/g,
  ];
  for (const rx of opt) {
    let mm;
    while ((mm = rx.exec(s)) !== null) P.optional.push({ word: mm[1], marker: mm[2] });
  }
  return P;
}

// Words of a char range with per-char required flags. pred(k) = required; drop = [[x, y]] ranges to skip.
const JOINT_RUN = 500;
const isJointRun = (r) => r >= 0 && r % 1000 >= JOINT_RUN;
function rangeWords(P, a, b, pred, drop, plain, joint) {
  const L = P.L;
  const s = L.s;
  const skip = new Uint8Array(Math.max(0, b - a));
  for (const [x, y] of drop || []) for (let k = Math.max(a, x); k < Math.min(b, y); k++) skip[k - a] = 1;
  // nested brackets inside an item: drop guides, timing remarks, notes and directive asides; keep optional words
  let depth = 0, open = -1;
  for (let k = a; k < b; k++) {
    const ch = s[k];
    if ((ch === "(" || ch === "[") && !pred(k)) { if (depth === 0) open = k; depth++; }
    else if ((ch === ")" || ch === "]") && depth > 0 && !pred(k)) {
      depth--;
      if (depth === 0 && open >= 0) {
        const inner = s.slice(open + 1, k);
        let req = false;
        for (let j = open; j <= k; j++) if (pred(j)) { req = true; break; }
        if (!req && (GUIDE_INNER.test(inner) || DIRECTIVE_WORD.test(inner) || words(inner).length > 4 || /^\s*"?[a-z]+(?:-[a-z]+)+"?\s*$/i.test(inner)))
          for (let j = open; j <= k; j++) skip[j - a] = 1;
        open = -1;
      }
    }
  }
  // a pronunciation guide (“…”) right after a word is never part of a form (§7.6)
  const gre = /\(\s*"[^"]{1,80}"\s*\)/g;
  let gm;
  const seg = s.slice(a, b);
  while ((gm = gre.exec(seg)) !== null) {
    let req = false;
    for (let j = a + gm.index; j < a + gm.index + gm[0].length; j++) if (pred(j)) { req = true; break; }
    // a guide caught inside the underline ("<u>Ia (“one-A”) supernova</u>") is still a guide
    const pron = /-|[A-Z]{2}/.test(L.text.slice(a + gm.index, a + gm.index + gm[0].length));
    if (!req || pron) for (let j = gm.index; j < gm.index + gm[0].length; j++) skip[j] = 1;
  }
  const attrs = new Array(b - a);
  let runId = -1, inRun = false;
  for (let k = a; k < b; k++) {
    if (skip[k - a]) { attrs[k - a] = null; inRun = false; continue; }
    const r = !!pred(k) && (!!strip(L.text[k]) || inRun);
    if (r && (!inRun || (L.tb && L.tb[k] && pred(k - 1) && /\p{Ll}/u.test(L.text[k - 1] || "") && /\p{Lu}/u.test(L.text[k])))) { runId++; inRun = true; }
    else if (!r) inRun = false;
    attrs[k - a] = { r, run: r ? runId : -1, tb: !!(L.tb && L.tb[k]) };
  }
  // JOINTLY_REQUIRED_PIECES: the named pieces form one run (one required portion, spec §7.6, brief §6)
  if (joint && joint.length) {
    const runText = new Map();
    for (let k = a; k < b; k++) { const at = attrs[k - a]; if (at && at.r) runText.set(at.run, (runText.get(at.run) || "") + L.text[k]); }
    const key = (t) => tokenize(t, null, plain).map((x) => x.t).join(" ");
    const ids = [...runText.keys()].sort((x, y) => x - y);
    for (const pair of joint) {
      if (!Array.isArray(pair) || pair.length < 2) continue;
      for (let i = 0; i + 1 < ids.length; i++) {
        if (key(runText.get(ids[i])) === key(String(pair[0])) && key(runText.get(ids[i + 1])) === key(String(pair[1]))) {
          // a joined run gets an id >= JOINT_RUN (mod 1000) so groups and matchForm can recognise it
          const jid = ids[i] % 1000 >= JOINT_RUN ? ids[i] : JOINT_RUN + ids[i];
          for (const at of attrs) if (at && (at.run === ids[i + 1] || at.run === ids[i])) at.run = jid;
          ids[i + 1] = jid; runText.set(jid, (runText.get(ids[i]) || "") + " " + (runText.get(jid) || ""));
        }
      }
    }
  }
  const text = L.text.slice(a, b);
  const toks = tokenize(text, (k) => attrs[k], plain);
  for (const t of toks) { t.it = !!(L.it && L.it[t.k0 + a]); t.k0 += a; t.k1 += a; }
  let disp = "";
  for (let k = a; k < b; k++) {
    const at = attrs[k - a];
    if (at && at.tb && at.r && k > a && attrs[k - a - 1] && attrs[k - a - 1].r && /\p{Ll}/u.test(L.text[k - 1]) && /\p{Lu}/u.test(L.text[k])) disp += " ";
    disp += at ? L.text[k] : " ";
  }
  toks.display = disp.replace(/\s+/g, " ").replace(/^[\s,;:.]+|[\s,;:]+$/g, "").replace(/\s+([,.;:)\]])/g, "$1");
  return toks;
}

function wordInfo(tok, prevTok) {
  const n = tok.r.filter(Boolean).length;
  const kind = n === 0 ? "O" : n === tok.t.length ? "R" : "M";
  const segs = [];
  for (let i = 0; i < tok.t.length; i++) {
    const r = !!tok.r[i];
    if (segs.length && segs[segs.length - 1][0] === r) segs[segs.length - 1][1] += tok.t[i];
    else segs.push([r, tok.t[i]]);
  }
  const run = tok.runs.find((x) => x >= 0);
  let num = tok.numMerged || numInfo(tok.t);
  // Roman numerals fold only in numeral positions: after a name; never "Malcolm X", vitamin C, "C major" (J§8.2)
  if (!num && /^(?:[IVX]+|[IVXLC]{2,})$/.test(tok.orig) && prevTok && /^\p{L}+$/u.test(prevTok.t) && !CONNECTIVES.has(prevTok.t) && !ARTICLES_ALL.has(prevTok.t)
    && !(tok.t === "x" && prevTok.t === "malcolm")) {
    const v = romanVal(tok.t);
    if (v) num = { v, kind: "roman" };
  }
  return { t: tok.t, kind, segs, run: run === undefined ? -1 : run, cap: tok.cap, orig: tok.orig, num, k0: tok.k0, k1: tok.k1, it: !!tok.it, poss: !!tok.poss };
}
function allReqWords(toks) {
  return toks.map((t, i) => wordInfo({ ...t, r: [...t.t].map(() => true), runs: [...t.t].map(() => 0) }, toks[i - 1]));
}

function respNum(tok, prevTok) {
  if (tok.numMerged) return tok.numMerged;
  const n = numInfo(tok.t);
  if (n) return n;
  if (prevTok && /^\p{L}+$/u.test(prevTok.t) && !CONNECTIVES.has(prevTok.t) && !ARTICLES_ALL.has(prevTok.t) && /^(?:[ivx]+|[ivxlc]{2,})$/.test(tok.t)) {
    const v = romanVal(tok.t);
    if (v) return { v, kind: "roman" };
  }
  return null;
}

// Candidate surface strings of a partly required word: (tail of pre) + R + (mid or nothing) + R + (prefix of post) (§7.3)
function wordCands(w) {
  if (w._cands) return w._cands;
  let cands = [""];
  const segs = w.segs;
  const allDigitsR = segs.filter((x) => x[0]).every((x) => /^\d+$/.test(x[1]));
  segs.forEach(([r, str], i) => {
    let opts;
    if (r) opts = [str];
    else if (i === 0) { opts = []; for (let k = 0; k <= str.length; k++) opts.push(str.slice(k)); }
    else if (i === segs.length - 1) {
      if (allDigitsR && str === "s") opts = ["s"];
      else { opts = []; for (let k = 0; k <= str.length; k++) opts.push(str.slice(0, k)); }
    } else opts = ["", str];
    const next = [];
    for (const c of cands) for (const o of opts) next.push(c + o);
    cands = next.slice(0, 96);
  });
  w._cands = [...new Set(cands)].filter(Boolean);
  w._rlen = segs.filter((x) => x[0]).reduce((n, x) => n + x[1].length, 0);
  return w._cands;
}

function budgetFor(len, ctx) {
  let b = len <= 4 ? 0 : len <= 8 ? 1 : 2;
  if (len >= 3) b += ctx.extraBudget || 0;
  return b;
}

const DERIV_SUFFIX = /(?:ations?|ative|atives|ating|ated|ates|ism|isms|ists?|ians?|ically|ical|ics?|ities|ity|ive|ives|izes?|ized|izing|ises?|ised|ising|ings?|ed|ers?|ly|ness|ments?|able|ible|als?|ally|ous|ans?|ese|ish|e|s|y|n|al)$/;
function stem(t) {
  let s = t;
  for (let i = 0; i < 3; i++) {
    const n = s.replace(DERIV_SUFFIX, "");
    if (n === s || n.length < 3) break;
    s = n;
  }
  return s;
}
const STRICT_SUFFIX = /(?:ations?|atives?|ating|ated|ates|ate|isms?|ists?|ians?|ically|ical|ics|ities|ity|ives?|izes?|ized|izing|ises?|ised|ising|ings?|ness|ments?|able|ible|ous|ese|ish|ers?)$/;
function strictStem(t) { const s = t.replace(STRICT_SUFFIX, ""); return s.length >= 4 ? s : t; }
function wordFormEq(base, rt) {
  if (base.length < 3 || rt.length < 3 || /\d/.test(rt)) return false;
  const sb = stem(base), sr = stem(rt);
  if (sb.length < 3) return false;
  return sr === sb || (sb.length >= 4 && (rt.startsWith(sb) || sr.startsWith(sb)));
}

// Cost of matching response token r against form word w: 0 exact, n edits, -1 no match. (J5 exact, J10 loose)
function wordCost(w, r, ctx, fuzzy, required) {
  const rt = r.t;
  if (w.t === rt) return 0;
  const rnum = r.num !== undefined ? r.num : numInfo(rt);
  if (w.num && rnum) {
    if (numEq(w.num, rnum) || (w.num.alt && numEq(w.num.alt, rnum))) return 0;
    // a partly underlined number word says the underlined letters are enough ("<u>Eight</u>h", "<u>1940</u>s", "19<u>80s</u>")
    return w.kind === "M" && wordCands(w).includes(rt) ? 0 : -1;
  }
  if (w.num && /^\d/.test(w.t) && w.kind === "R") return -1;
  if (abbrevEq(w.t, rt)) return 0;
  const cands = w.kind === "O" ? [w.t] : wordCands(w);
  const prot = !!w.protect;
  for (const c of cands) if (c === rt || inflEq(c, rt, prot) || spellEq(c, rt)) return 0;
  const base = w.kind === "O" ? w.t : w.segs.filter((x) => x[0]).map((x) => x[1]).join("");
  if (ctx.wordForms && required && wordFormEq(base, rt)) return 0;
  if (!fuzzy || /\d/.test(rt)) return -1;
  // never fuzz a one-letter required portion (an initial), digits or numerals (J10)
  if (w.kind !== "O" && w._rlen === 1) return -1;
  let best = -1;
  for (const c of cands) {
    if (/\d/.test(c) || c.length < 3) continue;
    const bud = budgetFor(Math.max(c.length, rt.length), ctx);
    // a derivational variant (nationalist / nationalism) is a word form, not a typo
    const isForm = c.length >= 6 && rt.length >= 6 && strictStem(c) === strictStem(rt) && (strictStem(c) !== c || strictStem(rt) !== rt);
    if (bud && !isForm) {
      const d = osa(c, rt, bud);
      // an edit to the first letter counts double against the token budget (asexual/sexual, citric/nitric, attachment/detachment)
      if (d > 0 && (c[0] !== rt[0] ? d + 1 : d) <= bud && (best < 0 || d < best)) best = d;
    }
    if (best < 0 && ctx.lenientSpell && !r.split && c.length >= 6 && rt.length >= 5 && c[0] === rt[0]) {
      const kc = phonKey(c), kr = phonKey(rt);
      if (kc.length >= 3 && (kc === kr || (kc.length >= 4 && osa(kc, kr, 1) <= 1))) best = 1;
    }
  }
  return best;
}

// ---------------------------------------------------------------- forms
const NAME_REF = /^(?:(?:just|only|the|a|his|her|their|its|any|of|those|these)\s+)*(last|family|sur|first|given|fore|christian)\s?-?\s?names?(?:\s+(?:alone|only|by\s+itself|on\s+its\s+own))?$/;
const NAME_PIECE = /^(?:(?:either|any|accept|his|her|their|the|just|only)\s+)*(?:first|given|last|family|sur)(?:\s*-?names?)?(?:\s+(?:for|of|alone|only|by|in)\b.*)?$/;
const NAME_SUFFIX = /^(?:jr|sr|ii|iii|iv|i)$/;
const NAME_PARTICLE = /^(?:van|von|der|den|de|del|della|di|da|du|dos|das|do|la|le|bin|bint|ibn|ben|al|el|ad|ud|ul|ye|y|of|the)$/;
// a person's name: two or more capitalised words (particles allowed), nothing else; returns [first, last] word index
function personName(ws) {
  const caps = [];
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    if (w.num || NAME_SUFFIX.test(w.t)) continue;
    if (/^\p{Lu}/u.test(w.orig || "")) caps.push(i);
    else if (!NAME_PARTICLE.test(w.t)) return null;
  }
  return caps.length >= 2 && caps.length <= 5 ? [caps[0], caps[caps.length - 1]] : null;
}

function markedRange(L, a, b) {
  if (a == null || b == null) return false;
  for (let k = a; k < b; k++) if ((L.bu[k] || L.uOnly[k] || L.bOnly[k]) && /\S/.test(L.text[k])) return true;
  return false;
}

// A reject term with a parenthetical names several responses: "alkane (s)", "(Book of) Revelations",
// "Robert C (ox) Merton", "George H (erbert) W (alker) Bush", "In (t)ernal Affairs" (without it, with it, glued)
function parenVariants(q) {
  q = String(q);
  if (!/\([^()]{1,40}\)/.test(q)) return [q];
  const removed = q.replace(/\s*\([^()]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
  const spaced = q.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  const glued = q.replace(/(\p{L}+)\s*\((s|es)\)/gu, "$1$2").replace(/(^|[^\p{L}])(\p{L}{1,2})\s*\((\p{L}{1,14})\)\s*(\p{Ll}*)/gu, "$1$2$3$4").replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  return [...new Set([removed, spaced, glued])].filter(Boolean);
}

const REJ_COND_AFTER = /^,?\s*(?:if|unless|when|without|plus|together|along|but|as\s+part|in\s+combination|with\s+(?:another|any|other|a\s+different|some|anything)|and\s+(?:another|any|other|a\s+different|some)|of\s+(?:any|another|other|a\s+different))\b/;
const REJ_COND_WORDS = /\b(?:if|unless|when|before|after|until|without|any|anything|answers?|descriptions?|other|another|including|mentioning)\b/i;

function linesForms(P, plain, joint, qrules) {
  const qMulti = !!(qrules && qrules.qMulti);
  const key = (plain ? 1 : 0) + (qMulti ? "m" : "") + (joint && joint.length ? "|" + JSON.stringify(joint) : "");
  if (!P.formsBy) P.formsBy = new Map();
  if (P.formsBy.has(key)) return P.formsBy.get(key);
  const L = P.L;
  const rules = qMulti ? { ...P.rules, qMulti: true } : P.rules;
  const reqPred = (k) => L.req(k);
  const pPred = (k) => L.uOnly[k] || L.bu[k] || (L.reqStyle === "b" && L.bOnly[k]);
  const uPred = (k) => L.uOnly[k] || L.bu[k];
  const accepts = [], prompts = [], antis = [], rejects = [], noprompts = [], contains = [], exceptions = [], substs = [];
  let prevWin = null;
  const winOf = (f) => {
    const w = f.window;
    if (!w) return null;
    const isPrev = w.shape === "previous" || w.side === "previous_flipped";
    if (w._linked === undefined) { if (isPrev) w._prev = prevWin; w._linked = true; }
    if (!isPrev) prevWin = w;
    return w;
  };
  const needSet = rules.needWords ? new Set(rules.needWords.flatMap((x) => tokenize(x, null, plain).map((t) => t.t))) : null;
  const mkForm = (f, base, ws) => {
    const form = { ...base, kind: f.kind, words: ws, isMain: f.src === "main" || f.src === "main_next", answer: f.answer };
    if (form.isMain && needSet) for (const w of ws) if (w.kind !== "O" && !needSet.has(w.t)) { w.kind = "O"; w.segs = [[false, w.t]]; w.run = -1; }
    buildGroups(form, rules, L);
    form.key = formKey(ws);
    return form;
  };
  for (const f of P.ref.forms) {
    const win = winOf(f);
    const base = { src: f.src, text: f.text, window: win, ask: f.ask || null, scope: f.scope || null, subst_for: f.subst_for || null, raw: f };
    if (f.kind === "exception") { exceptions.push({ ...base, kind: "exception", terms: (f.quoted || []).map((q) => tokenize(q, null, plain)) }); continue; }
    if (f.cls === "contain") {
      if (f.kind === "accept" && f.subst_for) {
        // "accept answers with Ova<u>herero</u> in place of “Herero”": a substitution item
        const toks = mergeNumbers(rangeWords(P, f.start, f.end, reqPred, null, plain));
        const ws = toks.map((t, i) => wordInfo(t, toks[i - 1])).filter((w) => w.kind !== "O" || !/^(?:answers?|with|using|that|mention|mentions|mentioning|including|containing)$/.test(w.t));
        if (ws.some((w) => w.kind !== "O")) substs.push(mkForm(f, { ...base, display: strip(f.text) }, ws));
        continue;
      }
      const slots = (f.slots || []).map((alts) => alts.map((x) => tokenize(x, null, plain)).filter((t) => t.length && !t.every((x) => CONNECTIVES.has(x.t) || ARTICLES_ALL.has(x.t)))).filter((alts) => alts.length);
      let desc = null;
      if (!slots.length) {
        const mm = CONTAIN.exec(L.s.slice(f.start, f.end));
        if (mm) desc = tokenize(L.text.slice(f.start + mm[0].length, f.end), null, plain).filter((t) => !ARTICLES_ALL.has(t.t) && !CONNECTIVES.has(t.t));
      }
      const wo = /\bwithout\s+(?:the\s+words?\s+|mentioning\s+)?"([^"]+)"/.exec(L.s.slice(f.start, Math.min(L.s.length, f.end + 60)));
      contains.push({ ...base, kind: f.kind, slots, desc, without: wo ? tokenize(wo[1], null, plain) : null });
      continue;
    }
    if (NEG.has(f.kind)) {
      const terms = [];
      const quoted = f.quoted && f.quoted.length ? f.quoted : null;
      let both = false;
      if (quoted) for (const q of quoted) for (const qv of parenVariants(q)) terms.push(tokenize(qv, null, plain));
      else if (f.core) {
        const bm = /^\s*both\s+(.+)$/i.exec(f.core);
        if (bm) { both = true; for (const part of bm[1].split(/\s+and\s+|\s*,\s*/)) terms.push(tokenize(part, null, plain)); }
        else {
          for (const qv of parenVariants(f.core)) terms.push(tokenize(qv, null, plain));
          // an appositive after the term ("St. Andrew Yaphe, patron saint of Quizbowl") is not part of it
          const ap = /^([^,]{3,60}),\s+(?=\p{Ll})/u.exec(f.core);
          if (ap) terms.push(tokenize(ap[1], null, plain));
        }
      }
      // legacy underline inside an unquoted reject target: each underlined run is rejected too
      if (!quoted && !both && f.ca != null) for (const [x, y] of L.runs(f.ca, f.cb, uPred)) terms.push(tokenize(L.text.slice(x, y), null, plain));
      const clauseTail = L.s.slice(f.start, Math.min(L.s.length, f.end + 80)).split(/[;\])]/)[0];
      const superset = /\bwith\s+anything\s+(?:else\s+)?(?:before|after|added|attached|else)\b/.test(clauseTail);
      const rf = { ...base, kind: f.kind, terms: terms.filter((t) => t.length), both, superset };
      // the line's own wording of the terms, for parseDirectives (not the derived variants)
      rf.labels = quoted ? quoted.map((q) => strip(String(q))) : f.core ? [strip(String(f.core))] : [];
      // terms that name a response exactly (J4 then beats the required-words exemption): quoted terms not followed by
      // a condition, and an unquoted target with no condition words; never an underlined run swept into the clause
      if (!both && !superset) {
        rf.exactQ = [];
        if (quoted) {
          let from = f.start != null ? f.start : 0;
          for (const q of quoted) {
            const at = L.text.indexOf(q, from);
            const after = at >= 0 ? L.s.slice(at + q.length, at + q.length + 48).replace(/^["”’'\s]+/, "") : "";
            if (at >= 0) from = at + q.length;
            if (REJ_COND_AFTER.test(after)) continue;
            for (const qv of parenVariants(q)) { const t = tokenize(qv, null, plain); if (t.length) rf.exactQ.push(t); }
          }
        } else if (f.core && !REJ_COND_WORDS.test(f.core)) {
          const ap = /^([^,]{3,60}),\s+(?=\p{Ll})/u.exec(f.core);
          for (const qv of parenVariants(ap ? ap[1] : f.core)) { const t = tokenize(qv, null, plain); if (t.length) rf.exactQ.push(t); }
        }
      }
      if (f.kind === "noprompt") noprompts.push(rf);
      else { rejects.push(rf); if (f.kind === "reject_noprompt") noprompts.push(rf); }
      continue;
    }
    if (f.kind !== "accept" && f.kind !== "prompt" && f.kind !== "antiprompt") continue;
    const list = f.kind === "accept" ? accepts : f.kind === "prompt" ? prompts : antis;
    const isMain = f.src === "main" || f.src === "main_next";
    // unmarked quoted items: the quoted strings are the forms (“Denali”, “King of Egypt”)
    // a quotation alone in parentheses is a pronunciation guide, not the item ("guqin (“goo-cheen”)")
    const guideQ = (q) => {
      const at = f.ca != null ? L.text.indexOf(q, f.ca) : -1;
      return at >= 0 && /\(\s*["“‘']?\s*$/.test(L.text.slice(Math.max(0, at - 3), at)) && /^\s*["”’']?\s*\)/.test(L.text.slice(at + q.length, at + q.length + 3));
    };
    if (f.wholeRequired && f.quoted && f.quoted.length && !isMain && !f.quoted.every(guideQ)) {
      // a quotation led by other words ("additional mention of “arrows”") never shields a response from a reject
      const weak = !/^\s*(?:(?:just|only|simply|the\s+answer)\s+)?["“‘']/.test(L.text.slice(f.ca, f.cb).replace(/^[\s,;:]+/, ""));
      for (const q of f.quoted) {
        const qq = strip(String(q)).replace(/[,.;:]+$/, "");
        const toks = mergeNumbers(tokenize(qq, null, plain));
        if (!toks.length) continue;
        const form = mkForm(f, { ...base, display: qq, weak }, allReqWords(toks));
        (f.subst_for && f.kind === "accept" ? substs : list).push(form);
      }
      continue;
    }
    let pred;
    const fromPrompt = !f.R.length && f.P.length;
    let uOnlyItem = false;
    if (f.kind === "accept" && f.wholeRequired && !isMain && f.ca != null) for (let k = f.ca; k < f.cb; k++) if (L.uOnly[k] && strip(L.text[k])) { uOnlyItem = true; break; }
    if (uOnlyItem) pred = uPred;
    else if (f.wholeRequired && (isMain ? f.start : f.ca) != null && /[(\[]/.test(L.text.slice(isMain ? f.start : f.ca, isMain ? f.end : f.cb))) {
      // an unmarked answer: parenthetical words are optional ("(Henry) Graham Greene", "guqin (“goo-cheen”)")
      const x0 = isMain ? f.start : f.ca, x1 = isMain ? f.end : f.cb;
      const opt = new Uint8Array(x1 - x0);
      let d = 0;
      for (let k = x0; k < x1; k++) { const ch = L.text[k]; if (ch === "(" || ch === "[") d++; opt[k - x0] = d > 0 ? 1 : 0; if ((ch === ")" || ch === "]") && d) d--; }
      pred = (k) => !(k >= x0 && k < x1 && opt[k - x0]);
    } else if (f.wholeRequired) pred = () => true;
    else if (fromPrompt || f.kind !== "accept") pred = pPred;
    else pred = reqPred;
    const a = isMain ? f.start : f.ca, b = isMain ? f.end : f.cb;
    if (a == null || b == null) continue;
    const raw = rangeWords(P, a, b, pred, f.drop, plain, isMain ? joint : null);
    const toks = mergeNumbers(raw);
    const ws = toks.map((t, i) => wordInfo(t, toks[i - 1]));
    if (!ws.length) continue;
    if (!ws.some((w) => w.kind !== "O")) for (const w of ws) { w.kind = "R"; w.segs = [[true, w.t]]; w.run = 0; }
    const form = mkForm(f, { ...base, display: raw.display || strip(L.text.slice(a, b).replace(/\s+/g, " ")) }, ws);
    if (f.kind === "accept" && !isMain) {
      const cs = Math.max(L.s.lastIndexOf(";", a), L.s.lastIndexOf("[", a), L.s.lastIndexOf("(", a));
      const clauseTxt = L.s.slice(cs + 1, Math.min(L.s.length, b + 40)).split(/[;\])]/)[0];
      // examples of "accept more specific answers like good leads" take extra modifiers before the head (J10)
      if (/\b(?:more\s+)?specific\b[^;]*\b(?:such\s+as|like|e\.g\.|including)\b/.test(L.s.slice(cs + 1, a + 1))) form.specificEx = true;
      if (/\b(?:or\s+)?(?:other\s+)?(?:synonyms?|equivalents?)\b/.test(clauseTxt)) form.synSibling = true;
    }
    if (f.subst_for && f.kind === "accept") { substs.push(form); continue; }
    list.push(form);
  }
  const mains = accepts.filter((f) => f.isMain);
  // "prompt on surname alone", "accept last name", "prompt on first name": the item names a part of the answer's
  // name, not a literal word (J§4.2 Strauss example; keywords.json s_surname). It becomes that word of each
  // person-name accept form. "partial last name" stays with the compound-surname rule (J12).
  {
    // the pieces of "accept first or last names" itself are not answers
    if (rules.either_name) for (const list of [accepts, prompts]) for (const f of list.slice()) if (!f.isMain && f.src !== "subst" && !markedRange(L, f.raw && f.raw.ca, f.raw && f.raw.cb) && NAME_PIECE.test(strip(String(f.display || "")).toLowerCase())) list.splice(list.indexOf(f), 1);
    const nameHosts = accepts.filter((h) => !h.window && !h.scope && personName(h.words));
    for (const list of nameHosts.length ? [prompts, antis, accepts] : []) {
      for (const f of list.slice()) {
        // an item with its own markup is a literal answer ("accept last <b><u>name</u></b>s")
        if (f.isMain || f.src === "subst" || (f.raw && f.raw.quoted && f.raw.quoted.length) || markedRange(L, f.raw && f.raw.ca, f.raw && f.raw.cb)) continue;
        const m = NAME_REF.exec(strip(String(f.display || "")).toLowerCase().replace(/[“”"'‘’.,;:]+/g, " ").replace(/\s+/g, " ").trim());
        if (!m) continue;
        list.splice(list.indexOf(f), 1);
        const last = !/^(?:first|given|fore|christian)$/.test(m[1]);
        const seen = new Set();
        for (const h of nameHosts) {
          let i = personName(h.words)[last ? 1 : 0];
          const disp = String(h.display || "");
          const picks = [h.words[i]];
          // "/" alternatives fill one word slot ("Raffaello Sanzio/Santi", P14)
          while (last && i > 0 && disp.includes(h.words[i - 1].orig + "/" + h.words[i].orig)) picks.push(h.words[--i]);
          for (const w0 of picks) {
            if (seen.has(w0.t)) continue;
            seen.add(w0.t);
            const words = [{ ...w0, kind: "R", segs: [[true, w0.t]], run: 0, _cands: undefined }];
            const v = { ...f, words, src: "nameref", isMain: false, parts: null, partsFixed: false };
            buildGroups(v, rules, L);
            v.key = formKey(words);
            list.push(v);
          }
        }
      }
    }
  }
  // several main answers (glycine [..] alanine [..] serine [..]): one combined form per choice of alternatives (P5)
  const answerIdx = new Set(accepts.filter((f) => f.isMain && typeof f.answer === "number").map((f) => f.answer));
  if (answerIdx.size > 1) {
    const byAns = [...answerIdx].sort((x, y) => x - y).map((i) => accepts.filter((f) => f.answer === i && !f.window));
    if (byAns.every((l) => l.length)) {
      let combos = [[]];
      for (const l of byAns) { const nx = []; for (const c of combos) for (const f of l) nx.push(c.concat([f])); combos = nx.slice(0, 64); }
      const singles = new Set(byAns.flat());
      for (let i = accepts.length - 1; i >= 0; i--) if (singles.has(accepts[i])) accepts.splice(i, 1);
      for (const c of combos) accepts.push(combineForms(c));
    }
  }
  {
    const multis = accepts.filter((f) => !f.window && !f.scope && f.parts && f.parts.length >= 2 && (f.isMain || f.src === "clause"));
    const k = multis.length ? multis[0].parts.length : 0;
    const same = multis.filter((f) => f.parts.length === k);
    if (same.length >= 2) {
      const ref0 = same[0];
      const rWords = (f, pi) => f.parts[pi].flatMap((gi) => f.groups[gi].words.map((wi) => f.words[wi].t));
      const alts = Array.from({ length: k }, () => []);
      for (const f of same) {
        const used = new Set();
        for (let pi = 0; pi < k; pi++) {
          let best = -1, bestN = 0;
          for (let ri = 0; ri < k; ri++) {
            if (used.has(ri)) continue;
            const n = rWords(f, pi).filter((t) => rWords(ref0, ri).some((u) => u === t || (u.length >= 5 && t.slice(0, 5) === u.slice(0, 5)))).length;
            if (n > bestN) { bestN = n; best = ri; }
          }
          if (best < 0) best = [...Array(k).keys()].find((ri) => !used.has(ri) && ri === pi) ?? [...Array(k).keys()].find((ri) => !used.has(ri));
          used.add(best);
          alts[best].push(partForm(f, pi));
        }
      }
      let combos = [[]];
      for (const l of alts) { const nx = []; for (const c of combos) for (const x of l) nx.push(c.concat([x])); combos = nx.slice(0, 48); }
      const have = new Set(accepts.map((f) => f.key));
      for (const c of combos) { const cf = combineForms(c); if (!have.has(cf.key)) { have.add(cf.key); accepts.push(cf); } }
    }
  }
  const hostsOf = (slotToks) => {
    const out = [];
    for (const host of accepts) {
      if (host.src === "subst") continue;
      const hw = host.words;
      let at = -1, len = 0;
      for (let i = 0; i + slotToks.length <= hw.length && at < 0; i++) {
        let ok = true;
        for (let j = 0; j < slotToks.length; j++) if (!(hw[i + j].t === slotToks[j].t || inflEq(hw[i + j].t, slotToks[j].t, false) || (hw[i + j].kind !== "O" && wordCands(hw[i + j]).includes(slotToks[j].t)))) { ok = false; break; }
        if (ok) { at = i; len = slotToks.length; }
      }
      if (at < 0 && slotToks.length === 1 && slotToks[0].t.length >= 2) {
        // an acronym slot ("the USA" for "United States of America")
        const letters = slotToks[0].t;
        for (let i = 0; i < hw.length && at < 0; i++) {
          let li = 0, j = i;
          while (j < hw.length && li < letters.length) {
            if (j > i && (CONNECTIVES.has(hw[j].t) || ARTICLES_ALL.has(hw[j].t))) { j++; continue; }
            if (hw[j].t[0] !== letters[li]) break;
            li++; j++;
          }
          if (li === letters.length && j - i >= 2) { at = i; len = j - i; }
        }
      }
      if (at >= 0) out.push([host, at, len]);
    }
    return out;
  };
  let tag = 0;
  const variant = (host, at, len, sf) => {
    const runBase = 1000 * (++tag);
    const repl = sf.words.map((w) => ({ ...w, run: w.run >= 0 ? w.run + runBase : -1, _cands: undefined }));
    const nw = host.words.slice(0, at).concat(repl, host.words.slice(at + len)).map((w) => ({ ...w, _cands: undefined }));
    const v = { ...host, words: nw, window: sf.window || host.window, src: "subst", isMain: false, subst_for: null, raw: sf.raw, partsFixed: false, parts: null };
    buildGroups(v, rules, L);
    // the substituted words sit elsewhere in the line, so text gaps cannot split the parts: keep the host's parts
    if (host.parts && host.parts.length > 1) {
      const hp = new Map();
      host.parts.forEach((pt, pi) => pt.forEach((gi) => host.groups[gi].words.forEach((wi) => hp.set(wi, pi))));
      const rp = hp.has(at) ? hp.get(at) : hp.get(at + len - 1);
      const pid = (i) => (i < at ? hp.get(i) : i < at + repl.length ? rp : hp.get(i - repl.length + len));
      const byP = new Map();
      let last = 0;
      v.groups.forEach((g, gi) => { const p0 = pid(g.words[0]); const p = p0 === undefined ? last : p0; last = p; if (!byP.has(p)) byP.set(p, []); byP.get(p).push(gi); });
      v.parts = [...byP.entries()].sort((x, y) => x[0] - y[0]).map((e) => e[1]);
      v.partsFixed = true;
    }
    v.key = formKey(nw);
    return v;
  };
  // substitution items replace one slot of the forms that contain it (§5.4 "in place of")
  for (const sf of substs) {
    const slot = tokenize(sf.subst_for, null, plain).filter((t) => !ARTICLES_ALL.has(t.t));
    if (!slot.length) continue;
    for (const [host, at, len] of hostsOf(slot)) accepts.push(variant(host, at, len, sf));
  }
  // On a multi-answer line an accept item that gives one answer only ("accept the Republic of Chile") replaces that
  // answer; an item listed with "or other synonyms" on a multi-span line ("accept monarch or other synonyms")
  // replaces one span. Neither is an answer on its own (J§16, J§15.2).
  const multiMain = mains.find((f) => f.parts && f.parts.length > 1);
  const mainR = new Set(mains.flatMap((f) => f.words.filter((w) => w.kind !== "O").map((w) => w.t)));
  const overlap = (a, b) => a === b || inflEq(a, b, false) || (a.length >= 5 && b.length >= 5 && a.slice(0, 6) === b.slice(0, 6));
  for (const f of accepts.slice()) {
    if (f.isMain || f.src === "subst" || f.src === "combined" || f.window || f.scope) continue;
    const fr = f.words.filter((w) => w.kind !== "O").map((w) => w.t);
    if (multiMain && f.parts.length === 1) {
      const hitParts = multiMain.parts.map((p) => p.some((gi) => multiMain.groups[gi].words.some((wi) => fr.some((t) => overlap(multiMain.words[wi].t, t)))));
      if (hitParts.filter(Boolean).length !== 1) continue;
      const wis = multiMain.parts[hitParts.indexOf(true)].flatMap((gi) => multiMain.groups[gi].words);
      const at = Math.min(...wis), end = Math.max(...wis) + 1;
      accepts.splice(accepts.indexOf(f), 1);
      accepts.push(variant(multiMain, at, end - at, f));
      continue;
    }
    if (f.synSibling && f.groups.length === 1 && !fr.some((t) => mainR.has(t))) {
      const host = mains.find((m) => m.groups.length > 1);
      if (!host) continue;
      accepts.splice(accepts.indexOf(f), 1);
      for (const g of host.groups) accepts.push(variant(host, g.words[0], g.words[g.words.length - 1] - g.words[0] + 1, f));
    }
  }
  // "“X” is not needed after it is read": a copy of each form with X optional, live once the marker is read (J§4.8)
  for (const o of P.optional || []) {
    const xt = tokenize(o.word, null, plain).map((t) => t.t);
    if (!xt.length) continue;
    const self = /^\s*(?:it|they|this|that)?\s*(?:is|are|has\s+been|have\s+been)?\s*(?:read|mentioned|said|given)\b|^\s*(?:read|mention(?:ed)?)\b/.test(o.marker);
    const q = /"([^"]+)"/.exec(o.marker);
    const markerWord = self ? o.word : q ? q[1] : o.marker.replace(VERB_TAIL, "").trim();
    const w = { side: "after", kw: "after", shape: "quoted", marker: '"' + markerWord + '"', _linked: true };
    for (const host of accepts.slice()) {
      if (host.window) continue;
      const hw = host.words;
      let at = -1;
      for (let i = 0; i + xt.length <= hw.length; i++) if (xt.every((t, j) => hw[i + j].t === t || inflEq(hw[i + j].t, t, false))) { at = i; break; }
      if (at < 0) continue;
      const drop = (from) => hw.map((x, i) => (i >= from && i < at + xt.length ? { ...x, kind: "O", segs: [[false, x.t]], run: -1, _cands: undefined } : { ...x, _cands: undefined }));
      let from = at;
      // a given name directly before a dropped surname in the same span goes too ("Gustav Holst")
      if (/^\p{Lu}\p{Ll}/u.test(hw[at].orig)) while (from > 0 && hw[from - 1].kind !== "O" && /^\p{Lu}\p{Ll}/u.test(hw[from - 1].orig) && hw[from - 1].run === hw[at].run && !hw[from - 1].num) from--;
      let nw = drop(from);
      if (!nw.some((x) => x.kind !== "O")) nw = drop(at);
      if (!nw.some((x) => x.kind !== "O")) continue;
      const v = { ...host, words: nw, window: w, src: "optional", isMain: false, parts: null, partsFixed: false };
      buildGroups(v, rules, L);
      v.key = formKey(nw);
      accepts.push(v);
    }
  }
  const lineWords = new Set();
  for (const f of accepts) for (const w of f.words) { lineWords.add(w.t); if (w.kind === "M") for (const [r, str] of w.segs) if (!r && str.length >= 3) lineWords.add(str); }
  const promptPool = new Set();
  for (const f of prompts.concat(antis)) for (const w of f.words) promptPool.add(w.t);
  const byWin = new Map();
  for (const f of accepts.concat(prompts, antis)) if (f.window) { if (!byWin.has(f.window)) byWin.set(f.window, []); byWin.get(f.window).push(f); }
  for (const [, list] of byWin) if (list.length > 1) for (const f of list) f._sibs = list;
  const out = { accepts, prompts, antis, rejects, noprompts, contains, exceptions, lineWords, promptPool };
  P.formsBy.set(key, out);
  return out;
}

// part pi of a multi-part form, as a small form of its own
function partForm(f, pi) {
  const wis = f.parts[pi].flatMap((gi) => f.groups[gi].words);
  const lo = Math.min(...wis), hi = Math.max(...wis);
  const words = f.words.slice(lo, hi + 1).map((w) => ({ ...w, _cands: undefined }));
  const groups = f.parts[pi].map((gi) => ({ words: f.groups[gi].words.map((i) => i - lo), run: f.groups[gi].run }));
  return { ...f, words, groups, parts: [groups.map((_, i) => i)], partsFixed: true, display: words.map((w) => w.orig).join(" "), key: formKey(words) };
}
function formKey(ws) { return ws.map((w) => w.t + (w.poss ? "'s" : "")).join(" "); }
function combineForms(list) {
  const words = [];
  const parts = [];
  const groups = [];
  list.forEach((f, ci) => {
    const off = words.length;
    for (const w of f.words) words.push({ ...w, run: w.run >= 0 ? w.run + 1000 * (ci + 1) : -1, _cands: undefined });
    const p = [];
    for (const g of f.groups) { groups.push({ words: g.words.map((i) => i + off), run: g.run + 1000 * (ci + 1) }); p.push(groups.length - 1); }
    parts.push(p);
  });
  return { ...list[0], words, groups, parts, partsFixed: true, src: "combined", isMain: true, key: formKey(words),
    display: list.map((f) => f.display).join(" + "), text: list.map((f) => f.text).join(" + "), answer: 0 };
}

function buildGroups(form, rules, L) {
  const ws = form.words;
  let first = true;
  for (const w of ws) { w.protect = false; if (w.kind !== "O" && first) { w.protect = !!w.cap; first = false; } }
  if (form.partsFixed && form.parts) return;
  let groups = [];
  let cur = null;
  ws.forEach((w, i) => {
    if (w.kind === "O") { cur = null; return; }
    if (cur && cur.run === w.run) cur.words.push(i);
    else { cur = { words: [i], run: w.run }; groups.push(cur); }
  });
  // "accept either part / either name" with a single span: each of its words is a portion (§7.4 rule 2)
  if (rules.either_portion && groups.length === 1 && groups[0].words.length > 1 && !ws.some((w) => w.num) && !isJointRun(groups[0].run)) {
    groups = groups[0].words.filter((i) => !ARTICLES_ALL.has(ws[i].t) && !CONNECTIVES.has(ws[i].t)).map((i) => ({ words: [i], run: ws[i].run }));
  } else if (rules.either_name) {
    // "accept first or last name": a name inside one span splits into its words (matchForm nameClusters)
    groups = groups.flatMap((g) => (g.words.length > 1 && !isJointRun(g.run) && personName(g.words.map((i) => ws[i])) ? g.words.filter((i) => !NAME_PARTICLE.test(ws[i].t)).map((i) => ({ words: [i], run: ws[i].run })) : [g]));
  }
  // parts: groups separated by "AND", or on multi-answer lines by "and" / "&" / "," / ";", are separate answers (J§16)
  const multi = !!(rules.multi || rules.all_required || rules.any_n || rules.qMulti);
  const parts = [];
  groups.forEach((g, gi) => {
    if (!gi) { parts.push([0]); return; }
    const prev = groups[gi - 1];
    const x = ws[prev.words[prev.words.length - 1]].k1, y = ws[g.words[0]].k0;
    const gap = x != null && y != null && L && y >= x ? L.text.slice(x, y) : "";
    const sep = /\bAND\b/.test(gap) || (multi && /(?:^|\s)(?:and|&)(?:\s|$)|[,;]/.test(gap)) || (rules.either_name && /^\s*(?:and|&)\s*$/.test(gap));
    if (sep) parts.push([gi]); else parts[parts.length - 1].push(gi);
  });
  form.groups = groups;
  form.parts = parts;
}

// ---------------------------------------------------------------- read position and timing windows (§6, J3)
function foldSearch(text) {
  let out = "";
  for (const ch of text) {
    let f = ch.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase();
    if (ch === "’" || ch === "‘" || ch === "`") f = "'";
    else if (ch === "“" || ch === "”") f = '"';
    else if (ch === "–" || ch === "—") f = "-";
    if (f.length !== ch.length) f = (f + "      ").slice(0, ch.length);
    out += f;
  }
  return out;
}
// Moderator and reader notes are not read aloud: blank them (same length) before searching markers (§6.2).
function blankNotes(t) {
  return t.replace(/(?:\(|\[)?\s*(?:note\s+to\s+(?:the\s+)?(?:moderators?|readers?)|moderator(?:'s|s')?\s+note|reader\s+note)\s*[:\-][^.!?\])]*[.!?\])]?/gi, (m) => " ".repeat(m.length));
}
// per question text: the folded read-aloud copy, marker hits, sentence starts and "this <noun>" positions (small LRU)
const TEXT_CACHE = new Map();
function textInfo(full) {
  let ti = TEXT_CACHE.get(full);
  if (ti) return ti;
  ti = { folded: foldSearch(blankNotes(full)), cache: new Map(), nouns: null };
  TEXT_CACHE.set(full, ti);
  if (TEXT_CACHE.size > 32) TEXT_CACHE.delete(TEXT_CACHE.keys().next().value);
  return ti;
}
function makeReadCtx(opts) {
  const full = opts && opts.fullText != null ? String(opts.fullText) : opts && opts.readText != null ? String(opts.readText) : null;
  if (full == null) return { hasText: false, buzz: Infinity, end: Infinity, cache: new Map() };
  let buzz = opts.readLen != null ? Number(opts.readLen) : opts.readText != null ? String(opts.readText).length : full.length;
  if (!Number.isFinite(buzz)) buzz = full.length;
  const ti = textInfo(full);
  return { hasText: true, text: full, folded: ti.folded, buzz, end: full.length, cache: ti.cache, ti };
}
function escRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
// First occurrence of a marker in [from, to): [start, end of the marker proper] or null.
function findMarker(rc, marker, self, from = 0, to = Infinity) {
  const key = (self ? "s:" : "m:") + from + ":" + to + ":" + marker;
  if (rc.cache.has(key)) return rc.cache.get(key);
  let res = null;
  const m = foldSearch(marker).replace(/["“”]/g, "").replace(/\s+/g, " ").trim();
  const hay = rc.folded.slice(from, to === Infinity ? undefined : to);
  if (m) {
    const tries = [m];
    const parts = m.split(" ");
    const last = parts[parts.length - 1];
    if (last.length >= 4) tries.push(parts.slice(0, -1).concat(singularize(last)).join(" "));
    const poss = m.replace(/'s\b/g, "").trim();
    if (poss.length >= 4 && poss !== m) tries.push(poss);
    const consider = (mm, len) => { if (mm && (!res || from + mm.index < res[0])) res = [from + mm.index, from + mm.index + len]; };
    for (const t of tries) {
      const body = escRx(t).replace(/ /g, "[\\s\\-]+");
      const tail = self ? "\\p{L}{0,3}" : "(?:'?s|es)?\\p{L}{0,3}";
      const mm = new RegExp("(?<![\\p{L}\\p{N}])(" + body + ")" + tail + "(?![\\p{L}\\p{N}])", "u").exec(hay);
      if (mm) consider(mm, mm[1].length);
    }
    if (/\d/.test(m) && m.replace(/\s+/g, "").length <= 12) {
      const body = [...m.replace(/\s+/g, "")].map(escRx).join("\\s?");
      const mm = new RegExp("(?<![\\p{L}\\p{N}])" + body + "(?![\\p{L}\\p{N}])", "u").exec(hay);
      if (mm) consider(mm, mm[0].length);
    }
  }
  rc.cache.set(key, res);
  return res;
}
function sentenceStarts(rc) {
  if (rc._sent) return rc._sent;
  const t = rc.text;
  const starts = [0];
  const re = /[.!?]["”’)]?\s+(?=["“(]?[A-Z0-9])/g;
  let m;
  while ((m = re.exec(t)) !== null) {
    const before = t.slice(Math.max(0, m.index - 4), m.index + 1);
    if (/(?:\b[A-Z]|\bMr|\bMrs|\bDr|\bSt|\bMt|\bNo|\bvs|\bJr|\bSr|\bed|\bc|\bca)\.$/.test(before)) continue;
    starts.push(m.index + m[0].length);
  }
  rc._sent = starts;
  return starts;
}
function sentenceRange(rc, which) {
  const st = sentenceStarts(rc);
  const n = st.length;
  const i = /last|final/.test(which) ? n - 1 : /second/.test(which) ? 1 : /third/.test(which) ? 2 : 0;
  if (i >= n) return [rc.end, rc.end];
  return [st[i], i + 1 < n ? st[i + 1] : rc.end];
}
function giveawayStart(rc) {
  if (rc._give !== undefined) return rc._give;
  const m = /\b(?:for\s+(?:10|ten|15|fifteen|20|twenty)\s+points|ftp)\b/i.exec(rc.text);
  const st = sentenceStarts(rc);
  rc._give = m ? m.index : st.length > 1 ? st[st.length - 1] : null;
  return rc._give;
}
const VERB_TAIL = /\s*(?:,|\s)\s*(?:(?:is|are|has\s+been|have\s+been|gets|get|was|were|being)\s+)?(?:read|mentioned|said|given|stated|named|revealed|clued)\b.*$/i;
function markerText(w) {
  let t = String(w.marker || "");
  const q = /["“”'‘’]([^"“”'‘’]{1,80})["“”'‘’]/.exec(t);
  if (q) return q[1];
  t = t.replace(/^\s*(?:the\s+)?(?:first\s+)?mention\s+of\s+/i, "").replace(/^\s*the\s+words?\s+/i, "");
  t = t.replace(VERB_TAIL, "").replace(/\s+(?:is|are|has\s+been)\s*$/i, "");
  return t.replace(/[,.;:]+$/, "").trim();
}
function selfText(form) {
  if (!form.words) return (form.slots || []).map((alts) => alts.map((t) => t.map((x) => x.orig).join(" ")).join(" ")).filter(Boolean);
  const runs = [];
  let cur = "";
  for (const w of form.words) {
    if (w.kind === "O") { if (cur) { runs.push(cur); cur = ""; } continue; }
    const r = w.segs.filter((x) => x[0]).map((x) => x[1]).join("");
    cur = cur ? cur + " " + r : r;
  }
  if (cur) runs.push(cur);
  return runs;
}
function selfHit(form, rc, from, to) {
  const t = selfText(form);
  for (const x of t.length > 1 ? [t.join(" ")].concat(t) : t) { const h = findMarker(rc, x, true, from, to); if (h) return h; }
  if (form.display) return findMarker(rc, form.display, true, from, to);
  return null;
}
// [open, close] read-position interval of a window; live iff open <= buzz <= close.
function windowSpan(w, form, rc) {
  if (!w || w.side === "whole_question") return [0, Infinity];
  if (w.shape === "fronted") {
    if (!w._frontWin) {
      const t = String(w.marker || "").replace(/,\s*$/, "");
      const L2 = new Line(t);
      const [, fw] = timingOf(L2, 0, L2.s.length, maskQuotes(L2.s, 0, L2.s.length));
      w._frontWin = fw || { side: "whole_question", shape: "none" };
    }
    return windowSpan(w._frontWin, form, rc);
  }
  if (w.shape === "previous" || w.side === "previous_flipped") {
    const p = w._prev;
    if (!p) return [0, Infinity];
    const [o, c] = windowSpan(p, form, rc);
    if (w.side === "previous_flipped") {
      if (o === 0 && c === Infinity) return [0, Infinity];
      if (o === 0) return [c === Infinity ? Infinity : c + 1, Infinity];
      return [0, o === Infinity ? Infinity : o - 1];
    }
    if (w.side === "after") return o > 0 ? [o, Infinity] : c === Infinity ? [Infinity, Infinity] : [c + 1, Infinity];
    return o > 0 ? [0, o === Infinity ? Infinity : o - 1] : [0, c];
  }
  if (!rc.hasText) {
    if (w.side === "after") return [Infinity, Infinity];
    if (w.side === "sentence" || w.side === "early") return [0, -1];
    return [0, Infinity];
  }
  if (w.side === "early") {
    const g = giveawayStart(rc);
    const sh = selfHit(form, rc);
    let c = g == null ? Infinity : g;
    if (sh && sh[0] < c) c = sh[0];
    return [0, c];
  }
  if (w.side === "sentence") return sentenceSpan(String(w.kw || ""), rc);
  let from = 0, to = Infinity;
  if (w.inSent) [from, to] = sentenceRange(rc, w.inSent);
  let hit = null;
  if (w.shape === "clue") {
    const mk = String(w.marker || "").toLowerCase();
    const st = sentenceStarts(rc);
    if (/first|opening|lead-?in/.test(mk) && !/end\s+of\s+the\s+(?:question|tossup)/.test(mk)) {
      const e = st.length > 1 ? st[1] - 1 : rc.end;
      hit = [e, e];
    } else if (/second/.test(mk)) {
      const e = st.length > 2 ? st[2] : rc.end;
      hit = [e, e];
    } else if (/last|final/.test(mk)) {
      const e = st[st.length - 1];
      hit = [e, e];
    } else if (/\(\*\)|\*|power/.test(mk)) {
      const i = rc.text.indexOf("(*)");
      hit = i >= 0 ? [i, i + 3] : null;
    } else {
      const g = giveawayStart(rc);
      hit = g == null ? null : [g, g];
    }
  } else if (w.shape === "self") {
    hit = selfHit(form, rc, from, to);
    if (!hit && form._sibs && !/\beach\b|respective/.test(String(w.marker || ""))) {
      // a glued, damaged item ("sexchromosome") is read when the sibling it contains is read
      const mine = selfText(form).join("");
      for (const sb of form._sibs) {
        if (sb === form) continue;
        const theirs = selfText(sb).join("");
        if (!theirs || theirs.length < 4 || !mine.includes(theirs) || mine === theirs) continue;
        const h = selfHit(sb, rc, from, to);
        if (h && (!hit || h[0] < hit[0])) hit = h;
      }
    }
  } else {
    const mt = markerText(w);
    if (/^(?:each|respectively|respective)\b/i.test(mt) || /^(?:it|they|this|that|these|those)$/i.test(mt)) hit = selfHit(form, rc, from, to);
    else hit = mt ? findMarker(rc, mt, false, from, to) : null;
  }
  if (w.side === "after") return hit ? [hit[1], Infinity] : [Infinity, Infinity];
  return hit ? [0, hit[0]] : [0, Infinity];
}
function sentenceSpan(kw, rc) {
  const k = kw.toLowerCase();
  const [s0, s1] = sentenceRange(rc, k);
  if (/first|opening/.test(k) || !/second|third|last|final/.test(k)) return [0, s1 === rc.end ? Infinity : s1 - 1];
  return [s0, /last|final/.test(k) ? Infinity : s1];
}
function isLive(form, rc) {
  if (!form.window) return true;
  const [o, c] = windowSpan(form.window, form, rc);
  return o !== Infinity && o <= rc.buzz && rc.buzz <= c;
}

// ---------------------------------------------------------------- response tokens
const FILLER_RX = /^\s*(?:(?:what|who|where|whom)\s+(?:is|are|was|were)|is\s+it|it\s+is|it'?s|i\s+think(?:\s+it'?s)?|i\s+believe|um+|uh+|er+|hmm+|the\s+answer\s+is|answer\s*:)\b[\s,:]*/i;
function respTokens(resp, plain) {
  let toks = tokenize(vulgar(resp), null, plain);
  toks = mergeNumbers(toks);
  toks.forEach((t, i) => { t.num = respNum(t, toks[i - 1]); });
  return toks;
}
const ACRONYMS = new Map(Object.entries({
  uk: "united kingdom", us: "united states", usa: "united states of america", ussr: "union of soviet socialist republics",
  un: "united nations", eu: "european union", wwi: "world war i", ww1: "world war i", wwii: "world war ii", ww2: "world war ii",
  dna: "deoxyribonucleic acid", rna: "ribonucleic acid", nyc: "new york city", uae: "united arab emirates",
  drc: "democratic republic of the congo", prc: "peoples republic of china",
}));

// ---------------------------------------------------------------- matching a form
function joinWords(a, b) {
  const segs = [];
  for (const sg of a.segs.concat(b.segs)) {
    if (segs.length && segs[segs.length - 1][0] === sg[0]) segs[segs.length - 1] = [sg[0], segs[segs.length - 1][1] + sg[1]];
    else segs.push([sg[0], sg[1]]);
  }
  const kind = a.kind === "O" && b.kind === "O" ? "O" : segs.every((x) => x[0]) ? "R" : "M";
  return { t: a.t + b.t, kind, segs, cap: a.cap, num: null, run: a.run, protect: false };
}

// All ways the words of group g can match a contiguous run of response tokens starting at j.
function groupMatchesAt(form, g, T, j, ctx, fuzzy) {
  const base = g.words.map((i) => form.words[i]);
  const seqs = [base];
  // "Smith, John": a person's name may be given surname first, with a comma (J§5.2)
  if (base.length >= 2 && base.every((w) => w.cap && /^\p{L}+$/u.test(w.t)) && T[j] && T[j].comma) seqs.push([base[base.length - 1]].concat(base.slice(0, -1)));
  if (ctx.freeOrder && base.length >= 2 && base.length <= 4) {
    const perm = (arr) => (arr.length <= 1 ? [arr] : arr.flatMap((x, i) => perm(arr.slice(0, i).concat(arr.slice(i + 1))).map((p) => [x].concat(p))));
    for (const p of perm(base)) if (p.some((w, i) => w !== base[i])) seqs.push(p);
  }
  const best = new Map();
  for (const ws of seqs) {
    const memo = new Map();
    const rec = (i, jj) => {
      const key = i * 1000 + jj;
      if (memo.has(key)) return memo.get(key);
      const res = [];
      if (i === ws.length) { res.push({ e: jj, cost: 0 }); memo.set(key, res); return res; }
      // an article inside the required span is required (spec C6: "Los Angeles", "The Invisible Man"); below strictness 15 it may be left out
      if (i === 0 && ws.length > 1 && ARTICLES_EN.has(ws[0].t) && ctx.articleOptional) for (const r of rec(1, jj)) res.push(r);
      if (i === ws.length - 1 && i > 0 && ctx.qWords && ws[i].kind === "R" && (ctx.qWords.has(ws[i].t) || ctx.qWords.has(ws[i].t.replace(/s$/, "")))) res.push({ e: jj, cost: 0 });
      // regnal numerals: "Henry the Eighth", "Louis the 14th" for Henry VIII / Louis XIV (J§5.5)
      if (jj + 1 < T.length && i > 0 && T[jj].t === "the" && ws[i].num && ws[i - 1].cap && !ws[i - 1].num) for (const r of rec(i, jj + 1)) res.push(r);
      if (jj < T.length) {
        const c = wordCost(ws[i], T[jj], ctx, fuzzy, true);
        if (c >= 0) for (const r of rec(i + 1, jj + 1)) res.push({ e: r.e, cost: r.cost + c });
        // two form words written as one response token ("Telltale", "Kim Jongun")
        if (i + 1 < ws.length && !ws[i].num) {
          const oneLetter = ws[i].t.length === 1 || ws[i + 1].t.length === 1 || (ws[i].kind !== "O" && wordCands(ws[i]) && ws[i]._rlen === 1) || (ws[i + 1].kind !== "O" && wordCands(ws[i + 1]) && ws[i + 1]._rlen === 1);
          const cj = ws[i + 1].num ? (ws[i].t + ws[i + 1].t === T[jj].t ? 0 : -1) : wordCost(joinWords(ws[i], ws[i + 1]), T[jj], ctx, fuzzy && !oneLetter, true);
          if (cj >= 0) for (const r of rec(i + 2, jj + 1)) res.push({ e: r.e, cost: r.cost + cj });
        }
        // one form word written as two response tokens ("Speed boat")
        if (jj + 1 < T.length && !ws[i].num) {
          const cs = wordCost(ws[i], { t: T[jj].t + T[jj + 1].t, num: null, split: true }, ctx, fuzzy, true);
          if (cs >= 0) for (const r of rec(i + 1, jj + 2)) res.push({ e: r.e, cost: r.cost + cs });
        }
      }
      memo.set(key, res);
      return res;
    };
    for (const r of rec(0, j)) if (r.e > j && (!best.has(r.e) || best.get(r.e).cost > r.cost)) best.set(r.e, r);
  }
  return [...best.values()].map((r) => ({ s: j, e: r.e, cost: r.cost }));
}

function poolHas(pool, x) {
  if (!pool) return false;
  if (pool.has(x)) return true;
  return x.length >= 4 && (pool.has(x.replace(/e?s$/, "")) || pool.has(x + "s") || pool.has(x + "es"));
}
function isAccountedTok(t, form, ctx, pool, i, T) {
  const x = t.t;
  for (const w of form.words) if (wordCost(w, t, ctx, false, false) >= 0) return true;
  // fragments of partly required words ("cells" of <u>T</u>cells, "cell" of cell<u>membrane</u>)
  for (const w of form.words) if (w.kind === "M") for (const [r, str] of w.segs) if (!r && str.length >= 2 && (str === x || inflEq(str, x, false))) return true;
  if (NEVER_ACCOUNTED.has(x)) return false;
  if (ARTICLES_ALL.has(x) || CONNECTIVES.has(x) || HONORIFICS.has(x)) return true;
  if (form.scope !== "bare") {
    if (poolHas(pool, x)) return true;
    if (ctx.qWords && ctx.qWords.has(x)) return true;
  }
  for (const w of form.words) {
    if (w.kind !== "O" || x.length < 5 || /\d/.test(x)) continue;
    const bud = budgetFor(Math.max(w.t.length, x.length), ctx);
    if (bud && osa(w.t, x, bud) <= bud) return true;
  }
  return x.length === 1 && /[a-z]/.test(x) && i > 0 && i < T.length - 1;
}

// initial-letter spans in a row (<u>U</u>nited <u>S</u>tates, <u>S</u>tudent <u>N</u>onviolent …) may be given as the acronym (J§4.4)
function initialRuns(form) {
  if (form._init) return form._init;
  const runs = [];
  let cur = [];
  form.groups.forEach((g, gi) => {
    const w = g.words.length === 1 ? form.words[g.words[0]] : null;
    const isInit = !!w && w.segs.length >= 1 && w.segs[0][0] && w.segs[0][1].length === 1 && w.segs.slice(1).every((x) => !x[0]) && /[a-z]/.test(w.segs[0][1]);
    if (isInit) cur.push(gi);
    else { if (cur.length >= 2) runs.push(cur); cur = []; }
  });
  if (cur.length >= 2) runs.push(cur);
  form._init = runs.map((gis) => ({ gis, letters: gis.map((gi) => form.words[form.groups[gi].words[0]].segs[0][1]).join("") }));
  return form._init;
}

// runs of two or more adjacent groups of a part that read as one person's name -> Map(group index -> run id)
function nameClusters(form, p) {
  const capW = (w) => !w.num && (/^\p{Lu}/u.test(w.orig || "") || NAME_PARTICLE.test(w.t));
  const m = new Map();
  let cur = null, id = 0;
  for (let k = 0; k < p.length; k++) {
    const g = form.groups[p[k]];
    if (!g.words.every((i) => capW(form.words[i]))) { cur = null; continue; }
    if (cur) {
      const pg = form.groups[p[k - 1]];
      for (let i = pg.words[pg.words.length - 1] + 1; i < g.words[0]; i++) if (!capW(form.words[i])) { cur = null; break; }
    }
    if (!cur) cur = { id: id++, n: 0 };
    cur.n++;
    m.set(p[k], cur);
  }
  const out = new Map();
  for (const [gi, c] of m) if (c.n >= 2) out.set(gi, c.id);
  return out;
}

// Match a form against response tokens. mode: { fuzzy, extraOk, prefixOk }
function matchForm(form, T, ctx, mode, pool) {
  const groups = form.groups;
  if (!groups || !groups.length) return null;
  const occ = groups.map((g) => {
    const list = [];
    for (let j = 0; j < T.length; j++) for (const o of groupMatchesAt(form, g, T, j, ctx, mode.fuzzy)) list.push(o);
    return list;
  });
  for (const run of initialRuns(form)) for (let j = 0; j < T.length; j++) if (T[j].t === run.letters) occ[run.gis[0]].push({ s: j, e: j + 1, cost: 0, covers: run.gis });
  const either = !!ctx.rules.either_portion;
  // "accept first or last name": any one group of a part that is a person's name
  // "accept first or last name": one group of each run of name groups is enough; the rest stays required
  const clusters = !either && ctx.rules.either_name ? form.parts.map((p) => nameClusters(form, p)) : null;
  // JOINTLY_REQUIRED_PIECES: groups of one joined run count only together (a lone piece is never an accept)
  let jointOf = null;
  if (either || clusters) {
    const byRun = new Map();
    groups.forEach((g, gi) => { if (isJointRun(g.run)) { if (!byRun.has(g.run)) byRun.set(g.run, []); byRun.get(g.run).push(gi); } });
    for (const l of byRun.values()) if (l.length > 1) { if (!jointOf) jointOf = new Map(); for (const gi of l) jointOf.set(gi, l); }
  }
  const got = (gi, sel) => !!sel[gi] && (!jointOf || !jointOf.has(gi) || jointOf.get(gi).every((x) => sel[x]));
  const partOk = (p, pi, sel) => {
    if (either) return p.some((gi) => got(gi, sel));
    if (!clusters || !clusters[pi].size) return p.every((gi) => sel[gi]);
    const need = new Map();
    for (const gi of p) {
      const c = clusters[pi].get(gi);
      if (c === undefined) { if (!sel[gi]) return false; } else need.set(c, need.get(c) || got(gi, sel));
    }
    for (const v of need.values()) if (!v) return false;
    return true;
  };
  const anyN = ctx.rules.any_n || 0;
  const fixed = ctx.rules.order === "fixed";
  const satisfied = (sel) => {
    const pk = form.parts.map((p, pi) => partOk(p, pi, sel));
    const n = pk.filter(Boolean).length;
    if (anyN && form.parts.length > 1) return n >= Math.min(anyN, form.parts.length);
    return n === form.parts.length;
  };
  let best = null;
  let nodes = 0;
  const sel = new Array(groups.length).fill(null);
  const used = new Uint8Array(T.length);
  const score = (c) => (c.sat ? 1e6 : 0) - c.left.length * 1e4 + c.nGroups * 100 - c.cost;
  const dfs = (gi, cost) => {
    if (++nodes > 5000) return;
    if (gi === groups.length) {
      const s2 = sel.map(Boolean);
      if (!s2.some(Boolean)) return;
      const sat = satisfied(s2);
      if (fixed) {
        let last = -1;
        for (const o of sel) if (o && o !== true) { if (o.s < last) return; last = o.s; }
      }
      const left = [];
      for (let k = 0; k < T.length; k++) if (!used[k] && !isAccountedTok(T[k], form, ctx, pool, k, T)) left.push(k);
      const cand = { sat, cost, left, nGroups: s2.filter(Boolean).length, sel: sel.slice() };
      if (!best || score(cand) > score(best)) best = cand;
      return;
    }
    if (sel[gi] === true) { dfs(gi + 1, cost); return; }
    dfs(gi + 1, cost);
    for (const o of occ[gi]) {
      let free = true;
      for (let k = o.s; k < o.e; k++) if (used[k]) { free = false; break; }
      if (!free) continue;
      if (o.covers && o.covers.some((g2) => g2 !== gi && sel[g2])) continue;
      for (let k = o.s; k < o.e; k++) used[k] = 1;
      sel[gi] = o;
      if (o.covers) for (const g2 of o.covers) if (g2 !== gi) sel[g2] = true;
      dfs(gi + 1, cost + o.cost);
      if (o.covers) for (const g2 of o.covers) if (g2 !== gi) sel[g2] = null;
      sel[gi] = null;
      for (let k = o.s; k < o.e; k++) used[k] = 0;
    }
  };
  dfs(0, 0);
  if (!best) return null;
  let leftOk = best.left.length === 0 || (mode.extraOk && form.scope !== "bare");
  if (!leftOk && mode.prefixOk && best.sat) {
    // extra modifiers before the head only ("Mississippi River" for "specific rivers such as Yellow River")
    const starts = best.sel.filter((o) => o && o !== true).map((o) => o.s);
    const firstPos = starts.length ? Math.min(...starts) : 0;
    leftOk = best.left.every((k) => k < firstPos && !NEVER_ACCOUNTED.has(T[k].t));
  }
  const full = best.sat && best.cost <= ctx.formBudget && leftOk;
  return { full, sat: best.sat, cost: best.cost, left: best.left, nGroups: best.nGroups, sel: best.sel };
}

// J9: the number of required words matched when the response gives a strict, non-empty subset of them (every other
// token accounted for); 0 otherwise. anyWord: count every word of the form ("prompt on either part alone").
function partialOf(form, T, ctx, pool, anyWord) {
  const req = [];
  form.words.forEach((w, i) => { if (anyWord ? !ARTICLES_ALL.has(w.t) && !CONNECTIVES.has(w.t) : w.kind !== "O") req.push(i); });
  if (!req.length) return 0;
  const hitW = new Set();
  let hitTok = 0;
  for (let k = 0; k < T.length; k++) {
    let m = -1;
    for (const i of req) if (wordCost(form.words[i], T[k], ctx, false, true) >= 0) { m = i; break; }
    if (m >= 0) { hitW.add(m); hitTok++; continue; }
    if (ARTICLES_ALL.has(T[k].t) || CONNECTIVES.has(T[k].t)) continue;
    if (anyWord || !isAccountedTok(T[k], form, ctx, null, k, T)) return 0;
  }
  if (!hitTok) return 0;
  return hitW.size < req.length ? hitW.size : 0;
}

// ---------------------------------------------------------------- strict comparisons (J4 rejects, hidden entries)
function contentToks(toks) {
  let i = 0;
  while (i < toks.length - 1 && ARTICLES_ALL.has(toks[i].t)) i++;
  return i ? toks.slice(i) : toks;
}
function tokEqLoose(a, b) {
  if (a.t === b.t) return true;
  const na = a.num || numInfo(a.t), nb = b.num || numInfo(b.t);
  if (na && nb) return numEq(na, nb);
  return inflEq(a.t, b.t, false) || inflEq(b.t, a.t, false) || abbrevEq(a.t, b.t);
}
// equality ignoring articles, number, joining, and (for multi-word items) word order (J4)
// protect: response words that are required words of a live accept form; folding (plural, abbreviation) never
// turns a different reject word into one of them ("Metamorphoses" never catches "Metamorphosis")
function strictEq(itemToks, T, ordered, protect) {
  const a = contentToks(itemToks), b = contentToks(T);
  if (!a.length || !b.length) return false;
  if (a.map((t) => t.t).join("") === b.map((t) => t.t).join("")) return true;
  if (a.length !== b.length) return false;
  const eq = protect ? (x, y) => x.t === y.t || (!protect.has(y.t) && tokEqLoose(x, y)) || (protect.has(y.t) && !!(x.num || numInfo(x.t)) && tokEqLoose(x, y)) : tokEqLoose;
  if (ordered) return a.every((x, i) => eq(x, b[i]));
  const used = new Uint8Array(b.length);
  for (const x of a) {
    let ok = false;
    for (let i = 0; i < b.length; i++) if (!used[i] && eq(x, b[i])) { used[i] = 1; ok = true; break; }
    if (!ok) return false;
  }
  return true;
}
// does T contain the term as a contiguous token run?
function containsRun(T, term) {
  const a = contentToks(term);
  if (!a.length) return false;
  for (let i = 0; i + a.length <= T.length; i++) {
    let ok = true;
    for (let j = 0; j < a.length; j++) if (!tokEqLoose(a[j], T[i + j])) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

// ---------------------------------------------------------------- the judge
function verdict(status, extra) { return { status, matchedAnswer: null, prompt: null, ...extra }; }

function judgeOnce(resp, P, strictness, opts, rc, plain) {
  const T = respTokens(resp, plain);
  if (!T.length) return verdict("reject", { rule: "J14" });
  const rules = rc.rules;
  const F = linesForms(P, plain, opts.jointPieces, rules);
  const exact = !!rules.exact;
  const lenient = !!rules.lenient;
  const ctx = {
    rules, extraBudget: (lenient ? 1 : 0) + (strictness < 10 ? 1 : 0) + (strictness < 5 ? 1 : 0),
    formBudget: (strictness >= 20 ? 1 : strictness >= 15 ? 2 : strictness >= 10 ? 3 : 4) + (lenient ? 1 : 0), wordForms: false, qWords: rc.qWords || null,
    lenientSpell: !!rules.lenientSpell && !exact, freeOrder: strictness < 10 && rules.order !== "fixed" && !exact, articleOptional: strictness < 15 && !exact,
  };
  // the line's own "accept X alone after …" decides the bare word; the generic-word rule then stays out
  if (F.accepts.some((f) => f.window && f.scope === "bare")) ctx.qWords = null;
  const respKey = formKey(T);
  const live = (f) => isLive(f, rc);
  const out = (status, f, rule, extra) => {
    const v = verdict(status, { rule, via: "line", ...extra });
    if (f) {
      v.matchedAnswer = f.display || f.text;
      if (status === "prompt") v.prompt = { target: f.display || f.text, ask: f.ask || null };
    }
    return v;
  };
  const multiLine = !!(rules.multi || rules.all_required || rules.qMulti || rules.any_n) || F.accepts.some((f) => f.isMain && f.parts && f.parts.length > 1);
  // a response that is exactly a live accept form, or exactly its required words, is never caught by a reject (J4)
  // The required-words exemption undoes folding only ("Metamorphoses", "A Guide for …" never catch "Metamorphosis",
  // "Guide for …"); a reject that names the response exactly ("do not accept “Invisible Man”") still wins.
  // (a partly underlined word also counts by its underlined letters: "<u>herm</u>s" → "herm", "<u>screen print</u>ing")
  const reqLetters = (w) => (w.kind === "M" ? w.segs.filter((x) => x[0]).map((x) => x[1]).join("") : w.t);
  const reqKey = (f) => {
    if (f._reqKey === undefined) { const ws = f.words.filter((w) => w.kind !== "O"); f._reqKey = [formKey(ws), ws.map(reqLetters).join(" ")]; }
    return f._reqKey;
  };
  // (the same normalisation on both sides: leading articles drop from the response and from the required words)
  const respContent = formKey(contentToks(T));
  const artless = (k) => k.replace(/^(?:(?:the|a|an)\s+)+/, "");
  const wholeAccept = (byReq = true) => F.accepts.some((f) => f.src !== "subst" && !f.weak && live(f) && (f.key === respKey || (byReq && reqKey(f).some((k) => k === respKey || artless(k) === respContent))));
  // only a quoted term with no qualifier after it ("“Ivan” if …", "“Caesar” and another name") names the response
  const exactTerm = (r) => (r.exactQ || []).some((t) => formKey(t) === respKey);
  let protect = null;
  for (const f of F.accepts) if (!f.weak && live(f)) for (const w of f.words) if (w.kind !== "O") { (protect || (protect = new Set())).add(w.t); if (w.kind === "M") protect.add(reqLetters(w)); }
  // ---- J4 strict reject (and hidden rejects, G1); on a multi-answer line one rejected answer rejects the whole
  const pieces = [T];
  if (multiLine) {
    const ps = String(resp).split(/\s*(?:,|;|&|\band\b)\s*/i).map((x) => x.trim()).filter(Boolean);
    if (ps.length > 1) for (const p of ps) pieces.push(respTokens(p, plain));
  }
  const excepted = (TT) => F.exceptions.some((x) => x.terms.some((t) => strictEq(t, TT, false) || containsRun(TT, t)));
  for (const r of F.rejects) {
    if (!live(r)) continue;
    const hit = r.both ? r.terms.length > 1 && r.terms.every((t) => containsRun(T, t))
      : r.superset ? r.terms.some((t) => containsRun(T, t) && contentToks(T).length > contentToks(t).length)
      // a reject term with "and" names an order ("volume and entropy" against an accepted "entropy and volume")
      : pieces.some((TT) => r.terms.some((t) => strictEq(t, TT, t.some((x) => x.t === "and"), r.window ? null : protect)));
    // a timed reject ("do not accept … afterwards") is aimed at an accepted item on purpose: only a whole live
    // accept form is exempt from it
    if (hit && !wholeAccept(!r.window && !exactTerm(r)) && !excepted(T)) return out("reject", null, "J4");
  }
  for (const c of F.contains) {
    if (!NEG.has(c.kind) || !live(c)) continue;
    let hit = false;
    if (c.slots.length) hit = c.slots.some((alts) => alts.some((t) => containsRun(T, t)));
    else if (c.desc && c.desc.length) hit = c.desc.every((d) => T.some((t) => tokEqLoose(d, t)));
    if (hit && c.without && c.without.length && containsRun(T, c.without)) hit = false;
    if (hit && !wholeAccept() && !excepted(T)) return out("reject", null, "J4");
  }
  const hidden = opts.hidden && typeof opts.hidden === "object" && !Array.isArray(opts.hidden) ? opts.hidden : null;
  const hTok = (list) => (Array.isArray(list) ? list : []).map((e) => respTokens(String(e), plain)).filter((t) => t.length);
  const H = hidden ? { accept: hTok(hidden.accept), prompt: hTok(hidden.prompt), antiprompt: hTok(hidden.antiprompt), reject: hTok(hidden.reject) } : null;
  if (H && H.reject.some((t) => strictEq(t, T, true)) && !wholeAccept()) return verdict("reject", { rule: "J4", via: "hidden" });
  let noPrompt = false;
  for (const r of F.noprompts) if (live(r) && !r.superset && r.terms.some((t) => strictEq(t, T, false))) noPrompt = true;
  // ---- J5 exact accept
  const liveAccepts = F.accepts.filter(live);
  // extra words may come from the line's other live accept forms ("Saul of Tarsus"), never a number
  const linePool = new Set();
  for (const f of liveAccepts) for (const w of f.words) {
    if (w.num) continue;
    linePool.add(w.t);
    if (w.kind === "M") for (const [r, str] of w.segs) if (!r && str.length >= 3) linePool.add(str);
  }
  for (const f of liveAccepts) {
    const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, linePool);
    if (m && m.full && m.cost === 0) return out("accept", f, "J5");
  }
  // ---- J6 / J7 named prompt and anti-prompt
  if (!noPrompt) {
    for (const f of F.prompts) {
      if (!live(f)) continue;
      const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, F.promptPool);
      if (m && m.full && m.cost === 0) return out("prompt", f, "J6");
    }
    for (const f of F.antis) {
      if (!live(f)) continue;
      const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, F.promptPool);
      if (m && m.full && m.cost === 0) {
        const v = out("prompt", f, "J7", { antiprompt: true });
        v.prompt.ask = f.ask || "Can you be less specific?";
        return v;
      }
    }
    for (const c of F.contains) {
      if (c.kind !== "prompt" && c.kind !== "antiprompt") continue;
      if (!live(c) || !c.slots.length) continue;
      // class descriptions take word forms and extra words (P16): "Indian states" mentions India
      if (c.slots.every((alts) => alts.some((t) => containsRun(T, t) || containsWordsLoose(T, t))) && !(c.without && containsRun(T, c.without))) {
        const anti = c.kind === "antiprompt";
        const v = verdict("prompt", { rule: anti ? "J7" : "J6", via: "line", matchedAnswer: c.text, prompt: { target: c.text, ask: c.ask || (anti ? "Can you be less specific?" : null) } });
        if (anti) v.antiprompt = true;
        return v;
      }
    }
  }
  // ---- J8 closed window
  for (const f of F.accepts) {
    if (live(f) || !f.window || windowSpan(f.window, f, rc)[1] >= rc.buzz) continue;
    const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, linePool);
    if (m && m.full) return out("reject", null, "J8", { note: "accepted only while its window was open" });
  }
  // ---- J9 partial policy
  const policy = rules.partial_policy || null;
  const extraOk = strictness < 20 && !exact && !rules.closed;
  const wordFormsOk = (!!(rules.word_forms && rules.word_forms.some((x) => /^accept:/.test(x))) || lenient) && !exact;
  for (const f of liveAccepts) {
    if (f.src === "subst" || f.scope === "bare") continue;
    if (!partialOf(f, T, ctx, linePool, false)) continue;
    ctx.wordForms = wordFormsOk;
    const loose = matchForm(f, T, ctx, { fuzzy: !exact, extraOk: false }, linePool);
    ctx.wordForms = false;
    if (loose && loose.full) continue;
    if (!noPrompt && rules.prompt_any_n && f.parts.length > 1) {
      const m = matchForm(f, T, ctx, { fuzzy: false, extraOk: false }, linePool);
      const nParts = m && m.sel ? f.parts.filter((p) => p.every((gi) => m.sel[gi])).length : 0;
      if (nParts >= rules.prompt_any_n) return out("prompt", f, "J9");
    }
    if (policy === "prompt" && !noPrompt) return out("prompt", f, "J9");
    if (policy === "reject" || rules.closed) return out("reject", null, "J9");
  }
  if (!noPrompt && multiLine && F.prompts.length) {
    const host = liveAccepts.find((f) => f.isMain && f.parts && f.parts.length > 1);
    const ps = String(resp).split(/\s*(?:,|;|&|\band\b)\s*/i).map((x) => x.trim()).filter(Boolean);
    if (host && ps.length > 1 && ps.length <= host.parts.length) {
      let promptHit = null, partHits = 0;
      const usedParts = new Set();
      const ok = ps.every((p) => {
        const PT = respTokens(p, plain);
        for (let pi = 0; pi < host.parts.length; pi++) {
          if (usedParts.has(pi)) continue;
          const m = matchForm(partForm(host, pi), PT, ctx, { fuzzy: false, extraOk: false }, null);
          if (m && m.full) { usedParts.add(pi); partHits++; return true; }
        }
        const pf = F.prompts.find((f) => live(f) && (() => { const m = matchForm(f, PT, ctx, { fuzzy: false, extraOk: false }, null); return m && m.full; })());
        if (pf) { promptHit = promptHit || pf; return true; }
        return false;
      });
      if (ok && promptHit && partHits) return out("prompt", promptHit, "J9");
    }
  }
  if (!noPrompt && (rules.prompt_either_part || rules.prompt_other_names)) {
    for (const f of liveAccepts) {
      if (!f.isMain) continue;
      if (rules.prompt_other_names) {
        const names = f.words.filter((w) => w.kind === "O" && w.cap && !ARTICLES_ALL.has(w.t) && !CONNECTIVES.has(w.t));
        if (names.length && T.every((t) => ARTICLES_ALL.has(t.t) || names.some((w) => wordCost(w, t, ctx, false, false) >= 0))) return out("prompt", f, "J9");
      }
      if (rules.prompt_either_part && partialOf(f, T, ctx, null, true)) return out("prompt", f, "J9");
    }
  }
  // ---- J10 loose accept: typos within the budget (with the collision guard), word forms, extra words, classes
  ctx.wordForms = wordFormsOk;
  for (const f of liveAccepts) {
    const m = matchForm(f, T, ctx, { fuzzy: !exact, extraOk, prefixOk: !!f.specificEx }, linePool);
    if (!m || !m.full) continue;
    if (m.cost > 0 && collides(f, T, m, F, opts)) continue;
    if (m.left.length && !extraWordsOk(T, m, opts, f)) continue;
    ctx.wordForms = false;
    return out("accept", f, "J10", m.left.length ? { note: "extra words ignored" } : m.cost ? { note: "spelling accepted" } : {});
  }
  ctx.wordForms = false;
  for (const c of F.contains) {
    if (c.kind !== "accept" || !live(c) || !c.slots.length) continue;
    const ok = c.slots.every((alts) => alts.some((t) => containsWordsLoose(T, t)));
    if (ok && !(c.without && containsRun(T, c.without))) return verdict("accept", { rule: "J10", via: "line", matchedAnswer: c.text });
  }
  // ---- J11 loose prompt
  if (!noPrompt) {
    for (const f of F.prompts.concat(F.antis)) {
      if (!live(f)) continue;
      const m = matchForm(f, T, ctx, { fuzzy: !exact, extraOk }, F.promptPool);
      if (!m || !m.full) continue;
      if (m.cost > 0 && collides(f, T, m, F, opts)) continue;
      if (m.left.length && !extraWordsOk(T, m, opts, f)) continue;
      const anti = F.antis.includes(f);
      const v = out("prompt", f, "J11", anti ? { antiprompt: true } : {});
      if (anti) v.prompt.ask = f.ask || "Can you be less specific?";
      return v;
    }
    // ---- J12 NAQT implicit prompts (closed list)
    const imp = implicitPrompt(F, T);
    if (imp) return out("prompt", imp, "J12");
  }
  // ---- J13 hidden answers, then the open class
  if (H) {
    const eq = (list) => list.find((t) => strictEq(t, T, true));
    if (eq(H.reject)) return verdict("reject", { rule: "J13", via: "hidden" });
    if (!noPrompt && eq(H.prompt)) return verdict("prompt", { rule: "J13", via: "hidden", prompt: { target: null, ask: null } });
    if (!noPrompt && eq(H.antiprompt)) return verdict("prompt", { rule: "J13", via: "hidden", antiprompt: true, prompt: { target: null, ask: "Can you be less specific?" } });
    const ha = eq(H.accept);
    if (ha) return verdict("accept", { rule: "J13", via: "hidden", matchedAnswer: ha.map((t) => t.orig).join(" ") });
    const others = H.reject.concat(H.prompt, H.antiprompt, H.accept);
    const guardOk = () => !others.some((o) => strictEq(o, T, true)) && !(opts.isKnownAnswer && opts.isKnownAnswer(respKey))
      && !F.rejects.some((r) => r.terms.some((t) => strictEq(t, T, false))) && !F.prompts.concat(F.antis).some((f) => f.key === respKey);
    const fuzzyHit = (list) => (exact ? null : list.find((t) => hiddenFuzzy(t, T, ctx)));
    if (!noPrompt && fuzzyHit(H.prompt) && guardOk()) return verdict("prompt", { rule: "J13", via: "hidden", prompt: { target: null, ask: null } });
    if (!noPrompt && fuzzyHit(H.antiprompt) && guardOk()) return verdict("prompt", { rule: "J13", via: "hidden", antiprompt: true, prompt: { target: null, ask: "Can you be less specific?" } });
    const fa = fuzzyHit(H.accept);
    if (fa && guardOk()) return verdict("accept", { rule: "J13", via: "hidden", matchedAnswer: fa.map((t) => t.orig).join(" "), note: "spelling accepted" });
    if (extraOk) {
      const ex = H.accept.find((t) => hiddenExtra(t, T));
      if (ex && guardOk()) return verdict("accept", { rule: "J13", via: "hidden", matchedAnswer: ex.map((t) => t.orig).join(" "), note: "extra words ignored" });
    }
  }
  if (openClass(rules, F)) return verdict("reject", { rule: "J13", via: "line", unsure: true, note: "the answer line allows equivalents or descriptions: judge it yourself" });
  return verdict("reject", { rule: "J14" });
}

function containsWordsLoose(T, term) {
  const a = contentToks(term);
  if (!a.length) return false;
  return a.every((x) => T.some((t) => tokEqLoose(x, t) || wordFormEq(x.t, t.t)));
}

function hiddenFuzzy(entry, T, ctx) {
  const a = contentToks(entry), b = contentToks(T);
  if (!a.length || a.length !== b.length) return false;
  let total = 0;
  for (let i = 0; i < a.length; i++) {
    if (tokEqLoose(a[i], b[i])) continue;
    if (/\d/.test(a[i].t) || /\d/.test(b[i].t) || a[i].t.length < 3) return false;
    const bud = budgetFor(Math.max(a[i].t.length, b[i].t.length), ctx);
    const d = osa(a[i].t, b[i].t, bud);
    if (d > 0 && (a[i].t[0] !== b[i].t[0] ? d + 1 : d) > bud) return false;
    if (d > bud) return false;
    if (a.length === 1 && knownCollision(b[i].t, { kind: "O", t: a[i].t, segs: [[false, a[i].t]] })) return false;
    total += d;
  }
  return total > 0 && total <= 2;
}
function hiddenExtra(entry, T) {
  const a = contentToks(entry);
  if (!a.length || a.every((t) => numInfo(t.t))) return false; // number guard
  const b = contentToks(T);
  if (b.length <= a.length || b.some((t) => NEVER_ACCOUNTED.has(t.t))) return false;
  for (let i = 0; i + a.length <= b.length; i++) {
    let ok = true;
    for (let j = 0; j < a.length; j++) if (!tokEqLoose(a[j], b[i + j])) { ok = false; break; }
    if (!ok) continue;
    if (a.length === 1 && i + a.length < b.length) continue; // head guard: a one-word entry takes words before it only
    return true;
  }
  return false;
}

// J10 collision guard: a fuzzy match is blocked when the response is itself another known answer.
function collides(form, T, m, F, opts) {
  const respKey = T.map((t) => t.t).join(" ");
  if (opts.isKnownAnswer && opts.isKnownAnswer(respKey)) return true;
  // (a) the whole response equals another item of this line (a reject, prompt or anti-prompt target)
  for (const r of F.rejects) if (r.terms.some((t) => strictEq(t, T, false))) return true;
  for (const f of F.prompts.concat(F.antis)) if (f.key === respKey) return true;
  // (b) the fuzzed token is the only required token of its span and is itself a frequent answer word
  for (let gi = 0; gi < m.sel.length; gi++) {
    const o = m.sel[gi];
    if (!o || o === true || !o.cost) continue;
    const g = form.groups[gi];
    const reqWords = g.words.map((i) => form.words[i]).filter((w) => w.kind !== "O");
    if (reqWords.length !== 1 || o.e - o.s !== 1) continue;
    const t = T[o.s].t;
    if (form.words.some((w) => w.t === t)) continue;
    if (knownCollision(t, reqWords[0])) return true;
    if (opts.isKnownAnswer && opts.isKnownAnswer(t)) return true;
  }
  return false;
}

// Extra unaccounted words (J10 below strictness 20): never a negation or a hedge, never a known different answer.
function extraWordsOk(T, m, opts, form) {
  for (const k of m.left) if (NEVER_ACCOUNTED.has(T[k].t)) return false;
  if (form && !form.specificEx) {
    for (let gi = 0; gi < m.sel.length; gi++) {
      const o = m.sel[gi];
      if (!o || o === true || !m.left.includes(o.s - 1)) continue;
      const g = form.groups[gi];
      const first = form.words[g.words[0]], before = form.words[g.words[0] - 1];
      if (first && first.cap && before && before.kind === "O" && before.cap && !ARTICLES_ALL.has(before.t) && !CONNECTIVES.has(before.t) && !HONORIFICS.has(before.t)) return false;
    }
  }
  return !(opts.isKnownAnswer && opts.isKnownAnswer(T.map((x) => x.t).join(" ")));
}

// is the group italic (a title, not a person's name)?
function P_IT(f, g) { const w = f.words[g.words[0]]; return !!(w && w.it); }
// J12: the NAQT implicit prompts (closed list).
function implicitPrompt(F, T) {
  for (const f of F.accepts) {
    if (!f.isMain) continue;
    // part of a space-separated compound surname that follows a given name (J§5.3)
    for (const g of f.groups) {
      if (g.words.length !== 2) continue;
      const w1 = f.words[g.words[0]], w2 = f.words[g.words[1]];
      if (!w1.cap || !w2.cap || w1.kind !== "R" || w2.kind !== "R") continue;
      const before = f.words[g.words[0] - 1];
      if (!before || before.kind !== "O" || !before.cap || ARTICLES_ALL.has(before.t) || CONNECTIVES.has(before.t)) continue;
      if (f.raw && f.raw.src === "main" && P_IT(f, g)) continue;
      const rest = T.filter((t) => !(t.t === before.t || ARTICLES_ALL.has(t.t)));
      if (rest.length === 1 && (rest[0].t === w1.t || rest[0].t === w2.t)) return f;
    }
    // a two-digit year, or decade shorthand (J§8.3, J§8.4)
    for (const w of f.words) {
      if (!w.num || w.num.kind !== "digit" || w.num.v < 1000 || w.num.v > 2099) continue;
      const TT = T.filter((t) => !ARTICLES_ALL.has(t.t));
      const rv = TT.length === 1 ? TT[0].num : null;
      if (rv && rv.v === w.num.v % 100 && !!rv.decade === !!w.num.decade) return f;
    }
  }
  return null;
}

function openClass(rules, F) {
  const oc = rules.open_class || [];
  if (oc.some((x) => /^(?:accept|prompt|antiprompt|prompt_partial):/.test(x))) return true;
  return F.contains.some((c) => (c.kind === "accept" || c.kind === "prompt") && !c.slots.length);
}

// Question-side notes and words ("Two answers required", "Description acceptable", the generic-word rule).
function questionInfo(rc, P) {
  rc.rules = P.rules;
  if (!rc.hasText) return;
  const t = rc.text;
  const extra = {};
  if (/\b(?:two|three|four|both)\s+answers?\s+(?:are\s+)?required\b/i.test(t)) extra.qMulti = true;
  if (/\bdescriptions?\s+(?:is\s+|are\s+)?acceptable\b/i.test(t)) extra.open_class = (P.rules.open_class || []).concat(["accept:description acceptable (question)"]);
  if (Object.keys(extra).length) rc.rules = { ...P.rules, ...extra };
  if (!rc.ti.nouns) {
    rc.ti.nouns = [];
    const toks = tokenize(t, null, false);
    for (let i = 0; i < toks.length; i++) {
      if (!/^(?:this|these|that|those)$/.test(toks[i].t)) continue;
      for (let j = i + 1; j <= i + 3 && j < toks.length; j++) {
        const w = toks[j].t;
        if (GENERIC_NOUNS.has(w)) rc.ti.nouns.push([toks[j].k1, w]);
        else if (w.endsWith("s") && GENERIC_NOUNS.has(w.slice(0, -1))) rc.ti.nouns.push([toks[j].k1, w.slice(0, -1)]);
      }
    }
  }
  // only what has been read: "name this acid" counts once the moderator has said it
  rc.qWords = new Set(rc.ti.nouns.filter(([end]) => end <= rc.buzz).map(([, w]) => w));
}

function judgeTop(resp, P, strictness, opts, plain) {
  const rc = makeReadCtx(opts);
  questionInfo(rc, P);
  const r = String(resp || "").replace(/[?!.]+\s*$/, "").trim();
  let v = judgeOnce(r, P, strictness, opts, rc, plain);
  // a strict reject of the whole response (J4) is final: no filler, acronym or hedge retry may override it
  if (v.status === "accept" || v.rule === "J4") return v;
  const better = (x) => x.status === "accept" || (x.status === "prompt" && v.status !== "prompt");
  // J1 response fillers ("what is", "um", "I think")
  const f = r.replace(FILLER_RX, "");
  if (f !== r && f.trim()) {
    const v2 = judgeOnce(f, P, strictness, opts, rc, plain);
    if (better(v2)) { v = v2; if (v.status === "accept") return v; }
  }
  // common acronyms (J§9.3): UK, USA, WWII, ...
  const toks = r.split(/\s+/);
  if (toks.some((x) => ACRONYMS.has(x.toLowerCase().replace(/\./g, "")))) {
    const ex = toks.map((x) => ACRONYMS.get(x.toLowerCase().replace(/\./g, "")) || x).join(" ");
    const v3 = judgeOnce(ex, P, strictness, opts, rc, plain);
    if (v3.status === "accept") return { ...v3, note: "acronym" };
  }
  // J2 one answer: only the first of several hedged answers counts
  const multi = !!(rc.rules.multi || rc.rules.all_required || rc.rules.qMulti || rc.rules.any_n);
  const pieces = r.split(/\s+(?:or|nor)\s+|\s*;\s*|(?<=\p{L})\s*\/\s*(?=\p{L})|,\s*(?=\S)/u).map((x) => x.trim()).filter(Boolean);
  // a strict reject of the whole response stands ("Portland, Maine" is not a hedge of "Portland")
  if (!multi && pieces.length > 1 && v.status !== "prompt" && v.rule !== "J4") {
    const v4 = judgeOnce(pieces[0], P, strictness, opts, rc, plain);
    v4.note = "only the first answer counts";
    return v4;
  }
  return v;
}

// ======================================================================
// Public API
// ======================================================================
const RANK = { accept: 3, prompt: 2, reject: 1 };
const rankOf = (v) => (RANK[v.status] || 0) + (v.unsure ? 0.5 : 0);

function judgeWithFollowups(resp, P, strictness, opts, plain) {
  const v = judgeTop(resp, P, strictness, opts, plain);
  const prev = [].concat(opts.previous || []).map((x) => String(x || "").trim()).filter(Boolean);
  if (!prev.length || v.status === "accept" || v.rule === "J4") return v;
  // a prompt follow-up is judged alone, then as "first answer + reply" and "reply + first answer" (spec §8)
  let best = v;
  for (const p of prev) {
    for (const combo of [p + " " + resp, resp + " " + p]) {
      const c = judgeTop(combo, P, strictness, opts, plain);
      if (rankOf(c) > rankOf(best)) best = { ...c, note: "judged together with the first answer" };
    }
  }
  if (best.status === "prompt" && prev.some((p) => normalizeText(p) === normalizeText(resp))) {
    return { status: "reject", matchedAnswer: null, prompt: null, rule: "J14", note: "the same answer was already prompted" };
  }
  return best;
}

// Both umlaut transliterations are acceptable (J§3.3): when the standard pass (ö→oe) does not accept and the line
// has ö/ü/ä, a second pass folds them plainly (ö→o).
function evaluateAnswer(userAnswer, answerline, sanitizedAnswerline, strictness = 10, opts = {}) {
  opts = opts && typeof opts === "object" ? opts : {};
  const resp = String(userAnswer == null ? "" : userAnswer).trim();
  if (!resp) return { status: "reject", matchedAnswer: null, prompt: null };
  const s = Number.isFinite(Number(strictness)) ? Number(strictness) : 10;
  try {
    const P = getLine(answerline, sanitizedAnswerline);
    let v = judgeWithFollowups(resp, P, s, opts, false);
    if (v.status !== "accept" && v.rule !== "J4" && /[öüäÖÜÄ]/.test(P.src)) {
      const v2 = judgeWithFollowups(resp, P, s, opts, true);
      if (rankOf(v2) > rankOf(v)) v = v2;
    }
    return v;
  } catch (e) {
    // never throw into the caller: fall back to a plain comparison with the main answer
    const main = stripTags(String(answerline || sanitizedAnswerline || "")).split(/[\[(]/)[0];
    const ok = normalizeText(main) && normalizeText(main) === normalizeText(resp);
    return { status: ok ? "accept" : "reject", matchedAnswer: ok ? main.trim() : null, prompt: null, error: String(e && e.message || e) };
  }
}

function windowSummary(w, form) {
  if (!w) return { until: null, after: null };
  if (w.side === "whole_question") return { until: null, after: null };
  const mk = w.shape === "self" ? "__self__" : w.shape === "clue" ? String(w.marker || "") : (markerText(w) || "__self__");
  if (w.side === "after") return { until: null, after: mk };
  if (w.side === "before") return { until: mk, after: null };
  if (w.side === "previous_flipped" && w._prev) {
    const p = windowSummary(w._prev, form);
    return { until: p.after, after: p.until };
  }
  if (w.side === "early" || w.side === "sentence" || w.side === "front") return { until: String(w.marker || w.kw || "") || null, after: null };
  return { until: null, after: null };
}

// Legacy summary of a parsed answer line (used by /api/parse-answerline and plugins), plus the spec forms.
function parseDirectives(answerline, sanitizedAnswerline) {
  const P = getLine(answerline, sanitizedAnswerline);
  const F = linesForms(P, false, null, null);
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  const accept = uniq(F.accepts.map((f) => f.display));
  const qualifiers = {};
  for (const f of F.accepts) {
    if (!f.window) continue;
    const w = windowSummary(f.window, f);
    if (w.until || w.after) qualifiers[f.display] = { until: w.until, after: w.after, group: [f.display] };
  }
  const prompt = F.prompts.map((f) => ({ target: f.display, ask: f.ask, ...windowSummary(f.window, f) }));
  for (const c of F.contains) if (c.kind === "prompt") prompt.push({ target: c.text, ask: c.ask, ...windowSummary(c.window) });
  if (P.rules.partial_policy === "prompt") prompt.push({ target: "__partial__", ask: null, until: null, after: null });
  const antiprompt = F.antis.map((f) => ({ target: f.display, ask: f.ask, ...windowSummary(f.window, f) }));
  for (const c of F.contains) if (c.kind === "antiprompt") antiprompt.push({ target: c.text, ask: c.ask, ...windowSummary(c.window) });
  const reject = [];
  for (const r of F.rejects) {
    if (r.labels && r.labels.length) for (const l of r.labels) reject.push(l);
    else for (const t of r.terms) reject.push(t.map((x) => x.orig + (x.poss ? "’s" : "")).join(" "));
  }
  for (const c of F.contains) if (NEG.has(c.kind)) reject.push(c.text);
  if (P.rules.partial_policy === "reject") reject.push("__partial__");
  const main = F.accepts.find((f) => f.isMain);
  const forms = P.ref.forms.map((f) => ({
    kind: f.kind, src: f.src, text: f.text, required: f.R || [], promptable: f.P || [], quoted: f.quoted || null,
    window: f.window ? { side: f.window.side, shape: f.window.shape, marker: f.window.marker } : null,
    ask: f.ask || null, scope: f.scope || null, class: f.cls || null, slots: f.slots || null, substFor: f.subst_for || null,
  }));
  const rules = JSON.parse(JSON.stringify(P.rules));
  return {
    accept, prompt, reject: uniq(reject), antiprompt, qualifiers,
    wordForms: !!(P.rules.word_forms && P.rules.word_forms.length), mainAnswer: main ? main.display : stripTags(P.src).split(/[\[(]/)[0].trim(),
    forms, rules,
  };
}

// A PROMPT is not correct: `correct` is true only for an accept (the bonus-scoring bug, spec §9 rank 1).
function checkAnswer(userAnswer, answerline, sanitizedAnswerline, strictness = 10, opts = {}) {
  const r = evaluateAnswer(userAnswer, answerline, sanitizedAnswerline, strictness, opts);
  return {
    correct: r.status === "accept",
    matchedAnswer: r.matchedAnswer,
    isDirective: false,
    prompted: r.status === "prompt",
    status: r.status,
    prompt: r.prompt || null,
    antiprompt: !!r.antiprompt,
    unsure: !!r.unsure,
  };
}

function checkBonusPart(userAnswer, partAnswerline, partSanitizedLine, pointValue = 10, strictness = 10, opts = {}) {
  const result = checkAnswer(userAnswer, partAnswerline, partSanitizedLine, strictness, opts);
  return {
    correct: result.correct,
    points: result.correct ? pointValue : 0,
    matchedAnswer: result.matchedAnswer,
    status: result.status,
    prompted: result.prompted,
    prompt: result.prompt,
    antiprompt: result.antiprompt,
    unsure: result.unsure,
  };
}

// partOpts: optional array, one object per part ({ jointPieces?, hidden?, readText?, fullText?, readLen?, previous? }),
// merged into that part's evaluateAnswer opts.
function checkBonus(userAnswers, bonusData, strictness = 10, partOpts = null) {
  const parts = [];
  let totalPoints = 0;
  // DB row fields are JSON strings; already-parsed arrays work too
  const arr = (v, d) => {
    if (Array.isArray(v)) return v;
    try { const x = JSON.parse(v); return Array.isArray(x) ? x : d; } catch { return d; }
  };
  const bd = bonusData || {};
  const answers = arr(bd.answers, []);
  const answersSanitized = arr(bd.answers_sanitized, []);
  const values = arr(bd.point_values ?? bd.values, [10, 10, 10]);
  const n = Math.max(answers.length, answersSanitized.length) || 3;
  for (let i = 0; i < n; i++) {
    const po = Array.isArray(partOpts) && partOpts[i] && typeof partOpts[i] === "object" ? partOpts[i] : {};
    const value = Number(values[i]) || 10;
    const r = checkBonusPart((userAnswers && userAnswers[i]) || "", answers[i] || "", answersSanitized[i] || "", value, strictness, po);
    parts.push(r);
    totalPoints += r.points;
  }
  return { parts, totalPoints };
}

// The spec forms of an answer line (parse half only): { forms, rules } — for tools and tests.
function parseAnswerLineForms(answerline, sanitizedAnswerline) {
  const d = parseDirectives(answerline, sanitizedAnswerline);
  return { forms: d.forms, rules: d.rules };
}

// debugging aid for tests (not part of the stable API)
function __debugLine(answerline, sanitized, opts = {}) {
  const P = getLine(answerline, sanitized);
  const rc = makeReadCtx(opts);
  questionInfo(rc, P);
  const F = linesForms(P, false, opts.jointPieces, rc.rules);
  const fw = (f) => ({ kind: f.kind, src: f.src, display: f.display, live: isLive(f, rc), win: f.window ? [f.window.side, f.window.shape, f.window.marker, f.window.inSent, windowSpan(f.window, f, rc)] : null,
    words: f.words.map((w) => w.t + ":" + w.kind + (w.run >= 0 ? "#" + w.run : "")).join(" "), groups: f.groups.map((g) => g.words.join("+")).join(" | "), parts: JSON.stringify(f.parts), ask: f.ask, scope: f.scope });
  return { rules: rc.rules, buzz: rc.buzz, accepts: F.accepts.map(fw), prompts: F.prompts.map(fw), antis: F.antis.map(fw),
    rejects: F.rejects.map((r) => ({ kind: r.kind, terms: r.terms.map((t) => t.map((x) => x.t).join(" ")), both: r.both, live: isLive(r, rc) })),
    noprompts: F.noprompts.map((r) => r.terms.map((t) => t.map((x) => x.t).join(" "))),
    contains: F.contains.map((c) => ({ kind: c.kind, slots: c.slots.map((a) => a.map((t) => t.map((x) => x.t).join(" "))), desc: c.desc && c.desc.map((x) => x.t).join(" "), live: isLive(c, rc) })),
    issues: P.L.issues };
}

return { stripTags, normalizeText, stripLeadingArticle, parseAnswerline, parseSanitizedAnswerline, healAnswerline, primaryAnswer, frequencyKey, answersSimilar, similarityKeys, similarKeysMatch, evaluateAnswer, parseDirectives, checkAnswer, checkBonusPart, checkBonus, parseAnswerLineForms, __debugLine };
})();
window.QBScoring = (function () {
"use strict";
const POWER_POINTS = 15;
const CORRECT_POINTS = 10;
const NEG_POINTS = -5;

function findPowerMark(questionText) {
  const idx = questionText.indexOf("(*)");
  if (idx !== -1) return idx;

  const htmlIdx = questionText.indexOf("<b>(*)</b>");
  if (htmlIdx !== -1) return htmlIdx;

  return -1;
}

function calculateCelerity(buzzCharIndex, totalQuestionLength) {
  if (totalQuestionLength <= 0) return 1.0;
  const ratio = Math.max(0, Math.min(1, buzzCharIndex / totalQuestionLength));
  return Math.round(ratio * 1000) / 1000;
}

function isPowerBuzz(buzzCharIndex, questionText) {
  const powerMarkIdx = findPowerMark(questionText);
  const isPower = powerMarkIdx >= 0 && buzzCharIndex <= powerMarkIdx;
  return { isPower, powerPosition: powerMarkIdx };
}

function scoreTossup(params, checkerFn) {
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

function scoreBonus(partResults) {
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

return { POWER_POINTS, CORRECT_POINTS, NEG_POINTS, findPowerMark, calculateCelerity, isPowerBuzz, scoreTossup, scoreBonus };
})();
window.QBJudge = (function (C, S) {
"use strict";
function list(v) { if (Array.isArray(v)) return v; try { const a = JSON.parse(v || "[]"); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
// usable only for a question that came with its hidden answers (null when it has none)
function ready(q) { return !!(q && Object.prototype.hasOwnProperty.call(q, "_hidden") && (q.answer != null || q.answers != null)); }
function judgeOpts(q, part) {
  const out = {};
  try {
    const flags = typeof q.flags === "string" ? JSON.parse(q.flags || "[]") : (q.flags || []);
    const joint = [];
    for (const f of flags) {
      if (!f || f.code !== "JOINTLY_REQUIRED_PIECES") continue;
      const m = /pieces '(.+?)' \+ '(.+?)' in the (?:part (\d+) )?answer line/.exec(f.detail || "");
      if (m && (m[3] ? Number(m[3]) : null) === (part == null ? null : part + 1)) joint.push([m[1], m[2]]);
    }
    if (joint.length) out.jointPieces = joint;
  } catch (e) { /* no flags */ }
  try {
    const h = q._hidden;
    let slot = h;
    if (part != null) { const n = list(q.answers).length; slot = Array.isArray(h) && h.length === n ? h[part] : null; }
    if (slot && typeof slot === "object" && !Array.isArray(slot)) out.hidden = slot;
  } catch (e) { /* none */ }
  return out;
}
function readPos(t, buzzPosition) {
  const raw = t.question_sanitized || t.question || "";
  let n = buzzPosition == null ? raw.length : Math.max(0, Math.min(raw.length, buzzPosition));
  const mark = n > 0 ? raw.lastIndexOf("(*)", n - 1) : -1;
  if (mark >= 0 && n < mark + 3) n = mark;
  const readText = raw.slice(0, n).replace(/\(\*\)/g, "");
  return { readText, fullText: raw.replace(/\(\*\)/g, ""), readLen: readText.length };
}
function bonusPartPos(b, part) {
  const parts = list(b.parts_sanitized);
  const fullText = [b.leadin_sanitized || "", parts[part] || ""].filter(Boolean).join(" ");
  return { readText: fullText, fullText, readLen: fullText.length };
}
function evaluateTossup(ua, t, strictness = 10, buzzPosition = null, previous = null) {
  return C.evaluateAnswer(ua, t.answer, t.answer_sanitized, strictness, { ...readPos(t, buzzPosition), ...judgeOpts(t), ...(previous ? { previous } : {}) });
}
function scoreTossupResult(ua, t, buzzCharIndex, fullyRead, strictness, previous = null) {
  const pos = readPos(t, fullyRead ? null : buzzCharIndex);
  let unsure = false;
  const res = S.scoreTossup({ userAnswer: ua, answerline: t.answer, sanitizedAnswer: t.answer_sanitized, buzzCharIndex, questionText: t.question_sanitized || t.question, fullyRead },
    (u, al, sa) => { const ev = C.evaluateAnswer(u, al, sa, strictness, { ...pos, ...judgeOpts(t), ...(previous ? { previous } : {}) }); unsure = ev.status !== "accept" && !!ev.unsure; return { correct: ev.status === "accept" }; });
  if (unsure) res.unsure = true;
  return res;
}
function evaluateBonusPart(ua, b, part, strictness = 10, previous = null) {
  const answers = list(b.answers), san = list(b.answers_sanitized);
  if (!(part >= 0 && part < answers.length)) return null;
  return C.evaluateAnswer(ua, answers[part], san[part] || "", strictness, { ...bonusPartPos(b, part), ...judgeOpts(b, part), ...(previous ? { previous } : {}) });
}
function scoreBonusResult(answers, b, strictness = 10, overrides = null, previous = null) {
  let partOpts = null;
  try { const n = list(b.answers).length; partOpts = Array.from({ length: n }, (_, i) => ({ ...bonusPartPos(b, i), ...judgeOpts(b, i), ...(Array.isArray(previous) && previous[i] ? { previous: previous[i] } : {}) })); } catch (e) { partOpts = null; }
  const values = list(b.point_values);
  const result = C.checkBonus(answers, b, strictness, partOpts);
  let parts = result.parts;
  if (Array.isArray(overrides)) parts = parts.map((pt, i) => { if (overrides[i] == null) return pt; const v = Number.isFinite(+values[i]) && +values[i] > 0 ? +values[i] : 10; return { ...pt, correct: !!overrides[i], points: overrides[i] ? v : 0 }; });
  return { ...S.scoreBonus(parts), parts };
}
return { ready, judgeOpts, readPos, bonusPartPos, evaluateTossup, scoreTossupResult, evaluateBonusPart, scoreBonusResult };
})(window.QBAnswerChecker, window.QBScoring);

