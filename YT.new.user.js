// ==UserScript==
// @name         YT.new
// @namespace    http://youtube.com/
// @version      0.10+lib
// @copyright    2025+
// @author       Sven Loges (SLC)
// @description  YouTube-Markierungs-Script for Greasemonkey 4.0
// @include      /^https?://www\.youtube\.com/.*$/
// @include      /^https?://youtu\.be/.*$/
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM.registerMenuCommand
// @grant        GM.info
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
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
                   'Permanent' : !true,
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
    'askNew' : {   // Angabe, ob neue Links bestaetigt werden sollen (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "askNew",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : !false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Abfrage ein",
                   'Hotkey'    : 'A',
                   'AltLabel'  : "Abfrage aus",
                   'AltHotkey' : 'A',
                   'FormLabel' : "Abfrage"
               },
    'alertInconsistency' : {  // Angabe, eine Meldung kommen soll, wenn VID und ANCHOR nicht zusammenpassen (true = anzeigen, false = nicht anzeigen)
                   'Name'      : "alertInconsistency",
                   'Type'      : __OPTTYPES.SW,
                   'Default'   : false,
                   'Action'    : __OPTACTION.NXT,
                   'Label'     : "Konsistenzmeldung ein",
                   'Hotkey'    : 'K',
                   'AltLabel'  : "Konsistenzmeldung aus",
                   'AltHotkey' : 'K',
                   'FormLabel' : "Konsistenzmeldung"
               },
    'Links' : {    // Datenspeicher fuer URL-Liste zu den neuen VIDs
                   'Name'      : "Links",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'Permanent' : true,
                   'Default'   : { },
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 100,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "VID-URLs:"
               },
    'newLinks' : {    // Datenspeicher fuer Liste der URLs zu neuen Videos (sowas wie die values() von 'Links'), ohne die 'N'-Eintraege
                   'Name'      : "newLinks",
                   'Type'      : __OPTTYPES.SD,
                   'Hidden'    : false,
                   'Serial'    : true,
                   'Permanent' : true,
                   'Default'   : [],
                   'Submit'    : undefined,
                   'Cols'      : 36,
                   'Rows'      : 100,
                   'Replace'   : null,
                   'Space'     : 0,
                   'Label'     : "New URLs:"
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

    for (const pattern of __PATTERNS) {
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanURL(url, dflt = null, prefix = __VPREFIX) {  // strips url or VID to clean video-URL... (without additional parameters)
    const __URL = (url || "");
    const __VID = (safeVID(url, dflt, prefix) || "");
    const __LEN = __VID.length;
    const __POS = __URL.indexOf(__VID);
    const __CLEANURL = ((__POS < 0) ? "#ERROR" : __URL.substring(0, __POS + __LEN));

    return __CLEANURL;
}

function clearObj(obj, keepRejected = true) {  // slow, but clean and straight forward, can be used for constant objects
    for (const key of Object.getOwnPropertyNames(obj)) {
        if ((! keepRejected) || (obj[key] !== __FLAG_N)) {
            delete obj[key];
        }
    }

    return obj;
}

function clearedObj(obj, keepRejected = true) {  // fast, better version of obj = { }, cannot be used for constant objects
    const __OBJ = Object.create(Object.getPrototypeOf(obj), { });

    if (keepRejected) {  // reconstruct all rejections...
        for (const [key, value] of Object.entries(obj)) {
            if (value === __FLAG_N) {
                __OBJ[key] = value;
            }
        }
    }

    return __OBJ;
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

        for (const child of __CHILDREN) {
            for (const tag of __TAGNAMEARR) {
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

const __DYNVIDS = { };

const __FLAG_NEW = 'NEW';
const __FLAG_N = 'N'

async function initIDs(optSet = __MAIN.optSet, cleanUp = false) {
    __LOG[0]("initIDs()");

    const __OPTSET = optSet;
    const __CLEANUP = cleanUp;
    const __STOREDVIDS = await __OPTSET.getOptValue('Links');

    for (const [key, value] of Object.entries(__STOREDVIDS)) {
        await checkAddID(key, value, __CLEANUP);
    }

    __LOG[0]("initIDs():", "Data initialized!", __DYNVIDS);

    //await acceptURL("https://youtu.be/7KZlmuiFH_w?t=143s");
    //await acceptURL("https://www.youtube.com/shorts/BG3fvrUcqwY");
    //await acceptURL("https://www.youtube.com/watch?v=NU5K_8JVyu8");
    //await acceptURL("https://www.youtube.com/watch?v=AlwcqI2Vpec");
    //await rejectURL("https://www.youtube.com/watch?v=MwkfhhiLQA0");
    //await rejectURL("https://www.youtube.com/shorts/13FG40ISI9s");
    //await rejectURL("https://www.youtube.com/shorts/OJ-R6_pDGaY");
    //await deleteURL("https://www.youtube.com/watch?v=c9ZqoqCPyd0&list=PLghYzmkF89GlIUtG0vYqyludt0ZQYUTxj&index=1&pp=iAQB8AUB");

    logIDs();

    return true;
}

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
    const __REJECTED = (__SETURL === __FLAG_N);
    const __INDBASE = ((typeof __DBASEID) !== "undefined");
    const __INREJECT = ((typeof __REJECTID) !== "undefined");
    const __INNEW = ((typeof __NEWID) !== "undefined");

    __LOG[1]("initIDs()", __VID, '=', __SETURL);

    if (__CHECK) {
        if (__INREJECT || __REJECTED) {  // can't have it in any of the other lists!
            if (__INDBASE) {
                showAlert("Data base VID " + __VID + " cannot be rejected!", __SETURL);
            }
            if (__INNEW) {
                showAlert("Static VID " + __VID + " cannot be rejected!", __SETURL);
            }
        }
        if (__INDBASE) {  // can't have it also in (static) __NEWVIDS without a comment!
            if (__INNEW) {
                __LOG[3]("Static VID is already in the data base!");
            }
        }
        if (__INDBASE) {
            __LOG[2]("Dropping VID already in data base...");
            return false;
        } else if (__INREJECT) {
            if (__RAW || ! __REJECTED) {  // __RAW: always fail, else check if rejected ID!
                showAlert("Rejected VID " + __VID + " cannot be set!", __SETURL);
            } else {
                __LOG[2]("Dropping already rejected VID...");
            }
            return false;
        } else if (__INNEW) {
            __LOG[2]("Dropping already static VID...");
            return false;
        }
    }

    if (__ADD) {
        __DYNVIDS[__VID] = __SETURL;
    }

    return true;
}

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
        if (__RAW || (__REJECTID !== __FLAG_N)) {  // __RAW: return raw 'N' if rejected ID, URL otherwise (wrong entry)!
            return __REJECTID;  // Found as 'rejected' in static list, generated by log of dynamic list, provided by GitHub!
        } else {
            return null;  // null for 'N' (rejected ID)
        }
    } else if (__INNEW) {
        return __NEWID;  // Found in static list, containing VIDs that were not yet integrated into the data base, provided by GitHub!
    } else {  // Checking the dynamic list in the option "Links"...
        const __ID = __DYNVIDS[__VID];

        if (__RAW) {  // __RAW: return raw 'N' if rejected ID, URL otherwise, undefined if not found!
            return __ID;
        } else if (__ID === __FLAG_N) {
            return null;  // null for 'N' (rejected ID)
        } else if (__ID) {
            return __FLAG_NEW;  // 'NEW' (valid URL found)
        } else {
            return __ID;  // undefined (not found)
        }
    }
}

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
    //clearObj(__DYNVIDS);
    //logIDs();

    return __OPTSET.setOpt('Links', __DYNVIDS, false);
}

async function acceptURL(url, text, channelAdd) {
    const __VID = safeVID(url);
    const __CLEANURL = cleanURL(url);
    const __TEXT = (text ? '(' + text + ')' : "");
    const __CHANNELADD = channelAdd;

    __LOG[0](__VID, '=', __CLEANURL + __CHANNELADD, __TEXT);

    return setID(__VID, __CLEANURL);
}

async function rejectURL(url, text, channelAdd) {
    const __VID = safeVID(url);
    const __NOID = __FLAG_N;
    const __TEXT = (text ? '(' + text + ')' : "");
    const __CHANNELADD = channelAdd;

    __LOG[0]("Will no longer ask for", __VID + __CHANNELADD, __TEXT);

    return setID(__VID, __NOID);
}

async function deleteURL(url, text, channelAdd) {
    const __VID = safeVID(url);
    const __FREEID = null;
    const __TEXT = (text ? '(' + text + ')' : "");
    const __CHANNELADD = channelAdd;

    __LOG[0]("Ignoring", __VID + __CHANNELADD, __TEXT);

    return setID(__VID, __FREEID);
}

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

function showIDs(rejected = false, showKeys = false, showIndex = false, objFormat = false, fixValue = null) {
    const __REJECTED = rejected;
    const __SHOWKEYS = showKeys;
    const __SHOWINDEX = showIndex;
    const __FILTER = (__REJECTED ? ([key, value]) => (value.toUpperCase() === "N")
                                 : ([key, value]) => (value.toUpperCase() !== "N"));
    const __OBJFORMAT = objFormat;
    const __FIXVALUE = fixValue;

    return showListValues(__DYNVIDS, __SHOWKEYS, __SHOWINDEX, __FILTER, __OBJFORMAT, __FIXVALUE);
}

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
}

