var PointPresenter = (function () {
    function PointPresenter(panel, targetElement) {
        this.panel = panel;
        this.targetElement = targetElement;
        this._svgns = "http://www.w3.org/2000/svg";
        this._points = [this._createShape(), this._createShape()];
        this._eventSubscriptions = {};
        var areaPresenter = this.areaPresenter = document.createElementNS(this._svgns, "svg");
        targetElement.parentElement.appendChild(areaPresenter);
        this._eventSubscriptions["pointerup"] = EventPromise.subscribeEvent(panel, "pointerup", this._pointerup);
    }
    PointPresenter.prototype._pointerup = function (e) {
        var point = this._points.shift();
        var eX = this._forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this._forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        if (e.offsetX != eX || e.offsetY != eY)
            return;

        point.style.display = '';
        this._points.push(point);
    };

    PointPresenter.prototype._forceInRange = function (value, min, rangeLength) {
        return Math.min(Math.max(value, min), min + rangeLength);
    };

    PointPresenter.prototype._createShape = function () {
        var shape = document.createElementNS(this._svgns, "circle");
        shape.r.baseVal.value = 10;
        shape.style.fill = "green";
        shape.style.opacity = "0.8";
        shape.style.display = "hidden";
        return shape;
    };

    PointPresenter.prototype.close = function () {
        for (var subscriptionName in this._eventSubscriptions)
            this._eventSubscriptions[subscriptionName].cease({ silently: true });
        this.targetElement.parentElement.removeChild(this.areaPresenter);
    };
    return PointPresenter;
})();
//# sourceMappingURL=pointpresenter.js.map
