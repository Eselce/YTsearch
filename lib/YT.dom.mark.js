// ==UserScript==
// _name         YT.dom.mark
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit Funktionen zur Markierung bestimmter Videos
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.js
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.mark.js
// ==/UserScript==

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
            } else {
                if (matchSearch(__TEXT)) {
                    const __HREF = __INFO.href;
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

// ==================== Ende Abschnitt fuer Markierung bestimmter Videos ====================

// *** EOF ***
