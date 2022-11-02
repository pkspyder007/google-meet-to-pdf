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

chrome.storage.onChanged.addListener(function (result, namespaces) {
  if (result.subtitleWarning) {
    if (result.subtitleWarning.newValue) {
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

// compare images
async function compareImages(img1, img2) {
  try {
    deepai.setApiKey('<add_your_api_key_here>');

    let node1 = document.createElement('img');
    node1.src = img1;
    let node2 = document.createElement('img');
    node2.src = img2;
    let resp = await deepai.callStandardApi("image-similarity", {
      image1: node1,
      image2: node2,
    });

    if(resp?.output?.distance > 30) {
      return true;
    }
    
    return false;

  } catch (error) {
    console.log(error);
    return true
  }
}

function takeScreenshot() {
  chrome.tabs.captureVisibleTab(null, { format: "jpeg" }, async (screenshotUrl) => {
    if (!screenshotUrl) {
      return;
    }
    if (screenshots.length == 0) {
      screenshots.push(screenshotUrl);
      return;
    }

    // screenshots.push(screenshotUrl);

    const res = await compareImages(screenshots[screenshots.length - 1], screenshotUrl);
    if(res) {
      screenshots.push(screenshotUrl);
      console.log("addding screenshot");
    }
    console.log("skipping screenshot");


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

