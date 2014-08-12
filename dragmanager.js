var DragPresenter = (function () {
    /**
    targetElement should have `position: relative` and areaClassName class should have `position: absolute`.
    */
    function DragPresenter(panel, targetElement, areaClassName) {
        var _this = this;
        this.panel = panel;
        this.targetElement = targetElement;
        this._offsetXPercentage = 0;
        this._offsetYPercentage = 0;
        this._widthPercentage = 0;
        this._heightPercentage = 0;
        this._onpointerdown = function (e) {
            _this._offsetX = e.offsetX - _this.targetElement.offsetLeft;
            _this._offsetY = e.offsetY - _this.targetElement.offsetTop;

            var areaPresenter = _this.areaPresenter;
            areaPresenter.style.left = e.offsetX + 'px';
            areaPresenter.style.top = e.offsetY + 'px';
            areaPresenter.style.width = areaPresenter.style.height = '0';
            areaPresenter.style.display = "block";

            _this.panel.onpointermove = _this._onpointermove;
            _this.panel.onpointerup = _this._onpointerup;
        };
        this._onpointermove = function (e) {
            _this._width = e.offsetX - _this._offsetX - _this.targetElement.offsetLeft;
            _this._height = e.offsetY - _this._offsetY - _this.targetElement.offsetTop;

            _this._draw();
        };
        this._onpointerup = function (e) {
            _this.panel.onpointermove = null;
        };
        this._onresize = function (e) {
            _this._draw();
        };
        var areaPresenter = this.areaPresenter = document.createElement("div");
        if (areaClassName)
            areaPresenter.className = areaClassName;
        areaPresenter.style.display = "none";
        targetElement.parentElement.appendChild(areaPresenter);
        panel.onpointerdown = this._onpointerdown;

        window.onresize = this._onresize;
    }
    Object.defineProperty(DragPresenter.prototype, "_offsetX", {
        get: function () {
            return this._offsetXPercentage * this.targetElement.clientWidth;
        },
        set: function (value) {
            this._offsetXPercentage = value / this.targetElement.clientWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DragPresenter.prototype, "_offsetY", {
        get: function () {
            return this._offsetYPercentage * this.targetElement.clientHeight;
        },
        set: function (value) {
            this._offsetYPercentage = value / this.targetElement.clientHeight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DragPresenter.prototype, "_width", {
        get: function () {
            return this._widthPercentage * this.targetElement.clientWidth;
        },
        set: function (value) {
            this._widthPercentage = value / this.targetElement.clientWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DragPresenter.prototype, "_height", {
        get: function () {
            return this._heightPercentage * this.targetElement.clientHeight;
        },
        set: function (value) {
            this._heightPercentage = value / this.targetElement.clientHeight;
        },
        enumerable: true,
        configurable: true
    });

    DragPresenter.prototype._draw = function () {
        var drawArea = this._getPanelArea();
        var areaPresenter = this.areaPresenter;
        areaPresenter.style.left = drawArea.left + 'px';
        areaPresenter.style.top = drawArea.top + 'px';
        areaPresenter.style.width = drawArea.width + 'px';
        areaPresenter.style.height = drawArea.height + 'px';
    };
    DragPresenter.prototype._getPanelArea = function () {
        var targetArea = this.getTargetArea();
        targetArea.left += this.targetElement.offsetLeft;
        targetArea.top += this.targetElement.offsetTop;

        return targetArea;
    };
    DragPresenter.prototype.getTargetArea = function () {
        return {
            left: Math.min(this._offsetX, this._offsetX + this._width),
            top: Math.min(this._offsetY, this._offsetY + this._height),
            width: Math.abs(this._width),
            height: Math.abs(this._height)
        };
    };
    return DragPresenter;
})();
//# sourceMappingURL=dragmanager.js.map
