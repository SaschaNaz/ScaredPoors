var FreezingManager = (function () {
    function FreezingManager() {
        this._continuousFreezing = [];
        this._wasDefreezedLastTime = true;
        this._lastStopping = null;
        this._isFrozen = true;
        this._latestMovements = [];
        this._totalFrozenTime = 0;
        this._elapsedTime = 0;
        this.observingDuration = 1.5;
    }
    Object.defineProperty(FreezingManager.prototype, "_lastStoppingDuration", {
        get: function () {
            return this._lastStopping.end - this._lastStopping.start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreezingManager.prototype, "_latestMovingDuration", {
        get: function () {
            var duration = 0;
            this._latestMovements.forEach(function (movement) {
                duration += movement.judged - movement.watched;
            });
            return duration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreezingManager.prototype, "_firstStoppingWithinDuration", {
        get: function () {
            var stopping = this._elapsedTime - this.observingDuration;
            for (var i = 0; i < this._latestMovements.length; i++) {
                var item = this._latestMovements[i];
                if (stopping >= item.watched)
                    stopping = item.judged; // Movement occured at that time, delaying
                else
                    break;
            }
            return stopping;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FreezingManager.prototype, "frozenRatio", {
        get: function () {
            if (!this._lastStopping)
                return 0;
            var frozen = this._totalFrozenTime;
            if (!this._isFrozen && this._lastStoppingDuration > this.observingDuration)
                frozen += this._lastStoppingDuration;

            return frozen / this._elapsedTime;
        },
        enumerable: true,
        configurable: true
    });

    FreezingManager.prototype.loadStopping = function (stopping) {
        this._elapsedTime = stopping.judged;
        this._presentElapsedTime(this._elapsedTime);

        this._clearOldMovements();

        if (!stopping.isOccured)
            this._latestMovements.push(stopping);

        if (this._latestMovingDuration <= this.observingDuration * 0.1) {
            this._lastStopping = { start: this._firstStoppingWithinDuration, end: stopping.judged };
            this._continuousFreezing.push(this._lastStopping);

            //presenting time
            return;

            this._wasDefreezedLastTime = false;
            this._presentStatus("frozen");
        }

        if (!this._wasDefreezedLastTime) {
            // fixing end time
        }

        this._wasDefreezedLastTime = true;
        if (stopping.isOccured)
            this._presentStatus("stopping");
        else
            this._presentStatus("active");
        //if (!stopping.isOccured) {
        //    this._presentStatus("active");
        //    this._movedLastTime = true;
        //    return;
        //}
        ////occured
        //this._presentStatus("stopped");
        //if (this._movedLastTime) {
        //    if (this._lastStopping) {
        //        if (this._lastStoppingDuration < this.minimalDuration) // too short stopping time, ignore it
        //            this._continuousFreezing.pop();
        //        else
        //            this._totalFrozenTime += this._lastStoppingDuration;
        //    }
        //    this._lastStopping = {
        //        start: stopping.watched,
        //        end: stopping.judged
        //    };
        //    this._continuousFreezing.push(this._lastStopping);
        //}
        //else {
        //    this._lastStopping.end = stopping.judged;
        //    if (this._lastStoppingDuration >= this.minimalDuration) { // enough stopping time, continuing
        //        this._presentStatus("frozen");
        //        this._presentFrozenTime(this._totalFrozenTime + this._lastStoppingDuration);
        //    }
        //}
        //this._movedLastTime = false;
    };

    FreezingManager.prototype._clearOldMovements = function () {
        while (this._latestMovements[0] && this._latestMovements[0].judged <= this._elapsedTime - 1.5)
            this._latestMovements.shift();
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
