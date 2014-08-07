var VideoElementExtension = (function () {
    function VideoElementExtension() {
    }
    VideoElementExtension.waitMetadata = function (video) {
        if (video.duration)
            return Promise.resolve();

        return new Promise(function (resolve, reject) {
            video.onloadedmetadata = function () {
                video.onloadedmetadata = null;
                resolve(undefined);
            };
        });
    };
    return VideoElementExtension;
})();
//# sourceMappingURL=videoextension.js.map
