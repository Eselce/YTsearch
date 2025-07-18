// ==UserScript==
// _name         YT.vid.log
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-VID-spezifischen Logfunktionen
// _require      https://eselce.github.io/YTsearch/lib/LOVEBITES.db.js
// _require      https://eselce.github.io/YTsearch/lib/REJECT.db.js
// _require      https://eselce.github.io/YTsearch/lib/NEW.db.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.dyn.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.log.js
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube VID-Logfunktionen ====================

// Gibt den Inhalt einer Liste (Object) als String zurueck.
// obj: Skript-Optionen zur Parametrisierung
// showKeys: Angabe, ob auch die Keys angezeigt werden sollen (Default: nur Werte)
// showIndex: Angabe, ob auch die Indices angezeigt werden sollen (Default: nur Werte)
// filter: Angabe, welche Items angezeigt weren sollen (Default: alle Items)
// objFormat: Angabe, ob die Ausgabe fuer JSON geeignet sein soll (Default: nur Liste)
// fixValue: Angabe, ob statt der Werte eine fixe Ausgabe erfolgen soll (Default: Werte)
// return String, der die Ausgabe enthaelt
function showListValues(obj, showKeys = false, showIndex = false, filter = null, objFormat = false, fixValue = null) {
    const __OBJ = obj;
    const __FILTER = (filter || (value => true));
    const __ENTRIES = Object.entries(__OBJ);
    const __FILTERED = __ENTRIES.filter(__FILTER);
    const __LEN = __FILTERED.length;
    const __SHOWKEYS = showKeys;
    const __SHOWINDEX = showIndex;
    const __OBJFORMAT = objFormat;  // __OBJFORMAT has no index, but always keys!
    const __FIXVALUE = fixValue;
    let ret = (__LEN + " entries...\n");

    __LOG[0]("All =", __ENTRIES.length, "entries", "\nFiltered =", ret);

    __FILTERED.forEach(([key, value], index) => {
            const __KEY = key;
            const __VALUE = (__FIXVALUE || value);
            const __INDEX = index;

            ret = ret + (__OBJFORMAT ? ("'" + __KEY + "'   : '" + __VALUE + "',")
                                     : ((__SHOWINDEX ? __INDEX + ": " : "") + (__SHOWKEYS ? __KEY + " = " : "") + __VALUE)) + '\n';
        });

    return ret;
}

// Gibt bestimmte Elemente von __DYNVIDS als String zurueck.
// rejected: Angabe, ob Sperrelemente 'N' angezeigt werden oder der Rest (Default: alle anderen)
// showKeys: Angabe, ob auch die Keys angezeigt werden sollen (Default: nur Werte)
// showIndex: Angabe, ob auch die Indices angezeigt werden sollen (Default: nur Werte)
// objFormat: Angabe, ob die Ausgabe fuer JSON geeignet sein soll (Default: nur Liste)
// fixValue: Angabe, ob statt der Werte eine fixe Ausgabe erfolgen soll (Default: Werte)
// return String, der die Ausgabe enthaelt
function showIDs(rejected = false, showKeys = false, showIndex = false, objFormat = false, fixValue = null) {
    const __REJECTED = rejected;
    const __SHOWKEYS = showKeys;
    const __SHOWINDEX = showIndex;
    const __FILTER = (__REJECTED ? (([key, value]) => isRejected(value))
                                 : (([key, value]) => (! isRejected(value))));
    const __OBJFORMAT = objFormat;
    const __FIXVALUE = fixValue;

    return showListValues(__DYNVIDS, __SHOWKEYS, __SHOWINDEX, __FILTER, __OBJFORMAT, __FIXVALUE);
}

// Gibt alle dynamischen IDs auf der Konsole aus.
// (1) Alle Sperreintraege in der Form "VID : 'N'"
// (2) Alle neuen Eintraege in der Form "VID : 'NEW'"
// (3) Alle neuen Eintraege als URL-Liste
// (4) Alle neuen Eintraege, die noch nicht in die DB importiert wurden
// return void
function logIDs() {
    const __ACCEPTED = false;
    const __REJECTED = true;
    const __SHOWKEYS = true;
    const __NOKEYS = false;
    const __NOINDEX = false;
    const __OBJFORMAT = true;

    __LOG[0]("Logging __DYNVIDS");

    __LOG[2](showIDs(__REJECTED, __SHOWKEYS, __NOINDEX, __OBJFORMAT));
    __LOG[2](showIDs(__ACCEPTED, __NOKEYS, __NOINDEX, __OBJFORMAT, __FLAG_NEW));
    __LOG[2](showIDs(__ACCEPTED, __NOKEYS, __NOINDEX));

    __LOG[2](showListValues(__NEWVIDS2IMPORT, __NOKEYS, __NOINDEX));
}

// ==================== Ende Abschnitt fuer YouTube VID-Logfunktionen ====================

// *** EOF ***
