module ImageBitmap {
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");

    export function createImageBitmap(image: any, sx = 0, sy = 0, width?: number, height?: number) {
        var prefix = getLengthPrefix(image);
        var widthName = prefix ? prefix + "Width" : "width";
        var heightName = prefix ? prefix + "Height" : "height";
        if (width == null)
            width = image[widthName];
        if (height == null)
            height = image[heightName];

        canvasContext.drawImage(image, sx, sy, width, height, 0, 0, width, height);
        return memoryBox.canvasContext.getImageData(0, 0, width, height);
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