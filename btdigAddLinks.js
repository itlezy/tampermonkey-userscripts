// ==UserScript==
// @name         btdigAddLinks
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add torrent and magnet links to btdig search results
// @author       You
// @match        https://btdig.com/search?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=btdig.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const ahrefs = document.getElementsByTagName("a");

    for (let i = 0; i < ahrefs.length; i++) {
        const href = ahrefs[i];
        const sref = href.href;

        if (sref.indexOf("magnet:") == 0) {
            const hrefIH = sref.substring(sref.indexOf("btih:") + 5, 60);

            let aT1 = document.createElement("a");
            aT1.innerText = " T1 ";
            aT1.href = "https://itorrents.org/torrent/" + hrefIH.toLowerCase() + ".torrent";
            href.parentElement.appendChild(aT1);

            let aT2 = document.createElement("a");
            aT2.innerText = " T2 ";
            aT2.href = "https://torrage.info/torrent.php?h=" + hrefIH.toUpperCase();
            href.parentElement.appendChild(aT2);

            let aT3 = document.createElement("a");
            aT3.innerText = " T3 ";
            aT3.href = "https://btcache.me/torrent/" + hrefIH.toUpperCase();
            href.parentElement.appendChild(aT3);

            let aM = document.createElement("a");
            aM.innerText = " M ";
            aM.href = "data:text," + sref;
            aM.download = "" + hrefIH + ".magnet";
            href.parentElement.appendChild(aM);

        }
    }

})();
