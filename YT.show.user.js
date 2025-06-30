// ==UserScript==
// @name         YT.show
// @namespace    http://youtube.com/
// @version      0.10+lib
// @copyright    2025+
// @author       Sven Loges (SLC)
// @description  Light version of YT.new - Script for Greasemonkey 4.0
// @include      /^https?://www\.youtube\.com/.*$/
// @include      /^https?://youtu\.be/.*$/
// @grant        GM.info
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant        GM_info
// @run-at       document-idle
// @require      https://eselce.github.io/GitTest/misc/OS2/lib/lib.all.js
// @require      https://eselce.github.io/YTsearch/lib/LOVEBITES.db.js
// @require      https://eselce.github.io/YTsearch/lib/REJECT.db.js
// @require      https://eselce.github.io/YTsearch/lib/NEW.db.js
// ==/UserScript==

// ECMAScript 9:
/* jshint esversion: 9 */

/* eslint no-multi-spaces: "off" */

// ==================== Konfigurations-Abschnitt fuer Optionen ====================

const __LOGLEVEL = 4;

// Moegliche Optionen (hier die Standardwerte editieren oder ueber das Benutzermenu setzen):
const __OPTCONFIG = {
    'searchRE' : {  // Array mit String-Versionen der Suchmuster (RegExp) der gesuchten Videos, nur eines der Muster muss passen
                   'Name'      : "searchRE",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'Permanent' : false,
                   'Default'   : [ "LOVE.?BITES?",
                                  "Miyako",
                                  "Fami[^l]",
                                  "Asami",
                                  "Midori",
                                  "Haru(na|pi)",
                                  "Miho",
                                  "\u30E9\u30D6\u30D0\u30A4\u30C4",  // ラブバイツ
                                  "Rabubaitsu",
                                  "Wolf.?pack",
                                  "DESTROSE",
                                  "21g",
                                  "DROP OF JOKER",
                                  "SONIC LOVER RECKLESS",
                                  "Gekijo",
                                  "METALicche",
                                  "Lust.?Queen",
                                  "CHAOS.?CONTROL" ],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 100,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "Suchmuster:"
               },
    'reset' : {           // Optionen auf die "Werkseinstellungen" zuruecksetzen
                   'FormPrio'  : undefined,
                   'Name'      : "reset",
                   'Type'      : __OPTTYPES.SI,
                   'Action'    : __OPTACTION.RST,
                   'Label'     : "Standard-Optionen",
                   'Hotkey'    : 'O',
                   'FormLabel' : ""
               },
    'storage' : {         // Browserspeicher fuer die Klicks auf Optionen
                   'FormPrio'  : undefined,
                   'Name'      : "storage",
                   'Type'      : __OPTTYPES.MC,
                   'ValType'   : 'String',
                   'Choice'    : Object.keys(__OPTMEM),
                   'Default'   : __OPTMEM.inaktiv,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Speicher: $",
                   'Hotkey'    : 'c',
                   'FormLabel' : "Speicher:|$"
               },
    'oldStorage' : {      // Vorheriger Browserspeicher fuer die Klicks auf Optionen
                   'FormPrio'  : undefined,
                   'Name'      : "oldStorage",
                   'Type'      : __OPTTYPES.SD,
                   'ValType'   : 'String',
                   'Default'   : 'inaktiv',
                   'PreInit'   : true,
                   'AutoReset' : true,
                   'Hidden'    : true
               },
    'showForm' : {        // Optionen auf der Webseite (true = anzeigen, false = nicht anzeigen)
                   'FormPrio'  : undefined,
                   'Name'      : "showForm",
                   'Type'      : __OPTTYPES.SW,
                   'FormType'  : __OPTTYPES.SI,
                   'Permanent' : true,
                   'Default'   : false,
                   'Title'     : "$V Optionen",
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Optionen anzeigen",
                   'Hotkey'    : 'a',
                   'AltTitle'  : "$V schlie\u00DFen",
                   'AltLabel'  : "Optionen verbergen",
                   'AltHotkey' : 'v',
                   'FormLabel' : ""
               }
};

