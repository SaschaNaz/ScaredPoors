var FreezingManager = (function () {
    function FreezingManager() {
        this._continuousFreezing = [];
        this._movedLastTime = true;
        this._lastStopping = null;
        this._totalFrozenTime = 0;
        this._elapsedTime = 0;
        this.minimalDuration = 1.5;
    }
    Object.defineProperty(FreezingManager.prototype, "_lastStoppingDuration", {
        get: function () {
            return this._lastStopping.end - this._lastStopping.start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreezingManager.prototype, "frozenRatio", {
        get: function () {
            if (!this._lastStopping)
                return 0;
            var frozen = this._totalFrozenTime;
            if (!this._movedLastTime && this._lastStoppingDuration > this.minimalDuration)
                frozen += this._lastStoppingDuration;

            return frozen / this._elapsedTime;
        },
        enumerable: true,
        configurable: true
    });

    FreezingManager.prototype.loadStopping = function (stopping) {
        this._elapsedTime = stopping.judged;
        this._presentElapsedTime(this._elapsedTime);
        if (!stopping.isOccured) {
            this._presentStatus("active");
            this._movedLastTime = true;
            return;
        }

        //occured
        this._presentStatus("stopped");
        if (this._movedLastTime) {
            if (this._lastStopping) {
                if (this._lastStoppingDuration < this.minimalDuration)
                    this._continuousFreezing.pop();
                else
                    this._totalFrozenTime += this._lastStoppingDuration;
            }
            this._lastStopping = {
                start: stopping.watched,
                end: stopping.judged
            };
            this._continuousFreezing.push(this._lastStopping);
        } else {
            this._lastStopping.end = stopping.judged;
            if (this._lastStoppingDuration >= this.minimalDuration) {
                this._presentStatus("frozen");
                this._presentFrozenTime(this._totalFrozenTime + this._lastStoppingDuration);
            }
        }

        this._movedLastTime = false;
    };

    FreezingManager.prototype._presentElapsedTime = function (time) {
        elapsedTimeText.textContent = time.toFixed(2);
    };

    FreezingManager.prototype._presentFrozenTime = function (time) {
        frozenTimeText.textContent = time.toFixed(2);
    };

    /**
    Expects `active`, `stopped`, or `frozen`.
    */
    FreezingManager.prototype._presentStatus = function (status) {
        switch (status) {
            case "active":
            case "stopped":
            case "frozen":
                statusPresenter.className = status;
                break;
            default:
                throw new Error("Unexpected keyword");
        }
    };
    return FreezingManager;
})();
//# sourceMappingURL=freezingmanager.js.map
