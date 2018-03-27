document.addEventListener('DOMContentLoaded', function () {
  var checkPageButton = document.getElementById('instagain');
  var tabId = null;
  checkPageButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true }, function (tabs) {
      tabId = tabs[0].id;
      chrome.tabs.sendMessage(tabId,
        { data: "start" },
        {},
        function (res) {
          console.log(res);
        })
    });
  }, false);

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension');
    if (request.data == 'working') {
      console.log('content script is working!!')
    } else if (request.data == 'error') {
      chrome.tabs.update(tabId,
        {
          url: 'https://www.instagram.com/explore/locations/218019304/troms-norway/'
        },
        function (tab) {
          setTimeout(function () {
            chrome.tabs.sendMessage(tabId,
              { data: "start" },
              {},
              function (res) {
                console.log(res);
              });
          }, 5000);
        });
    }
  });
}, false);