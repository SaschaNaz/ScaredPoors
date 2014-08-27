module EventTargetExtensions {
    export function waitEvent<T extends Event>(target: EventTarget, eventName: string) {
        return new Promise<T>((resolve, reject) => {
            var eventListener = (event: T) => {
                target.removeEventListener(eventName, eventListener);
                resolve(event);
            };
            target.addEventListener(eventName, eventListener);
        });
    }

    export function subscribeEvent<T extends Event>(target: EventTarget, eventName: string, listener: (ev: T, subscription: EventSubscription) => any) {
        var oncessation: () => any;
        var subscription: EventSubscription = {
            cease() {
                target.removeEventListener(eventName, eventListener);
                oncessation();
            },
            cessation: new Promise<void>((resolve, reject) => {
                oncessation = () => {
                    resolve(undefined);
                };
            })
        };

        var eventListener = (event: T) => {
            listener.call(target, event, subscription);
        };
        target.addEventListener(eventName, eventListener);
        return subscription;
    }

    export interface EventSubscription {
        cease(): void;
        cessation: Promise<void>
    }
}

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
    export function seek(video: VideoPlayable, time: number) {
        return new Promise<void>((resolve, reject) => {
            video.onseeked = () => {
                video.onseeked = null;
                resolve(undefined);
            };
            video.currentTime = time;
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