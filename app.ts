class MemoryBox {
    canvas = document.createElement("canvas");
    canvasContext: CanvasRenderingContext2D;
    image = document.createElement("img");
    constructor() {
        this.canvasContext = this.canvas.getContext("2d");
    }
}

declare var target: HTMLVideoElement;
declare var info: HTMLSpanElement;
declare var imagediff: any;
var analyzer = new ScaredPoors();
var lastImageFrame: FrameData[] = [];
var loadedArrayBuffer: ArrayBuffer;
var memoryBox = new MemoryBox();
var equalities: Occurrence[] = [];
interface ImageCropInfomation {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
}
interface FrameData {
    time: number;
    imageData: ImageData;
}
interface Occurrence {
    isOccured: boolean;
    watched: number;
    judged: number;
}
interface Continuity {
    start: number;
    end: number;
    duration?: number;
}
interface Equality {
    type: string;
    isEqual: boolean;
    currentTime: number;
}

if (!window.setImmediate) {
    window.setImmediate = (expression: any, ...args: any[]) => window.setTimeout.apply(window, [expression, 0].concat(args));
}

var imageDiffWorker = new Worker("imagediffworker.js");

var getImageData = (file: Blob, width: number, height: number, crop: ImageCropInfomation) => {
    memoryBox.image.src = URL.createObjectURL(file, { oneTimeOnly: true });

    return new Promise<ImageData>((resolve, reject) => {
        var sequence = promiseImmediate();
        var asyncOperation = () => {
            if (!memoryBox.image.complete) {
                sequence.then(promiseImmediate).then(asyncOperation);
                return;
            }

            if (memoryBox.image.naturalWidth !== width
                || memoryBox.image.naturalHeight !== height)
                console.warn(["Different image size is detected.", memoryBox.image.naturalWidth, width, memoryBox.image.naturalHeight, height].join(" "));
            memoryBox.canvasContext.drawImage(memoryBox.image, crop.offsetX, crop.offsetY, crop.width, crop.height, 0, 0, crop.width, crop.height);
            resolve(memoryBox.canvasContext.getImageData(0, 0, crop.width, crop.height));
        };
        sequence.then(asyncOperation);
    });
};

var promiseImmediate = () =>
    new Promise(function (resolve, reject) {
        window.setImmediate(function () {
            resolve(undefined);
        });
    });


var loadVideo = (file: Blob) => {
    target.src = URL.createObjectURL(file);
};

var loadMJPEG = (file: Blob) => {
    var crop: ImageCropInfomation = {
        offsetX: 139,
        offsetY: 236,
        width: 309,
        height: 133
    }
    MJPEGReader.read(file).then((mjpeg) => new Promise((resolve, reject) => {
        memoryBox.canvas.width = crop.width;
        memoryBox.canvas.height = crop.height;    

        var finish = () => {
            // operation chain ends
            info.innerText = displayEqualities(equalities);
            resolve(undefined)
            return Promise.reject();
        };

        var i = 0;
        var time: number;
        var sequence = mjpeg.getForwardFrame(0)
            .then((frame) => {
                if (!frame)
                    return Promise.reject();
                i = frame.index;
                time = i / mjpeg.totalFrames * mjpeg.duration;
                return getImageData(frame.data, mjpeg.width, mjpeg.height, crop);
            }).then((imageData) => {
                lastImageFrame.push({ time: time, imageData: imageData });
            }, finish);

        var asyncOperation = () => {
            var _imageData: ImageData;
            return mjpeg.getForwardFrame(i + 1)
                .then<ImageData>((frame) => {
                    if (!frame)
                        return Promise.reject(); // finish this operation chain

                    i = frame.index;
                    time = i / mjpeg.totalFrames * mjpeg.duration;
                    return getImageData(frame.data, mjpeg.width, mjpeg.height, crop);
                }).then((imageData) => {
                    _imageData = imageData;
                    return equal(time, imageData);
                }, finish).then((equality) => {
                    equalities.push({ watched: lastImageFrame[0].time, judged: equality.currentTime, isOccured: equality.isEqual });
                    lastImageFrame.push({ time: time, imageData: _imageData });
                    while (time - lastImageFrame[0].time > 0.25)
                        lastImageFrame.shift();
                    sequence = sequence.then<void>(asyncOperation); // chain operation
                });
        };
        sequence.then(asyncOperation);
    }));
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

var equal = (currentTime: number, imageData: ImageData) => {
    return new Promise<Equality>((resolve, reject) => {
        var callback = (e: MessageEvent) => {
            imageDiffWorker.removeEventListener("message", callback);
            if (e.data.type == "equality")
                resolve(e.data);
        };
        imageDiffWorker.addEventListener("message", callback);
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageFrame[0].imageData, data2: imageData, colorTolerance: 100, pixelTolerance: 100 });
    });
};

var displayEqualities = (freezings: Occurrence[]) => {
    var continuousFreezing: Continuity[] = [];
    var movedLastTime = true;
    var last: Continuity;
    freezings.forEach((freezing) => {
        if (!freezing.isOccured) {
            movedLastTime = true;
            return;
        }

        if (movedLastTime) {
            if (last)
                last.duration = parseFloat((last.end - last.start).toFixed(3));
            last = { start: parseFloat(freezing.watched.toFixed(3)), end: parseFloat(freezing.judged.toFixed(3)) };
            continuousFreezing.push(last);
        }
        else
            last.end = parseFloat(freezing.judged.toFixed(3));

        movedLastTime = false;
    });
    last.duration = parseFloat((last.end - last.start).toFixed(3));
    return continuousFreezing.map((freezing) => { return JSON.stringify(freezing); }).join("\r\n")
        + "\r\n\r\n" + getTotalDuration(continuousFreezing);
}

var getTotalDuration = (continuities: Continuity[]) => {
    var total = 0;
    continuities.forEach((continuity) => {
        total += continuity.duration;
    });
    return total;
}