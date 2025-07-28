// ==UserScript==
// _name         YT.vid.ref
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-spezifischen Funktionen fuer dynamische VIDs
// _require      https://eselce.github.io/YTsearch/lib/LOVEBITES.db.js
// _require      https://eselce.github.io/YTsearch/lib/REJECT.db.js
// _require      https://eselce.github.io/YTsearch/lib/NEW.db.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.dyn.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.ref.js
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube VID-Utilities ====================

const __DYNREFS = { };

// Initialisiert die dynamischen VID-Referenz-Listen.
// storedRefs: Liste (Object) mit gespeicherten Referenzen
// return true
async function initRefIDs(storedRefs) {
    __LOG[0]("initRefIDs()");

    const __STOREDREFS = storedRefs;

    // Only, if initRefIDs() can be called twice!
    //clearObj(__DYNREFS);

    for (const [__KEY, __VALUE] of Object.entries(__STOREDREFS)) {
        await checkAddRefID(__KEY, __VALUE);
    }

    __LOG[0]("initRefIDs():", "Dynamic reference data initialized!", __DYNREFS);

    return true;
}

// Kontrolliert die Plausibilitaet eines dynamischen Referenz-Eintrags und addiert ihn.
// vid: VID, fuer die ein Eintrag in der dynamischen Referenz-Liste gemacht wird
// refs: Zu setzender Wert (Object mit Referenzen)
// check: Angabe ueber Pruefung auf Einschraenkungen durch statische Listen (Default: true)
// add: Angabe, ob Eintrag der dynamischen Liste hinzugefuegt werden soll (Default: true)
// return Gesetzter Eintrag fuer diese VID
async function checkAddRefID(vid, refs, check = true, add = true) {
    const __VID = vid;
    const __REFS = refs;
    const __CHECK = check;
    const __ADD = add;

    __LOG[2]("checkAddRefID()", __VID, '=', __REFS);

    if (__CHECK) {
    }

    if (__ADD) {
        __DYNREFS[__VID] = __REFS;
    }

    return true;
}

// Findet die Eintraege in der dynamischen Referenz-Liste zur VID.
// vid: VID, fuer die die Eintraege in der Referenz-Liste gesucht werden
// return Array aller gesetzter Keys
function getRefID(vid) {
    const __VID = vid;
    const __REFS = __DYNREFS[__VID];
    const __KEYS = Object.keys(__REFS);

    return __KEYS;
}

// Findet die Eintraege in der dynamischen Referenz-Liste zur VID.
// vid: VID, fuer die die Eintraege in der Referenz-Liste gesucht werden
// id: Key des gesuchten Referenz (Datenbank-ID)
// return Wert der gesuchten Referenz, falls gefunden, null sonst
function hasRefID(vid, id) {
    const __VID = vid;
    const __ID = id;
    const __REFS = __DYNREFS[__VID];
    const __REF = getObjValue(__REFS, __ID, null);

    return __REF;
}

// Setzt fuer die VID einen Eintrag in der dynamischen Referenz-Liste und speichert.
// vid: VID, fuer die ein Wert in der Liste gesetzt wird (URL oder VID)
// id: Key des zu setzenden Wertes (Datenbank-ID der Referenz)
// ref: Zu setzender Wert (VID der Referenz)
// return Rueckgabewert von setOpt(), also die neue dynamische Liste
async function setRefID(vid, id, ref) {
    const __OPTSET = __MAIN.optSet;
    const __VID = safeVID(vid);
    const __ID = id;
    const __REF = safeVID(ref);

    if (__VID) {
        if (__ID) {
            const __OLDREFS = __DYNREFS[__VID];
            const __REFS = getValue(__OLDREFS, { });

            if (__REF) { 
                __REFS[__ID] = __REF;

                __LOG[4]("SetRefID(" + __VID + ', ' + __ID + ") = " + __REF + ' ' + getKeyString(__REFS));
            } else {
                __LOG[2]("SetRefID(" + __VID + ', ' + __ID + ") REMOVED " + __REFS[__ID]);

                delete __REFS[__ID];
            }

            if (! __OLDREFS) {
                __DYNREFS[__VID] = __REFS;
            }
        } else {
            __LOG[2]("SetRefID(" + __VID + ") REMOVED " + getKeyString(__DYNREFS[__VID]));

            delete __DYNREFS[__VID];
        }
    }

    //__LOG[0](__DYNREFS);
    //clearObj(__DYNREFS);
    //logRefIDs();

    return __OPTSET.setOpt('RefIDs', __DYNREFS, false);
}

// ==================== Ende Abschnitt fuer YouTube VID-Utilities ====================

// *** EOF ***
