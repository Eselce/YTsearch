// ==UserScript==
// _name         YT.vid
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-spezifischen Funktionen fuer VIDs
// _require      https://eselce.github.io/YTsearch/lib/LOVEBITES.db.js
// _require      https://eselce.github.io/YTsearch/lib/REJECT.db.js
// _require      https://eselce.github.io/YTsearch/lib/NEW.db.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.js
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube VID-Utilities ====================

const __FLAG_N = 'N'
const __FLAG_NEW = 'NEW';

// Gibt an, ob das uebergebene Item (etwa eine URL, 'N' oder 'NEW')
// ein Sperreintrag 'N' ist. Wird als Filter in VID-Liste genutzt.
// item: Eintrag in einer VID-Liste, die 'N' und 'NEW' unterstuetzt
// return true, falls Sperreintrag 'N', false sonst
function isRejected(item) {
    return (item === __FLAG_N);
}

// Gibt an, ob das uebergebene Item (etwa eine URL, 'N' oder 'NEW')
// ein Neueintrag 'NEW' ist. Wird als Filter in VID-Liste genutzt.
// item: Eintrag in einer VID-Liste, die 'N' und 'NEW' unterstuetzt
// return true, falls Neueintrag 'NEW', false sonst
function isNew(item) {
    return (item === __FLAG_NEW);
}

// Initialisiert die VID-Listen. Basis-Version fuer die statischen Listen.
// In dieser Basis-Version nur Ueberpruefung der statischen Listen.
// return Importliste, die sich aus der Ueberpruefung ergab
async function initStaticIDs() {
    __LOG[0]("initStaticIDs()");

    const __IMPORT = await checkStaticIDs();

    __LOG[0]("initStaticIDs():", "Static data initialized!");

    //logIDs();

    return __IMPORT;
}

// Ueberprueft die statischen IDs auf Konsistenz.
// return Importliste, die sich aus der Ueberpruefung ergibt
async function checkStaticIDs() {
    const __IMPORT = { };

    for (const __VID of Object.keys(__REJECTVIDS)) {
        const __DBASEID = __LOVEBITESVIDS[__VID];
        const __NEWID = __NEWVIDS[__VID];
        const __INDBASE = ((typeof __DBASEID) !== "undefined");
        const __INNEW = ((typeof __NEWID) !== "undefined");

        __LOG[2]("checkStaticIDs()", __VID, '=', __FLAG_N);

        if (__INDBASE) {
            showAlert("Rejected VID in data base!", __VID);
        }
        if (__INNEW) {
            showAlert("Rejected VID in static list!", __VID);
        }
    }

    for (const __VID of Object.keys(__NEWVIDS)) {
        const __DBASEID = __LOVEBITESVIDS[__VID];
        const __INDBASE = ((typeof __DBASEID) !== "undefined");

        __LOG[2]("checkStaticIDs()", __VID, '=', __FLAG_NEW);

        if (__INDBASE) {  // can't have it also in (static) __NEWVIDS without a comment!
            __LOG[4]("Static VID " + __VID + " is already in the data base!");
        } else {  // Candidate for import...
            __IMPORT[__VID] = __VID;
        }
    }

    return __IMPORT;
}

// ==================== Ende Abschnitt fuer YouTube VID-Utilities ====================

// *** EOF ***
