describe("Тесты конструктора класса UnterPromise", function() {

    it("Конструктор в качестве аргумента принимает функцию, иначе выбрасываем TypeError", function() {
        let testError;

        try {
            new UnterPromise()
        }
        catch (error) {
            testError = error;
        }

        assert.equal(testError.name, "TypeError");
    });

    it("Переданная функция немедленно вызывается в конструкторе", function() {
        let testValue;

        new UnterPromise(() => testValue = "foo");

        assert.equal(testValue, "foo");
    });

    it("Конструктор передает экзекьютеру в качестве аргументов внутренние методы промиса, изменяющие сосотояние промиса и присваивающие переданный им аргумент результату промиса", function() {
        let testValue = "foo";
        let testError = new Error("Тестовая ошибка!");
        let resolvedPromise = new UnterPromise(resolve => {
            assert.typeOf(resolve, "function");
            resolve(testValue);
        });
        let rejectedPromise = new UnterPromise((resolve, reject) => {
            assert.typeOf(reject, "function");
            reject(testError);
        });
        
        assert.equal(resolvedPromise._status, "fulfilled");
        assert.equal(resolvedPromise._result, testValue);
        assert.equal(rejectedPromise._status, "rejected");
        assert.equal(rejectedPromise._result, testError);
    });

    it("Статус промиса изменяется только один раз, последующие попытки разрешить или отклонить промис игнорирутся", function() {

        let testValue_1 = "foo";
        let testValue_2 = "bar";
        let testError = new Error("Тестовая ошибка!");

        let promise = new UnterPromise((resolve, reject) => {
            resolve(testValue_1);
            resolve(testValue_2);
            reject(testError);
        });

        assert.equal(promise._result, testValue_1);
        assert.equal(promise._status, "fulfilled");
    });
});