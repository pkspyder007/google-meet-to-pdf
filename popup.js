let IS_RECORDING = false

let screenshots = []

chrome.storage.sync.get(["isRecording"], function (result) {
    const icon = $('i');

    const actionText = $('#ssbtn');
    if (result.isRecording) {
        IS_RECORDING = true
        icon.removeClass('fa-play')
        icon.addClass('fa-pause')
        actionText.text("Stop documenting")
    }
    else {
        IS_RECORDING = false
        actionText.text("Start documenting")
        icon.removeClass('fa-pause')
        icon.addClass('fa-play')
    }
})

chrome.storage.sync.get(["subtitleWarning"], function (result) {
    if (result.subtitleWarning) {
        $("#captions-off").css("display", "block");
    }
    else {
        $("#captions-off").css("display", "none");
    }
})

$(".icon-container").on('click', function () {
    // start recording
    IS_RECORDING = !IS_RECORDING;

    const icon = $('i');

    const actionText = $('#ssbtn');

    if (IS_RECORDING) {
        icon.removeClass('fa-play')
        icon.addClass('fa-pause')
        actionText.text("Stop documenting")
        chrome.storage.sync.set({ isRecording: true }, function () { });
        sendMessage({ action: "start_screenshots" });
    } else {
        actionText.text("Start documenting")
        icon.removeClass('fa-pause')
        icon.addClass('fa-play')
        chrome.storage.sync.set({ isRecording: false }, function () { });
        sendMessage({ action: "stop_screenshots" });
    }

})

$("#download-cc").on('click', function () {
    chrome.storage.sync.get(["script", "meet_code"], function (output) {
        const doc = new jsPDF();
        doc.setFillColor(221, 221, 221);
        doc.setLineWidth(1.5);
        doc.rect(0, 0, 220, 60, "F");

        doc.addImage(imgData, 'PNG', 20, 6, 46, 46);

        doc.setLineWidth(1);
        doc.setDrawColor(255, 113, 113);
        doc.line(10, 60, 200, 60);

        doc.setFontSize(37);

        doc.setFont('helvetica');
        doc.setFontType('bold');
        doc.text("Meet Documentor", 190, 28, "right");

        doc.setFontSize(17);
        doc.setFont('times');
        doc.setFontType('italic');
        var today = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        var width = doc.getTextWidth('options');
        width = 147 - width;
        doc.text(today.toLocaleDateString(undefined, options), 190, 38, "right");
        doc.text(output.meet_code, 190, 45, "right");



        doc.setFontSize(16);
        var splitText = doc.splitTextToSize(output.script, 170);

        var y = 70;

        for (var i = 0; i < splitText.length; i++) {
            if (y > 280) {
                y = 10;
                doc.addPage();
            }
            var res = splitText[i].split(":");

            if (res.length > 1) {
                y = y + 5;
                var name = res[0].concat(" :");
                var width = doc.getTextWidth(name);
                var conversation = res[1];

                doc.setFontType('bold');
                doc.text(10, y, name);
                doc.setFontType('normal');
                doc.text(15 + width, y, conversation);
            } else {
                doc.text(30, y, splitText[i]);
            }
            y = y + 7;
        }

        doc.save(output.meet_code + "-cc.pdf");

    })
})

$("#download-ss").on('click', function () {
    chrome.storage.sync.get(["script", "meet_code"], function (output) {
        const doc = new jsPDF();
        doc.setFillColor(221, 221, 221);
        doc.setLineWidth(1.5);
        doc.rect(0, 0, 220, 60, "F");

        doc.addImage(imgData, 'PNG', 20, 6, 46, 46);

        doc.setLineWidth(1);
        doc.setDrawColor(255, 113, 113);
        doc.line(10, 60, 200, 60);

        doc.setFontSize(37);

        doc.setFont('helvetica');
        doc.setFontType('bold');
        doc.text("Meet Documentor", 190, 28, "right");

        doc.setFontSize(17);
        doc.setFont('times');
        doc.setFontType('italic');
        var today = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        var width = doc.getTextWidth('options');
        width = 147 - width;
        doc.text(today.toLocaleDateString(undefined, options), 190, 38, "right");
        doc.text(output.meet_code, 190, 45, "right");


        // let htmlStr = ''

        // screenshots.forEach(img => {
        //     htmlStr +=
        //         `<div>
        //         <img src="${img}" />
        //     </div>`
        // })


        // doc.addHTML($(".pdf-wrapper"), {
        //     pageSplit: true
        // }, function () {
        //     doc.save(output.meet_code + "-ss.pdf");
        // });
        // doc.html(htmlStr, {
        //     callback: function (pdf) {
        //         doc.save(output.meet_code + "-ss.pdf");
        //     },
        //     x: 5,
        //     y: 60
        // });

        // add all images
        screenshots.forEach((img) => {
            doc.addImage(img, 6, 70, 200, 150);
            doc.addPage();
        })

        doc.save(output.meet_code + "-ss.pdf");
    })

})


function setScreenshotUrl(urls) {
    // console.log(urls);
    screenshots = urls
}


function sendMessage(message) {
    chrome.runtime.sendMessage(message, function (response) {
        console.log(response);
    });
}

function getCurrentTab(callback) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
        if (chrome.runtime.lastError)
            console.error(chrome.runtime.lastError);
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        callback(tab);
    });
}

chrome.tabs.onRemoved.addListener(
    function () {
        // getCurrentTab((tab) => {
        // set recording to false
        chrome.storage.sync.set({ isRecording: false }, function () { });
        // })
    },
)