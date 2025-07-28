// ==UserScript==
// _name         YT.vid.ref.log
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-VID-spezifischen Logfunktionen fuer Referenzen
// _require      https://eselce.github.io/YTsearch/lib/LOVEBITES.db.js
// _require      https://eselce.github.io/YTsearch/lib/REJECT.db.js
// _require      https://eselce.github.io/YTsearch/lib/NEW.db.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.dyn.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.log.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.ref.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.ref.log.js
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube VID-Logfunktionen fuer Referenzen ====================

// Gibt bestimmte Elemente von __DYNREFS als String zurueck.
// rejected: Angabe, ob Sperrelemente 'N' angezeigt werden oder der Rest (Default: alle anderen)
// showKeys: Angabe, ob auch die Keys angezeigt werden sollen (Default: nur Werte)
// showIndex: Angabe, ob auch die Indices angezeigt werden sollen (Default: nur Werte)
// objFormat: Angabe, ob die Ausgabe fuer JSON geeignet sein soll (Default: nur Liste)
// fixValue: Angabe, ob statt der Werte eine fixe Ausgabe erfolgen soll (Default: Werte)
// return String, der die Ausgabe enthaelt
function showRefIDs(rejected = false, showKeys = false, showIndex = false, objFormat = false, fixValue = null) {
    const __REJECTED = rejected;
    const __SHOWKEYS = showKeys;
    const __SHOWINDEX = showIndex;
    const __FILTER = (__REJECTED ? (([key, value]) => isRejected(value))
                                 : (([key, value]) => (! isRejected(value))));
    const __OBJFORMAT = objFormat;
    const __FIXVALUE = fixValue;

    return showListValues(__DYNREFS, __SHOWKEYS, __SHOWINDEX, __FILTER, __OBJFORMAT, __FIXVALUE);
}

// Gibt alle dynamischen RefIDs auf der Konsole aus.
// (1) Alle referenzierten Eintraege in der Form "VID : ID"
// return void
function logRefIDs() {
    const __ACCEPTED = false;
    const __REJECTED = true;
    const __SHOWKEYS = true;
    const __NOKEYS = false;
    const __NOINDEX = false;
    const __OBJFORMAT = true;

    __LOG[0]("Logging __DYNREFS");

    __LOG[2](showRefIDs(__ACCEPTED, __NOKEYS, __NOINDEX, __OBJFORMAT));
}

// ==================== Ende Abschnitt fuer YouTube VID-Logfunktionen fuer Referenzen ====================

// *** EOF ***
