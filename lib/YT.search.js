// ==UserScript==
// _name         YT.search
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit spezifischen Funktionen fuer Suchmuster
// _require      https://eselce.github.io/YTsearch/lib/YT.search.js
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer Suchmuster ====================

//const __SEARCHPATTERN = /(LOVE.?BITES?|Miyako|Fami[^l]|Asami|Midori|Haru(na|pi)|Miho|Wolf.?pack|DESTROSE|21g|DROP OF JOKER|SONIC LOVER RECKLESS|Gekijo|METALicche|Lust.?Queen|CHAOS.?CONTROL)/i;

const __SEARCHPATTERNS = [];

// Initialisiert die Suchmuster aufgrund der Option 'searchRE'.
// Diese Option enthaelt das String-Array, das als patterns uebergeben wird.
// patterns: String-Array mit Suchmustern, aus denen RegExp gemacht werden
// flags: Wird an RegExp uebergeben, Flag hinter dem /.../
// return Liefert die Anzahl der RegExp zurueck, die aktiv wurden
async function initSearch(patterns, flags = 'i') {
    const __FLAGS = (flags || 'i');
    const __PATTERNS = (patterns || [ "LOVEBITES" ]);

    __SEARCHPATTERNS.length = 0;  // Empty array (dirty)

    for (const __PATTERN of __PATTERNS) {
        const __REGEXP = new RegExp(__PATTERN, __FLAGS);

        __SEARCHPATTERNS.push(__REGEXP);
    }

    const __COUNT = __SEARCHPATTERNS.length;

    __LOG[0]("initSearch():", "Search initialized with " + __COUNT + " patterns!", __SEARCHPATTERNS);

    return __COUNT;
}

// Ermittelt, ob ein Titel einem der Suchmuster entspricht.
// title: Zu ueberpruefender Titel
// return match()-Ausgabe des Treffers, null, falls nicht gefunden
function matchSearch(title) {
    const __TITLE = title;

    for (const __REGEXP of __SEARCHPATTERNS) {
        const __MATCH = __TITLE.match(__REGEXP);

        if (__MATCH) {
            return __MATCH;
        }
    }

    return null;

    //return __TITLE.match(__SEARCHPATTERN);
}

// ==================== Ende Abschnitt fuer Suchmuster ====================

// *** EOF ***
