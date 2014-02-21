var MemoryBox = (function () {
    function MemoryBox() {
        this.canvas = document.createElement("canvas");
        this.image = document.createElement("img");
        this.canvasContext = this.canvas.getContext("2d");
    }
    return MemoryBox;
})();

var analyzer = new ScaredPoors();
var lastImageData;
var freezes = [];
var loadedArrayBuffer;
var memoryBox = new MemoryBox();
var equalities = [];

var imageDiffWorker = new Worker("imagediffworker.js");

//window.addEventListener("DOMContentLoaded", () => {
//    analyzer.startAnalysis(target, postOperation);
//});
var getImageData = function (file, width, height, crop) {
    memoryBox.image.src = URL.createObjectURL(file);
    if (memoryBox.image.naturalWidth !== width || memoryBox.image.naturalHeight !== height)
        console.warn(["Different image size is detected.", memoryBox.image.naturalWidth, width, memoryBox.image.naturalHeight, height].join(" "));
    memoryBox.canvasContext.drawImage(memoryBox.image, crop.offsetX, crop.offsetY, crop.width, crop.height, 0, 0, crop.width, crop.height);
    return memoryBox.canvasContext.getImageData(0, 0, crop.width, crop.height);
};

var loadVideo = function (file) {
    target.src = URL.createObjectURL(file);
};

//var mjpegWorker = new Worker("mjpegworker.js");
//mjpegWorker.addEventListener("message", (e: MessageEvent) => {
//    var data: MJPEGData = e.data.mjpegData;
//    //var array = new Uint8Array(loadedArrayBuffer);
//    var frameDataList = data.frameDataList;
//    var sendFrame = () => {
//        sendingIndex += data.frameRate;
//        if (frameDataList.length <= sendingIndex)
//            return;
//        var sendingFrame = frameDataList[sendingIndex];
//        postOperation(sendingFrame.currentTime, getImageDataFromArray(sendingFrame.jpegArrayData));
//    };
//    var sendingIndex = -data.frameRate;
//    imageDiffWorker.addEventListener("message", (eq: MessageEvent) => {
//        if (eq.data.type == "equality") {
//            sendFrame();
//        }
//    });
//    sendFrame();
//    sendFrame();//send two frames
//});
var loadMJPEG = function (file) {
    //var reader = new FileReader();
    //reader.onload = (e) => {
    //    loadedArrayBuffer = <ArrayBuffer>e.target.result;
    //(new MJPEGReader()).read(file, 24, (frames) => {
    //    frames.forEach((frame) => {
    //        postOperation(frame.currentTime, getImageDataFromArray(frame.jpegBase64));
    //    });
    //});
    //mjpegWorker.postMessage({ type: "mjpeg", file: file /*arraybuffer: loadedArrayBuffer*/, frameRate: 100 });
    //};
    //reader.readAsArrayBuffer(file);
    var crop = {
        offsetX: 140,
        offsetY: 271,
        width: 354,
        height: 155
    };
    MJPEGReader.read(file, function (mjpeg) {
        memoryBox.canvas.width = crop.width;
        memoryBox.canvas.height = crop.height;
        lastImageData = getImageData(mjpeg.frames[0], mjpeg.width, mjpeg.height, crop);
        var i = 1;
        var operateAsync = function () {
            equalAsync(i, getImageData(mjpeg.getFrameByTime(i), mjpeg.width, mjpeg.height, crop), function (equality) {
                //equality operation start
                equalities.push(equality);
                i++;

                //equality operation end
                if (i <= mjpeg.duration)
                    window.setImmediate(operateAsync);
            });
        };
        operateAsync();
    });
};

var equalAsync = function (currentTime, imageData, onend) {
    var callback = function (e) {
        imageDiffWorker.removeEventListener("message", callback);
        if (e.data.type == "equality")
            onend(e.data);
    };
    imageDiffWorker.addEventListener("message", callback);
    if (lastImageData)
        imageDiffWorker.postMessage({ type: "equal", currentTime: currentTime, data1: lastImageData, data2: imageData, tolerance: 140 });

    lastImageData = imageData;
};
//# sourceMappingURL=app.js.map
