// ==UserScript==
// @name         YT.new
// @namespace    http://youtube.com/
// @version      0.20+lib
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
// @require      https://eselce.github.io/YTsearch/lib/lib.YT.js
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

// ==================== Spezialisierter Abschnitt fuer Optionen ====================

// Logging initialisieren mit Loglevel (siehe ganz oben im Konfigurationsabschnitt)...
__LOG.init(window, __LOGLEVEL);

// ==================== Ende Abschnitt fuer Optionen ====================

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
    // Optionen sind gerade geladen...
    const __OPTSET = optSet;
    const __STOREDVIDS = await __OPTSET.getOptValue('Links');
    const __CLEANUP = false;
    const __PATTERNS = await __OPTSET.getOptValue('searchRE', []);
    const __REFLAGS = 'i';

    // Registriere Servicefunktionen...
    setRegFun('getID', getID);
    setRegFun('handleNewMatch', handleNewMatchDyn);

    // Starte Initialisierung der statischen VIDs (check)...
    const __IMPORT = await initStaticIDs();

    // Starte Initialisierung der dynamischen VIDs ueber gespeicherte Optionswerte...
    await initDynIDs(__STOREDVIDS, __IMPORT, __CLEANUP);

    // Starte Initialisierung der Suchmuster ueber gespeicherte Optionswerte...
    await initSearch(__PATTERNS, __REFLAGS);

    //await acceptURL("https://youtu.be/7KZlmuiFH_w?t=143s");
    //await acceptURL("https://www.youtube.com/shorts/BG3fvrUcqwY");
    //await acceptURL("https://www.youtube.com/watch?v=NU5K_8JVyu8");
    //await acceptURL("https://www.youtube.com/watch?v=AlwcqI2Vpec");
    //await rejectURL("https://www.youtube.com/watch?v=MwkfhhiLQA0");
    //await rejectURL("https://www.youtube.com/shorts/13FG40ISI9s");
    //await rejectURL("https://www.youtube.com/shorts/OJ-R6_pDGaY");
    //await deleteURL("https://www.youtube.com/watch?v=c9ZqoqCPyd0&list=PLghYzmkF89GlIUtG0vYqyludt0ZQYUTxj&index=1&pp=iAQB8AUB");

    logIDs();

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
