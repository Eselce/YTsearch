// ==UserScript==
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
// ==/UserScript==

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
