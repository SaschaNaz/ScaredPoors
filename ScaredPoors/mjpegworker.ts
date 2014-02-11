importScripts("mjpegreader.js");

addEventListener('message', (e) => {
    if (e.data.type === "mjpeg") {
        (new MJPEGReader()).read(e.data.file, e.data.frameRate, (mjpegData) => {
            postMessage(mjpegData, null);
            delete mjpegData;
        });
    }
});