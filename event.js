// caption start
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.todo == "activate") {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            chrome.pageAction.show(tabs[0].id)
        })
    }
})

chrome.storage.onChanged.addListener(function(result, namespaces){
    if (result.subtitleWarning) {
        if(result.subtitleWarning.newValue){
            var notifOption = {
                type: "basic",
                iconUrl: "round-table.png",
                title: "Caption Off!",
                message: "Please turn on CAPTIONS!!"
            };
            chrome.notifications.create("captionOff", notifOption);
        }  
    }
})

// caption end

// screenshots start

const SCREENSHOT_INTERVAL = 3000;

let screenshots = [];

let timer = null;

function messageResponder(req, senderInfo, cb) {
  if (req.action && req.action === "start_screenshots") {
    timer = setInterval(takeScreenshot, SCREENSHOT_INTERVAL);
  }

  if (req.action && req.action === "stop_screenshots") {
    openScreenShotsInNewTab();
  }
}


function takeScreenshot() {
    chrome.tabs.captureVisibleTab(null, { format: "jpeg"}, (screenshotUrl) => {
        if(screenshotUrl) {
            screenshots.push(screenshotUrl);
    }
  });
}

function openScreenShotsInNewTab() {
  const viewTabUrl = chrome.extension.getURL('popup.html');
  const views = chrome.extension.getViews();
  for (let i = 0; i < views.length; i++) {
      let view = views[i];
    if (view.document.URL == viewTabUrl) {
        view.setScreenshotUrl(screenshots);
      break;
    }
  }
  clearInterval(timer);
  timer = null;
  console.log(screenshots);
  screenshots = [];
}


chrome.runtime.onMessage.addListener(messageResponder);