function askNewLink(vid, href, text, channelAdd) {
    const __VID = vid;
    const __HREF = href;
    const __TEXT = (text || "(null)");
    const __CHANNELADD = channelAdd;
    const __MESSAGE = __TEXT + '\n\n' + "Accept " + __VID + __CHANNELADD + " (Y/N)?";
    const __DEFAULT = 'Y';

    __LOG[0](__MESSAGE);

    const __ANSWER = prompt(__MESSAGE, __DEFAULT);

    return (__ANSWER && (__ANSWER.toUpperCase() !== 'N'));
}

//const __SEARCHPATTERN = /(LOVE.?BITES?|Miyako|Fami[^l]|Asami|Midori|Haru(na|pi)|Miho|Wolf.?pack|DESTROSE|21g|DROP OF JOKER|SONIC LOVER RECKLESS|Gekijo|METALicche|Lust.?Queen|CHAOS.?CONTROL)/i;

const __SEARCHPATTERNS = [];

async function initSearch(optSet = __MAIN.optSet, flags = 'i') {
    const __OPTSET = optSet;
    const __FLAGS = flags;
    const __PATTERNS = await __OPTSET.getOptValue('searchRE', []);

    __SEARCHPATTERNS.length = 0;  // Empty array (dirty)

    for (const pattern of __PATTERNS) {
        const __REGEXP = new RegExp(pattern, __FLAGS);

        __SEARCHPATTERNS.push(__REGEXP);
    }

    const __COUNT = __SEARCHPATTERNS.length;

    __LOG[0]("initSearch():", "Search initialized with " + __COUNT + " patterns!", __SEARCHPATTERNS);

    return __COUNT;
}

