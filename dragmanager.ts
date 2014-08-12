class DragPresenter {
    areaPresenter: HTMLDivElement;

    private _offsetXPercentage = 0;
    private _offsetYPercentage = 0;
    private _widthPercentage = 0;
    private _heightPercentage = 0;

    private get _offsetX() {
        return this._offsetXPercentage * this.targetElement.clientWidth;
    }
    private set _offsetX(value: number) {
        this._offsetXPercentage = value / this.targetElement.clientWidth;
    }
    private get _offsetY() {
        return this._offsetYPercentage * this.targetElement.clientHeight;
    }
    private set _offsetY(value: number) {
        this._offsetYPercentage = value / this.targetElement.clientHeight;
    }
    private get _width() {
        return this._widthPercentage * this.targetElement.clientWidth;
    }
    private set _width(value: number) {
        this._widthPercentage = value / this.targetElement.clientWidth;
    }
    private get _height() {
        return this._heightPercentage * this.targetElement.clientHeight;
    }
    private set _height(value: number) {
        this._heightPercentage = value / this.targetElement.clientHeight;
    }
    private _borderSize: number;

    /**
    targetElement should have `position: relative` and areaClassName class should have `position: absolute`.
    */
    constructor(public panel: HTMLElement, public targetElement: HTMLElement, areaClassName?: string, borderSize = 0) {
        var areaPresenter = this.areaPresenter = document.createElement("div");
        if (areaClassName)
            areaPresenter.className = areaClassName;
        this._borderSize = borderSize;
        areaPresenter.style.display = "none";
        targetElement.parentElement.appendChild(areaPresenter);
        panel.onpointerdown = this._onpointerdown;

        window.onresize = this._onresize;
    }

    private _onpointerdown = (e: PointerEvent) => {
        var eX = this.forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this.forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        if (e.offsetX != eX || e.offsetY != eY)
            return;

        this._offsetX = eX - this.targetElement.offsetLeft
        this._offsetY = eY - this.targetElement.offsetTop;

        var areaPresenter = this.areaPresenter;
        areaPresenter.style.left = eX + 'px';
        areaPresenter.style.top = eY + 'px';
        areaPresenter.style.width = areaPresenter.style.height = '0';
        areaPresenter.style.display = "block";

        this.panel.onpointermove = this._onpointermove;
        this.panel.onpointerup = this._onpointerup;
    };

    private _onpointermove = (e: PointerEvent) => {
        var eX = this.forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this.forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        this._width = eX - this._offsetX - this.targetElement.offsetLeft;
        this._height = eY - this._offsetY - this.targetElement.offsetTop;

        this._draw();
    };

    private forceInRange(value: number, min: number, rangeLength: number) {
        return Math.min(Math.max(value, min), min + rangeLength);
    }

    private _onpointerup = (e: PointerEvent) => {
        this.panel.onpointermove = null;
    };

    private _onresize = (e: UIEvent) => {
        this._draw();
    };
    private _draw() {
        var drawArea = this._getPanelArea();
        var areaPresenter = this.areaPresenter;
        areaPresenter.style.left = (drawArea.left - this._borderSize) + 'px';
        areaPresenter.style.top = (drawArea.top - this._borderSize) + 'px';
        areaPresenter.style.width = drawArea.width + 'px';
        areaPresenter.style.height = drawArea.height + 'px';
    }
    private _getPanelArea() {
        var targetArea = this.getTargetArea();
        targetArea.left += this.targetElement.offsetLeft;
        targetArea.top += this.targetElement.offsetTop;

        return targetArea;
    }
    getTargetArea() {
        return {
            left: Math.min(this._offsetX, this._offsetX + this._width),
            top: Math.min(this._offsetY, this._offsetY + this._height),
            width: Math.abs(this._width),
            height: Math.abs(this._height)
        }
    }
    close() {
        window.onresize = null;
        this.panel.onpointerdown = this.panel.onpointermove = this.panel.onpointerup = null;
        this.targetElement.parentElement.removeChild(this.areaPresenter);
    }
} 