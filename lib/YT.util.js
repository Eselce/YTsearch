// ==UserScript==
// _name         YT.util
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-spezifischen Funktionen fuer Utilities
// _require      https://eselce.github.io/YTsearch/lib/YT.util.js
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube-Utilities ====================

const __YOUTUBEHOME = 'https://www.youtube.com';
const __NOPREFIX = "";

// Reduziert eine URL oder ID auf die reine ID (ueber die Muster)
// url: URL oder VID eines YouTube Videos
// dflt: Default-Video, falls erfolglos
// patterns: Array von Mustern in Form von RegExp 
// prefix: Gemeinsamer Anfang der IDs, gehört nicht zur URL. Default: ""
// return ID mit Prefix bei Erfolg, und dflt, falls nicht
function safeID(url, dflt = null, patterns = null, prefix = __NOPREFIX) {  // strips ID to pure ID according to the patterns...
    const __URL = String(url).split("\n")[0].trim();  // only one line (multi-line makes it complicated)
    const __FULLURL = ((__URL.startsWith('/')) ? "https://www.youtube.de" : "") + __URL;
    const __DEFAULT = dflt;
    const __PATTERNS = (patterns || [ /^(?:[0-9\s,]*,)?([0-9A-Za-z_\-]+)(?:,[\w\s,./\-=?:]*)?$/ ]);
    const __PREFIX = prefix;

    for (const __PATTERN of __PATTERNS) {
        if (__PATTERN.test(__FULLURL)) {
            const __URL = __FULLURL.replace(__PATTERN, '$1');

            return (__PREFIX + __URL);
        }
    }

    return __DEFAULT;
}

// ==================== Ende Abschnitt fuer YouTube-Utilities ====================

// *** EOF ***
