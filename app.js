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

var analyze = function (crop, calibration) {
    //crop = {
    //    x: 139,
    //    y: 236,
    //    width: 309,
    //    height: 133
    //}
    var manager = new FreezingManager();

    //var threshold = 100;
    var threshold = Math.round(calibration * 1.6);

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