function matchSearch(title) {
    const __TITLE = title;

    for (const regExp of __SEARCHPATTERNS) {
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
            __LOG[1](__INFO);
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
        const __HREF = __INFO.href;
        const __VID = __INFO.vid;
        const __TEXTRAW = __INFO.textRaw;
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
            const __REJECTED = (__ID === __FLAG_N);

            if (__ID && ! __REJECTED) {
                __LOG[0]("Found", __VID, __ID);
            } else if (__REJECTED) {
                __LOG[0]("Rejected", __VID);
            } else {
                __LOG[0]("Checked", __VID);
            }

            __ANCHOR.YTnewMark = __VID;

            if (__ID && ! __REJECTED) {
                ret = markAnchorOK(__ANCHOR, __VID, __ID);
            } else {
                if (matchSearch(__TEXT)) {
                    const __ASKNEW = await __OPTSET.getOptValue('askNew', false);
                    let addNew = false;

                    if (__ASKNEW && ! __REJECTED) {
                        addNew = askNewLink(__VID, __HREF, __TEXT, __CHANNELADD);
                    }

                    if (addNew === null) {  // abgebrochen, keine Festlegung!
                        __LOG[0](__VID + __CHANNELADD, "ignored", '(' + __TEXT + ')');

                        //ret = markAnchorNull(__ANCHOR, __VID, __ID);
                    } else if (addNew) {
                        const __ID = __FLAG_NEW;

                        await acceptURL(__HREF, __TEXT, __CHANNELADD);

                        ret = markAnchorOK(__ANCHOR, __VID, __ID);
                    } else {
                        await rejectURL(__VID, __TEXT, __CHANNELADD);

                        ret = markAnchorNo(__ANCHOR, __VID);
                    }
                }
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
    const __CLEANUP = false;
    const __REFLAGS = 'i';

    // Optionen sind gerade geladen, starte Initialisierung der IDs ueber gespeicherte Optionswerte...
    await initIDs(optSet, __CLEANUP);

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
