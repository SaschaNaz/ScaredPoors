var MemoryBox = (function () {
    function MemoryBox() {
        this.canvas = document.createElement("canvas");
        this.image = document.createElement("img");
        this.canvasContext = this.canvas.getContext("2d");
    }
    return MemoryBox;
})();

var videoPresenter = null;

var videoControl = null;

var analyzer = new ScaredPoors();
var lastImageFrame;
var loadedArrayBuffer;
var memoryBox = new MemoryBox();
var equalities = [];

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

var getImageDataFromBlob = function (file, width, height, crop) {
    memoryBox.image.src = URL.createObjectURL(file, { oneTimeOnly: true });

    return exportImageDataFromImage(memoryBox.image, width, height, crop);
};

var promiseImmediate = function () {
    return new Promise(function (resolve, reject) {
        window.setImmediate(function () {
            resolve(undefined);
        });
    });
};

/*
TODO
fix loadMJPEG to use VideoPlayable interface
no getFrame in HTMLVideoElement, should make equivalent method (with canvas)
*/
var loadVideo = function (file) {
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
    } else
        videoPresenter = videoControl = videoNativeElement;

    videoControl.src = URL.createObjectURL(file);

    return waitMetadata().then(function () {
        return startAnalyze();
    });
};

var waitMetadata = function () {
    return new Promise(function (resolve, reject) {
        videoControl.onloadedmetadata = function () {
            videoControl.onloadedmetadata = null;
            resolve(undefined);
        };
    });
};

var startAnalyze = function () {
    var crop = {
        offsetX: 139,
        offsetY: 236,
        width: 309,
        height: 133
    };
    memoryBox.canvas.width = crop.width;
    memoryBox.canvas.height = crop.height;

    var sequence = getFrameImageData(0, videoControl.videoWidth, videoControl.videoHeight, crop).then(function (imageData) {
        lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
    });

    for (var time = 0.1; time < videoControl.duration; time += 0.1) {
        (function (time) {
            var imageData;
            sequence = sequence.then(function () {
                return getFrameImageData(time, videoControl.videoWidth, videoControl.videoHeight, crop);
            }).then(function (_imageData) {
                imageData = _imageData;
                return equal(videoControl.currentTime, imageData);
            }).then(function (equality) {
                equalities.push({ watched: lastImageFrame.time, judged: equality.currentTime, isOccured: equality.isEqual });
                lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
            });
        })(time);
    }

    return sequence.then(function () {
        info.innerText = displayEqualities(equalities);
    });
    //var asyncOperation = () => {
    //    var _imageData: ImageData;
    //    var next = time + 0.2;
    //    if (next > videoControl.duration)
    //        return finish;
    //    getFrameImageData(next, videoControl.videoWidth, videoControl.videoHeight, crop)
    //        .then((imageData) => {
    //        });
    //};
    //var sequence = mjpeg.getForwardFrame(0)
    //    .then((frame) => {
    //        i = frame.index;
    //        time = i / mjpeg.totalFrames * mjpeg.duration;
    //        return getImageDataFromBlob(frame.data, mjpeg.width, mjpeg.height, crop);
    //    }).then((imageData) => {
    //        lastImageFrame = { time: time, imageData: imageData };
    //    });
    //var asyncOperation = () => {
    //    var _imageData: ImageData;
    //    var next = Math.floor(i + 0.2 / mjpeg.frameInterval);
    //    if (next >= mjpeg.totalFrames)
    //        return finish();
    //    return mjpeg.getForwardFrame(next)
    //        .then<ImageData>((frame) => {
    //            i = frame.index;
    //            time = i / mjpeg.totalFrames * mjpeg.duration;
    //            return getImageDataFromBlob(frame.data, mjpeg.width, mjpeg.height, crop);
    //        }).then((imageData) => {
    //            _imageData = imageData;
    //            return equal(time, imageData);
    //        }).then((equality) => {
    //            equalities.push({ watched: lastImageFrame.time, judged: equality.currentTime, isOccured: equality.isEqual });
    //            lastImageFrame = { time: time, imageData: _imageData };
    //            sequence = sequence.then<void>(asyncOperation); // chain operation
    //        });
    //};
    //sequence.then(asyncOperation);
    //});
};

var getFrameImageData = function (time, originalWidth, originalHeight, crop) {
    return new Promise(function (resolve, reject) {
        videoControl.onseeked = function () {
            videoControl.onseeked = null;
            if (videoControl === videoPresenter) {
                memoryBox.canvasContext.drawImage(videoPresenter, crop.offsetX, crop.offsetY, crop.width, crop.height, 0, 0, crop.width, crop.height);
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
        var sequence = promiseImmediate();
        var asyncOperation = function () {
            if (!img.complete) {
                sequence.then(promiseImmediate).then(asyncOperation);
                return;
            }

            if (img.naturalWidth !== width || img.naturalHeight !== height)
                console.warn(["Different image size is detected.", img.naturalWidth, width, img.naturalHeight, height].join(" "));
            memoryBox.canvasContext.drawImage(img, crop.offsetX, crop.offsetY, crop.width, crop.height, 0, 0, crop.width, crop.height);
            resolve(memoryBox.canvasContext.getImageData(0, 0, crop.width, crop.height));
        };
        sequence.then(asyncOperation);
    });
};

var equal = function (currentTime, imageData) {
    return new Promise(function (resolve, reject) {
        var callback = function (e) {
            imageDiffWorker.removeEventListener("message", callback);
            if (e.data.type == "equality")
                resolve(e.data);
        };
        imageDiffWorker.addEventListener("message", callback);
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageFrame.imageData, data2: imageData, colorTolerance: 60, pixelTolerance: 100 });
    });
};

var displayEqualities = function (freezings) {
    var continuousFreezing = [];
    var movedLastTime = true;
    var last;
    freezings.forEach(function (freezing) {
        if (!freezing.isOccured) {
            movedLastTime = true;
            return;
        }

        if (movedLastTime) {
            if (last) {
                last.duration = parseFloat((last.end - last.start).toFixed(3));
                if (last.duration < 1.5)
                    continuousFreezing.pop();
            }
            last = { start: parseFloat(freezing.watched.toFixed(3)), end: parseFloat(freezing.judged.toFixed(3)) };
            continuousFreezing.push(last);
        } else
            last.end = parseFloat(freezing.judged.toFixed(3));

        movedLastTime = false;
    });
    last.duration = parseFloat((last.end - last.start).toFixed(3));
    return continuousFreezing.map(function (freezing) {
        return JSON.stringify(freezing);
    }).join("\r\n") + "\r\n\r\n" + getTotalDuration(continuousFreezing);
};

var getTotalDuration = function (continuities) {
    var total = 0;
    continuities.forEach(function (continuity) {
        total += continuity.duration;
    });
    return total;
};
//# sourceMappingURL=app.js.map
