document.addEventListener(
  "DOMContentLoaded",
  () => {
    const input = document.querySelector("#likeInput");
    const valueLabel = document.querySelector("label");

    input.addEventListener("change", (e) => {
      valueLabel.textContent = e.target.value;
    });

    const startButton = document.getElementById("start");
    const continueButton = document.getElementById("continue");
    const tabIds = [];
    startButton.addEventListener(
      "click",
      () => {
        chrome.tabs.query({ active: true }, (tabs) => {
          tabIds.push(
            tabs
              .filter((tab) => tabIds.indexOf(tab.id) === -1)
              .map((tab) => tab.id),
          );
          // biome-ignore lint/complexity/noForEach: <explanation>
          tabs.forEach(({ id }) => {
            chrome.tabs.sendMessage(
              id,
              {
                data: {
                  operation: "start",
                  count: Number.parseInt(valueLabel.textContent),
                },
              },
              {},
              (res) => {
                console.log(res);
              },
            );
          });
        });
      },
      false,
    );

    continueButton.addEventListener(
      "click",
      () => {
        chrome.tabs.query({ active: true }, (tabs) => {
          tabIds.push(
            tabs
              .filter((tab) => tabIds.indexOf(tab.id) === -1)
              .map((tab) => tab.id),
          );
          // biome-ignore lint/complexity/noForEach: <explanation>
          tabs.forEach(({ id }) => {
            chrome.tabs.sendMessage(
              id,
              {
                data: {
                  operation: "continue",
                  count: Number.parseInt(valueLabel.textContent),
                },
              },
              {},
              (res) => {
                console.log(res);
              },
            );
          });
        });
      },
      false,
    );

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(
        sender.tab
          ? `from a content script:${sender.tab.url}`
          : "from the extension",
      );
      if (request.data === "working") {
        console.log("content script is working!!");
      } else if (request.data === "error") {
        // chrome.tabs.update(
        //   sender.tab.id,
        //   {
        //     url: "https://www.instagram.com/fujifeed/",
        //   },
        //   (tab) => {
        //     setTimeout(() => {
        //       chrome.tabs.sendMessage(
        //         sender.tab.id,
        //         { data: "start" },
        //         {},
        //         (res) => {
        //           console.log(res);
        //         },
        //       );
        //     }, 5000);
        //   },
        // );
      }
    });
  },
  false,
);
