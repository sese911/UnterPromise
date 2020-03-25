class UnterPromise {
    static resolve(value) {
        let unterPromise = new UnterPromise(() => {});
        unterPromise._status = "fulfilled";
        unterPromise._result = value;

        return unterPromise;
    }

    static reject(error) {
        let unterPromise = new UnterPromise(() => {});
        unterPromise._status = "rejected";
        unterPromise._result = error;

        return unterPromise;        
    }

    constructor(executor) {
        this._status = "pending";
        this._result;
        this._onResolveQueue = [];
        this._onRejectQueue = [];

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
            let resolveHandlerObj = this._onResolveQueue.shift();
            let returnValue;

            try {
                returnValue = resolveHandlerObj.onResolveHandler(this._result);
            }
            catch(error) {
                resolveHandlerObj.unterPromise._reject(error);
                break;
            }

            if (returnValue instanceof UnterPromise) {
                returnValue.then(
                    () => resolveHandlerObj.unterPromise._resolve(returnValue._result),
                    () => resolveHandlerObj.unterPromise._reject(returnValue._result)
                );
            } else {
                resolveHandlerObj.unterPromise._resolve(returnValue);
            }
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
            let rejectHandlerObj = this._onRejectQueue.shift();
            let returnValue;

            try {
                returnValue = rejectHandlerObj.onRejectHandler(this._result);
            }
            catch(error) {
                rejectHandlerObj.unterPromise._reject(error);
                break;
            }

            if (returnValue instanceof UnterPromise) {
                returnValue.then(
                    () => rejectHandlerObj.unterPromise._resolve(returnValue._result),
                    () => rejectHandlerObj.unterPromise._reject(returnValue._result)
                );
            } else {
                rejectHandlerObj.unterPromise._resolve(returnValue);
            }
        }
    }

    then(onResolve, onReject) {
        let newUnterPromis = new UnterPromise(() => {});

        if (typeof onResolve === "function") {
            this._onResolveQueue.push({ onResolveHandler: onResolve, unterPromise: newUnterPromis });
        }

        if (typeof onReject === "function") {
            this._onRejectQueue.push({ onRejectHandler: onReject, unterPromise: newUnterPromis });
        }

        if(this._status === "fulfilled") this._runOnResolveHandlers();
        if(this._status === "rejected") this._runOnRejectHandlers();

        return newUnterPromis;
    }
    
}