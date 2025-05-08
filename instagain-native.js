// gets the parent of the like/unlike buttons
const getCTA = () => document.querySelector("article span>svg").parentElement;

const instaGain = (document, n) => {
  const interval = 4000;
  function delay(ms) {
    return (res) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(res);
        }, ms);
      });
  }

  function takeUntil(n) {
    let _count = 0;
    return (res) =>
      new Promise((resolve, reject) => {
        if (++_count > n) {
          alert("All done!");
          reject(new Error("limit_reached"));
        }
        resolve(res);
      });
  }

  function branchInto(a, b) {
    return (condition) => (data) =>
      condition ? Promise.resolve(a(data)) : Promise.resolve(b(data));
  }

  const delayShort = delay(interval);
  const delay1 = delay(1000);
  const delay2 = delay(2000);
  const immediate = delay(0);
  const takeN = takeUntil(n);
  const delayOrImmediateIf = branchInto(delayShort, immediate);
  const probabilityFn = (probability) => {
    return () => Math.random() < probability / 100;
  };
  const probabilitySmallPercent = probabilityFn(25);

  function likeCurrent() {
    return new Promise((resolve, reject) => {
      try {
        const likeSVG = getCTA().querySelector("[aria-label='Like']");
        const unlikeSVG = getCTA().querySelector("[aria-label='Unlike']");

        if (likeSVG && probabilitySmallPercent()) {
          likeSVG.parentElement.click();
        } else if (unlikeSVG) {
          throw new Error("already liked");
        }
      } catch (e) {
        if (e.name !== "TypeError" && e.message !== "already liked") {
          reject(e);
        }
        resolve("already liked.");
      }
      resolve();
    });
  }

  function checkIfLiked() {
    return new Promise((resolve, reject) => {
      try {
        // const button = document.querySelector(emptyLikeButton);
        // const icon = button.querySelector('span');
        const likeButton = getCTA();
        const isFilled =
          likeButton.querySelector("[aria-label='Unlike']") !== null;

        if (isFilled) throw new Error("already liked");
      } catch (e) {
        if (e.name !== "TypeError" && e.message !== "already liked") {
          reject(e);
        }
        resolve(true);
      }
      resolve(false);
    });
  }

  function getNext() {
    return new Promise((resolve, reject) => {
      try {
        document.querySelector("[aria-label='Next']").parentElement.click();
      } catch (e) {
        reject(e);
      }
      resolve();
    });
  }

  function log(tag) {
    return (x) => {
      console.log(tag, x);
      return x;
    };
  }

  function autoLike() {
    return Promise.resolve()
      .then(getNext)
      .then(delay2)
      .then(async (_) => {
        const isLiked = await checkIfLiked();
        const branch = delayOrImmediateIf(!isLiked);
        return await branch(_);
      })
      .then(likeCurrent)
      .then(delay2)
      .then(takeN)
      .then(autoLike);
  }

  return {
    start: autoLike,
  };
};
function init() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
      sender.tab
        ? `from a content script: ${sender.tab.url}`
        : "from the extension",
    );
    if (request.data.operation === "start") {
      const mostRecent = document.querySelectorAll("main article>div")[0];
      const mostRecentPictures = mostRecent
        .querySelector("div")
        .querySelectorAll("div");
      mostRecentPictures[0].querySelector("div>a").click();
      window.setTimeout(() => {
        const app = instaGain(document, request.data.count);
        app.start().catch((e) => {
          chrome.runtime.sendMessage(chrome.runtime.id, { data: "error" });
        });
      }, 3000);
      sendResponse({ data: "working" });
    } else if (request.data.operation === "continue") {
      const app = instaGain(document, request.data.count);
      app.start().catch((e) => {
        console.trace(e);
        chrome.runtime.sendMessage(chrome.runtime.id, { data: "error" });
      });
    }
  });
}

const readyStateCheckInterval = window.setInterval(() => {
  if (document.readyState === "complete") {
    window.clearInterval(readyStateCheckInterval);
    init();
  }
}, 50);
