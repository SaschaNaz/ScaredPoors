var FreezingManager = (function () {
    function FreezingManager() {
        this._continuousFreezing = [];
        this._movedLastTime = true;
        this._lastStopping = null;
        this._totalFrozenTime = 0;
        this.minimalDuration = 1.5;
    }
    Object.defineProperty(FreezingManager.prototype, "_lastStoppingDuration", {
        get: function () {
            return this._lastStopping.end - this._lastStopping.start;
        },
        enumerable: true,
        configurable: true
    });

    FreezingManager.prototype.loadOccurrence = function (occurrence) {
        this._presentElapsedTime(occurrence.judged);
        if (!occurrence.isOccured) {
            this._presentStopping(false);
            this._presentFreezing(false);
            this._movedLastTime = true;
            return;
        }

        //occured
        this._presentStopping(true);
        if (this._movedLastTime) {
            if (this._lastStopping) {
                if (this._lastStoppingDuration < this.minimalDuration)
                    this._continuousFreezing.pop();
                else
                    this._totalFrozenTime += this._lastStoppingDuration;
            }
            this._lastStopping = {
                start: occurrence.watched,
                end: occurrence.judged
            };
            this._continuousFreezing.push(this._lastStopping);
        } else {
            this._lastStopping.end = occurrence.judged;
            if (this._lastStoppingDuration >= this.minimalDuration) {
                this._presentFreezing(true);
                this._presentFrozenTime(this._totalFrozenTime + this._lastStoppingDuration);
            }
        }

        this._movedLastTime = false;
    };

    FreezingManager.prototype._presentElapsedTime = function (time) {
        elapsedTimeText.textContent = time.toString();
    };

    FreezingManager.prototype._presentFrozenTime = function (time) {
        frozenTimeText.textContent = time.toString();
    };

    FreezingManager.prototype._presentStopping = function (stopping) {
        stoppingText.textContent = stopping ? "true" : "false";
    };

    FreezingManager.prototype._presentFreezing = function (freezing) {
        freezingText.textContent = freezing ? "true" : "false";
    };
    return FreezingManager;
})();
//# sourceMappingURL=freezingmanager.js.map
