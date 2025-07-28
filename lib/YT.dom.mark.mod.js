// ==UserScript==
// _name         YT.dom.mark.mod
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit Funktionen zur Interaktionen bei Markierung von Videos
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.js
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.mark.js
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.mark.mod.js
// ==/UserScript==

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
