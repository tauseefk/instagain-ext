document.addEventListener('DOMContentLoaded', function () {
  let input = document.querySelector('#likeInput');
  let valueLabel = document.querySelector('label');

  input.addEventListener('change', e => {
    valueLabel.textContent = e.target.value;
  });

  var startButton = document.getElementById('start');
  var continueButton = document.getElementById('continue');
  var tabIds = [];
  startButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true }, function (tabs) {
      tabIds.push(tabs.filter(tab => tabIds.indexOf(tab.id) === -1).map(tab => tab.id));
      tabs.forEach(({ id }) => {
        chrome.tabs.sendMessage(id,
        {
          data: {
            operation: 'start',
            count: parseInt(valueLabel.textContent)
          }
        },
        {},
        function (res) {
          console.log(res);
        });
      });
    });
  }, false);

  continueButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true }, function (tabs) {
      tabIds.push(tabs.filter(tab => tabIds.indexOf(tab.id) === -1).map(tab => tab.id));
      tabs.forEach(({ id }) => {
        chrome.tabs.sendMessage(id,
          {
            data: {
              operation: 'continue',
              count: parseInt(valueLabel.textContent)
            }
          },
          {},
          function (res) {
            console.log(res);
        });
      });
    });
  }, false);

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log(sender.tab ?
      'from a content script:' + sender.tab.url :
      'from the extension');
    if (request.data == 'working') {
      console.log('content script is working!!')
    } else if (request.data == 'error') {
      chrome.tabs.update(sender.tab.id,
        {
          url: 'https://www.instagram.com/fujifeed/'
        },
        function (tab) {
          setTimeout(function () {
            chrome.tabs.sendMessage(sender.tab.id,
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
