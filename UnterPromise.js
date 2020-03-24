class UnterPromise {
    constructor(executor) {
        if (typeof executor === "function") {
            executor();
        }
        else {
            throw TypeError(`UnterPromise executor ${typeof executor} is not a function`);
        }
    }
}