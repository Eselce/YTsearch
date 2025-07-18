/****** JavaScript-Bibliothek 'lib.YT.base.js' ["BASE"] ******/

// Inhaltsverzeichnis:
// https://eselce.github.io/YTsearch/lib/<BASE>: 
//  YT.util.js
//  YT.util.video.js
//  YT.dom.js
//  YT.vid.js
//  YT.search.js

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

// ==================== Ende Abschnitt fuer YouTube VID-Utilities ====================

// *** EOF ***

/*** Ende Modul YT.vid.js ***/

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

