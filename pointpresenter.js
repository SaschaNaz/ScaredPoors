var PointPresenter = (function () {
    function PointPresenter(panel, targetElement) {
        var _this = this;
        this.panel = panel;
        this.targetElement = targetElement;
        this._svgns = "http://www.w3.org/2000/svg";
        this.areaPresenter = document.createElementNS(this._svgns, "svg");
        this._svgPoints = ArrayExtensions.from({ length: 2 }, function () {
            return _this._createShape();
        });
        this._eventSubscriptions = {};
        this._pointRelativities = ArrayExtensions.from({ length: 2 }, function () {
            return ({ x: 0, y: 0 });
        });
        this._pointerup = function (e) {
            var svgPoint = _this._svgPoints.shift();
            var pointRelativity = _this._pointRelativities.shift();
            var eX = _this._forceInRange(e.offsetX, _this.targetElement.offsetLeft, _this.targetElement.clientWidth);
            var eY = _this._forceInRange(e.offsetY, _this.targetElement.offsetTop, _this.targetElement.clientHeight);
            if (e.offsetX != eX || e.offsetY != eY)
                return;

            pointRelativity.x = _this._sizeRelativity.getRelativeX(eX - _this.targetElement.offsetLeft);
            pointRelativity.y = _this._sizeRelativity.getRelativeY(eY - _this.targetElement.offsetTop);
            svgPoint.cx.baseVal.value = eX;
            svgPoint.cy.baseVal.value = eY;

            svgPoint.style.display = '';
            _this._svgPoints.push(svgPoint);
            _this._pointRelativities.push(pointRelativity);
        };
        this._onresize = function (e) {
            _this._draw();
        };
        this._sizeRelativity = new SizeRelativity(targetElement);
        targetElement.parentElement.appendChild(this.areaPresenter);

        this._svgPoints.forEach(function (circle) {
            return _this.areaPresenter.appendChild(circle);
        });

        this._eventSubscriptions["pointerup"] = EventPromise.subscribeEvent(panel, "pointerup", this._pointerup);
        this._eventSubscriptions["resize"] = EventPromise.subscribeEvent(window, "resize", this._onresize);
    }
    Object.defineProperty(PointPresenter.prototype, "isFullyPointed", {
        get: function () {
            return this._svgPoints.every(function (circle) {
                return !circle.style.display;
            });
        },
        enumerable: true,
        configurable: true
    });

    PointPresenter.prototype._forceInRange = function (value, min, rangeLength) {
        return Math.min(Math.max(value, min), min + rangeLength);
    };

    PointPresenter.prototype._createShape = function () {
        var shape = document.createElementNS(this._svgns, "circle");
        shape.r.baseVal.value = 10;
        shape.style.fill = "green";
        shape.style.opacity = "0.8";
        shape.style.display = "none";
        return shape;
    };
    PointPresenter.prototype.getTargetPoints = function () {
        var points = [];
        for (var i in this._pointRelativities)
            points[i] = {
                x: this._sizeRelativity.getAbsoluteX(this._pointRelativities[i].x),
                y: this._sizeRelativity.getAbsoluteY(this._pointRelativities[i].y)
            };
        return points;
    };
    PointPresenter.prototype._getPanelPoints = function () {
        var _this = this;
        var points = this.getTargetPoints();
        points.forEach(function (point) {
            point.x += _this.targetElement.offsetLeft;
            point.y += _this.targetElement.offsetTop;
        });
        return points;
    };

    PointPresenter.prototype._draw = function () {
        var points = this._getPanelPoints();
        this._svgPoints.forEach(function (svgPoint, i) {
            svgPoint.cx.baseVal.value = points[i].x;
            svgPoint.cy.baseVal.value = points[i].y;
        });
    };

    PointPresenter.prototype.close = function () {
        for (var subscriptionName in this._eventSubscriptions)
            this._eventSubscriptions[subscriptionName].cease({ silently: true });
        this.targetElement.parentElement.removeChild(this.areaPresenter);
    };
    return PointPresenter;
})();
//# sourceMappingURL=pointpresenter.js.map
