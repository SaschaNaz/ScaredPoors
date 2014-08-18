module VideoElementExtensions {
    export function waitMetadata(video: VideoPlayable) {
        if (video.duration)
            return Promise.resolve<void>();

        return new Promise<void>((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.onloadedmetadata = null;
                resolve(undefined);
            };
        });
    }
    export function seekFor(video: VideoPlayable, time: number) {
        return new Promise<void>((resolve, reject) => {
            videoControl.onseeked = () => {
                videoControl.onseeked = null;
                resolve(undefined);
            };
            videoControl.currentTime = time;
        });
    }
}

module ImageElementExtensions {
    export function waitCompletion(image: HTMLImageElement) {
        if (image.complete)
            return Promise.resolve<void>();
            
        return new Promise<void>((resolve, reject) => {
            var asyncOperation = () => {
                if (!image.complete) {
                    PromiseExtensions.immediate().then(asyncOperation);
                    return;
                }

                resolve(undefined);
            };
            PromiseExtensions.immediate().then(asyncOperation);
        });
    }
}

module PromiseExtensions {
    export function immediate() {
        return new Promise<void>((resolve, reject) => {
            window.setImmediate(() => {
                resolve(undefined);
            });
        });
    }
}