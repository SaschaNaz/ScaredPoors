var ImageBitmap;
(function (ImageBitmap) {
    var canvas = document.createElement("canvas");
    var canvasContext = canvas.getContext("2d");

    function createImageBitmap(image, sx, sy, width, height) {
        if (typeof sx === "undefined") { sx = 0; }
        if (typeof sy === "undefined") { sy = 0; }
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
    ImageBitmap.createImageBitmap = createImageBitmap;

    function getLengthPrefix(element) {
        if (element instanceof HTMLImageElement)
            return "natural";
        else if (element instanceof HTMLVideoElement)
            return "video";
        else
            return null;
    }
})(ImageBitmap || (ImageBitmap = {}));
//# sourceMappingURL=imagebitmap.js.map
