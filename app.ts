/*
TODO:
Change the text below the title as phase changes
1. Load file
2. Select target area
3. Set the threshold value from user-measured reference length and subject volume
*/

declare function saveAs(data: Blob, filename: string): void;

var videoPresenter: HTMLElement = null;
var videoControl: VideoPlayable = null;

var analyzer = new ScaredPoors();
var lastImageFrame: FrameData;
//var occurrences: Occurrence[] = [];
interface Area {
    x: number;
    y: number;
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
}
interface Equality {
    type: string;
    isEqual: boolean;
    time: number;
}

if (!window.setImmediate) {
    window.setImmediate = (expression: any, ...args: any[]) => window.setTimeout.apply(window, [expression, 0].concat(args));
}

var imageDiffWorker = new Worker("imagediffworker.js");

var analyze = (crop: Area, calibration: number) => {
    //crop = {
    //    x: 139,
    //    y: 236,
    //    width: 309,
    //    height: 133
    //}
    var manager = new FreezingManager();
    //var threshold = 100;
    var threshold = Math.round(calibration * 1.6);

    var sequence = getFrameImageData(0, videoControl.videoWidth, videoControl.videoHeight, crop)
        .then((imageData) => {
            lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
        });

    for (var time = 0.1; time <= videoControl.duration; time += 0.1) {
        ((time: number) => {
            var imageData: ImageData;
            sequence = sequence
                .then(() => getFrameImageData(time, videoControl.videoWidth, videoControl.videoHeight, crop))
                .then((_imageData) => {
                    imageData = _imageData;
                    return equal(videoControl.currentTime, imageData, threshold);
                }).then((equality) => {
                    manager.loadStopping({ watched: lastImageFrame.time, judged: equality.time, isOccured: equality.isEqual });
                    lastImageFrame = { time: videoControl.currentTime, imageData: imageData };
                }).catch((error) => {
                    error;
                });
        })(time);
    }

    return sequence
        .then(() => {
            manager.flushInput();
            frozenRatioText.textContent = manager.frozenRatio.toFixed(2);
            return manager.freezingTimeline;
        });
};

var getFrameImageData = (time: number, originalWidth: number, originalHeight: number, crop: Area) => {
    return VideoElementExtensions.seek(videoControl, time)
        .then(() => {
            if (videoPresenter instanceof HTMLVideoElement) {
                return WindowExtensions.createImageData(videoPresenter, crop.x, crop.y, crop.width, crop.height);
            }
            else {
                return ImageElementExtensions.waitCompletion(<HTMLImageElement>videoPresenter)
                    .then(() => WindowExtensions.createImageData(videoPresenter, crop.x, crop.y, crop.width, crop.height));
            }
        });
};

var equal = (time: number, imageData: ImageData, pixelTolerance: number) => {
    return new Promise<Equality>((resolve, reject) => {
        var callback = (e: MessageEvent) => {
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