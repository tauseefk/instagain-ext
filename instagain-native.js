
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
  const interval = 4000;
  const filledLikeButton = '.glyphsSpriteHeart__filled__24__red_5';
  const emptyLikeButton = '.glyphsSpriteHeart__outline__24__grey_9';

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
    return function (condition) {
      return function (data) {
        return condition ? Promise.resolve(a(data)) : Promise.resolve(b(data))
      }
    }
  }

  const delayShort = delay(interval);
  const delay1 = delay(1000);
  const delay2 = delay(2000);
  const immediate = delay(0);
  const takeN = takeUntil(n);
  const delayOrImmediateIf = branchInto(delayShort, immediate);

  function likeCurrent() {
    return new Promise(function (resolve, reject) {
      try {
        const button = document.querySelectorAll(emptyLikeButton);
        const filled = document.querySelector(filledLikeButton);
        // const icon = button.querySelector('span');
        // const isLiked = [...icon.classList].find(c => c.indexOf("glyphsSpriteHeart__filled__24__red_5") > -1)
        if (button.length > 1) {
          button[1].click();
        } else if (filled) {
          throw (new Error('already liked'))
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
      try {
        // const button = document.querySelector(emptyLikeButton);
        // const icon = button.querySelector('span');
        const button = document.querySelectorAll(emptyLikeButton);
        const filled = document.querySelector(filledLikeButton);
        if (filled) throw (new Error('already liked'))
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

  function log(tag) {
    return function (x) {
      console.log(tag, x)
      return x
    }
  }

  function autoLike() {
    return Promise.resolve()
      .then(getNext)
      .then(delay2)
      .then(_ => {
        return checkIfLiked()
          .then(isLiked => delayOrImmediateIf(!isLiked))
          .then(branch => branch(_))
      })
      .then(likeCurrent)
      .then(delay2)
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
          console.trace(e);
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
