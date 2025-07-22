// ==UserScript==
// _name         YT.named
// _namespace    https://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  JS-lib mit spezifischen Funktionen fuer registrierte Funktionen
// _require      https://eselce.github.io/YTsearch/lib/YT.named.js
// ==/UserScript==

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
