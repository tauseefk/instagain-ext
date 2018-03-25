
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
'use scrict'

var instaGain = function (document) {
  var interval = 8000;

  function delay(ms, res) {
    return function (res) {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          resolve(res);
        }, ms);
      });
    }
  }

  let delayShort = delay(interval);

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
      .then(autoLike)
      .catch(console.error.bind(this));
  }

  return {
    start: autoLike
  }
};
function init() {
  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension');
    if (request.data == 'start') {
      let mostRecent = document.querySelectorAll('main>article>div')[1];
      let mostRecentPictures = mostRecent.querySelector('div').querySelectorAll('div');
      mostRecentPictures[0].querySelector('div>a').click();
      window.setTimeout(function () {
        let app = instaGain(document);
        app.start()
          .catch(function (e) {
            chrome.runtime.sendMessages('', { data: 'error' });
          });
      }, 3000);
      sendResponse({ farewell: 'goodbye' });
    }
  });
};

readyStateCheckInterval = window.setInterval(function () {
  if (document.readyState === 'complete') {
    window.clearInterval(readyStateCheckInterval);
    init();
  }
}, 50);