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
})(VideoElementExtension || (VideoElementExtension = {}));
//# sourceMappingURL=videoextension.js.map
