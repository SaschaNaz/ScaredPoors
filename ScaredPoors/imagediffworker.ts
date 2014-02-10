// ImageData Equality Operators
function equalWidth(a, b) {
    return a.width === b.width;
}
function equalHeight(a, b) {
    return a.height === b.height;
}
function equalDimensions(a, b) {
    return equalHeight(a, b) && equalWidth(a, b);
}
function equal(a, b, tolerance) {

    var
        aData = a.data,
        bData = b.data,
        length = aData.length,
        i;

    tolerance = tolerance || 0;

    if (!equalDimensions(a, b)) return false;
    for (i = length; i--;) if (aData[i] !== bData[i] && Math.abs(aData[i] - bData[i]) > tolerance) return false;

    return true;
}
addEventListener('message', (e) => {
    if (e.data.type === "equal") {
        var equality = equal(e.data.data1, e.data.data2, e.data.tolerance);
        postMessage((equality + " " + e.data.currentTime), null);
    }
});