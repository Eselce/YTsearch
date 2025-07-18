// ==UserScript==
// _name         YT.dom
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit YouTube-spezifischen Funktionen fuer DOM-Baum
// _require      https://eselce.github.io/YTsearch/lib/YT.dom.js
// ==/UserScript==

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
