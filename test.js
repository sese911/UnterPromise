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
});