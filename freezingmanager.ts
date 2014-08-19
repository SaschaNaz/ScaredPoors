class FreezingManager {
    private _continuousFreezing: Continuity[] = [];
    private _wasDefreezedLastTime = true;
    private _lastStopping: Continuity = null;
    private _isFrozen = true;
    private _latestMovements: Occurrence[] = [];
    private _totalFrozenTime = 0;
    private _elapsedTime = 0;

    private get _lastStoppingDuration() {
        return this._lastStopping.end - this._lastStopping.start;
    }
    private get _latestMovingDuration() {
        var duration = 0;
        this._latestMovements.forEach((movement) => {
            duration += movement.judged - movement.watched;
        });
        return duration;
    }
    private get _firstStoppingWithinDuration() {
        var stopping = this._elapsedTime - this.observingDuration; // Assuming there is no movement
        for (var i = 0; i < this._latestMovements.length; i++) {
            var item = this._latestMovements[i];
            if (stopping >= item.watched)
                stopping = item.judged; // Movement occured at that time, delaying
            else
                break;
        }
        return stopping;
    }
    get frozenRatio() {
        if (!this._lastStopping)
            return 0;
        var frozen = this._totalFrozenTime;
        if (!this._isFrozen && this._lastStoppingDuration > this.observingDuration) // last stopping is not yet added while it is long enough
            frozen += this._lastStoppingDuration;

        return frozen / this._elapsedTime;
    }

    observingDuration = 1.5;

    loadStopping(stopping: Occurrence) {
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
    }

    private _clearOldMovements() {
        while (this._latestMovements[0] && this._latestMovements[0].judged <= this._elapsedTime - 1.5)
            this._latestMovements.shift();
    }

    private _presentElapsedTime(time: number) {
        elapsedTimeText.textContent = time.toFixed(2);
    }

    private _presentFrozenTime(time: number) {
        frozenTimeText.textContent = time.toFixed(2);
    }

    /** 
    Expects `active`, `stopped`, or `frozen`.
    */
    private _presentStatus(status: string) {
        switch (status) {
            case "active":
            case "stopped":
            case "frozen":
                statusPresenter.className = status;
                break;
            default:
                throw new Error("Unexpected keyword");
        }
    }
}