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
    function seekFor(video, time) {
        return new Promise(function (resolve, reject) {
            videoControl.onseeked = function () {
                videoControl.onseeked = null;
                resolve(undefined);
            };
            videoControl.currentTime = time;
        });
    }
    VideoElementExtensions.seekFor = seekFor;
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
//# sourceMappingURL=extensions.js.map
