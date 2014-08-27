/*
TODO:
Change the text below the title as phase changes
1. Load file
2. Select target area
3. Set the threshold value from user-measured reference length and subject volume
*/
var videoPresenter = null;
var videoControl = null;

var analyzer = new ScaredPoors();
var lastImageFrame;


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

//var loadVideo = (file: Blob) => {
//    panel.onclick = null;
//    if (videoControl) {
//        videoControl.pause();
//        if (videoControl !== <any>videoPresenter) {
//            videoControl.src = "";
//            document.removeChild((<any>videoPresenter).player);
//            videoPresenter = null;
//        }
//    }
//    if (!videoNativeElement.canPlayType(file.type)) {
//        switch (file.type) {
//            case "video/avi":
//                var player = new MJPEGPlayer();
//                presenter.appendChild(player.element);
//                videoControl = player;
//                videoPresenter = player.element;
//                break;
//        }
//    }
//    else {
//        videoPresenter = videoControl = videoNativeElement;
//        videoNativeElement.style.display = "";
//    }
//    videoControl.src = URL.createObjectURL(file);
//    return VideoElementExtensions.waitMetadata(videoControl).then(() => {
//        openOptions.style.display = areaText.style.display = "";
//        videoSlider.max = videoControl.duration.toString();
//        phaseText.innerHTML =
//        "Drag the screen to specify the analysis target area.\
//        Then, click the bottom bar to proceed.\
//        Open the options pages to adjust parameters.".replace(/\s\s+/g, "<br />");
//        var dragPresenter = new DragPresenter(panel, videoPresenter, "targetArea");
//        var scaleToOriginal = (area: Area) => {
//            var scaleX = videoControl.videoWidth / videoPresenter.clientWidth;
//            var scaleY = videoControl.videoHeight / videoPresenter.clientHeight;
//            return {
//                x: Math.round(area.x * scaleX),
//                y: Math.round(area.y * scaleY),
//                width: Math.round(area.width * scaleX),
//                height: Math.round(area.height * scaleY)
//            };
//        };
//        dragPresenter.ondragsizechanged = (area) => {
//            area = scaleToOriginal(area);
//            areaXText.textContent = area.x.toFixed();
//            areaYText.textContent = area.y.toFixed();
//            areaWidthText.textContent = area.width.toFixed();
//            areaHeightText.textContent = area.height.toFixed();
//        };
//        statusPresenter.onclick = () => {
//            if (dragPresenter.isDragged) {
//                phaseText.style.display = openOptions.style.display = areaText.style.display = "none";
//                analysisText.style.display = "";
//                dragPresenter.close();
//                analyze(scaleToOriginal(dragPresenter.getTargetArea()));
//            }
//        };
//    });
//};
var analyze = function (crop) {
    //crop = {
    //    x: 139,
    //    y: 236,
    //    width: 309,
    //    height: 133
    //}
    var manager = new FreezingManager();

    //var threshold = 100;
    var threshold = Math.round(crop.width * crop.height * 1.2e-2);

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
                return equal(videoControl.currentTime, imageData, threshold);
            }).then(function (equality) {
                manager.loadStopping({ watched: lastImageFrame.time, judged: equality.time, isOccured: equality.isEqual });
                lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
            }).catch(function (error) {
                error;
            });
        })(time);
    }

    return sequence.then(function () {
        manager.flushInput();
        frozenRatioText.textContent = manager.frozenRatio.toFixed(2);
        return manager.freezingTimeline;
    });
};

var getFrameImageData = function (time, originalWidth, originalHeight, crop) {
    return VideoElementExtensions.seek(videoControl, time).then(function () {
        if (videoPresenter instanceof HTMLVideoElement) {
            return WindowExtensions.createImageData(videoPresenter, crop.x, crop.y, crop.width, crop.height);
        } else {
            return ImageElementExtensions.waitCompletion(videoPresenter).then(function () {
                return WindowExtensions.createImageData(videoPresenter, crop.x, crop.y, crop.width, crop.height);
            });
        }
    });
};

var equal = function (time, imageData, pixelTolerance) {
    return new Promise(function (resolve, reject) {
        var callback = function (e) {
            imageDiffWorker.removeEventListener("message", callback);
            if (e.data.type == "equality")
                resolve(e.data);
        };
        imageDiffWorker.addEventListener("message", callback);
        imageDiffWorker.postMessage({
            type: "equal", time: time,
            data1: lastImageFrame.imageData, data2: imageData, colorTolerance: 60, pixelTolerance: pixelTolerance
        });
    });
};
//# sourceMappingURL=app.js.map
