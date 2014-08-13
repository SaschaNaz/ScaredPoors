/*
TODO:
Change the text below the title as phase changes
1. Load file
2. Select target area
3. Set the threshold value from user-measured reference length and subject volume
*/
var MemoryBox = (function () {
    function MemoryBox() {
        this.canvas = document.createElement("canvas");
        this.canvasContext = this.canvas.getContext("2d");
    }
    return MemoryBox;
})();

var videoPresenter = null;
var videoControl = null;

var analyzer = new ScaredPoors();
var lastImageFrame;
var memoryBox = new MemoryBox();


if (!window.setImmediate) {
    window.setImmediate = function (expression) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        return window.setTimeout.apply(window, [expression, 0].concat(args));
    };
}

var imageDiffWorker = new Worker("imagediffworker.js");

var promiseImmediate = function () {
    return new Promise(function (resolve, reject) {
        window.setImmediate(function () {
            resolve(undefined);
        });
    });
};

var loadVideo = function (file) {
    panel.onclick = null;

    if (videoControl) {
        videoControl.pause();
        if (videoControl !== videoPresenter) {
            videoControl.src = "";
            document.removeChild(videoPresenter.player);
            videoPresenter = null;
        }
    }

    if (!videoNativeElement.canPlayType(file.type)) {
        switch (file.type) {
            case "video/avi":
                var player = new MJPEGPlayer();
                presenter.appendChild(player.element);
                videoControl = player;
                videoPresenter = player.element;
                break;
        }
    } else {
        videoPresenter = videoControl = videoNativeElement;
        videoNativeElement.style.display = "";
    }

    videoControl.src = URL.createObjectURL(file);

    return VideoElementExtension.waitMetadata(videoControl).then(function () {
        openOptions.style.display = "";
        var dragPresenter = new DragPresenter(panel, videoPresenter, "targetArea");
        phaseText.innerHTML = "Drag the screen to specify the analysis target area.\
        Then, click the bottom bar to proceed.\
        Open the options pages to adjust parameters.".replace(/\s\s+/g, "<br />");
        statusPresenter.onclick = function () {
            if (dragPresenter.isDragged) {
                phaseText.style.display = openOptions.style.display = "none";
                analysisText.style.display = "";
                dragPresenter.close();
                startAnalyze(dragPresenter.getTargetArea());
            }
        };
    });
};

var startAnalyze = function (crop) {
    memoryBox.canvas.width = crop.width;
    memoryBox.canvas.height = crop.height;
    var manager = new FreezingManager();

    var sequence = getFrameImageData(0, videoControl.videoWidth, videoControl.videoHeight, crop).then(function (imageData) {
        lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
    });

    for (var time = 0.1; time <= videoControl.duration; time += 0.1) {
        (function (time) {
            var imageData;
            sequence = sequence.then(function () {
                return getFrameImageData(time, videoControl.videoWidth, videoControl.videoHeight, crop);
            }).then(function (_imageData) {
                imageData = _imageData;
                return equal(videoControl.currentTime, imageData);
            }).then(function (equality) {
                manager.loadOccurrence({ watched: lastImageFrame.time, judged: equality.time, isOccured: equality.isEqual });
                lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
            });
        })(time);
    }

    return sequence.then(function () {
        frozenRatioText.textContent = manager.frozenRatio.toFixed(2);
    });
};

var getFrameImageData = function (time, originalWidth, originalHeight, crop) {
    return new Promise(function (resolve, reject) {
        videoControl.onseeked = function () {
            videoControl.onseeked = null;
            if (videoControl === videoPresenter) {
                memoryBox.canvasContext.drawImage(videoPresenter, crop.left, crop.top, crop.width, crop.height, 0, 0, crop.width, crop.height);
                resolve(memoryBox.canvasContext.getImageData(0, 0, crop.width, crop.height));
            } else {
                exportImageDataFromImage(videoPresenter, originalWidth, originalHeight, crop).then(function (imageData) {
                    return resolve(imageData);
                });
                //draw image, as getImageData does.
            }
        };
        videoControl.currentTime = time;
    });
};

var exportImageDataFromImage = function (img, width, height, crop) {
    return new Promise(function (resolve, reject) {
        var asyncOperation = function () {
            if (!img.complete) {
                promiseImmediate().then(asyncOperation);
                return;
            }

            if (img.naturalWidth !== width || img.naturalHeight !== height)
                console.warn(["Different image size is detected.", img.naturalWidth, width, img.naturalHeight, height].join(" "));
            memoryBox.canvasContext.drawImage(img, crop.left, crop.top, crop.width, crop.height, 0, 0, crop.width, crop.height);
            resolve(memoryBox.canvasContext.getImageData(0, 0, crop.width, crop.height));
        };
        promiseImmediate().then(asyncOperation);
    });
};

var equal = function (time, imageData) {
    return new Promise(function (resolve, reject) {
        var callback = function (e) {
            imageDiffWorker.removeEventListener("message", callback);
            if (e.data.type == "equality")
                resolve(e.data);
        };
        imageDiffWorker.addEventListener("message", callback);
        imageDiffWorker.postMessage({
            type: "equal", time: time,
            data1: lastImageFrame.imageData, data2: imageData, colorTolerance: 60, pixelTolerance: 100
        });
    });
};
//# sourceMappingURL=app.js.map