// ==================== Ende Konfigurations-Abschnitt fuer Optionen ====================

const __VPREFIX = '';

function safeID(url, dflt = null, patterns = null, prefix = __VPREFIX) {  // strips ID to pure ID according to the patterns...
    const __URL = String(url).split("\n")[0].trim();  // only one line (multi-line makes it complicated)
    const __FULLURL = ((__URL.startsWith('/')) ? "https://www.youtube.de" : "") + __URL;
    const __PATTERNS = (patterns || [ /^(?:[0-9\s,]*,)?([0-9A-Za-z_\-]+)(?:,[\w\s,./\-=?:]*)?$/ ]);

    for (let pattern of __PATTERNS) {
        if (pattern.test(__FULLURL)) {
            const __URL = __FULLURL.replace(pattern, '$1');

            return (prefix + __URL);
        }
    }

    return dflt;
}

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

function nodeList2Array(list) {
    const __LIST = list;
    const __ARR = [];

    for (let i = 0; i < __LIST.length; i++) {
        __ARR[i] = __LIST[i];
    }

    return __ARR;
}

function findParentTag(element, tagName = 'A') {
    const __LEAF = element;
    let elem = __LEAF;

    while (elem && (elem.tagName != tagName)) {
        elem = elem.parentElement;
    }

    return elem;
}

function findParentAnchorMap(element) {
    return findParentAnchor(element);  // Only one parameter, no index or arr!
}

function findParentAnchor(element) {
    return findParentTag(element, 'A');
}

function getFirstTagEx (anchor, tagNameArr) {
    const __ANCHOR = anchor;
    const __TAGNAMEARR = tagNameArr;

    if (__ANCHOR) {
        const __CHILDREN = __ANCHOR.children;

        for (let child of __CHILDREN) {
            for (let tag of __TAGNAMEARR) {
                if (! String(tag).localeCompare(child.tagName)) {  // case insensitive!
                    return child;
                }
            }
        }
    }

    return null;
}

function getFirstTag(anchor, tagNames) {
    const __TAGNAMEARR = (Array.isArray(tagNames) ? tagNames : tagNames.split(' '));

    return getFirstTagEx(anchor, __TAGNAMEARR);
}

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

function walkDownTags(anchor, tagNames) {
    const __TAGNAMEARR = (Array.isArray(tagNames) ? tagNames : tagNames.split(' '));

    return walkDownTagsEx(anchor, __TAGNAMEARR);
}

function trimMS(s) {
    const __INPUT = (s || "");
    const __RET = __INPUT.trim().replaceAll(/(\s\s+|\n)/g, " ");

    return __RET;
}

const __FLAG_N = 'N'

async function findID(vid, raw = false) {
    const __VID = vid;
    const __RAW = raw;
    const __DBASEID = __LOVEBITESVIDS[__VID];
    const __REJECTID = __REJECTVIDS[__VID];
    const __NEWID = __NEWVIDS[__VID];

    if ((typeof __DBASEID) !== "undefined") {
        return __DBASEID;  // Found in the data base, generated by report, provided by GitHub!
    } else if ((typeof __REJECTID) !== "undefined") {
        if (__RAW || (__REJECTID !== __FLAG_N)) {  // __RAW: return raw 'N' if rejected ID, URL otherwise (wrong entry)!
            return __REJECTID;  // Found as 'rejected' in static list, generated by log of dynamic list, provided by GitHub!
        } else {
            return null;  // null for 'N' (rejected ID)
        }
    } else if ((typeof __NEWID) !== "undefined") {
        return __NEWID;  // Found in static list, containing VIDs that were not yet integrated into the data base, provided by GitHub!
    } else {
        return undefined;  // Not found in static lists!
    }
}

