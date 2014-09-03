var PointPresenter = (function () {
    function PointPresenter(panel, targetElement) {
        this.panel = panel;
        this.targetElement = targetElement;
        this._svgns = "http://www.w3.org/2000/svg";
        this._svgPoints = [this._createShape(), this._createShape()];
        this._eventSubscriptions = {};
        this._pointRelativities = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
        var areaPresenter = this.areaPresenter = document.createElementNS(this._svgns, "svg");
        targetElement.parentElement.appendChild(areaPresenter);
        this._eventSubscriptions["pointerup"] = EventPromise.subscribeEvent(panel, "pointerup", this._pointerup);
    }
    PointPresenter.prototype._pointerup = function (e) {
        var svgPoint = this._svgPoints.shift();
        var pointRelativity = this._pointRelativities.shift();
        var eX = this._forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this._forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        if (e.offsetX != eX || e.offsetY != eY)
            return;

        svgPoint.style.display = '';
        this._svgPoints.push(svgPoint);
        this._pointRelativities.push(pointRelativity);
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
    PointPresenter.prototype.getPoints = function () {
        var points;
        for (var i in this._pointRelativities) {
            var point = this._svgPoints[i];
            points[i] = {
                x: this._sizeRelativity.getAbsoluteX(this._pointRelativities[i].x),
                y: this._sizeRelativity.getAbsoluteY(this._pointRelativities[i].y)
            };
        }
        return points;
    };

    PointPresenter.prototype.close = function () {
        for (var subscriptionName in this._eventSubscriptions)
            this._eventSubscriptions[subscriptionName].cease({ silently: true });
        this.targetElement.parentElement.removeChild(this.areaPresenter);
    };
    return PointPresenter;
})();
//# sourceMappingURL=pointpresenter.js.map
