/****** JavaScript-Bibliothek 'lib.YT.ext.js' ["EXT"] ******/

// Inhaltsverzeichnis:
// https://eselce.github.io/YTsearch/lib/<EXT>: 
//  YT.vid.dyn.js
//  YT.vid.dyn.mod.js
//  YT.vid.log.js
//  YT.vid.ref.js
//  YT.vid.ref.log.js
//  YT.dom.mark.mod.js

/*** Modul YT.vid.dyn.js ***/

// ==UserModule==
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
// ==/UserModule==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube VID-Utilities ====================

const __DYNVIDS = { };
const __NEWVIDS2IMPORT = { };

// Initialisiert die dynamischen VID-Listen.
// storedVids: Liste (Object) mit gespeicherten Videos
// imprt: Importliste, die sich aus Ueberpruefung statischer VIDs ergab
// cleanUp: Angabe, ob URLs gekuerzt werden (siehe cleanURL())
// return true
async function initDynIDs(storedVids, imprt = null, cleanUp = false) {
    __LOG[0]("initDynIDs()");

    const __STOREDVIDS = storedVids;
    const __IMPORT = imprt;
    const __CLEANUP = cleanUp;

    // Only, if initDynIDs() can be called twice!
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

/*** Ende Modul YT.vid.dyn.js ***/

/*** Modul YT.vid.dyn.mod.js ***/

// ==UserModule==
// _name         YT.dyn.mod
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit Funktionen zur Modifizierung der dynamischen VIDs
// _require      https://eselce.github.io/YTsearch/lib/LOVEBITES.db.js
// _require      https://eselce.github.io/YTsearch/lib/REJECT.db.js
// _require      https://eselce.github.io/YTsearch/lib/NEW.db.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.dyn.js
// _require      https://eselce.github.io/YTsearch/lib/YT.vid.dyn.mod.js
// ==/UserModule==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube VID-Utilities ====================

// Setzt fuer die passende VID die uebergebene URL in der dynamischen Liste.
// url: Zu setzende URL/VID (fuer Sperreintraege gibt es rejectURL())
// text: Beschreibender Text (Titel) fuer die Konsolenausgabe
// channelAdd: Beschreibender Text (Channel) fuer die Konsolenausgabe
// return Rueckgabewert von setOpt(), also die neue dynamische Liste
async function acceptURL(url, text, channelAdd) {
    const __VID = safeVID(url);
    const __CLEANURL = cleanURL(url);
    const __TEXT = (text ? '(' + text + ')' : "");
    const __CHANNELADD = channelAdd;

    __LOG[0](__VID, '=', __CLEANURL + __CHANNELADD, __TEXT);

    return setID(__VID, __CLEANURL);
}

// Setzt fuer die passende VID einen Sperreintrag 'N' in der dynamischen Liste.
// url: Zur VID passende URL (die in der Liste auf 'N' gesetzt wird)
// text: Beschreibender Text (Titel) fuer die Konsolenausgabe
// channelAdd: Beschreibender Text (Channel) fuer die Konsolenausgabe
// return Rueckgabewert von setOpt(), also die neue dynamische Liste
async function rejectURL(url, text, channelAdd) {
    const __VID = safeVID(url);
    const __NOID = __FLAG_N;
    const __TEXT = (text ? '(' + text + ')' : "");
    const __CHANNELADD = channelAdd;

    __LOG[0]("Will no longer ask for", __VID + __CHANNELADD, __TEXT);

    return setID(__VID, __NOID);
}

// Entfernt eine VID mit URL oder Sperreintrag 'N' in der dynamischen Liste.
// url: Zur VID passende URL (die in der Liste entfernt wird)
// text: Beschreibender Text (Titel) fuer die Konsolenausgabe
// channelAdd: Beschreibender Text (Channel) fuer die Konsolenausgabe
// return Rueckgabewert von setOpt(), also die neue dynamische Liste
async function deleteURL(url, text, channelAdd) {
    const __VID = safeVID(url);
    const __FREEID = null;
    const __TEXT = (text ? '(' + text + ')' : "");
    const __CHANNELADD = channelAdd;

    __LOG[0]("Ignoring", __VID + __CHANNELADD, __TEXT);

    return setID(__VID, __FREEID);
}

// ==================== Ende Abschnitt fuer YouTube VID-Utilities ====================

// *** EOF ***

/*** Ende Modul YT.vid.dyn.mod.js ***/

/*** Modul YT.vid.log.js ***/

// ==UserModule==
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
// ==/UserModule==

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
            const __RAWVALUE = (__FIXVALUE || value);
            const __VALUE = (((typeof __RAWVALUE) === 'object')
                                ? getKeyString(__RAWVALUE)
                                : (__OBJFORMAT ? ("'" + __RAWVALUE + "'") : __RAWVALUE));
            const __INDEX = index;

            ret = ret + (__OBJFORMAT ? ("'" + __KEY + "'   : " + __VALUE + ',')
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

/*** Ende Modul YT.vid.log.js ***/

/*** Modul YT.vid.ref.js ***/

// ==UserModule==
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
// ==/UserModule==

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

/*** Ende Modul YT.vid.ref.js ***/

/*** Modul YT.vid.ref.log.js ***/

// ==UserModule==
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
// ==/UserModule==

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

/*** Ende Modul YT.vid.ref.log.js ***/

/*** Modul YT.dom.mark.mod.js ***/

// ==UserModule==
// _name         YT.dom.mark.mod
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit Funktionen zur Interaktionen bei Markierung von Videos
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.js
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.mark.js
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.mark.mod.js
// ==/UserModule==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer Interaktionen bei Markierung von Videos ====================

// Fragt nach dem Status eines Videolinks.
// vid: Video-ID. Diese gilt es zu bestaetigen!
// href: URL des Videos. Wird bisher nicht genutzt!
// text: Text aus dem Titel
// channelAdd: Ggfs. Verweis auf den Channel als Hilfestellung 
// return Liefert den anchor zurueck
function askNewLink(vid, href, text, channelAdd) {
    const __VID = vid;
    const __HREF = href;
    const __TEXT = (text || "(null)");
    const __CHANNELADD = channelAdd;
    const __LABEL = __TEXT;
    const __MESSAGE = "Accept " + __VID + __CHANNELADD + " (Y/N)?";
    const __DEFAULT = 'Y';

    __LOG[0](__MESSAGE);

    const __ANSWER = askUser(__LABEL, __MESSAGE, __DEFAULT, (answer => answer.match(/^[nyj]{1}$/i)));
    //const __ANSWER = showMessage(__LABEL, ___MESSAGE);

    return (__ANSWER && (__ANSWER.toUpperCase() !== 'N'));
}

// Ueberprueft Link in Beschreibung und speichert ggfs. eine Referenz.
// anchor: DOM-Video-Link, hier in Beschreibung
// vid: Video-ID
// id: Datenbank-ID dieser VID
// return void
async function checkRef(anchor, vid, id) {
    const __OPTSET = __MAIN.optSet;
    const __ANCHOR = anchor;
    const __VID = vid;
    const __ID = id;
    const __PARENT = findParentAnchor(__ANCHOR);
    const __SUPERPARENT = findParentTag(__PARENT, 'DIV');
    const __SUPERID = __SUPERPARENT.id;
    const __CHECKREF = __PARENT.checkRef;

    if (__SUPERID && ! __CHECKREF) {
        __PARENT.checkRef = (__SUPERID || 'unbekannt');

        const __DOCHREF = document.documentURI;
        const __DOCVID = safeVID(__DOCHREF);
        const __DOCID = await findID(__DOCVID);

        if (__DOCID) {
            //__LOG[0]("REFERENZ", __SUPERID, __ID, __VID, __DOCID, __DOCVID);

            if (hasRefID(__DOCVID, __ID)) {  // TODO __ID leer oder 'N'
                __LOG[4]("REFERENZ", __SUPERID, __ID, __VID, __DOCID, __DOCVID);
            } else {
                const __TEXTRAW = (__ANCHOR && __ANCHOR.textContent);
                const __TEXT = trimMS(__TEXTRAW);
                const __LABEL = "Referenz (" + __SUPERID + ") " + __DOCID + ' ' + __DOCVID + " = " + __ID;
                const __SHOW = (__SUPERID === 'snippet');
                const __ASKREF = await __OPTSET.getOptValue('askRef', false);

                const __ANSWER = (__ASKREF ? showMessage(__LABEL, __TEXT, __SHOW) : true);
                //const __ANSWER = (__ASKREF ? showAlert(__LABEL, __TEXT, undefined, __SHOW) : true);

                if (__ANSWER !== __FLAG_N) {
                    setRefID(__DOCVID, __ID, __VID);
                }
            }
        }
    }
}

// Behandelt Markierung eines passenden Videolinks mit dynamischen IDs.
// info: Informationen ueber den Link, siehe getYTinfo()
// return Liefert den anchor zurueck
async function handleNewMatchDyn(info) {
    const __OPTSET = __MAIN.optSet;
    const __INFO = info;
    const __ANCHOR = __INFO.anchor;
    const __HREF = __INFO.href;
    const __VID = __INFO.vid;
    const __TEXT = __INFO.text;
    const __CHANNEL = __INFO.channel;
    const __CHANNELADD = (__CHANNEL ? " / '" + __CHANNEL + "'" : "");
    const __ASKNEW = await __OPTSET.getOptValue('askNew', false);
    let ret = __ANCHOR;
    let addNew = false;

    if (__ASKNEW) {
        addNew = askNewLink(__VID, __HREF, __TEXT, __CHANNELADD);
    }

    if (addNew === null) {  // abgebrochen, keine Festlegung!
        __LOG[0](__VID + __CHANNELADD, "ignored", '(' + __TEXT + ')');
    } else if (addNew) {
        const __ID = __FLAG_NEW;

        await acceptURL(__HREF, __TEXT, __CHANNELADD);

        ret = markAnchorOK(__ANCHOR, __VID, __ID);
    } else {
        await rejectURL(__VID, __TEXT, __CHANNELADD);

        ret = markAnchorNo(__ANCHOR, __VID);
    }

    return ret;
}

// ==================== Ende Abschnitt fuer Interaktionen bei Markierung von Videos ====================

// *** EOF ***

/*** Ende Modul YT.dom.mark.mod.js ***/

