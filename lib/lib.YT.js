/****** JavaScript-Bibliothek 'lib.YT.js' ["YT"] ******/

// Inhaltsverzeichnis:
// https://eselce.github.io/YTsearch/lib/<YT>: 
//  YT.util.js
//  YT.util.video.js
//  YT.named.js
//  YT.search.js
//  YT.vid.js
//  YT.vid.dyn.js
//  YT.vid.dyn.mod.js
//  YT.vid.log.js
//  YT.dom.js
//  YT.dom.mark.js
//  YT.dom.mark.mod.js

/*** Modul YT.util.js ***/

// ==UserModule==
// _name         YT.util
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-spezifischen Funktionen fuer Utilities
// _require      https://eselce.github.io/YTsearch/lib/YT.util.js
// ==/UserModule==

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

/*** Ende Modul YT.util.js ***/

/*** Modul YT.util.video.js ***/

// ==UserModule==
// _name         YT.util.video
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-spezifischen Funktionen fuer Videos
// _require      https://eselce.github.io/YTsearch/lib/YT.util.js
// _require      https://eselce.github.io/YTsearch/lib/YT.util.video.js
// ==/UserModule==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer YouTube-Videos ====================

const __VPREFIX = "";

// Reduziert eine URL oder VID auf die reine VID (von 11 Zeichen)
// url: URL oder VID eines YouTube Videos
// dflt: Default-Video, falls erfolglos
// prefix: Gemeinsamer Anfang der IDs, gehört nicht zur URL. Default: ""
// return VID mit Prefix bei Erfolg, und dflt, falls nicht
function safeVID(url, dflt = null, prefix = __VPREFIX) {  // strips url or VID to pure video-ID...
    const __PATTERNS = [  // /^([0-9A-Za-z_\-]{11})$/,  // This one is also done by the 4th of the other regExps!
                        /^\s*https?:\/\/(?:(?:www|m)\.)?youtube\.\S+\/watch\?v=([0-9A-Za-z_\-]{11})(?:&\S+=\S+)*(?:[\s,\(][\s\w,=\(\)\.:\/&\?"]*)?$/,
                        /^\s*https?:\/\/(?:(?:www|m)\.)?youtube\.\S+\/shorts\/([0-9A-Za-z_\-]{11})\/?(?:(?:\?\S+=\S+)(?:&\S+=\S+)*)?(?:[\s,\(][\s\w,=\(\)\.:\/&\?"]*)?$/,
                        /^\s*https?:\/\/(?:(?:www|m)\.)?youtube\.\S+\/live\/([0-9A-Za-z_\-]{11})\/?(?:(?:\?\S+=\S+)(?:&\S+=\S+)*)?(?:[\s,\(][\s\w,=\(\)\.:\/&\?"]*)?$/,
                        /^\s*https?:\/\/youtu\.be\/([0-9A-Za-z_\-]{11})\/?(?:(?:\?\S+=\S+)(?:&\S+=\S+)*)?(?:[\s,\(][\s\w,=\(\)\.:\/&\?"]*)?$/,
                        /^(?:[0-9\s,]*,)?([0-9A-Za-z_\-]{11})(?:,[\w\s,./\-=?:]*)?$/,
                        /^\[.*\] https?:\/\/youtu\.be\/([0-9A-Za-z_\-]{11})\/?(?:(?:\?\S+=\S+)(?:&\S+=\S+)*)?(?: DONE \(.*\))?$/ ];

    return safeID(url, dflt, __PATTERNS, prefix);
}

// Reduziert eine URL um alles hinter der VID (URL-Parameter usw.)
// url: URL oder VID eines YouTube Videos
// dflt: Default-Video, falls erfolglos
// prefix: Gemeinsamer Anfang der IDs, gehört nicht zur URL. Default: ""
// return Gekuerzte URL zur VID bei Erfolg, und "#ERROR", falls nicht
function cleanURL(url, dflt = null, prefix = __VPREFIX) {  // strips url or VID to clean video-URL... (without additional parameters)
    const __URL = (url || "");
    const __VID = (safeVID(url, dflt, prefix) || "");
    const __LEN = __VID.length;
    const __POS = __URL.indexOf(__VID);
    const __CLEANURL = ((__POS < 0) ? "#ERROR" : __URL.substring(0, __POS + __LEN));

    return __CLEANURL;
}

// Liefert auf einer geladenen YouTube-Seite alle Infos zu einem Video.
// anchor: Knoten im DOM-Baum, der zum Video-Eintrag gehoert
// href: Falls angegeben, diese URL nutzen und nicht bestimmen
// return Liefert ein __INFO-Object mit all den Daten
// - vid: VID
// - title: TITLE
// - channel: CHANNEL
// - href: HREF
// - text: TEXT
// - textRaw: TEXTRAW
// - titleRaw: TITLERAW
// - anchor: ANCHOR
// - anchorDown: ANCHORDOWN
// - superParent: SUPERPARENT
// - chNode: CHNODE
// - chNode1: CHNODE1
// - chNode2: CHNODE2
function getYTinfo(anchor, href = null) {
    if (! anchor) {
        return anchor;
    }

    const __ANCHOR = anchor;
    const __ANCHORDOWN = walkDownTags(__ANCHOR, "H3 SPAN");
    const __HREF = (href || (__ANCHOR && __ANCHOR.href));
    const __VID = safeVID(__HREF);
    const __TEXTRAW = (__ANCHOR && __ANCHOR.textContent);
    const __TEXT = trimMS(__TEXTRAW);
    const __TITLERAW = ((__ANCHORDOWN && __ANCHORDOWN.textContent) || __TEXTRAW);  // Use __ANCHOR, when __ANCHORDOWN fails!
    const __TITLE = trimMS(__TITLERAW);
    const __SUPERPARENT = ((__ANCHOR && __ANCHOR.parentNode && __ANCHOR.parentNode.parentNode) ? __ANCHOR.parentNode.parentNode.parentNode : null);
    //const __CHNODE = __ANCHOR.querySelector("#channel-name");
    const __CHNODE1 = __ANCHOR.querySelector("yt-formatted-string#text.style-scope.ytd-channel-name");
    const __CHNODE2 = (__SUPERPARENT ? __SUPERPARENT.querySelector("div#text-container.style-scope.ytd-channel-name") : null);
    const __CHNODE = (__CHNODE1 ? __CHNODE1 : __CHNODE2);
    const __INFO = { };

    __INFO.vid = __VID;
    __INFO.title = __TITLE;

    if (__CHNODE) {
        const __CHANNELRAW = __CHNODE.textContent;
        const __CHANNEL = trimMS(__CHANNELRAW);

        __INFO.channel = __CHANNEL;
    }

    if ((! __VID) || (__ANCHOR.YTlogged != __VID)) {
        if (__VID) {
            __LOG[2](__INFO);
        }

        __ANCHOR.YTlogged = __VID;
    }

    __INFO.href = __HREF;
    __INFO.text = __TEXT;
    __INFO.textRaw = __TEXTRAW;
    __INFO.titleRaw = __TITLERAW;
    __INFO.anchor = __ANCHOR;
    __INFO.anchorDown = __ANCHORDOWN;
    __INFO.superParent = __SUPERPARENT;
    __INFO.chNode = __CHNODE;
    __INFO.chNode1 = __CHNODE1;
    __INFO.chNode2 = __CHNODE2;

    return __INFO;
}

// ==================== Ende Abschnitt fuer YouTube-Videos ====================

// *** EOF ***

/*** Ende Modul YT.util.video.js ***/

/*** Modul YT.named.js ***/

// ==UserModule==
// _name         YT.named
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit spezifischen Funktionen fuer registrierte Funktionen
// _require      https://eselce.github.io/YTsearch/lib/YT.named.js
// ==/UserModule==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer registrierte Funktionen ====================

const __REGFUN = [];

// Registriert eine Funktion unter einem bestimmten Namen.
// name: Name, unter dem die Funktion zu finden sein wird
// fun: Die registrierte Callback-Funktion
// return Liefert die Funktion zurueck
function setRegFun(name, fun) {
    const __NAME = name;
    const __FUN = fun;

    __REGFUN[__NAME] = __FUN;

    return __FUN;
}

// Liefert eine unter einem Namen registrierte Funktion zurueck.
// Achtung: Moeglichst lieber direkt callRegFun() aufrufen!
// name: Name, unter dem die Funktion registriert ist
// return Liefert die Funktion zurueck, oder null, falls nicht registriert
function getRegFun(name) {
    const __NAME = name;
    const __FUN = __REGFUN[__NAME];

    return getValue(__FUN, null);
}

// Ruft eine unter einem Namen registrierte Funktion auf.
// name: Name, unter dem die Funktion registriert ist
// args: Parameter zum Aufruf
// return Liefert die Funktionsrueckgabe zurueck, oder null, falls nicht registriert
function callRegFun(name, ...args) {
    const __NAME = name;
    const __FUN = getRegFun(__NAME);
    const __THIS = null;

    return (__FUN ? __FUN.call(__THIS, ...args) : __THIS);
}

// ==================== Ende Abschnitt fuer registrierte Funktionen ====================

// *** EOF ***

/*** Ende Modul YT.named.js ***/

/*** Modul YT.search.js ***/

// ==UserModule==
// _name         YT.search
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit spezifischen Funktionen fuer Suchmuster
// _require      https://eselce.github.io/YTsearch/lib/YT.search.js
// ==/UserModule==

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

/*** Ende Modul YT.search.js ***/

/*** Modul YT.vid.js ***/

// ==UserModule==
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
// ==/UserModule==

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

// Findet einen Eintrag in allen Listen zur VID.
// vid: VID, fuer die ein Eintrag in den Listen gesucht wird (URL oder 'N')
// raw: Liefert 'N' statt null fuer einen Sperreintrag 'N' (Default: null)
// return Gesetzter Eintrag fuer diese VID
async function findID(vid, raw = false) {
    const __VID = vid;
    const __RAW = raw;
    const __DBASEID = __LOVEBITESVIDS[__VID];
    const __REJECTID = __REJECTVIDS[__VID];
    const __NEWID = __NEWVIDS[__VID];
    const __INDBASE = ((typeof __DBASEID) !== "undefined");
    const __INREJECT = ((typeof __REJECTID) !== "undefined");
    const __INNEW = ((typeof __NEWID) !== "undefined");

    if (__INDBASE) {
        return __DBASEID;  // Found in the data base, generated by report, provided by GitHub!
    } else if (__INREJECT) {
        if (__RAW || (! isRejected(__REJECTID))) {  // __RAW: return raw 'N' if rejected ID, URL otherwise (wrong entry)!
            return __REJECTID;  // Found as 'rejected' in static list, generated by log of dynamic list, provided by GitHub!
        } else {
            return null;  // null for 'N' (rejected ID)
        }
    } else if (__INNEW) {
        return __NEWID;  // Found in static list, containing VIDs that were not yet integrated into the data base, provided by GitHub!
    } else {  // Checking the dynamic list in the option "Links"...
        const __ID = callRegFun('getID', __VID);

        if (__RAW) {  // __RAW: return raw 'N' if rejected ID, URL otherwise, undefined if not found!
            return __ID;
        } else if (isRejected(__ID)) {
            return null;  // null for 'N' (rejected ID)
        } else if (__ID) {
            return __FLAG_NEW;  // 'NEW' (valid URL found)
        } else {
            return __ID;  // undefined (not found)
        }
    }
}

// ==================== Ende Abschnitt fuer YouTube VID-Utilities ====================

// *** EOF ***

/*** Ende Modul YT.vid.js ***/

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

/*** Ende Modul YT.vid.log.js ***/

/*** Modul YT.dom.js ***/

// ==UserModule==
// _name         YT.dom
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-spezifischen Funktionen fuer DOM-Baum
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.js
// ==/UserModule==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer bestimmte DOM Operationen ====================

// Wandelt die Eintraege einer Node-Liste in ein Array dieser Eintraege.
// list: DOM-Node-Liste, z.B. aus einem querySelectorAll()-Aufruf
// return Liefert ein Array mit denselben Eintraegen zur Weiterverarbeitung
function nodeList2Array(list) {
    const __LIST = list;
    const __ARR = [];

    for (let i = 0; i < __LIST.length; i++) {
        __ARR[i] = __LIST[i];
    }

    return __ARR;
}

// Sucht fuer ein DOM-Element den ersten Vorfahren, der ein bestimmter Tag ist.
// element: DOM-Knoten, bei dem begonnen wird
// tagName: Gesuchter Tagname, z.B. 'A' fuer einen Link
// return Liefert (Super-)Parent-Anchor, falls gefunden, null sonst
function findParentTag(element, tagName = 'A') {
    const __LEAF = element;
    let elem = __LEAF;

    while (elem && (elem.tagName != tagName)) {
        elem = elem.parentElement;
    }

    return elem;
}

// Sucht fuer ein DOM-Element den ersten Vorfahren, der ein <A> Link ist.
// Version fuer Maps, da der zweite Parameter als Index interpretiert wuerde!
// element: DOM-Knoten, bei dem begonnen wird
// return Liefert (Super-)Parent-Anchor, falls gefunden, null sonst
function findParentAnchorMap(element) {
    return findParentAnchor(element);  // Only one parameter, no index or arr!
}

// Sucht fuer ein DOM-Element den ersten Vorfahren, der ein <A> Link ist.
// element: DOM-Knoten, bei dem begonnen wird
// return Liefert (Super-)Parent-Anchor, falls gefunden, null sonst
function findParentAnchor(element) {
    return findParentTag(element, 'A');
}

// Findet erstes Child, das den Tags aus dem Array entspricht.
// anchor: DOM-Knoten, bei dem begonnen wird
// tagNameArr: Array mit moeglichen Tagnames
// return Liefert Child-Anchor, falls gefunden, null sonst
function getFirstTagEx (anchor, tagNameArr) {
    const __ANCHOR = anchor;
    const __TAGNAMEARR = tagNameArr;

    if (__ANCHOR) {
        const __CHILDREN = __ANCHOR.children;

        for (const __CHILD of __CHILDREN) {
            for (const __TAG of __TAGNAMEARR) {
                if (! String(__TAG).localeCompare(__CHILD.tagName)) {  // case insensitive!
                    return __CHILD;
                }
            }
        }
    }

    return null;
}


// Findet erstes Child, das den Tags aus dem Array entspricht.
// anchor: DOM-Knoten, bei dem begonnen wird
// tagNames: Array oder String mit moeglichen Tagnames (durch Leerzeichen getrennt)
// return Liefert Child-Anchor, falls gefunden, null sonst
function getFirstTag(anchor, tagNames) {
    const __TAGNAMEARR = (Array.isArray(tagNames) ? tagNames : tagNames.split(' '));

    return getFirstTagEx(anchor, __TAGNAMEARR);
}

// Wandert von einem DOM-Knoten abwaerts, solange Tags aus dem Array gefunden
// werden. Es wird immer in den ersten Treffer herabgestiegen. Simpel.
// anchor: DOM-Knoten, bei dem begonnen wird
// tagNameArr: Array mit moeglichen Tagnames
// return Liefert den letzten gefundenen anchor zurueck (also ohne gueltige Childs)
function walkDownTagsEx(anchor, tagNameArr) {
    const __ANCHOR = anchor;
    const __TAGNAMEARR = tagNameArr;
    const __RETNODE = getFirstTagEx(__ANCHOR, __TAGNAMEARR);

    if (__RETNODE) {
        return walkDownTagsEx(__RETNODE, __TAGNAMEARR);
    } else {
        return __ANCHOR;
    }
}

// Wandert von einem DOM-Knoten abwaerts, solange Tags aus dem Array gefunden
// werden. Es wird immer in den ersten Treffer herabgestiegen. Aufruf-Version.
// anchor: DOM-Knoten, bei dem begonnen wird
// tagNames: Array oder String mit moeglichen Tagnames (durch Leerzeichen getrennt)
// return Liefert den letzten gefundenen anchor zurueck (also ohne gueltige Childs)
function walkDownTags(anchor, tagNames) {
    const __TAGNAMEARR = (Array.isArray(tagNames) ? tagNames : tagNames.split(' '));

    return walkDownTagsEx(anchor, __TAGNAMEARR);
}

// ==================== Ende Abschnitt fuer bestimmte DOM Operationen ====================

// *** EOF ***

/*** Ende Modul YT.dom.js ***/

/*** Modul YT.dom.mark.js ***/

// ==UserModule==
// _name         YT.dom.mark
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit Funktionen zur Markierung bestimmter Videos
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.js
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.mark.js
// ==/UserModule==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer Markierung bestimmter Videos ====================

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
    const __MESSAGE = __TEXT + '\n\n' + "Accept " + __VID + __CHANNELADD + " (Y/N)?";
    const __DEFAULT = 'Y';

    __LOG[0](__MESSAGE);

    const __ANSWER = askUser(__MESSAGE, __DEFAULT, (answer => answer.match(/^[nyj]{1}$/i)));

    return (__ANSWER && (__ANSWER.toUpperCase() !== 'N'));
}

// Markiert einen Videolink aufgrund der Parameter.
// anchor: DOM-Video-Link, z.B. in Vorschlaegen, Suche, Verlinkung
// bold: Macht den Titel fett
// color: Faerbt den Titel ein
// label: Fuegt einen Hinweis for dem Titel ein (z.B. die VID)
// return Liefert den anchor zurueck
function markAnchorEx(anchor, bold, color, label) {
    const __ANCHOR = walkDownTags(anchor, "H3 SPAN");
    const __BOLD = bold;
    const __COLOR = color;
    const __LABEL = label;
    const __TEXTRAW = (__ANCHOR && __ANCHOR.textContent);
    const __TEXT = trimMS(__TEXTRAW);
    const __TEXTNEW = __LABEL + ' ' + __TEXT;
    //const __HTML = (__ANCHOR && __ANCHOR.innerHTML);

    if (__ANCHOR) {
        __ANCHOR.textContent = __TEXTNEW;

        formatCell(__ANCHOR, __BOLD, __COLOR);
    }

    return __ANCHOR;
}

// Markiert einen Videolink gruen (OK, anerkannt).
// anchor: DOM-Video-Link, z.B. in Vorschlaegen, Suche, Verlinkung
// vid: Video-ID. Wird sichtbar im Titel untergebracht!
// id: Datenbank-ID dieser VID. Wird ebenfalls ausgegeben!
// return Liefert den anchor zurueck
function markAnchorOK(anchor, vid, id) {
    const __ANCHOR = anchor;
    const __VID = vid;
    const __ID = id;
    const __BOLD = true;
    const __COLOR = 'darkgreen';

    return markAnchorEx(__ANCHOR, __BOLD, __COLOR, '[' + __ID + ' ' + __VID + ']');
}

// Markiert einen Videolink rot (No, abgelehnt).
// anchor: DOM-Video-Link, z.B. in Vorschlaegen, Suche, Verlinkung
// vid: Video-ID. Wird sichtbar im Titel untergebracht!
// return Liefert den anchor zurueck
function markAnchorNo(anchor, vid) {
    const __ANCHOR = anchor;
    const __VID = vid;
    const __BOLD = true;
    const __COLOR = 'red';

    return markAnchorEx(__ANCHOR, __BOLD, __COLOR, '(' + __VID + ')');
}

// Markiert einen Videolink orange (Null, unbekannt, Muster passt).
// anchor: DOM-Video-Link, z.B. in Vorschlaegen, Suche, Verlinkung
// vid: Video-ID. Wird sichtbar im Titel untergebracht 
// return Liefert den anchor zurueck
function markAnchorNull(anchor, vid) {
    const __ANCHOR = anchor;
    const __VID = vid;
    const __BOLD = true;
    const __COLOR = 'orange';

    return markAnchorEx(__ANCHOR, __BOLD, __COLOR, '(' + __VID + ')');
}

// Markiert einen Videolink je nach Status gruen, rot oder orange, falls noetig.
// Version fuer Maps, da der zweite Parameter als Index interpretiert wuerde!
// anchor: DOM-Video-Link, z.B. in Vorschlaegen, Suche, Verlinkung
// return Liefert den anchor zurueck
function markAnchorMap(anchor) {
    return markAnchor(anchor);  // Only one parameter, no index or arr!
}

// Markiert einen Videolink je nach Status gruen, rot oder orange, falls noetig.
// anchor: DOM-Video-Link, z.B. in Vorschlaegen, Suche, Verlinkung
// href: Falls angegeben, diese URL statt ermittelter benutzen 
// return Liefert den anchor zurueck
async function markAnchor(anchor, href) {
    const __OPTSET = __MAIN.optSet;
    const __ANCHOR = anchor;
    const __INFO = getYTinfo(__ANCHOR, href);
    let ret = __ANCHOR;

    if (__INFO) {
        const __VID = __INFO.vid;
        const __TEXT = __INFO.text;
        const __CHANNEL = __INFO.channel;
        const __CHANNELADD = (__CHANNEL ? " / '" + __CHANNEL + "'" : "");

        if (__ANCHOR.YTnewMark) {
            if (__VID != __ANCHOR.YTnewMark) {
                const __SHOWALERT = await __OPTSET.getOptValue('alertInconsistency', false);

                __LOG[0](__ANCHOR.YTnewMark, "=>", __VID, __TEXT);

                if (__SHOWALERT) {
                    showAlert(__VID + " != " + __ANCHOR.YTnewMark, __TEXT);
                }

                __ANCHOR.YTnewMark = __VID;  // Don't show message again for this entry!

                return ret;
            }
        }

        if (__VID && ! __ANCHOR.YTnewMark) {
            const __RAW = true;  // deliver 'N' for rejected IDs
            const __ID = await findID(__VID, __RAW);
            const __REJECTED = isRejected(__ID);

            if (__ID && ! __REJECTED) {
                __LOG[2]("Found", __VID, __ID);
            } else if (__REJECTED) {
                __LOG[2]("Rejected", __VID);
            } else {
                __LOG[2]("Checked", __VID);
            }

            __ANCHOR.YTnewMark = __VID;

            if (__ID && ! __REJECTED) {
                ret = markAnchorOK(__ANCHOR, __VID, __ID);
            } else if (__REJECTED) {
                ret = markAnchorNo(__ANCHOR, __VID);
            } else if (matchSearch(__TEXT)) {
                ret = await callRegFun('handleNewMatch', __INFO);
            }
        }
    }

    return ret;
}

// Behandelt Markierung eines passenden Videolinks mit statischen IDs.
// info: Informationen ueber den Link, siehe getYTinfo()
// return Liefert den anchor zurueck
async function handleNewMatchStatic(info, id) {
    const __INFO = info;
    const __ANCHOR = __INFO.anchor;
    const __VID = __INFO.vid;
    const __RET = markAnchorNull(__ANCHOR, __VID);

    return __RET;
}

function markTitles(delay = 1000, repeat = 1500) {
    const __DELAY = delay;
    const __REPEAT = repeat;

    const __WORKER = function() {
        const __TITLELIST = getElements("A>SPAN, #video-title");  // __LOG[0](__TITLELIST);
        //const __TITLE = getElement('[CLASS="style-scope ytd-watch-metadata"][FORCE-DEFAULT-STYLE=""]');  // __LOG[0](__TITLE);
        //const __MARKED = (__TITLE ? markAnchor(__TITLE, window.location.href) : __TITLE);  // __LOG[0](__MARKED);
        const __TITLES = nodeList2Array(__TITLELIST);  // __LOG[0](__TITLES);
        const __ANCHORS = __TITLES.map(findParentAnchorMap);  // __LOG[0](__ANCHORS);
        const __RESULT = __ANCHORS.map(markAnchorMap);  // __LOG[0](__RESULT);

        setTimeout(__WORKER, __REPEAT);
    }

    setTimeout(__WORKER, __DELAY);

    return true;
}

// ==================== Ende Abschnitt fuer Markierung bestimmter Videos ====================

// *** EOF ***

/*** Ende Modul YT.dom.mark.js ***/

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
    const __MESSAGE = __TEXT + '\n\n' + "Accept " + __VID + __CHANNELADD + " (Y/N)?";
    const __DEFAULT = 'Y';

    __LOG[0](__MESSAGE);

    const __ANSWER = askUser(__MESSAGE, __DEFAULT, (answer => answer.match(/^[nyj]{1}$/i)));

    return (__ANSWER && (__ANSWER.toUpperCase() !== 'N'));
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

