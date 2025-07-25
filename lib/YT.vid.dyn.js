// ==UserScript==
// _name         YT.vid.dyn
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
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube VID-Utilities ====================

const __DYNVIDS = { };
const __NEWVIDS2IMPORT = { };

// Initialisiert die dynamischen VID-Listen.
// storedVids: Liste (Object) mit gespeicherten Videos
// import: Importliste, die sich aus Ueberpruefung statischer VIDs ergab
// cleanUp: Angabe, ob URLs gekuerzt werden (siehe cleanURL())
// return true
async function initDynIDs(storedVids, imprt = null, cleanUp = false) {
    __LOG[0]("initDynIDs()");

    const __STOREDVIDS = storedVids;
    const __IMPORT = imprt;
    const __CLEANUP = cleanUp;

    // Only, if initIDs() can be called twice!
    //clearObj(__DYNVIDS, isRejected);
    //clearObj(__NEWVIDS2IMPORT);

    Object.assign(__NEWVIDS2IMPORT, __IMPORT);

    for (const [__KEY, __VALUE] of Object.entries(__STOREDVIDS)) {
        await checkAddID(__KEY, __VALUE, __CLEANUP);

        // Ignore static entry, there's a new kid in town!
        //delete __NEWVIDS2IMPORT[__KEY];
    }

    __LOG[0]("initDynIDs():", "Dynamic data initialized!", __DYNVIDS);

    return true;
}

// Kontrolliert die Plausibilitaet eines dynamischen Eintrags und addiert ihn.
// vid: VID, fuer die ein Eintrag in der dynamischen Liste gemacht wird
// url: Zu setzender Wert (URL oder 'N')
// cleanUp: Angabe, ob Parameter von der URL entfernt werden (Default: false)
// check: Angabe ueber Pruefung auf Einschraenkungen durch statische Listen (Default: true)
// add: Angabe, ob Eintrag der dynamischen Liste hinzugefuegt werden soll (Default: true)
// return Gesetzter Eintrag fuer diese VID
async function checkAddID(vid, url, cleanUp = false, check = true, add = true) {
    const __VID = vid;
    const __URL = (url || __FLAG_N);
    const __CLEANUP = cleanUp;
    const __CHECK = check;
    const __ADD = add;
    const __RAW = false;
    const __DBASEID = __LOVEBITESVIDS[__VID];
    const __REJECTID = __REJECTVIDS[__VID];
    const __NEWID = __NEWVIDS[__VID];
    const __CLEANURL = cleanURL(__URL);
    const __SETURL = ((__CLEANUP && __CLEANURL) ? __CLEANURL : __URL);
    const __INDBASE = ((typeof __DBASEID) !== "undefined");
    const __INREJECT = ((typeof __REJECTID) !== "undefined");
    const __INNEW = ((typeof __NEWID) !== "undefined");
    const __TRYREJECT = isRejected(__SETURL);
    const __REJECTED = (__INREJECT || __TRYREJECT);

    __LOG[2]("checkAddID()", __VID, '=', __SETURL);

    if (__CHECK) {
        if (__TRYREJECT) {
            if (__INDBASE) {
                showAlert("Data base VID " + __VID + " cannot be rejected!", __SETURL);
            }
            if (__INNEW) {
                showAlert("Static VID " + __VID + " cannot be rejected!", __SETURL);
            }
        }

        if (__INDBASE) {
            __LOG[1]("Dropping VID already in data base...");
            return false;
        } else if (__INREJECT) {
            if (__RAW || ! __TRYREJECT) {  // __RAW: always fail, else check if rejected ID!
                showAlert("Rejected VID " + __VID + " cannot be set!", __SETURL);
            } else {
                __LOG[1]("Dropping already rejected VID...");
            }
            return false;
        } else if (__INNEW) {
            __LOG[1]("Dropping already static VID...");
            return false;
        }
    }

    if (__ADD) {
        __DYNVIDS[__VID] = __SETURL;
    }

    return true;
}

// Findet einen Eintrag in der dynamischen Liste zur VID.
// vid: VID, fuer die ein Eintrag in der Liste gesucht wird
// return Gesetzter Eintrag fuer diese VID
function getID(vid) {
    const __VID = vid;

    return __DYNVIDS[__VID];
}

// Setzt fuer die VID einen Eintrag in der dynamischen Liste und speichert.
// vid: VID, fuer die ein Wert in der Liste gesetzt wird (URL oder 'N'/null)
// id: Zu setzender Wert (URL oder Sperreintrag 'N' oder null zum Loeschen)
// return Rueckgabewert von setOpt(), also die neue dynamische Liste
async function setID(vid, id) {
    const __OPTSET = __MAIN.optSet;
    const __VID = vid;
    const __ID = id;

    if (__VID) {
        if (__ID) {
            __DYNVIDS[__VID] = __ID;
        } else {
            delete __DYNVIDS[__VID];
        }
    }

    //__LOG[0](__DYNVIDS);
    //clearObj(__DYNVIDS, isRejected);
    //logIDs();

    return __OPTSET.setOpt('Links', __DYNVIDS, false);
}

// ==================== Ende Abschnitt fuer YouTube VID-Utilities ====================

// *** EOF ***
