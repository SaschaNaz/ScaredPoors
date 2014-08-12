class FreezingManager {
    private _continuousFreezing: Continuity[] = [];
    private _movedLastTime = true;
    private _lastStopping: Continuity = null;
    private _totalFrozenTime = 0;
    private _elapsedTime = 0;

    private get _lastStoppingDuration() {
        return this._lastStopping.end - this._lastStopping.start;
    }
    get frozenRatio() {
        if (!this._lastStopping)
            return 0;
        var frozen = this._totalFrozenTime;
        if (!this._movedLastTime && this._lastStoppingDuration > this.minimalDuration) // last stopping is not yet added while it is long enough
            frozen += this._lastStoppingDuration;

        return frozen / this._elapsedTime;
    }

    minimalDuration = 1.5;

    loadOccurrence(occurrence: Occurrence) {
        this._elapsedTime = occurrence.judged;
        this._presentElapsedTime(this._elapsedTime);
        if (!occurrence.isOccured) {
            this._presentStatus("active");
            this._movedLastTime = true;
            return;
        }
        
        //occured
        this._presentStatus("stopped");
        if (this._movedLastTime) {
            if (this._lastStopping) {
                if (this._lastStoppingDuration < this.minimalDuration) // too short stopping time, ignore it
                    this._continuousFreezing.pop();
                else
                    this._totalFrozenTime += this._lastStoppingDuration;
            }
            this._lastStopping = {
                start: occurrence.watched,
                end: occurrence.judged
            };
            this._continuousFreezing.push(this._lastStopping);
        }
        else {
            this._lastStopping.end = occurrence.judged;
            if (this._lastStoppingDuration >= this.minimalDuration) { // enough stopping time, continuing
                this._presentStatus("frozen");
                this._presentFrozenTime(this._totalFrozenTime + this._lastStoppingDuration);
            }
        }

        this._movedLastTime = false;
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