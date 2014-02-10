importScripts("mjpegreader.js");

addEventListener('message', function (e) {
    if (e.data.type === "mjpeg") {
        (new MJPEGReader()).read(e.data.file, e.data.frameRate, function (currentTime, imageDataArray) {
            postMessage({ currentTime: currentTime, imageDataArray: imageDataArray }, null);
        });
    }
});
//# sourceMappingURL=mjpegworker.js.map
