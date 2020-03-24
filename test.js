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

describe("Тесты метода .then", function() {

    it("Метод .then принимает первым аргументом функцию, которая должна быть вызвана при разрешении промиса с результатом промиса в качастве аргумента", function(done) {
        let testValue = "foo";

        new UnterPromise(resolve => {
            setTimeout(() => resolve(testValue), 100);
        })
        .then(value => {
            assert.equal(value, testValue);
            done();
        });
    });

    it("Одному промису можно присвоить несколько обработчиков разрешения и все они должны выполниться", function(done) {
        let testValue = "foo";
        let result_1, result_2, result_3;

        let promise = new UnterPromise(resolve => {
            setTimeout(() => resolve(testValue), 100);
        });
        promise.then(value => {
            result_1 = value;
        });
        promise.then(value => {
            result_2 = value;
        });
        promise.then(value => {
            result_3 = value;

            assert.equal(result_1, testValue);
            assert.equal(result_2, testValue);
            assert.equal(result_3, testValue);
            done();
        });
    });

    it("Если .then вызван на уже разрешенном промисе, обработчик разрешения должен исполниться немедленно", function(done) {
        let testValue = "foo";

        let promise = new UnterPromise(resolve => {
            setTimeout(() => resolve(testValue), 100);
        });
        setTimeout(() => {
            promise.then(value => {
                assert.equal(value, testValue);
                done();
            });
        }, 200);
    });
    
});