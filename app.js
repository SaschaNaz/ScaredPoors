var MemoryBox = (function () {
    function MemoryBox() {
        this.canvas = document.createElement("canvas");
        this.image = document.createElement("img");
        this.canvasContext = this.canvas.getContext("2d");
    }
    return MemoryBox;
})();

var analyzer = new ScaredPoors();
var lastImageFrame = [];
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

var loadVideo = function (file) {
    target.src = URL.createObjectURL(file);
};

var loadMJPEG = function (file) {
    var crop = {
        offsetX: 139,
        offsetY: 236,
        width: 309,
        height: 133
    };
    MJPEGReader.read(file).then(function (mjpeg) {
        return new Promise(function (resolve, reject) {
            memoryBox.canvas.width = crop.width;
            memoryBox.canvas.height = crop.height;

            var finish = function () {
                // operation chain ends
                info.innerText = displayEqualities(equalities);
                resolve(undefined);
                return Promise.reject();
            };

            var i = 0;
            var time;
            var sequence = mjpeg.getForwardFrame(0).then(function (frame) {
                if (!frame)
                    return Promise.reject();
                i = frame.index;
                time = i / mjpeg.totalFrames * mjpeg.duration;
                return getImageData(frame.data, mjpeg.width, mjpeg.height, crop);
            }).then(function (imageData) {
                lastImageFrame.push({ time: time, imageData: imageData });
            }, finish);

            var asyncOperation = function () {
                var _imageData;
                return mjpeg.getForwardFrame(i + 1).then(function (frame) {
                    if (!frame)
                        return Promise.reject();

                    i = frame.index;
                    time = i / mjpeg.totalFrames * mjpeg.duration;
                    return getImageData(frame.data, mjpeg.width, mjpeg.height, crop);
                }).then(function (imageData) {
                    _imageData = imageData;
                    return equal(time, imageData);
                }, finish).then(function (equality) {
                    equalities.push({ watched: lastImageFrame[0].time, judged: equality.currentTime, isOccured: equality.isEqual });
                    lastImageFrame.push({ time: time, imageData: _imageData });
                    while (time - lastImageFrame[0].time > 0.25)
                        lastImageFrame.shift();
                    sequence = sequence.then(asyncOperation); // chain operation
                });
            };
            sequence.then(asyncOperation);
        });
    });
    //MJPEGReader.read(file, (mjpeg) => {
    //    memoryBox.canvas.width = crop.width;
    //    memoryBox.canvas.height = crop.height;
    //    var i = 0;
    //    {
    //        var frame = mjpeg.getForwardFrame(i);
    //        if (!frame)
    //            return;
    //        i = frame.index;
    //        var time = i / mjpeg.totalFrames * mjpeg.duration;
    //        var imageData = getImageData(frame.data, mjpeg.width, mjpeg.height, crop);
    //        lastImageFrame.push({ time: time, imageData: imageData });
    //    }
    //    var operateAsync = () => {
    //        var frame = mjpeg.getForwardFrame(i + 1);
    //        if (!frame) {
    //            //console.log(equalities.map(function (equality) { return JSON.stringify(equality) }).join("\r\n"));
    //            info.innerText = displayEqualities(equalities);
    //            return;
    //        }
    //        i = frame.index;
    //        var time = i / mjpeg.totalFrames * mjpeg.duration;
    //        var imageData = getImageData(frame.data, mjpeg.width, mjpeg.height, crop);
    //        equalAsync(time, imageData, (equality) => {
    //            equalities.push({ watched: lastImageFrame[0].time, judged: equality.currentTime, isOccured: equality.isEqual });
    //            lastImageFrame.push({ time: time, imageData: imageData });
    //            while (time - lastImageFrame[0].time > 0.25)
    //                lastImageFrame.shift();
    //            window.setImmediate(operateAsync);
    //        });
    //    }
    //    operateAsync();
    //});
};

var equal = function (currentTime, imageData) {
    return new Promise(function (resolve, reject) {
        var callback = function (e) {
            imageDiffWorker.removeEventListener("message", callback);
            if (e.data.type == "equality")
                resolve(e.data);
        };
        imageDiffWorker.addEventListener("message", callback);
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageFrame[0].imageData, data2: imageData, colorTolerance: 100, pixelTolerance: 100 });
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
            if (last)
                last.duration = parseFloat((last.end - last.start).toFixed(3));
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
