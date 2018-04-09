
/** Usage:
 * Open Instagram in the browser,
 * log-in with your account,
 * find the #hashtag that you can most relate with,
 * click on one of the pictures in the latest category,
 * run the following script in the browser console.
 *
 * Brace yourselves, followers are coming ;)
 *
 * @author tauseefk
 */
'use strict'
var instaGain = function (document) {
  var interval = 8000;

  function delay(ms) {
    return function (res) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(res);
        }, ms);
      });
    }
  }

  function takeUntil(n) {
    var _count = 0;
    return function (res) {
      return new Promise(function (resolve, reject) {
        if (++_count > n) {
          reject(new Error("limit_reached"));
        }
        resolve(res);
      });
    }
  }

  let delayShort = delay(interval);
  let take2K = takeUntil(2000);

  function likeCurrent() {
    return new Promise(function (resolve, reject) {
      try {
        document.querySelector('.coreSpriteHeartOpen').click();
      } catch (e) {
        if (e.name !== 'TypeError' || document.querySelector('.coreSpriteHeartFull') === null) {
          reject(e);
        }
        resolve('already liked.');
      }
      resolve();
    });
  }

  function getNext() {
    return new Promise(function (resolve, reject) {
      try {
        document.querySelector('.coreSpriteRightPaginationArrow').click();
      } catch (e) {
        reject(e);
      }
      resolve();
    });
  }

  function autoLike() {
    return Promise.resolve()
      .then(getNext)
      .then(delayShort)
      .then(likeCurrent)
      .then(take2K)
      .then(autoLike);
  }

  return {
    start: autoLike
  }
};
function init() {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ?
      'from a content script: ' + sender.tab.url :
      'from the extension');
    if (request.data == 'start') {
      let mostRecent = document.querySelectorAll('main>article>div')[1];
      let mostRecentPictures = mostRecent.querySelector('div').querySelectorAll('div');
      mostRecentPictures[0].querySelector('div>a').click();
      window.setTimeout(function () {
        var app = instaGain(document);
        app.start()
          .catch(function (e) {
            chrome.runtime.sendMessage(chrome.runtime.id, { data: 'error' });
          });
      }, 3000);
      sendResponse({ data: 'working' });
    }
  });
};

var readyStateCheckInterval = window.setInterval(function () {
  if (document.readyState === 'complete') {
    window.clearInterval(readyStateCheckInterval);
    init();
  }
}, 50);
