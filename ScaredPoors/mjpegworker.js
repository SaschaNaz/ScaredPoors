importScripts("mjpegreader.js");

addEventListener('message', function (e) {
    if (e.data.type === "mjpeg") {
        (new MJPEGReader()).read(e.data.file, e.data.frameRate, function (mjpegData) {
            postMessage({ mjpegData: mjpegData }, null);
            delete mjpegData;
        });
    }
});
//# sourceMappingURL=mjpegworker.js.map
