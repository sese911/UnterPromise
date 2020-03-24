class UnterPromise {
    constructor(executor) {
        this._status = "pending";
        this._result;

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
        }
    }

    _reject(error) {
        if (this._status === "pending") {
            this._status = "rejected";
            this._result = error;
        }
    }

    
}