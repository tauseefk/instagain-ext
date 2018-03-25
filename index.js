document.addEventListener('DOMContentLoaded', function () {
  var checkPageButton = document.getElementById('instagain');
  checkPageButton.addEventListener('click', function () {

    chrome.tabs.query({ active: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id,
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
    if (request.data == 'start') {
      sendResponse({ farewell: 'goodbye' });
    } else if (request.data == 'error') {
      chrome.tabs.update(tabs[0].id,
        {
          url: 'https://www.instagram.com/explore/locations/218019304/troms-norway/'
        });
    }
  });
}, false);