
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
  const persistFields = (x) => ({ id: x.id, name: x.name, version: x.version, author: x.author, description: x.description, filename: x.filename, code: x.code, enabled: x.enabled });
  function savePlugins() { saveStore(PLUGINS_KEY, QB._plugins.filter((p) => !p._builtin).map(persistFields)); }
  function saveThemes() { saveStore(THEMES_KEY, QB._themes.map(persistFields)); }
  function findExt(id) { return QB._plugins.find((p) => p.id === id) || QB._themes.find((t) => t.id === id); }

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
      storage: {
        get(k) { try { return JSON.parse(localStorage.getItem("qb-pl-" + ext.id + "-" + k)); } catch { return null; } },
        set(k, v) { localStorage.setItem("qb-pl-" + ext.id + "-" + k, JSON.stringify(v)); },
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

  function readSettings(id) { try { return JSON.parse(localStorage.getItem("qb-pl-" + id + "-settings")) || {}; } catch { return {}; } }
  function writeSettings(id, s) { try { localStorage.setItem("qb-pl-" + id + "-settings", JSON.stringify(s)); } catch {} }
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

  // Plugins folded into the app itself: a stored copy is dropped at boot and
  // the zip is refused on import (the app already does what they did).
  const RETIRED_PLUGINS = { "achievement-icons": "Achievement Icons" };
  function finalizePlugin(filename, code, manifest) {
    if (!manifest || !manifest.id) { importFail("Plugin must call QB.registerPlugin({ id, ... })"); return null; }
    // A plugin that is now part of the app (multiplayer, achievement icons) can't be replaced by a zip.
    if (RETIRED_PLUGINS[manifest.id]) { importFail(RETIRED_PLUGINS[manifest.id] + " is built into the app"); return null; }
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
    QB._emit("plugins:changed");
  };
  QB.togglePlugin = (id, on) => (on ? QB.enablePlugin(id) : QB.disablePlugin(id));
  QB.removePlugin = (id) => { const p = QB._plugins.find((x) => x.id === id); if (p && p._builtin) return; QB.disablePlugin(id); QB._plugins = QB._plugins.filter((x) => x.id !== id); savePlugins(); };
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
    if (r.plugin) return finalizePlugin(filename, finalCode, r.plugin);
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
    QB._plugins.forEach((p) => { p._enabledRuntime = false; if (p.enabled && (p._builtin || !QB._pluginsHeld)) QB.enablePlugin(p.id); });
  };
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
    "flashcards": "Study", "coach-mode": "Study", "clue-recall": "Study", "buzz-trainer": "Study", "power-facts": "Study",
    "packet-builder": "Tools", "answerline-lab": "Tools", "folders": "Tools", "answer-rules": "Tools", "achievement-lab": "Tools",
    "advanced-freq": "Analysis", "keyword-freq": "Analysis", "buzz-words": "Analysis", "fact-sheet": "Analysis", "canon-tracker": "Analysis",
    "achievement-icons": "Extras", "class-sync": "Extras", "class-admin": "Extras",
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
            return '<button type="button" class="ptile" data-page="' + esc(pg.pluginId + "::" + pg.id) + '"><span class="picon" style="--c:' + GROUP_COLOR[g] + '">' + esc(mono(nice)) + '</span><span style="min-width:0"><b>' + esc(nice) + '</b><small>v' + esc(plug.version || "") + "</small></span></button>";
          }).join("") + "</div></section>").join("");
      }
    } else if (tab === "manage") {
      const rows = visible.slice().sort((a, b) => GROUP_ORDER.indexOf(groupOf(a.id)) - GROUP_ORDER.indexOf(groupOf(b.id)) || String(a.name).localeCompare(String(b.name))).map((p) => {
        const g = groupOf(p.id);
        const set = p.enabled ? settingsHtml(p, "card") : "";
        return '<div class="ext-row ext-card' + (p.enabled ? " active" : "") + '">' +
          '<span class="picon" style="--c:' + GROUP_COLOR[g] + '">' + esc(mono(p.name)) + "</span>" +
          '<span class="er-name"><b>' + esc(p.name) + (p.description ? ' <span class="qb-info" data-tip="' + esc(p.description) + '">i</span>' : "") +
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
        return '<div class="store-card"><span class="picon" style="--c:' + GROUP_COLOR[g] + '">' + esc(mono(item.name)) + "</span>" +
          '<span class="store-main"><b>' + esc(item.name) + '</b><small>v' + esc(item.version) + (item.author ? " · " + esc(item.author) : "") + "</small></span>" +
          (item.description ? '<span class="qb-info" data-tip="' + esc(item.description) + '">i</span>' : "") + btn + "</div>";
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
    var isHost = false, myId = "";
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

    ctx.onHotkey("chat", function () { if (!active()) return; var ci = body && body.querySelector("#mp-chat-input"); if (ci) ci.focus(); });

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
    ctx._cleanup = function () { window.removeEventListener("keydown", onDrawerEsc, true); markBusy(false); returnPanel(); restoreSoloPanel(); document.removeEventListener("keydown", onKey); stopReveal(); stopAnswerTimer(); stopTick(); stopBuzzWindowTimer(); stopBonusTimer(); stopClientRead(); stopAutoSub(); try { if (ws) ws.close(); } catch (e) {} };

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

    function addPlayer(id, name, team, spec, avatar) {
      if (!players[id]) order.push(id);
      players[id] = { id: id, name: name || ("Player" + order.length), team: team || "", score: (players[id] && players[id].score) || 0, spec: !!spec, avatar: avatar || (players[id] && players[id].avatar) || "" };
    }
    function removePlayer(id) { delete players[id]; order = order.filter(function (x) { return x !== id; }); }

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
          setVal("panel-speed-slider", b.cfg.revealSpeed, ["input", "change"]);
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
    var ROOM_DEFAULTS = { answerSeconds: 10, buzzWindow: 10, rebuzz: false, bonusEvery: false, stopPower: false, allowSkips: true, locked: false, public: true };
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
            addPlayer(myId, myName, "", mySpec, myAv());
            sysChat(myName + " created the lobby");
            mpPrefetchNow();   // the FIRST question should serve instantly too
          } else {
            toHost({ t: "hello", name: myName, spectate: mySpec, avatar: myAv() });
          }
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
          if (!players[myId]) toHost({ t: "hello", name: myName, spectate: mySpec, avatar: myAv() });
          setStatus("Host left \u2014 " + (((players[m.id] || {}).name) || "another player") + " is now the host.");
          return;
        }
        if (m.t === "hostleft") { setStatus("Host left \u2014 lobby closed."); }
      };
      sock.onclose = function () {
        if (!opened && fallback) { giveUp(); return; }
        if (!opened) setStatus("Couldn't reach the relay \u2014 check the URL (and that the worker is deployed).");
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
          addPlayer(id, joinName || d.name, "", d.spectate, d.avatar);
          sysChat(players[id].name + " joined" + (d.spectate ? " (spectating)" : ""));
        }
        pushState();
        // bring the newcomer up to speed
        sessionLog.forEach(function (e) { conn.send({ t: "logentry", entry: e }); });
        if (current) {
          conn.send(questionMsg());
          var reading = !paused && !pendingBuzzer && !ended && revealIdx < current.text.length;
          conn.send({ t: "read", from: revealIdx, speed: reading ? Math.max(8, curRevealSpeed) : 0 });
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
      broadcast({ t: "read", from: revealIdx, speed: Math.max(8, curRevealSpeed) });
      // TIME-BASED reveal: the index follows the wall clock, not the number of
      // interval fires — a busy host machine can no longer fall behind its own
      // clients' text. (The old ticker also ran getPracticeConfig — two full
      // panel scans — per CHARACTER on the host and nothing on clients, which
      // is exactly why nonhosts used to see the question sooner.)
      var tickMs = Math.max(8, curRevealSpeed);
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
      }, tickMs);
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
      var tickMs = Math.max(8, speed);
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
      }, tickMs);
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
      var label = key === "answerSeconds" ? "Answer Time" : key === "buzzWindow" ? "Buzz Window" : key === "rebuzz" ? "Rebuzzes" : key === "bonusEvery" ? "Bonus after every question" : key === "stopPower" ? "Stop on power" : key === "allowSkips" ? "Skips" : key === "locked" ? "Room lock" : key === "public" ? "Public room" : key;
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
        players = {}; order = []; (d.players || []).forEach(function (p) { players[p.id] = p; order.push(p.id); });
        settings = d.settings || settings;
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
      else if (d.t === "locked") { leftIntentionally = true; ctx.toast("Lobby is locked", "error"); leave(); setStatus("Lobby is locked"); }
      else if (d.t === "config") { if (d.config) { filterSummary = d.config.filterSummary || filterSummary; } renderFilterSummary(); }
      else if (d.t === "bonus") { applyBonus(d); }
      else if (d.t === "bpart") { applyBonusPart(d); }
      else if (d.t === "bcancel") { applyBonusCancel(); }
      // A promoted host cancelled the question that was mid-read when the old
      // host vanished — reset the question area (scores and log are kept).
      // render only when visible — renderRoom borrows the filters panel and
      // must never steal it from a practice screen in the foreground.
      else if (d.t === "qreset") { stopClientRead(); stopAutoSub(); current = null; ended = false; pendingBuzzer = null; bonusView = null; paused = false; if (active()) render(); }
    }

    // ── local actions (sent to host or handled if host) ──
    function requestBuzz() {
      if (!current || ended) return;
      if (players[myId] && players[myId].spec) { ctx.toast("You're spectating \u2014 no buzzing", "error"); return; }
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
      r.innerHTML = c.s ? esc(c.x) : (c.m ? '<span class="mp-chat-teamtag">TEAM</span> ' : "") + "<strong>" + esc(c.n) + ":</strong> " + esc(c.x);
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
      if (!lobby) renderForm(); else renderRoom();
      updateTopBar();
      try { if (window.qbWebPathSync) window.qbWebPathSync(); } catch (e) {}   // the website's address: /multiplayer/<room>
    }
    function setStatus(m) { var s = body && body.querySelector("#mp-status"); if (s) s.textContent = m; }

    function renderForm() {
      // The website: an account plays under its display name; a signed-out
      // player is "unregistered" + digits (new each time). The app: the name
      // last used here, else the account's display name, else the profile's.
      var st = (ctx.host && ctx.host.getState && ctx.host.getState()) || {};
      var acct = st.account || null, fixedName = !!st.web;
      if (st.web) myName = acct ? (acct.displayName || acct.handle) : "unregistered" + (10000 + Math.floor(Math.random() * 90000));
      else myName = ctx.getSetting("name") || (acct && acct.displayName) || st.username || ("Player" + Math.floor(Math.random() * 1000));
      var initial = (String(myName).trim()[0] || "?").toUpperCase();
      var recent = recentRooms();
      body.innerHTML =
        '<div class="mp-lobby">' +
          '<label class="mp-who"><span class="avatar">' + esc(initial) + '</span><span class="mp-who-txt"><span class="eyebrow">Playing as</span>' +
            '<input id="mp-name" value="' + esc(myName) + '" maxlength="24" autocomplete="off" spellcheck="false" aria-label="Your name"' + (fixedName ? " readonly" : "") + '></span>' +
            (fixedName ? '<span class="qb-info" data-tip="' + (acct ? "Your display name — change it in Account." : "Sign in to play under your own name.") + '">i</span>' : "") + '</label>' +
          '<section class="mp-card mp-join-card">' +
            '<label class="mp-field"><span>Room code <span class="qb-info" data-tip="Type a code to join that room, or leave it empty for a new one. Share the code so others can join.">i</span></span><input id="mp-lobby" class="code-input" maxlength="32" autocomplete="off" spellcheck="false" aria-label="Room code"></label>' +
            '<label class="checkbox-row"><input type="checkbox" id="mp-spectate"> Join as spectator</label>' +
            '<button type="button" class="btn btn-lg btn-go" id="mp-join">Join/Create Room</button>' +
          "</section>" +
          '<div class="mp-status" id="mp-status"></div>' +
          '<section class="mp-recent mp-public" id="mp-public-rooms" hidden><h2 class="eyebrow">Public rooms <span class="qb-info" data-tip="Rooms whose players left them public (Room settings → Public room). Pick one to join.">i</span></h2><div class="list" id="mp-public-list"></div></section>' +
          (recent.length ? '<section class="mp-recent"><h2 class="eyebrow">Recent rooms</h2><div class="list">' + recent.map(function (r) {
            return '<button type="button" class="list-row clickable mp-recent-row" data-code="' + esc(r.code) + '"><b class="mp-rcode">' + esc(String(r.code).toUpperCase()) + '</b><span class="mp-rwho">' + esc(r.players ? r.players + (r.players === 1 ? " player" : " players") : "") + (r.host ? " · you hosted" : "") + '</span><span class="mp-rwhen">' + esc(whenLabel(r.at)) + '</span><span class="mp-rjoin">Rejoin ›</span></button>';
          }).join("") + "</div></section>" : "") +
        "</div>";
      var nameEl = body.querySelector("#mp-name"), codeEl = body.querySelector("#mp-lobby"), joinBtn = body.querySelector("#mp-join");
      // one button: a typed code joins that room (or opens it if nobody is
      // there yet); an empty box makes a new room with a fresh code
      var goTyped = function () { go(codeEl.value.trim() || newRoomCode()); };
      codeEl.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); goTyped(); } });
      nameEl.addEventListener("change", function () { var v = nameEl.value.trim(); if (v) { myName = v; ctx.setSetting("name", v); var av = body.querySelector(".mp-who .avatar"); if (av) av.textContent = (v[0] || "?").toUpperCase(); } });
      var go = function (code) {
        myName = (nameEl.value.trim()) || myName;
        if (!fixedName) ctx.setSetting("name", myName); // remember for next time (the app)
        lobby = String(code || "").trim();
        mySpec = !!body.querySelector("#mp-spectate").checked;
        if (!lobby) { setStatus("Enter a room code."); return; }
        join();
      };
      joinBtn.onclick = goTyped;
      // the game server's public rooms, refreshed while this form shows
      var loadPublic = function () {
        var sec = body && body.querySelector("#mp-public-rooms");
        if (!sec) { clearInterval(pubTimer); pubTimer = null; return; }
        var base = gameServerUrl();
        if (!base || base === "off") return;
        fetch(base.replace(/\/$/, "") + "/lobby/_rooms", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
          if (!d || !Array.isArray(d.rooms) || !body || !body.contains(sec)) return;
          sec.hidden = false;
          var list = sec.querySelector("#mp-public-list");
          list.innerHTML = d.rooms.length ? d.rooms.map(function (r) {
            var who = (r.names || []).join(", ") + (r.players > (r.names || []).length ? " +" + (r.players - r.names.length) : "");
            var state = (r.players === 1 ? "1 player" : r.players + " players") + (r.spectators ? " · " + r.spectators + " watching" : "") + (r.questions ? " · Q" + r.questions : " · waiting");
            return '<button type="button" class="list-row clickable mp-recent-row mp-pub-row" data-code="' + esc(r.code) + '"' + (r.summary ? ' title="' + esc(r.summary) + '"' : "") + '><b class="mp-rcode">' + esc(String(r.code).toUpperCase()) + '</b><span class="mp-rwho">' + esc(who) + '</span><span class="mp-rwhen">' + esc(state) + '</span><span class="mp-rjoin">Join ›</span></button>';
          }).join("") : '<p class="mp-pub-empty">No public rooms right now — leave the code empty and press Join/Create Room to start one.</p>';
          list.querySelectorAll(".mp-pub-row").forEach(function (b) { b.onclick = function () { go(b.dataset.code); }; });
        }).catch(function () {});
      };
      clearInterval(pubTimer); pubTimer = setInterval(loadPublic, 5000); loadPublic();
      try { if (ctx.host && ctx.host.tip) ctx.host.tip(body.querySelector(".mp-lobby"), "mp-lobby"); } catch (e) {}
      body.querySelectorAll(".mp-recent-row").forEach(function (r) { r.onclick = function () { go(r.dataset.code); }; });
    }
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
      return '<div class="filter-section mp-injected"><div class="filter-label">Game rules</div>' +
        '<div class="slider-group"><span style="font-size:11px;min-width:78px" title="Time to type an answer after buzzing">Answer time</span><input type="range" id="mp-ans" min="3" max="30" step="1" value="' + (settings.answerSeconds) + '"><span class="slider-value" id="mp-ans-val">' + (settings.answerSeconds) + "s</span></div>" +
        '<div class="slider-group" style="margin-top:6px"><span style="font-size:11px;min-width:78px" title="Time to buzz once the question finishes reading">Buzz window</span><input type="range" id="mp-bwin" min="3" max="30" step="1" value="' + (settings.buzzWindow || 10) + '"><span class="slider-value" id="mp-bwin-val">' + (settings.buzzWindow || 10) + "s</span></div>" +
        '<label class="checkbox-row"><input type="checkbox" id="mp-rebuzz" ' + (settings.rebuzz ? "checked" : "") + "> Allow rebuzzes</label>" +
        '<label class="checkbox-row" title="After every correct tossup, the winner answers a random bonus"><input type="checkbox" id="mp-bonusevery" ' + (settings.bonusEvery ? "checked" : "") + "> Bonus after every question</label>" +
        '<label class="checkbox-row"><input type="checkbox" id="mp-stoppow"' + (settings.stopPower ? " checked" : "") + "> Stop on power</label>" +
        '<label class="checkbox-row"><input type="checkbox" id="mp-skips"' + (settings.allowSkips !== false ? " checked" : "") + "> Allow skips</label>" +
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
            '<span class="badge rh-host" id="mp-hostbadge"' + (isHost ? "" : " hidden") + ">You host</span>" +
            (mySpec ? '<span class="badge rh-spec">Spectating</span>' : "") +
            '<span class="spacer"></span>' +
            '<span class="rh-q num" id="mp-qcount"></span>' +
            '<button type="button" class="btn" id="mp-roomset"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/></svg>Room settings</button>' +
          "</div>" +
          '<div class="practice-layout mp-layout">' +
            '<main class="question-area">' +
              '<div class="question-placeholder" id="mp-placeholder">' +
                '<div class="placeholder-icon"><svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.6 2.6 0 1 1 3.7 2.5c-.9.4-1.3 1-1.3 1.8v.3"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg></div>' +
                '<p class="text-muted">Press <kbd>N</kbd> to start.</p>' +
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
              "</div>" +
              '<div class="panel-body" data-pane="players"' + (panelTab === "players" ? "" : " hidden") + '><div class="mp-scores" id="mp-scores"></div></div>' +
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

      renderScores(); renderSettings(); renderFilterSummary();
      if (current) { renderQuestion(); renderBuzzes(); }
      renderSessionLog();
      syncActions();
    }
    var panelTab = "players", unreadChat = 0;
    function showPanelTab(t) {
      if (t !== "players" && t !== "chat") t = "players";
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
      var hb = body.querySelector("#mp-hostbadge"); if (hb) hb.hidden = !isHost;
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
      if (t.id === "panel-speed-slider") return "changed reading speed to " + t.value;
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
        return '<div class="mp-player' + (you ? " mp-you" : "") + (p.off ? " mp-off" : "") + '"><span class="avatar" style="background:' + (you ? "var(--accent-strong)" : colorOf(p.id)) + '">' + esc(initial) + '</span>' +
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
    hotkeys: [{ id: "chat", label: "Focus chat", default: "Enter" }],
    onEnable: __qbMain,
    onDisable: function (ctx) { if (ctx._cleanup) ctx._cleanup(); },
  });
})();

