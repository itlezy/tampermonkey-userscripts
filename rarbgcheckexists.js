// ==UserScript==
// @name         rarbgcheckexists
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  check against the 'Everything' search tool if you already have the file
// @author       You
// @match        https://rarbgmirror.org/torrents.php?search=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=rarbgmirror.org
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant unsafeWindow
// @grant window.close
// @grant GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let resultRows = jQuery("tr.lista2");

    console.log("Rows [%s]", resultRows.length);

    resultRows.each(function(i, val) {
        let row = resultRows[i];
        let a1 = jQuery(row).find("a")[1];
        let a1j = jQuery(a1);
        let a1text = a1j.text();

        console.log("Link is [%s] text [%s]", a1j.attr("href"), a1text);

        GM_xmlhttpRequest({
            method: "GET",
            url: "http://localhost:8097/?search=" + encodeURIComponent(a1text),
            onload: function(response) {
                if (response.responseText.indexOf("<p class=\"numresults\">0 results</p>") < 0) {
                    console.log("Found result for [%s]", a1text);

                    jQuery(row).children('td,th').css('background-color','#979A9A');
                }
            }
        });
    });

})();
