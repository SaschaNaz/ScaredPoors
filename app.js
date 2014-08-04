var MemoryBox = (function () {
    function MemoryBox() {
        this.canvas = document.createElement("canvas");
        this.image = document.createElement("img");
        this.canvasContext = this.canvas.getContext("2d");
    }
    return MemoryBox;
})();

var videoPresenter = null;

var videoControl;

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

var getImageData = function (file, width, height, crop) {
    memoryBox.image.src = URL.createObjectURL(file, { oneTimeOnly: true });

    return new Promise(function (resolve, reject) {
        var sequence = promiseImmediate();
        var asyncOperation = function () {
            if (!memoryBox.image.complete) {
                sequence.then(promiseImmediate).then(asyncOperation);
                return;
            }

            if (memoryBox.image.naturalWidth !== width || memoryBox.image.naturalHeight !== height)
                console.warn(["Different image size is detected.", memoryBox.image.naturalWidth, width, memoryBox.image.naturalHeight, height].join(" "));
            memoryBox.canvasContext.drawImage(memoryBox.image, crop.offsetX, crop.offsetY, crop.width, crop.height, 0, 0, crop.width, crop.height);
            resolve(memoryBox.canvasContext.getImageData(0, 0, crop.width, crop.height));
        };
        sequence.then(asyncOperation);
    });
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
    if (videoControl)
        videoControl.pause();
    if (videoControl !== videoPresenter) {
        videoControl.src = "";
        document.removeChild(videoPresenter.player);
        videoPresenter = null;
    }

    if (videoNativeElement.canPlayType(file.type)) {
        switch (file.type) {
            case "video/avi":
                var player = new MJPEGPlayer();
                presenter.appendChild(player.element);
                videoControl = player;
                videoPresenter = player.element;
                break;
        }
    } else
        videoNativeElement = videoPresenter = videoNativeElement;

    videoControl.src = URL.createObjectURL(file);
    videoControl.play();
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

    MJPEGReader.read(file).then(function (mjpeg) {
        return new Promise(function (resolve, reject) {
            var i = 0;
            var time;

            var finish = function () {
                // operation chain ends
                info.innerText = displayEqualities(equalities);
                resolve(undefined);
                return Promise.reject();
            };

            var sequence = mjpeg.getForwardFrame(0).then(function (frame) {
                i = frame.index;
                time = i / mjpeg.totalFrames * mjpeg.duration;
                return getImageData(frame.data, mjpeg.width, mjpeg.height, crop);
            }).then(function (imageData) {
                lastImageFrame = { time: time, imageData: imageData };
            });

            var asyncOperation = function () {
                var _imageData;
                var next = Math.floor(i + 0.2 / mjpeg.frameInterval);
                if (next >= mjpeg.totalFrames)
                    return finish();

                return mjpeg.getForwardFrame(next).then(function (frame) {
                    i = frame.index;
                    time = i / mjpeg.totalFrames * mjpeg.duration;
                    return getImageData(frame.data, mjpeg.width, mjpeg.height, crop);
                }).then(function (imageData) {
                    _imageData = imageData;
                    return equal(time, imageData);
                }).then(function (equality) {
                    equalities.push({ watched: lastImageFrame.time, judged: equality.currentTime, isOccured: equality.isEqual });
                    lastImageFrame = { time: time, imageData: _imageData };
                    sequence = sequence.then(asyncOperation); // chain operation
                });
            };
            sequence.then(asyncOperation);
        });
    });
};

var getFrame = function (time) {
    videoControl.onseeked = function () {
    };
};

var equal = function (currentTime, imageData) {
    return new Promise(function (resolve, reject) {
        var callback = function (e) {
            imageDiffWorker.removeEventListener("message", callback);
            if (e.data.type == "equality")
                resolve(e.data);
        };
        imageDiffWorker.addEventListener("message", callback);
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageFrame.imageData, data2: imageData, colorTolerance: 100, pixelTolerance: 100 });
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
