console.log("BACKGROUND");

const SCREENSHOT_INTERVAL = 3000;

let VUID = 101;

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

chrome.runtime.onMessage.addListener(messageResponder);

function takeScreenshot() {
  chrome.tabs.captureVisibleTab(null, { format: "png"}, (screenshotUrl) => {
    if(screenshotUrl) {
        screenshots.push(screenshotUrl);
    }
  });
}

function openScreenShotsInNewTab() {
    let targetId = null;
  const viewTabUrl = chrome.extension.getURL('popup.html');
//   const viewTabUrl = chrome.extension.getURL('screenshots.html?id=' + VUID++);
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
  screenshots = [];
//   chrome.tabs.create({ url: viewTabUrl }, (tab) => {
//     targetId = tab.id;
//   });
}
