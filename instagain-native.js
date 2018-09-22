
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
var instaGain = function (document, n) {
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
          alert('All done!');
          reject(new Error("limit_reached"));
        }
        resolve(res);
      });
    }
  }

  function branchInto(a, b) {
    return function(condition) {
      return new Promise(function(resolve, reject) {
        // TODO add rejection if malformed
        if(condition) {
          resolve(a);
        } else {
          resolve(b);
        }
      });
    }
  }

  function execCB (cb) {
    return new Promise(function (resolve, reject) {
      cb().then(resolve);
    });
  }

  const delayShort = delay(interval);
  const delay1 = delay(1000);
  const immediate = delay(0);
  const take2K = takeUntil(2000);
  const takeN = takeUntil(n);
  const delayOrImmediateIf = branchInto(delayShort, immediate);

  function head(arr) {
    if (Array.isArray(arr) && arr.length) {
      return arr[0];
    } else {
      return null;
    }
  }

  function likeCurrent() {
    return new Promise(function (resolve, reject) {
      const button = document.querySelector('.coreSpriteHeartOpen');
      const icon = button.querySelector('span');
      try {
        const isLiked = [...icon.classList].find(c => c.indexOf("glyphsSpriteHeart__filled") > -1)
        if(!isLiked) {
          button.click();
        } else {
          throw(new Error('already liked'))
        }
      } catch (e) {
        if (e.name !== 'TypeError' && e.message !== 'already liked') {
          reject(e);
        }
        resolve('already liked.');
      }
      resolve();
    });
  }

  function checkIfLiked() {
    return new Promise(function (resolve, reject) {
      const button = document.querySelector('.coreSpriteHeartOpen');
      const icon = button.querySelector('span');
      try {
        const isLiked = [...icon.classList].find(c => c.indexOf("glyphsSpriteHeart__filled") > -1)
        if(isLiked) throw(new Error('already liked'))
      } catch (e) {
        if (e.name !== 'TypeError' && e.message !== 'already liked') {
          reject(e);
        }
        resolve(true);
      }
      resolve(false);
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
      .then(delay1)
      .then(checkIfLiked)
      .then(isLiked => delayOrImmediateIf(!isLiked))
      .then(execCB)
      .then(likeCurrent)
      .then(takeN)
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
    if (request.data.operation === 'start') {
      let mostRecent = document.querySelectorAll('main>article>div')[1];
      let mostRecentPictures = mostRecent.querySelector('div').querySelectorAll('div');
      mostRecentPictures[0].querySelector('div>a').click();
      window.setTimeout(function () {
        var app = instaGain(document, request.data.count);
        app.start()
          .catch(function (e) {
            chrome.runtime.sendMessage(chrome.runtime.id, { data: 'error' });
          });
      }, 3000);
      sendResponse({ data: 'working' });
    } else if (request.data.operation === 'continue') {
      var app = instaGain(document, request.data.count);
      app.start()
        .catch(function (e) {
          chrome.runtime.sendMessage(chrome.runtime.id, { data: 'error' });
        });
    }
  });
};

var readyStateCheckInterval = window.setInterval(function () {
  if (document.readyState === 'complete') {
    window.clearInterval(readyStateCheckInterval);
    init();
  }
}, 50);