//const __SEARCHPATTERN = /(LOVE.?BITES?|Miyako|Fami[^l]|Asami|Midori|Haru(na|pi)|Miho|Wolf.?pack|DESTROSE|21g|DROP OF JOKER|SONIC LOVER RECKLESS|Gekijo|METALicche|Lust.?Queen|CHAOS.?CONTROL)/i;

const __SEARCHPATTERNS = [];

async function initSearch(optSet = __MAIN.optSet, flags = 'i') {
    const __OPTSET = optSet;
    const __FLAGS = flags;
    const __PATTERNS = await __OPTSET.getOptValue('searchRE', []);

    __SEARCHPATTERNS.length = 0;  // Empty array (dirty)

    for (let pattern of __PATTERNS) {
        const __REGEXP = new RegExp(pattern, __FLAGS);

        __SEARCHPATTERNS.push(__REGEXP);
    }

    const __COUNT = __SEARCHPATTERNS.length;

    __LOG[0]("initSearch():", "Search initialized with " + __COUNT + " patterns!", __SEARCHPATTERNS);

    return __COUNT;
}

function matchSearch(title) {
    const __TITLE = title;

    for (let regExp of __SEARCHPATTERNS) {
        const __MATCH = __TITLE.match(regExp);

        if (__MATCH) {
            return __MATCH;
        }
    }

    return null;

    //return __TITLE.match(__SEARCHPATTERN);
}

