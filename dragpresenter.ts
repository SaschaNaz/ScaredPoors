class DragPresenter {
    areaPresenter: HTMLDivElement;

    private _offsetXPercentage = 0;
    private _offsetYPercentage = 0;
    private _widthPercentage = 0;
    private _heightPercentage = 0;

    ondragsizechanged: (dragArea: Area) => any;

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
    private _capturedPointerId: number;

    get isDragged() {
        return this.areaPresenter.style.display !== "none";
    }

    /**
    targetElement should have `position: relative` and areaClassName class should have `position: absolute`.
    areaClassName should have `box-sizing: border-box`.
    */
    constructor(public panel: HTMLElement, public targetElement: HTMLElement, areaClassName?: string) {
        var areaPresenter = this.areaPresenter = document.createElement("div");
        if (areaClassName)
            areaPresenter.className = areaClassName;
        areaPresenter.style.display = "none";
        targetElement.parentElement.appendChild(areaPresenter);
        panel.onpointerdown = this._onpointerdown;

        window.onresize = this._onresize;
    }

    private _onpointerdown = (e: PointerEvent) => {
        var eX = this._forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this._forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        if (e.offsetX != eX || e.offsetY != eY)
            return;

        this._offsetX = eX - this.targetElement.offsetLeft
        this._offsetY = eY - this.targetElement.offsetTop;

        var areaPresenter = this.areaPresenter;
        areaPresenter.style.left = eX + 'px';
        areaPresenter.style.top = eY + 'px';
        areaPresenter.style.width = areaPresenter.style.height = '0';
        areaPresenter.style.display = "block";

        this._capturedPointerId = e.pointerId;
        this.panel.setPointerCapture(e.pointerId);
        this.panel.onpointermove = this._onpointermove;
        this.panel.onpointerup = this._onpointerup;

        if (this.ondragsizechanged)
            this.ondragsizechanged({ x: 0, y: 0, width: 0, height: 0 }); 
    };

    private _onpointermove = (e: PointerEvent) => {
        var eX = this._forceInRange(e.offsetX, this.targetElement.offsetLeft, this.targetElement.clientWidth);
        var eY = this._forceInRange(e.offsetY, this.targetElement.offsetTop, this.targetElement.clientHeight);
        this._width = eX - this._offsetX - this.targetElement.offsetLeft;
        this._height = eY - this._offsetY - this.targetElement.offsetTop;

        this._draw();
        if (this.ondragsizechanged)
            this.ondragsizechanged(this.getTargetArea());
    };

    private _forceInRange(value: number, min: number, rangeLength: number) {
        return Math.min(Math.max(value, min), min + rangeLength);
    }

    private _onpointerup = (e: PointerEvent) => {
        this.panel.releasePointerCapture(this._capturedPointerId);
        this.panel.onpointermove = this.panel.onpointerup = null;
    };

    private _onresize = (e: UIEvent) => {
        this._draw();
    };
    private _draw() {
        var drawArea = this._getPanelArea();
        var areaPresenter = this.areaPresenter;
        areaPresenter.style.left = drawArea.x + 'px';
        areaPresenter.style.top = drawArea.y + 'px';
        areaPresenter.style.width = drawArea.width + 'px';
        areaPresenter.style.height = drawArea.height + 'px';
    }
    private _getPanelArea() {
        var targetArea = this.getTargetArea();
        targetArea.x += this.targetElement.offsetLeft;
        targetArea.y += this.targetElement.offsetTop;

        return targetArea;
    }
    getTargetArea() {
        return <Area>{
            x: Math.min(this._offsetX, this._offsetX + this._width),
            y: Math.min(this._offsetY, this._offsetY + this._height),
            width: Math.abs(this._width),
            height: Math.abs(this._height)
        }
    }
    close() {
        window.onresize = null;
        this.panel.onpointerdown = this.panel.onpointermove = this.panel.onpointerup = window.onpointerleave =   null;
        this.targetElement.parentElement.removeChild(this.areaPresenter);
    }
} 