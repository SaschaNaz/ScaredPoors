var analyzer = new ScaredPoors();
var lastSeconds = [];
var lastImageData;
var freezes = [];
var canvasContext;

var imageDiffWorker = new Worker("imagediffworker.js");
imageDiffWorker.addEventListener("message", function (e) {
    info.innerHTML = e.data;
});
window.addEventListener("DOMContentLoaded", function () {
    target.addEventListener("play", function () {
        canvasContext = tempCanvas.getContext("2d");
        tempCanvas.width = target.videoWidth;
        tempCanvas.height = target.videoHeight;
    });
    analyzer.startAnalysis(target, postOperation);
});

var getImageDataFromArray = function (subarray) {
    var dataURI = "data:image/jpeg;base64," + btoa(String.fromCharCode.apply(null, subarray));
    var image = document.createElement("img");
    image.src = dataURI;
    tempCanvas.width = image.naturalWidth;
    tempCanvas.height = image.naturalHeight;
    canvasContext.drawImage(image, 0, 0);
    return canvasContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
};

var loadMJPEG = function (file) {
    canvasContext = tempCanvas.getContext("2d");
    (new MJPEGReader()).read(file, 24, function (currentTime, imageDataArray) {
        postOperation(currentTime, getImageDataFromArray(imageDataArray));
    });
    //mjpegWorker.postMessage({ type: "mjpeg", file: file, frameRate: 24 });
};

var postOperation = function (currentTime, imageData) {
    if (lastSeconds.length && lastSeconds[0] > currentTime - 1)
        return;

    if (lastSeconds.length)
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageData, data2: imageData, tolerance: 200 });

    lastSeconds.unshift(currentTime);
    lastImageData = imageData;
};
//# sourceMappingURL=app.js.map
