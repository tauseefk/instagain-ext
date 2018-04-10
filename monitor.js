(function () {
  const tabStorage = {};
  const networkFilters = {
    urls: [
      "https://www.instagram.com/web/likes/*"
    ]
  };

  chrome.webRequest.onBeforeRequest.addListener((details) => {
    const { tabId, requestId } = details;
    if (!tabStorage.hasOwnProperty(tabId)) {
      return;
    }

    tabStorage[tabId].requests[requestId] = {
      requestId: requestId,
      url: details.url,
      startTime: details.timeStamp,
      status: 'pending'
    };

  }, networkFilters);

  chrome.webRequest.onCompleted.addListener((details) => {
    const { tabId, requestId } = details;
    if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
      return;
    }

    const request = tabStorage[tabId].requests[requestId];

    Object.assign(request, {
      endTime: details.timeStamp,
      requestDuration: details.timeStamp - request.startTime,
      status: 'complete'
    });

    if (details.statusCode !== 200) {
      chrome.tabs.update(tabId, {
        url: "https://www.instagram.com/tauseef25"
      });
    }

  }, networkFilters);

  chrome.webRequest.onErrorOccurred.addListener((details) => {
    const { tabId, requestId } = details;
    if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
      return;
    }

    const request = tabStorage[tabId].requests[requestId];
    Object.assign(request, {
      endTime: details.timeStamp,
      status: 'error',
    });
    console.log(tabStorage[tabId].requests[requestId]);
  }, networkFilters);

  chrome.tabs.onActivated.addListener((tab) => {
    const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
    if (!tabStorage.hasOwnProperty(tabId)) {
      tabStorage[tabId] = {
        id: tabId,
        requests: {},
        registerTime: new Date().getTime()
      };
    }
  });
  chrome.tabs.onRemoved.addListener((tab) => {
    const tabId = tab.tabId;
    if (!tabStorage.hasOwnProperty(tabId)) {
      return;
    }
    tabStorage[tabId] = null;
  });
}());