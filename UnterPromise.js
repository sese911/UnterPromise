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
        this._onRejectQueue  = [];
        this._onFinallyQueue = [];

        if (typeof executor === "function") {
            try {
                executor(value => this._resolve(value), error => this._reject(error));
            } catch (error) {
                this._reject(error);
            }
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
            this._runOnFinallyHandlers();
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
            }
            else if (returnValue !== undefined && typeof returnValue.then === "function") {
                try {
                    returnValue.then(
                    value => resolveHandlerObj.unterPromise._resolve(value),
                    error => resolveHandlerObj.unterPromise._reject(error)
                    );
                }
                catch(error){
                    resolveHandlerObj.unterPromise._reject(error);
                }
            }
            else {
                resolveHandlerObj.unterPromise._resolve(returnValue);
            }
        }
    }

    _cancelOnResolveHandlers() {
        while(this._onResolveQueue.length > 0) {
            let resolveHandlerObj = this._onResolveQueue.shift();
            resolveHandlerObj.unterPromise._reject(this._result);
        }
    }

    _reject(error) {
        if (this._status === "pending") {
            this._status = "rejected";
            this._result = error;

            if (this._onRejectQueue.length > 0) {
                this._runOnRejectHandlers();
            } else {
                this._cancelOnResolveHandlers();
            }

            this._runOnFinallyHandlers();    
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
            }
            else if (returnValue !== undefined && typeof returnValue.then === "function") {
                try {
                    returnValue.then(
                    value => rejectHandlerObj.unterPromise._resolve(value),
                    error => rejectHandlerObj.unterPromise._reject(error)
                    );
                }
                catch(error) {
                    rejectHandlerObj.unterPromise._reject(error);
                }                
            }
            else {
                rejectHandlerObj.unterPromise._resolve(returnValue);
            }
        }
    }

    _runOnFinallyHandlers() {
        while(this._onFinallyQueue.length > 0) {
            let finallyHandlerObj = this._onFinallyQueue.shift();
            let returnValue;

            try {
                returnValue = finallyHandlerObj.onFinallyHandler();
            }
            catch(error) {
                finallyHandlerObj.unterPromise._reject(error);
                break;
            }

            if (returnValue instanceof UnterPromise) {
                returnValue.then(
                    () => {
                        if (this._status === "fulfilled") {
                            finallyHandlerObj.unterPromise._resolve(this._result);
                        } else {
                            finallyHandlerObj.unterPromise._reject(this._result);
                        }                        
                    },
                    () => {
                        finallyHandlerObj.unterPromise._reject(returnValue._result);
                    }
                );
            }
            else if (returnValue !== undefined && typeof returnValue.then === "function") {
                try {
                    returnValue.then(
                        value => {
                            if (this._status === "fulfilled") {
                                finallyHandlerObj.unterPromise._resolve(value);
                            } else {
                                finallyHandlerObj.unterPromise._reject(value);
                            }
                        },
                        error => {
                            finallyHandlerObj.unterPromise._reject(error);
                        }
                    );
                }   
                catch(error) {
                    finallyHandlerObj.unterPromise._reject(error);
                }            
            }
            else {
                if (this._status === "fulfilled") {
                    finallyHandlerObj.unterPromise._resolve(this._result);
                } else {
                    finallyHandlerObj.unterPromise._reject(this._result);
                }
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

        if(this._status === "fulfilled") {
            this._runOnResolveHandlers();
        }                
        else if (this._status === "rejected") {
            if (this._onRejectQueue.length > 0) {
                this._runOnRejectHandlers();
            } else {
                this._cancelOnResolveHandlers();
            }
        }

        return newUnterPromis;
    }

    catch(onReject) {
        return this.then(undefined, onReject);       
    }

    finally(onFinally) {
        let newUnterPromis = new UnterPromise(() => {});

        if(typeof onFinally === "function") {
            this._onFinallyQueue.push({ onFinallyHandler: onFinally, unterPromise: newUnterPromis} );
        }

        if (this._status !== "pending") { this._runOnFinallyHandlers(); }

        return newUnterPromis;
    }    
}