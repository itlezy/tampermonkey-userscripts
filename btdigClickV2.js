// ==UserScript==
// @name         btdigClickV2
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  auto-click search results in btdig
// @author       You
// @match        https://btdig.com/search?q=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=btdig.com
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @grant unsafeWindow
// @grant window.close
// ==/UserScript==

(function() {
    'use strict';

    function sCompare(s1, s2) {
        console.log("Comparing [ %s ] vs [ %s ]", s1, s2);

        return s1.toLowerCase().trim().indexOf(s2.toLowerCase().trim()) >= 0 ||
            s2.toLowerCase().trim().indexOf(s1.toLowerCase().trim()) >= 0;
    }

    function sNormalize(s) {
        return s.replace(/\s+/g, " ").trim();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sz = urlParams.get('sz');
    const szM = urlParams.get('szM');
    const szG = urlParams.get('szG');
    const fileName = sNormalize(urlParams.get('q'));
    const dirName = sNormalize(urlParams.get('dirName'));
    const chijapChars = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;

    console.log("File Name [ %s ], Dir Name [ %s ], szM %s, szG %s",
                fileName, dirName, szM, szG);

    let torrents = {};

    // 1. extract results to objects
    let resultDivs = jQuery("div.one_result");

    resultDivs.each(function(i, val) {
        let torrentName = sNormalize(jQuery(val).find("div.torrent_name").text());
        let fileNames = sNormalize(jQuery(val).find("div.torrent_excerpt").find("div.fa").text());
        let torrentSize = sNormalize(jQuery(val).find("span.torrent_size").text());
        let fileSizes = sNormalize(jQuery(val).find("div.torrent_excerpt").find("span").text());
        let magnetLink = jQuery(val).find("a:last").attr("href");
        let hashId = magnetLink.substring(magnetLink.indexOf("btih:") + 5, 60);

        console.log("Torrent Name [ %s ]", torrentName);
        console.log("File Names [ %s ]", fileNames);
        console.log("Torrent Size [ %s ]", torrentSize);
        console.log("File Sizes [ %s ]", fileSizes);
        console.log("HashId [ %s ], Magnet [ %s ]", hashId, magnetLink);

        // skip anything larger than 12 Gb
        if (torrentSize.indexOf("GB") > 0 && parseFloat(torrentSize.split(" ")[0]) > 12) {
            console.log("Skipping torrent (too big)..");
            return;
        }

        if (chijapChars.test(torrentName) || chijapChars.test(fileNames)) {
            console.log("Skipping torrent (chi jap chars)..");
            return;
        }

        torrents[hashId] = {
            hashId: hashId,
            torrentName: torrentName,
            fileNames: fileNames,
            fileSizes: fileSizes,
            score: 0
        };
    });

    // 2. score them based on matching rules
    for (const hashId in torrents) {
        let torrentEntry = torrents[hashId];

        console.log("Torrent Entry", torrentEntry);

        if (sCompare(torrentEntry.torrentName, dirName)) {
            torrentEntry.score++;
            console.log("DirName match [ %s ] [ %s ]", torrentEntry.torrentName, dirName);
        }

        if (sCompare(torrentEntry.fileNames, fileName)) {
            torrentEntry.score++;
            console.log("FileName match [ %s ] [ %s ]", torrentEntry.fileNames, fileName);
        }

        if (sCompare(torrentEntry.fileSizes, szM + " MB")
            ||
            sCompare(torrentEntry.fileSizes, szG + " GB")
           ) {
            torrentEntry.score++;
            console.log("FileSizes match [ %s ] [ %s ] [ %s ]", torrentEntry.fileSizes, szM + " MB", szG + " GB");
        }

        if (dirName.indexOf("rbg") < 0 && torrentEntry.torrentName.indexOf("rbg") > 0) {
            torrentEntry.score++;
            console.log("Preferring 'rarbg' entries anyways..");
            // in case the dirName does not contain already 'rbg', otherwise it would get +1 point from the dir match rule
        }
    }

    // 3.1 select the best match
    let maxScore = 0;
    let maxHashId;

    for (const hashId in torrents) {
        let torrentEntry = torrents[hashId];

        console.log("Torrent Entry (1st pass)", torrentEntry);

        if (torrentEntry.score > maxScore) {
            maxScore = torrentEntry.score;
            maxHashId = hashId;
        }
    }

    if (!maxHashId) {
        console.warn("No suitable match");
        return;
    }

    console.log("Max Score is [ %s ] HashId is [ %s ], selected torrent is [ %s ]", maxScore, maxHashId, torrents[maxHashId].torrentName);

    // 3.2 second pass to select - given the same maxScore - a torrent that is from rarbg
    for (const hashId in torrents) {
        let torrentEntry = torrents[hashId];

        console.log("Torrent Entry (2nd pass)", torrentEntry);

        if (torrentEntry.score == maxScore && torrentEntry.torrentName.indexOf("rbg") > 0) {
            maxHashId = hashId;
        }
    }

    console.log("Max Score is [ %s ] HashId is [ %s ], selected torrent is [ %s ]", maxScore, maxHashId, torrents[maxHashId].torrentName);

    // 4. download it
    if (maxHashId) {
        console.log("Selected Torrent is %s", maxHashId, torrents[maxHashId]);

        let a1 = document.createElement("a");
        a1.href = "https://itorrents.org/torrent/" + maxHashId + ".torrent";
        a1.target = "_blank"; // remember to allow popups
        a1.click();

        let a2 = document.createElement("a");
        a2.href = "https://torrage.info/torrent.php?h=" + maxHashId;
        a2.target = "_blank"; // remember to allow popups
        a2.click();

        setTimeout(function() { window.close(); }, 3333);
    } else {
        console.warn("No suitable match");
    }

})();
