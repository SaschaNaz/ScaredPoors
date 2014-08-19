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

module WindowExtensions {
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");

    export function createImageData(image: any): Promise<ImageData>;
    export function createImageData(image: any, sx: number, sy: number, width: number, height: number): Promise<ImageData>;
    export function createImageData(image: any, sx = 0, sy = 0, width?: number, height?: number) {
        return Promise.resolve().then(() => {
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

    function getLengthPrefix(element: any) {
        if (element instanceof HTMLImageElement)
            return "natural";
        else if (element instanceof HTMLVideoElement)
            return "video";
        else
            return null;
    }
}