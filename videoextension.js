var VideoElementExtension;
(function (VideoElementExtension) {
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
    VideoElementExtension.waitMetadata = waitMetadata;
    function seekFor(video, time) {
        return new Promise(function (resolve, reject) {
            videoControl.onseeked = function () {
                videoControl.onseeked = null;
                resolve(undefined);
            };
            videoControl.currentTime = time;
        });
    }
    VideoElementExtension.seekFor = seekFor;
})(VideoElementExtension || (VideoElementExtension = {}));
//# sourceMappingURL=videoextension.js.map
