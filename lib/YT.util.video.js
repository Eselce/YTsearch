// ==UserScript==
// _name         YT.util.video
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-spezifischen Funktionen fuer Videos
// _require      https://eselce.github.io/YTsearch/lib/YT.util.js
// _require      https://eselce.github.io/YTsearch/lib/YT.util.video.js
// ==/UserScript==

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
