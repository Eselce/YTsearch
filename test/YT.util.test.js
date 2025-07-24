// ==UserScript==
// _name         YT.util.test
// _namespace    http://www.youtube.com/
// _version      0.10
// _copyright    2025+
// _author       Sven Loges (SLC)
// _description  Unit-Tests JS-lib mit Funktionen und Utilities fuer YouTube
// _require      https://eselce.github.io/GitTest/misc/OS2/lib/lib.all.js
// _require      https://eselce.github.io/YTsearch/lib/YT.util.js
// _require      https://eselce.github.io/YTsearch/test/YT.util.test.js
// ==/UserScript==

// ECMAScript 6:
/* jshint esnext: true */
/* jshint moz: true */

// ==================== Abschnitt fuer Unit-Tests zu YT.util ====================

(() => {

// ==================== Abschnitt fuer diverse Utilities fuer YouTube ====================

    const __TESTDATA = {
            '__YOUTUBEHOME'         : [ 'https://www.youtube.com',                          'string'    ],
            '__NOPREFIX'            : [ "",                                                 'string'    ],
            'safeID'                : [ "https://www.youtube.com/watch?v=hBEU15T6q5g", undefined, undefined, __NOPREFIX, 'hBEU15T6q5g', 'string' ]
        };

    new UnitTest('YT.util.js', "Utilities zur Behandlung von YouTube-IDs", {
            '__YOUTUBEHOME'       : function() {
                                        const [ __EXP, __TYPE ] = __TESTDATA['__YOUTUBEHOME'];
                                        const __RET = __YOUTUBEHOME;

                                        ASSERT_EQUAL(__RET, __EXP, "__YOUTUBEHOME muss richtig gesetzt werden");

                                        return ASSERT_TYPEOF(__RET, __TYPE, "__YOUTUBEHOME muss String zur\u00FCckgeben");
                                    },
            '__NOPREFIX'          : function() {
                                        const [ __EXP, __TYPE ] = __TESTDATA['__NOPREFIX'];
                                        const __RET = __NOPREFIX;

                                        ASSERT_EQUAL(__RET, __EXP, "__NOPREFIX muss richtig gesetzt werden");

                                        return ASSERT_TYPEOF(__RET, __TYPE, "__NOPREFIX muss String zur\u00FCckgeben");
                                    },
            'safeID'              : function() {
                                        const [ __URL, __DEF, __PAT, __PRE, __EXP, __TYPE ] = __TESTDATA['safeID'];
                                        const __RET = safeID(__URL, __DEF, __PAT, __PRE);

                                        ASSERT_EQUAL(__RET, __EXP, "safeID() muss String zur\u00FCckgeben");

                                        return ASSERT_TYPEOF(__RET, __TYPE, "safeID() muss String zur\u00FCckgeben");
                                    }
        });

// ==================== Ende Abschnitt fuer diverse Utilities fuer YouTube ====================

})();

// ==================== Ende Abschnitt fuer Unit-Tests zu YT.util ====================

// *** EOF ***
