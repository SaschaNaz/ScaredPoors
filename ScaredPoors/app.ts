declare var target: HTMLVideoElement;
declare var info: HTMLSpanElement;
declare var tempCanvas: HTMLCanvasElement;
declare var imagediff: any;
var analyzer = new ScaredPoors();
var lastSeconds = [];
var lastImageData: ImageData;
var freezes = [];
var canvasContext: CanvasRenderingContext2D;

var imageDiffWorker = new Worker("imagediffworker.js");
imageDiffWorker.addEventListener("message", (e) => {
    info.innerHTML = e.data;
});
window.addEventListener("DOMContentLoaded", () => {
    target.addEventListener("play", () => {
        canvasContext = tempCanvas.getContext("2d");
        tempCanvas.width = target.videoWidth;
        tempCanvas.height = target.videoHeight;
    });
    analyzer.startAnalysis(target, postOperation);
});

var getImageDataFromArray = (subarray: Uint8Array) => {
    var dataURI = "data:image/jpeg;base64," + btoa(String.fromCharCode.apply(null, subarray));
    var image = document.createElement("img");
    image.src = dataURI;
    tempCanvas.width = image.naturalWidth;
    tempCanvas.height = image.naturalHeight;
    canvasContext.drawImage(image, 0, 0);
    return canvasContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
}

var loadMJPEG = (file: Blob) => {
    canvasContext = tempCanvas.getContext("2d");
    (new MJPEGReader()).read(file, 24, (currentTime, imageDataArray) => {
        postOperation(currentTime, getImageDataFromArray(imageDataArray));
    });
    //mjpegWorker.postMessage({ type: "mjpeg", file: file, frameRate: 24 });
}

var postOperation = (currentTime: number, imageData: ImageData) => {
    if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
        return;

    if (lastSeconds.length)// not 0
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageData, data2: imageData, tolerance: 200 });

    lastSeconds.unshift(currentTime);
    lastImageData = imageData;

};