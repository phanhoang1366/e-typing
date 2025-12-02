// ==UserScript==
// @name     Unnamed Script 893647
// @version  1
// @description  Try to type as fast as possible but with a bot helping you.
// @match    https://www.e-typing.ne.jp/*
// @grant    none
// ==/UserScript==

(function() {
    'use strict';
    let isTyping = false;
    let lastKana = "";
    awaitElement();

function awaitElement() {
    let interval = setInterval(() => {
        // Checks if div with id "kanaText" exists
        if (document.getElementById("kanaText")) {
            clearInterval(interval);
            searchNewWord();
        }
    }, 250);
}

function searchNewWord() {
    let interval = setInterval(() => {
        let kana = document.getElementById("kanaText").innerText;
        if (kana === "") {
            clearInterval(interval);
            lastKana = "";
            isTyping = false;
            setTimeout(() => {
                awaitElement();
            }, 250);
        }
        else if (kana !== lastKana && !isTyping) {
            // Only type if the word has changed and we're not already typing
            lastKana = kana;
            isTyping = true;
            let romaji = kanaToRomajiIME(kana);
            simulateTyping(romaji, randomDelay(), 50).then(() => {
                isTyping = false;
            });
        }
    }, 100);
}

function kanaToRomajiIME(kana) {
  const table = {
    あ:"a", い:"i", う:"u", え:"e", お:"o",
    か:"ka", き:"ki", く:"ku", け:"ke", こ:"ko",
    さ:"sa", し:"si", す:"su", せ:"se", そ:"so",
    た:"ta", ち:"ti", つ:"tu", て:"te", と:"to",
    な:"na", に:"ni", ぬ:"nu", ね:"ne", の:"no",
    は:"ha", ひ:"hi", ふ:"hu", へ:"he", ほ:"ho",
    ま:"ma", み:"mi", む:"mu", め:"me", も:"mo",
    や:"ya", ゆ:"yu", よ:"yo",
    ら:"ra", り:"ri", る:"ru", れ:"re", ろ:"ro",
    わ:"wa", を:"wo", ん:"nn",
    が:"ga", ぎ:"gi", ぐ:"gu", げ:"ge", ご:"go",
    ざ:"za", じ:"zi", ず:"zu", ぜ:"ze", ぞ:"zo",
    だ:"da", ぢ:"di", づ:"du", で:"de", ど:"do",
    ば:"ba", び:"bi", ぶ:"bu", べ:"be", ぼ:"bo",
    ぱ:"pa", ぴ:"pi", ぷ:"pu", ぺ:"pe", ぽ:"po",
    ゃ:"ya", ゅ:"yu", ょ:"yo",
    っ:"", ー:"-", 、:","
  };

  // youon (きゃ → kya, etc.)
  const youon = {
    ki:{ya:"kya", yu:"kyu", yo:"kyo"},
    gi:{ya:"gya", yu:"gyu", yo:"gyo"},
    si:{ya:"sya", yu:"syu", yo:"syo"},
    zi:{ya:"zya", yu:"zyu", yo:"zyo"},
    ti:{ya:"tya", yu:"tyu", yo:"tyo"},
    di:{ya:"dya", yu:"dyu", yo:"dyo"},
    ni:{ya:"nya", yu:"nyu", yo:"nyo"},
    hi:{ya:"hya", yu:"hyu", yo:"hyo"},
    bi:{ya:"bya", yu:"byu", yo:"byo"},
    pi:{ya:"pya", yu:"pyu", yo:"pyo"},
    mi:{ya:"mya", yu:"myu", yo:"myo"},
    ri:{ya:"rya", yu:"ryu", yo:"ryo"},
  };

  let result = "";
  for (let i = 0; i < kana.length; i++) {
    let ch = kana[i];
    let next = kana[i + 1];

    // Handle sokuon (っ)
    if (ch === "っ") {
      const romajiNext = table[next];
      if (romajiNext) result += romajiNext[0];
      continue;
    }

    // Handle long vowel mark (ー)
    if (ch === "ー") {
      result += "-";
      continue;
    }

    let base = table[ch];
    let small = table[next];

    // Handle youon combinations (きゃ, しゅ, etc.)
    if (next && (next === "ゃ" || next === "ゅ" || next === "ょ")) {
      for (const [stem, combos] of Object.entries(youon)) {
        if (base === stem && combos[table[next]]) {
          result += combos[table[next]];
          i++; // skip the small kana
          base = null;
          break;
        }
      }
    }

    if (base) result += base;
  }

  return result;
}

function randomDelay() {
    return Math.floor(Math.random() * 200) + 100; 
    // Random delay between 100ms to 450ms
}

async function simulateTyping(text, delay = 60, unstable = 50) {
    for (const ch of text) {
        const charCode = ch.charCodeAt(0);
        const keyCode = charCode;

        // Create keypress event with proper charCode (this is what e-typing listens for)
        const keypressEvent = new KeyboardEvent("keypress", {
            bubbles: true,
            cancelable: true,
            key: ch,
            char: ch,
            charCode: charCode,
            keyCode: keyCode,
            which: charCode
        });

        // Dispatch to document (e-typing listens on document level)
        document.dispatchEvent(keypressEvent);

        await new Promise(r => setTimeout(r, delay + Math.floor(Math.random() * unstable))); // simulate real typing with some instability
    }
}

})();
