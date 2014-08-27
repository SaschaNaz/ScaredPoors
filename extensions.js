var VideoElementExtensions;
(function (VideoElementExtensions) {
    function waitMetadata(video) {
        if (video.duration)
            return Promise.resolve();

        return new Promise(function (resolve, reject) {
            video.onloadedmetadata = function () {
                video.onloadedmetadata = null;
                resolve(undefined);
            };
        });
    }
    VideoElementExtensions.waitMetadata = waitMetadata;
    function seek(video, time) {
        return new Promise(function (resolve, reject) {
            video.onseeked = function () {
                video.onseeked = null;
                resolve(undefined);
            };
            video.currentTime = time;
        });
    }
    VideoElementExtensions.seek = seek;
})(VideoElementExtensions || (VideoElementExtensions = {}));

var ImageElementExtensions;
(function (ImageElementExtensions) {
    function waitCompletion(image) {
        if (image.complete)
            return Promise.resolve();

        return new Promise(function (resolve, reject) {
            var asyncOperation = function () {
                if (!image.complete) {
                    PromiseExtensions.immediate().then(asyncOperation);
                    return;
                }

                resolve(undefined);
            };
            PromiseExtensions.immediate().then(asyncOperation);
        });
    }
    ImageElementExtensions.waitCompletion = waitCompletion;
})(ImageElementExtensions || (ImageElementExtensions = {}));

var PromiseExtensions;
(function (PromiseExtensions) {
    function immediate() {
        return new Promise(function (resolve, reject) {
            window.setImmediate(function () {
                resolve(undefined);
            });
        });
    }
    PromiseExtensions.immediate = immediate;
})(PromiseExtensions || (PromiseExtensions = {}));

var WindowExtensions;
(function (WindowExtensions) {
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");

    function createImageData(image, sx, sy, width, height) {
        if (typeof sx === "undefined") { sx = 0; }
        if (typeof sy === "undefined") { sy = 0; }
        return Promise.resolve().then(function () {
            var prefix = getLengthPrefix(image);
            var widthName = prefix ? prefix + "Width" : "width";
            var heightName = prefix ? prefix + "Height" : "height";
            if (width == null)
                width = image[widthName];
            if (height == null)
                height = image[heightName];
            canvas.width = width;
            canvas.height = height;

            canvasContext.drawImage(image, sx, sy, width, height, 0, 0, width, height);
            return canvasContext.getImageData(0, 0, width, height);
        });
    }
    WindowExtensions.createImageData = createImageData;

    function getLengthPrefix(element) {
        if (element instanceof HTMLImageElement)
            return "natural";
        else if (element instanceof HTMLVideoElement)
            return "video";
        else
            return null;
    }
})(WindowExtensions || (WindowExtensions = {}));
//# sourceMappingURL=extensions.js.map
