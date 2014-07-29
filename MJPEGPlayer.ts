class MJPEGPlayer implements VideoPlayable {
    private _src: MJPEGVideo;
    private _srcUrl: string;
    element = document.createElement("img");
    get src() {
        return this._srcUrl; // _src.blob is not immediately available after setting src property
    }
    set src(url: string) {
        this._srcUrl = url;
        this._getBlobFromUrl(url)
            .then((blob) => MJPEGReader.read(blob))
            .then((video) => {
                this._src = video;
            });
    }
    private _getBlobFromUrl(url: string) {
        return new Promise<Blob>((resolve, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.onload = (e) => {
                resolve(xhr.response);
            };
            xhr.open("GET", url);
            xhr.responseType = "blob"; 
            xhr.send();
        });
    }

    private _stopToken = false;
    private _currentVideoTime = 0;
    get currentTime() {
        return this._currentVideoTime;
    }
    set currentTime(time: number) {
        this._show(time);
    }

    private _show(time: number) {
        this._currentVideoTime = time;
        return this._src.getFrameByTime(time).then((frame) => {
            this.element.src = URL.createObjectURL(frame, { oneTimeOnly: true });
        }, function () { });
    }
    play() {
        var referenceTime = Date.now() / 1000;
        var referenceVideoTime = this._currentVideoTime;

        var sequence = Promise.resolve();
        var playNext = () => {
            if (this._stopToken) {
                this._stopToken = false;
                return;
            }

            var targetTime = referenceVideoTime + Date.now() / 1000 - referenceTime;
            if (targetTime - this._currentVideoTime > 0.1) {
                referenceTime = Date.now() / 1000;
                referenceVideoTime = this._currentVideoTime;
                targetTime = referenceVideoTime + 0.1;
            }
            if (targetTime < this._src.duration) {
                sequence = sequence.then(promiseImmediate).then(playNext);
                return this._show(targetTime);
            }
            else
                return this._show(this._src.duration);
        };
        sequence.then(promiseImmediate).then(playNext);
    }
    pause() {
        this._stopToken = true;
    }

    get videoWidth() {
        if (this._src)
            return this._src.width;
        else
            return 0;
    }
    get videoHeight() {
        if (this._src)
            return this._src.height;
        else
            return 0;
    }
}

interface VideoPlayable {
    src: string;
    play(): void;
    pause(): void;
    currentTime: number;

    videoWidth: number;
    videoHeight: number;
}