function getYTinfo(anchor, href) {
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
    __INFO.title = __TITLE

    if (__CHNODE) {
        const __CHANNELRAW = __CHNODE.textContent;
        const __CHANNEL = trimMS(__CHANNELRAW);

        __INFO.channel = __CHANNEL;
    }

    if ((! __VID) || (__ANCHOR.YTlogged != __VID)) {
        if (__VID) {
            //__LOG[1](__INFO);
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

function markAnchorOK(anchor, vid, id) {
    const __ANCHOR = anchor;
    const __VID = vid;
    const __ID = id;
    const __BOLD = true;
    const __COLOR = 'darkgreen';

    return markAnchorEx(__ANCHOR, __BOLD, __COLOR, '[' + __ID + ' ' + __VID + ']');
}

function markAnchorNo(anchor, vid) {
    const __ANCHOR = anchor;
    const __VID = vid;
    const __BOLD = true;
    const __COLOR = 'red';

    return markAnchorEx(__ANCHOR, __BOLD, __COLOR, '(' + __VID + ')');
}

function markAnchorNull(anchor, vid) {
    const __ANCHOR = anchor;
    const __VID = vid;
    const __BOLD = true;
    const __COLOR = 'orange';

    return markAnchorEx(__ANCHOR, __BOLD, __COLOR, '(' + __VID + ')');
}

function markAnchorMap(anchor) {
    return markAnchor(anchor);  // Only one parameter, no index or arr!
}

async function markAnchor(anchor, href) {
    const __OPTSET = __MAIN.optSet;
    const __ANCHOR = anchor;
    const __INFO = getYTinfo(__ANCHOR, href);
    let ret = __ANCHOR;

    if (__INFO) {
        //const __HREF = __INFO.href;
        const __VID = __INFO.vid;
        //const __TEXTRAW = __INFO.textRaw;
        const __TEXT = __INFO.text;
        const __CHANNEL = __INFO.channel;
        const __CHANNELADD = (__CHANNEL ? " / '" + __CHANNEL + "'" : "");

        if (__ANCHOR.YTnewMark) {
            if (__VID != __ANCHOR.YTnewMark) {
                __LOG[0](__ANCHOR.YTnewMark, "=>", __VID, __TEXT);

                __ANCHOR.YTnewMark = __VID;  // Don't show message again for this entry!

                return ret;
            }
        }

        if (__VID && ! __ANCHOR.YTnewMark) {
            const __RAW = true;  // deliver 'N' for rejected IDs
            const __ID = await findID(__VID, __RAW);
            const __REJECTED = (__ID === __FLAG_N);

            if (__ID && ! __REJECTED) {
                //__LOG[0]("Found", __VID, __ID);
            } else if (__REJECTED) {
                //__LOG[0]("Rejected", __VID);
            } else {
                //__LOG[0]("Checked", __VID);
            }

            __ANCHOR.YTnewMark = __VID;

            if (__ID && ! __REJECTED) {
                ret = markAnchorOK(__ANCHOR, __VID, __ID);
            } else if (__REJECTED) {
                ret = markAnchorNo(__ANCHOR, __VID);
            } else if (matchSearch(__TEXT)) {
                //__LOG[0](__VID + __CHANNELADD, "ignored", '(' + __TEXT + ')');

                ret = markAnchorNull(__ANCHOR, __VID);
            }
        }
    }

    return ret;
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

// ==================== Page-Manager fuer Infos zum Video ====================

// Verarbeitet Ansicht "Video abspielen"
const procVideo = new PageManager("Video", null, () => {

        return {
                'menuAnchor'  : getElement('DIV'),
                'formWidth'   : 3,
                'formBreak'   : 4
            };
    }, async optSet => {
        return markTitles();
    });

// ==================== Ende Page-Manager fuer Infos zum Video ====================

// ==================== Page-Manager fuer Infos zur Suche ====================

// Verarbeitet Ansicht "Videos suchen"
const procSearch = new PageManager("Search", null, () => {

        return {
                'menuAnchor'  : getElement('DIV'),
                'formWidth'   : 3,
                'formBreak'   : 4
            };
    }, async optSet => {
        return markTitles();
    });

// ==================== Ende Page-Manager fuer Infos zur Suche ====================

// ==================== Spezialbehandlung der Startparameter ====================

// Callback-Funktion fuer die Behandlung der Optionen und Laden des Benutzermenus
// Diese Funktion erledigt nur Modifikationen und kann z.B. einfach optSet zurueckgeben!
// optSet: Platz fuer die gesetzten Optionen
// optParams: Eventuell notwendige Parameter zur Initialisierung
// 'hideMenu': Optionen werden zwar geladen und genutzt, tauchen aber nicht im Benutzermenu auf
// 'menuAnchor': Startpunkt fuer das Optionsmenu auf der Seite
// 'showForm': Checkliste der auf der Seite sichtbaren Optionen (true fuer sichtbar)
// 'hideForm': Checkliste der auf der Seite unsichtbaren Optionen (true fuer unsichtbar)
// 'formWidth': Anzahl der Elemente pro Zeile
// 'formBreak': Elementnummer des ersten Zeilenumbruchs
// return Gefuelltes Objekt mit den gesetzten Optionen
async function prepareOptions(optSet, optParams) {
    const __REFLAGS = 'i';

    // Optionen sind gerade geladen, starte Initialisierung der Suchmuster ueber gespeicherte Optionswerte...
    await initSearch(optSet, __REFLAGS);

    return optSet;
}

// Callback-Funktion fuer die Ermittlung des richtigen PageManagers
// page: Die ueber den Selektor ermittelte Seitennummer
// return Der zugehoerige PageManager (hier: 1-basiert)
function setupManager(page) {
    const __MAIN = this;

    return __MAIN.pageManager[Math.max(0, page - 1)];
}

// ==================== Ende Spezialbehandlung der Startparameter ====================

// ==================== Hauptprogramm ====================

// Konfiguration der Callback-Funktionen zum Hauptprogramm...
const __MAINCONFIG = {
                        'setupManager'  : setupManager,
                        'prepareOpt'    : prepareOptions
                    };

// Selektor (Seite bzw. Parameter) fuer den richtigen PageManager...
const __LEAFS = {
                    'watch'        : 1, // Ansicht Video
                    'results'      : 2  // Ansicht Search
                };

// URL-Legende:
// s=0: Video
// s=1: Search
const __MAIN = new Main(__OPTCONFIG, __MAINCONFIG, procVideo, procSearch);

__MAIN.run(getPageIdFromURL, __LEAFS);

// ==================== Ende Hauptprogramm ====================

// *** EOF ***
