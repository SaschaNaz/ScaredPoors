class MemoryBox {
    canvas = document.createElement("canvas");
    canvasContext: CanvasRenderingContext2D;
    image = document.createElement("img");
    constructor() {
        this.canvasContext = this.canvas.getContext("2d");
    }
}

declare var videoNativeElement: HTMLVideoElement;
var videoPresenter: HTMLElement = null;
declare var presenter: HTMLDivElement;
var videoControl: VideoPlayable = null;

declare var info: HTMLSpanElement;
var analyzer = new ScaredPoors();
var lastImageFrame: FrameData;
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

var getImageDataFromBlob = (file: Blob, width: number, height: number, crop: ImageCropInfomation) => {
    memoryBox.image.src = URL.createObjectURL(file, { oneTimeOnly: true });

    return exportImageDataFromImage(memoryBox.image, width, height, crop);
};

var promiseImmediate = () =>
    new Promise<void>((resolve, reject) => {
        window.setImmediate(() => {
            resolve(undefined);
        });
    });


/*
TODO
fix loadMJPEG to use VideoPlayable interface
no getFrame in HTMLVideoElement, should make equivalent method (with canvas)
*/

var loadVideo = (file: Blob) => {
    if (videoControl) {
        videoControl.pause();
        if (videoControl !== <any>videoPresenter) {
            videoControl.src = "";
            document.removeChild((<any>videoPresenter).player);
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
    }
    else
        videoPresenter = videoControl = videoNativeElement;
    
    videoControl.src = URL.createObjectURL(file);

    return waitMetadata().then(() => startAnalyze());
};

var waitMetadata = () => {
    return new Promise<void>((resolve, reject) => {
        videoControl.onloadedmetadata = () => {
            videoControl.onloadedmetadata = null;
            resolve(undefined);
        };
    });
};

var startAnalyze = () => {
    var crop: ImageCropInfomation = {
        offsetX: 139,
        offsetY: 236,
        width: 309,
        height: 133
    }
    memoryBox.canvas.width = crop.width;
    memoryBox.canvas.height = crop.height;

    var sequence = getFrameImageData(0, videoControl.videoWidth, videoControl.videoHeight, crop)
        .then((imageData) => {
            lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
        });

    for (var time = 0.2; time < videoControl.duration; time += 0.2) {
        ((time: number) => {
            var imageData: ImageData;
            sequence = sequence
                .then(() => getFrameImageData(time, videoControl.videoWidth, videoControl.videoHeight, crop))
                .then((_imageData) => {
                    imageData = _imageData;
                    return equal(videoControl.currentTime, imageData)
                })
                .then((equality) => {
                    equalities.push({ watched: lastImageFrame.time, judged: equality.currentTime, isOccured: equality.isEqual });
                    lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
                });
        })(time);
    }

    return sequence
        .then(() => {
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

var getFrameImageData = (time: number, originalWidth: number, originalHeight: number, crop: ImageCropInfomation) => {
    return new Promise<ImageData>((resolve, reject) => {
        videoControl.onseeked = () => {
            videoControl.onseeked = null;
            if (videoControl === <any>videoPresenter) {
                memoryBox.canvasContext.drawImage(videoPresenter, crop.offsetX, crop.offsetY, crop.width, crop.height, 0, 0, crop.width, crop.height);
                resolve(memoryBox.canvasContext.getImageData(0, 0, crop.width, crop.height));
            }
            else {
                exportImageDataFromImage(<HTMLImageElement>videoPresenter, originalWidth, originalHeight, crop)
                    .then((imageData) => resolve(imageData));
                //draw image, as getImageData does.
            }
        };
        videoControl.currentTime = time;
    });
}

var exportImageDataFromImage = (img: HTMLImageElement, width: number, height: number, crop: ImageCropInfomation) => {
    return new Promise<ImageData>((resolve, reject) => {
        var sequence = promiseImmediate();
        var asyncOperation = () => {
            if (!img.complete) {
                sequence.then(promiseImmediate).then(asyncOperation);
                return;
            }

            if (img.naturalWidth !== width
                || img.naturalHeight !== height)
                console.warn(["Different image size is detected.", img.naturalWidth, width, img.naturalHeight, height].join(" "));
            memoryBox.canvasContext.drawImage(img, crop.offsetX, crop.offsetY, crop.width, crop.height, 0, 0, crop.width, crop.height);
            resolve(memoryBox.canvasContext.getImageData(0, 0, crop.width, crop.height));
        };
        sequence.then(asyncOperation);
    });
};

var equal = (currentTime: number, imageData: ImageData) => {
    return new Promise<Equality>((resolve, reject) => {
        var callback = (e: MessageEvent) => {
            imageDiffWorker.removeEventListener("message", callback);
            if (e.data.type == "equality")
                resolve(e.data);
        };
        imageDiffWorker.addEventListener("message", callback);
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageFrame.imageData, data2: imageData, colorTolerance: 60, pixelTolerance: 100 });
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
            if (last) {
                last.duration = parseFloat((last.end - last.start).toFixed(3));
                if (last.duration < 1.5)
                    continuousFreezing.pop();
            }
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