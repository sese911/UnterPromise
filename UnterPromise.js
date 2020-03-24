class UnterPromise {
    constructor(executor) {
        this._status = "pending";
        this._result;
        this._onResolveQueue = [];
        this._onRejectQueue  = [];

        if (typeof executor === "function") {
            executor(value => this._resolve(value), error => this._reject(error));
        }
        else {
            throw TypeError(`UnterPromise executor ${typeof executor} is not a function`);
        }
    }

    _resolve(value) {
        if (this._status === "pending") {
            this._status = "fulfilled";
            this._result = value;

            this._runOnResolveHandlers();
        }
    }

    _runOnResolveHandlers() {
        while(this._onResolveQueue.length > 0) {
            this._onResolveQueue.shift()(this._result);
        }
    }

    _reject(error) {
        if (this._status === "pending") {
            this._status = "rejected";
            this._result = error;

            this._runOnRejectHandlers();
        }
    }

    _runOnRejectHandlers() {
        while(this._onRejectQueue.length > 0) {
            this._onRejectQueue.shift()(this._result);
        }
    }

    then(onResolve, onReject) {
        this._onResolveQueue.push(onResolve);
        this._onRejectQueue.push(onReject);

        if(this._status === "fulfilled") this._runOnResolveHandlers();
        if(this._status === "rejected") this._runOnRejectHandlers();
    }
    
}