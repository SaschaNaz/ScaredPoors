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
var lastSeconds = [];
var lastImageData: ImageData;
var freezes = [];
var loadedArrayBuffer: ArrayBuffer;
var memoryBox = new MemoryBox();

var imageDiffWorker = new Worker("imagediffworker.js");
imageDiffWorker.addEventListener("message", (e: MessageEvent) => {
    if (e.data.type == "equality")
        info.innerHTML = e.data.equality + " " + e.data.currentTime;
});
window.addEventListener("DOMContentLoaded", () => {

    analyzer.startAnalysis(target, postOperation);
});

var getImageDataFromArray = (subarray: Uint8Array) => {
    var dataURI = "data:image/jpeg;base64," + btoa(String.fromCharCode.apply(null, subarray));
    memoryBox.image.src = dataURI;
    memoryBox.canvas.width = memoryBox.image.naturalWidth;
    memoryBox.canvas.height = memoryBox.image.naturalHeight;
    memoryBox.canvasContext.drawImage(memoryBox.image, 0, 0);
    return memoryBox.canvasContext.getImageData(0, 0, memoryBox.image.naturalWidth, memoryBox.image.naturalHeight);
};


var loadVideo = (file: Blob) => {
    target.src = URL.createObjectURL(file);
};

var mjpegWorker = new Worker("mjpegworker.js");
mjpegWorker.addEventListener("message", (e: MessageEvent) => {
    var data: MJPEGData = e.data.mjpegData;
    var array = new Uint8Array(loadedArrayBuffer);
    var frameDataList = data.frameDataList;
    var sendFrame = () => {
        sendingIndex += data.frameRate;
        if (frameDataList.length <= sendingIndex)
            return;
        var sendingFrame = frameDataList[sendingIndex];
        postOperation(sendingFrame.currentTime, getImageDataFromArray(array.subarray(sendingFrame.jpegStartIndex, sendingFrame.jpegFinishIndex)));
    };

    var sendingIndex = -data.frameRate;
    imageDiffWorker.addEventListener("message", (eq: MessageEvent) => {
        if (eq.data.type == "equality") {
            sendFrame();
        }
    });
    sendFrame();
    sendFrame();//send two frames
});


var loadMJPEG = (file: Blob) => {
    var reader = new FileReader();
    reader.onload = (e) => {
        loadedArrayBuffer = <ArrayBuffer>e.target.result;
        //(new MJPEGReader()).read(file, 24, (frames) => {
        //    frames.forEach((frame) => {
        //        postOperation(frame.currentTime, getImageDataFromArray(frame.jpegBase64));
        //    });
        //});
        mjpegWorker.postMessage({ type: "mjpeg", file: file, frameRate: 100 });
    };
    reader.readAsArrayBuffer(file);
};

var postOperation = (currentTime: number, imageData: ImageData) => {
    if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
        return;

    if (lastSeconds.length)// not 0
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageData, data2: imageData, tolerance: 200 });

    lastSeconds.unshift(currentTime);
    lastImageData = imageData;
};