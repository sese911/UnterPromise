let TestingClass = UnterPromise;

describe(`Тесты конструктора класса ${TestingClass.name}`, function() {

    it("Конструктор в качестве аргумента принимает функцию, иначе выбрасываем TypeError", function() {
        let testError;

        try {
            new TestingClass();
        }
        catch (error) {
            testError = error;
        }

        assert.equal(testError.name, "TypeError");
    });

    it("Переданная функция немедленно вызывается в конструкторе", function() {
        let testValue;

        new TestingClass(() => testValue = "foo");

        assert.equal(testValue, "foo");
    });

    it("Конструктор передает экзекьютеру в качестве аргументов внутренние методы промиса, изменяющие сосотояние промиса и присваивающие переданный им аргумент результату промиса", function(done) {
        let testValue = "foo";
        let testError = new Error("Тестовая ошибка!");

        new TestingClass(resolve => {
            assert.typeOf(resolve, "function");
            resolve(testValue);
        })
        .then(value => {
            assert.equal(value, testValue);
        });

        new TestingClass((resolve, reject) => {
            assert.typeOf(reject, "function");
            reject(testError);
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });

    it("Статус промиса изменяется только один раз, последующие попытки разрешить или отклонить промис игнорирутся", function(done) {

        let testValue_1 = "foo";
        let testValue_2 = "bar";
        let testError = new Error("Тестовая ошибка!");

        new TestingClass((resolve, reject) => {
            resolve(testValue_1);
            resolve(testValue_2);
            reject(testError);
        })
        .then(value => {
            assert.equal(value, testValue_1);
            done();
        });

    });

    it("Если экзекьютор при выполнении выдает ошибку, промис должен быть отклонен со значением этой ошибки", function(done) {
        let testError = new Error("Тестовая ошибка!");

        new TestingClass((resolve, reject) => {
            throw testError;
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });
});

describe("Тесты метода .then", function() {

    it("Метод .then принимает первым аргументом функцию, которая должна быть вызвана при разрешении промиса с результатом промиса в качастве аргумента", function(done) {
        let testValue = "foo";

        new TestingClass(resolve => {
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

        let promise = new TestingClass(resolve => {
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

        let promise = new TestingClass(resolve => {
            setTimeout(() => resolve(testValue), 100);
        });
        setTimeout(() => {
            promise.then(value => {
                assert.equal(value, testValue);
                done();
            });
        }, 200);
    });

    it("Метод .then принимает вторым аргументом функцию, которая должна быть вызвана при отклонении промиса с результатом промиса в качестве аргумента", function(done) {
        let testError = new Error("Тестовая ошибка!");

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(testError), 100);
        })
        .then(null, error => {
            assert.equal(error, testError);
            done();
        });
    });

    it("Одному промису можно присвоить несколько обработчиков отклонения и все они должны выполниться", function(done) {
        let testError = new Error("Тестовая ошибка!");
        let result_1, result_2, result_3;

        let promise = new TestingClass((resolve, reject) => {
            setTimeout(() => reject(testError), 100);
        });
        promise.then(null, error => {
            result_1 = error;
        });
        promise.then(null, error => {
            result_2 = error;
        });
        promise.then(null, error => {
            result_3 = error;

            assert.equal(result_1, testError);
            assert.equal(result_2, testError);
            assert.equal(result_3, testError);
            done();
        });
    });

    it("Если .then вызван на уже отклоненном промисе, обработчик отклонения должен исполниться немедленно", function(done) {
        let testError = new Error("Тестовая ошибка!");

        let promise = new TestingClass((resolve, reject) => {
            setTimeout(() => reject(testError), 100);
        });
        setTimeout(() => {
            promise.then(null, error => {
                assert.equal(error, testError);
                done();
            });
        }, 200);
    });

    it("Метод .then возвращает новый промис, который разрешится когда будет вызван один из обработчиков полученных методом .then", function(done) {
        let onResolveCalled = false;
        let onRejectCalled  = false;

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .then(() => {})
        .then(() => {
            onResolveCalled = true;
        });
        
        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 200);
        })
        .then(null, () => {})
        .then(() => {
            onRejectCalled = true;

            assert.isTrue(onResolveCalled);
            assert.isTrue(onRejectCalled);
            done();
        });
    });

    it("Если обработчик, переданный методу .then, возвращает значение, то промис созданный методом .then разрешается с этим значением", function(done) {
        let testValue = "foobar";

        new TestingClass(resolve => {
            setTimeout(() => resolve("foo"), 100);
        })
        .then(value => {
            return value + "bar";
        })
        .then(value => {
            assert.equal(value, testValue);
            done();
        });
    });

    it("Если обработчик, переданный методу .then, возвращает undefined, то промис созданный методом .then разрешается со значением undefined", function(done) {
        let testValue;

        new TestingClass(resolve => {
            setTimeout(() => resolve("foo"), 100);
        })
        .then(() => {
            // ничего не возвращает
        })
        .then(value => {
            assert.equal(value, testValue);
            done();
        });
    });

    it("Если обработчик, переданный методу .then, выдает ошибку, то промис созданный методом .then отклоняется со значением выданной ошибки", function(done) {
        let testError = Error("Тестовая ошибка!");
        let result_1, result_2;

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .then(() => {
            throw testError;
        })
        .then(null, error => {
            result_1 = error;
        });
        
        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .then(null, () => {
            throw testError;
        })
        .then(null, error => {
            result_2 = error;

            assert.equal(result_1, testError);
            assert.equal(result_2, testError);
            done();
        });
    });

    it("Если обработчик, переданный методу .then, возвращает разрешенный промис, то промис созданный методом .then разрешается со значением промиса возвращенного обработчиком", function(done) {
        let testValue = "foo";
        let result_1, result_2;

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .then(() => {
            return new TestingClass(resolve => resolve(testValue));
        })
        .then(value => {
            result_1 = value;
        });

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .then(null, () => {
            return new TestingClass(resolve => resolve(testValue));
        })
        .then(value => {
            result_2 = value;

            assert.equal(result_1, testValue);
            assert.equal(result_2, testValue);
            done();
        });
    });

    it("Если обработчик, переданный методу .then, возвращает отклоненный промис, то промис созданный методом .then отклоняется со значением промиса возвращенного обработчиком", function(done) {
        let testError = new Error("Тестовая ошибка!");
        let result_1, result_2;

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .then(() => {
            return new TestingClass((resolve, reject) => reject(testError));
        })
        .then(null, error => {
            result_1 = error;
        });

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .then(null, () => {
            return new TestingClass((resolve, reject) => reject(testError));
        })
        .then(null, error => {
            result_2 = error;

            assert.equal(result_1, testError);
            assert.equal(result_2, testError);
            done();
        });
    });

    it("Если обработчик, переданный методу .then, возвращает промис в состоянии ожидания, то промис созданный методом .then разрешается со значением промиса возвращенного обработчиком как только тот разрешится", function(done) {
        let testValue = "foo";
        let result_1, result_2;

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .then(() => {
            return new TestingClass(resolve => {
                setTimeout(() => resolve(testValue), 100);
            });
        })
        .then(value => {
            result_1 = value;
        });

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .then(null, () => {
            return new TestingClass(resolve => {
                setTimeout(() => resolve(testValue), 100);
            });
        })
        .then(value => {
            result_2 = value;

            assert.equal(result_1, testValue);
            assert.equal(result_2, testValue);
            done();
        });
    });

    it("Если обработчик, переданный методу .then, возвращает промис в состоянии ожидания, то промис созданный методом .then отклоняется со значением промиса возвращенного обработчиком как только тот отклонится", function(done) {
        let testError = new Error("Тестовая ошибка!");
        let result_1, result_2;

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .then(() => {
            return new TestingClass((resolve, reject) => {
                setTimeout(reject(testError), 100);
            });
        })
        .then(null, error => {
            result_1 = error;
        });

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .then(null, () => {
            return new TestingClass((resolve, reject) => {
                setTimeout(reject(testError), 100);
            });
        })
        .then(null, error => {
            result_2 = error;

            assert.equal(result_1, testError);
            assert.equal(result_2, testError);
            done();
        });
    }); 

    it("Если промис был отклонен, то все промисы созданные вызванными на нем методами .then с обработчиками разрешения, но без обработчиков отклонения, также должны быть отклонены", function(done) {
        let testError = new Error("Тестовая ошибка!");
        let testValue = "foo";
    
        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(testError), 100);
        })
        .then(() => {})
        .then(() => {}, error => {
            assert.equal(error, testError)            
            return new TestingClass(resolve => {
                setTimeout(() => resolve(testValue), 100);
            });
        })
        .then(value => {
            assert.equal(value, testValue);
            done();
        });
    });  
});

describe("Тесты метода .catch", function() {

    it("Метод .catch принимает в качестве аргумента функцию, которая должна быть вызвана при отклонении промиса с результатом промиса в качестве аргумента", function(done) {
        let testError = new Error("Тестовая ошибка!");

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(testError), 100);
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });

    it("Одному промису можно присвоить несколько обработчиков отклонения и все они должны выполниться", function(done) {
        let testError = new Error("Тестовая ошибка!");
        let result_1, result_2, result_3;

        let promise = new TestingClass((resolve, reject) => {
            setTimeout(() => reject(testError), 100);
        });
        promise.catch(error => {
            result_1 = error;
        });
        promise.catch(error => {
            result_2 = error;
        });
        promise.catch(error => {
            result_3 = error;

            assert.equal(result_1, testError);
            assert.equal(result_2, testError);
            assert.equal(result_3, testError);
            done();
        });
    });

    it("Если .catch вызван на уже отклоненном промисе, обработчик отклонения должен исполниться немедленно", function(done) {
        let testError = new Error("Тестовая ошибка!");

        let promise = new TestingClass((resolve, reject) => {
            setTimeout(() => reject(testError), 100);
        });
        setTimeout(() => {
            promise.catch(error => {
                assert.equal(error, testError);
                done();
            });
        }, 200);
    });

    it("Метод .catch возвращает новый промис, который разрешится когда будет вызван обработчик полученный методом .catch", function(done) {
        let onResolveCalled  = false;
        
        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .catch(() => {})
        .then(value => {
            onResolveCalled = true;
            assert.isTrue(onResolveCalled);
            done();
        });
    });

    it("Если обработчик, переданный методу .catch, возвращает значение, то промис созданный методом .catch разрешается с этим значением", function(done) {
        let testValue = "foo";

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .catch(() => {
            return testValue;
        })
        .then(value => {
            assert.equal(value, testValue);
            done();
        });
    });

    it("Если обработчик, переданный методу .catch, возвращает undefined, то промис созданный методом .catch разрешается со значением undefined", function(done) {
        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .catch(() => {
            // ничего не возвращает
        })
        .then(value => {
            assert.equal(value, undefined);
            done();
        });
    });

    it("Если обработчик, переданный методу .catch, выдает ошибку, то промис созданный методом .catch отклоняется со значением выданной ошибки", function(done) {
        let testError = Error("Тестовая ошибка!");
        
        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .catch(() => {
            throw testError;
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });

    it("Если обработчик, переданный методу .catch, возвращает разрешенный промис, то промис созданный методом .catch разрешается со значением промиса возвращенного обработчиком", function(done) {
        let testValue = "foo";

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .catch(() => {
            return TestingClass.resolve(testValue);
        })
        .then(value => {
            assert.equal(value, testValue);
            done();
        });
    });

    it("Если обработчик, переданный методу .catch, возвращает отклоненный промис, то промис созданный методом .catch отклоняется со значением промиса возвращенного обработчиком", function(done) {
        let testError = new Error("Тестовая ошибка!");

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .catch(() => {
            return TestingClass.reject(testError);
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });

    it("Если обработчик, переданный методу .catch, возвращает промис в состоянии ожидания, то промис созданный методом .catch разрешается со значением промиса возвращенного обработчиком как только тот разрешится", function(done) {
        let testValue = "foo";

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .catch(() => {
            return new TestingClass(resolve => {
                setTimeout(() => resolve(testValue), 100);
            });
        })
        .then(value => {
            assert.equal(value, testValue);
            done();
        });
    });

    it("Если обработчик, переданный методу .catch, возвращает промис в состоянии ожидания, то промис созданный методом .catch отклоняется со значением промиса возвращенного обработчиком как только тот отклонится", function(done) {
        let testError = new Error("Тестовая ошибка!");

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .catch(() => {
            return new TestingClass((resolve, reject) => {
                setTimeout(reject(testError), 100);
            });
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });
});

describe("Тесты метода .finally", function() {
    
    it("Метод .finally принимает в качестве аргумента функцию, которая должна быть вызвана при разрешении или отклонении промиса", function(done) {
        let onResolveCalled = false;
        let onRejectCalled  = false;

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .finally(() => {
            onResolveCalled = true;
        });

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        })
        .finally(() => {
            onRejectCalled = true;

            assert.isTrue(onResolveCalled);
            assert.isTrue(onRejectCalled);
            done();
        });
    });

    it("Одному промису можно присвоить несколько обработчиков finally и все они должны выполниться", function(done) {
        let testValue = "foo";
        let result_1, result_2, result_3, result_4;

        let resolvedPromise = new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        });
        resolvedPromise.finally(() => {
            result_1 = testValue;
        });
        resolvedPromise.finally(() => {
            result_2 = testValue;
        });

        let rejectedPromise = new TestingClass((resolve, reject) => {
            setTimeout(() => reject(), 100);
        });
        rejectedPromise.finally(() => {
            result_3 = testValue;
        });
        rejectedPromise.finally(() => {
            result_4 = testValue;

            assert.equal(result_1, testValue);
            assert.equal(result_2, testValue);
            assert.equal(result_3, testValue);
            assert.equal(result_4, testValue);
            done();
        });
    });

    it("Если .finally вызван на уже разрешенном или отклоненном промисе, обработчик должен исполниться немедленно", function(done) {
        let onResolveCalled = false;
        let onRejectCalled  = false;

        TestingClass.resolve()
        .finally(() => {
            onResolveCalled = true;
        });

        TestingClass.reject()
        .finally(() => {
            onRejectCalled = true;

            assert.isTrue(onResolveCalled);
            assert.isTrue(onRejectCalled);
            done();
        });
    });

    it("Обработчик переданный в метод .finally при своем исполнении не должен получать никаких аргументов", function(done) {
        new TestingClass(resolve => {
            setTimeout(() => resolve("foo"), 100);
        })
        .finally(value => {
            assert.isUndefined(value);
        });

        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(new Error("Какая-то ошибка!")), 100);
        })
        .finally(value => {
            assert.isUndefined(value);
            done();
        })
        .catch(() => {});
    });

    it("Метод .finally возвращает новый промис, который разрешится или отклонится когда будет вызван обработчик полученный методом .finally. Этот промис должен разрешится или отклонится со значением и статусом, с которым был разрешен или отклонен промис на котором был вызван метод .finally", function(done) {
        let testValue = "foo";
        let testError = new Error("Тестовая ошибка!");
        
        new TestingClass(resolve => {
            setTimeout(() => resolve(testValue), 100);
        })
        .finally(() => {}) // Должен вернуть разрешенный промис со значением testValue
        .then(value => {
            assert.equal(value, testValue);
        });
        
        new TestingClass((resolve, reject) => {
            setTimeout(() => reject(testError), 100);
        })
        .finally(() => { // Должен вернуть отклоненный промис со значением testError
            return TestingClass.resolve(testValue);
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });

    it("Если обработчик, переданный методу .finally, выдает ошибку, то промис созданный методом .finally отклоняется со значением этой ошибки", function(done) {
        let testError = new Error("Тестовая ошибка!");

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .finally(() => {
            throw testError;
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });

    it("Если обработчик, переданный методу .finally, возвращает отклоненный промис, то промис созданный методом .finally отклоняется со значением этого промиса", function(done) {
        let testError = new Error("Тестовая ошибка!");

        new TestingClass(resolve => {
            setTimeout(() => resolve(), 100);
        })
        .finally(() => {
            return new TestingClass((resolve, reject) => {
                setTimeout(() => reject(testError), 100);
            });
        })
        .catch(error => {
            assert.equal(error, testError);
            done();
        });
    });
});

describe(`Тесты статических методов класса ${TestingClass.name}`, function() {

    it("Статический метод resolve возвращает промис, разрешенный с переданным в метод аргументом", function() {

        let testValue = "foo";

        TestingClass.resolve(testValue)
        .then(value => {
            assert.equal(value, testValue);
        });
    });

    it("Статический метод reject возвращает промис, отклоненный с переданным в метод аргументом", function() {

        let testError = new Error("Тестовая ошибка!");

        TestingClass.reject(testError)
        .then(null, error => {
            assert.equal(error, testError);
        });
    });

});

describe(`Поддержка thenable объектов классом ${TestingClass.name}`, function() {

    let testNumberError  = new Error("thenable объект вызвал отклонение промиса!");
    let badThenableError = new Error("Ошибка метода .then  в thenable объекте!");
    class ThenableNumberphile {
        constructor(value) {
            this.someValue = value;
        }
        then(resolve, reject) {
            typeof this.someValue === "number"
                ? resolve(this.someValue * 2)
                : reject(testNumberError);
        }
    }

    class BadThenable {
        constructor() {}
        then() { throw badThenableError; }
    }

    it("Если обработчик разрешения промиса возвращает объект у которого есть метод .then, следует вызвать этот метод и прередать ему в качастве аргументов функции разрешающие и отклоняющие промис, привязанный к этому обработчику", function(done) {
        let testValue = 666;
        let testError  = new Error("Тестовая ошибка!");
        let wasRunned_1 = false;

        let resolvedPromise = TestingClass.resolve(testValue);

        resolvedPromise
        .then(value => {
            return new ThenableNumberphile(value);
        })
        .then(value => {
            wasRunned_1  = true;
            assert.equal(value, testValue * 2);
        });

        resolvedPromise
        .then(() => {
            return new ThenableNumberphile("не число");
        })
        .catch(error => {
            assert.isTrue(wasRunned_1);
            assert.equal(error, testNumberError);
            done();
        });
    });

    it("Если обработчик отклонения промиса возвращает объект у которого есть метод .then, следует вызвать этот метод и прередать ему в качастве аргументов функции разрешающие и отклоняющие промис, привязанный к этому обработчику", function(done) {
        let testValue = 666;
        let testError  = new Error("Тестовая ошибка!");
        let wasRunned_1 = false;

        let rejectedPromise = TestingClass.reject(testError);

        rejectedPromise
        .catch(() => {
            return new ThenableNumberphile(testValue);
        })
        .then(value => {
            wasRunned_1 = true;
            assert.equal(value, testValue * 2);
        });

        rejectedPromise
        .catch(() => {
            return new ThenableNumberphile("не число");
        })
        .catch(error => {
            assert.isTrue(wasRunned_1);
            assert.equal(error, testNumberError);
            done();
        });
    });

    it("Если обработчик завершения промиса возвращает объект у которого есть метод .then, следует вызвать этот метод и прередать ему в качастве аргументов функции разрешающие и отклоняющие промис, привязанный к этому обработчику", function(done) {
        let testValue = 666;
        let testError  = new Error("Тестовая ошибка!");
        let wasRunned_1 = wasRunned_2 = wasRunned_3 = false;

        let resolvedPromise = TestingClass.resolve(testValue);        
        let rejectedPromise = TestingClass.reject(testError);

        resolvedPromise
        .finally(() => {
            return new ThenableNumberphile(testValue);
        })
        .then(value => {
            wasRunned_1 = true;
            assert.equal(value, testValue);
        });

        resolvedPromise
        .finally(() => {
            return new ThenableNumberphile("не число");
        })
        .catch(error => {
            wasRunned_2 = true;
            assert.equal(error, testNumberError);
        });

        rejectedPromise
        .finally(() => {
            return new ThenableNumberphile(testValue);
        })
        .catch(error => {
            wasRunned_3 = true;
            assert.equal(error, testError);
        }); 

        rejectedPromise
        .finally(() => {
            return new ThenableNumberphile("не число");
        })
        .catch(error => {
            assert.isTrue(wasRunned_1);
            assert.isTrue(wasRunned_2);
            assert.isTrue(wasRunned_3);
            assert.equal(error, testNumberError);
            done();
        });
    });

    it("Если обработчик разрешения, отклонения или завершения промиса возвращает объект у которого есть метод .then и он при исполнении выдает ошибку следует отклонить промис, привязанный к этому обработчику, со значением выданной ошибки", function(done) {
        let testValue = 666;
        let testError  = new Error("Тестовая ошибка!");
        let wasRunned_1 = wasRunned_2 = wasRunned_3 = false;

        let resolvedPromise = TestingClass.resolve(testValue);        
        let rejectedPromise = TestingClass.reject(testError);

        resolvedPromise
        .then(() => {
            return new BadThenable();
        })
        .catch(error => {
            wasRunned_1 = true;
            assert.equal(error, badThenableError);
        });

        resolvedPromise
        .finally(() => {
            return new BadThenable();
        })
        .catch(error => {
            wasRunned_2 = true;
            assert.equal(error, badThenableError);
        });

        rejectedPromise
        .catch(() => {
            return new BadThenable();
        })
        .catch(error => {
            wasRunned_3 = true;
            assert.equal(error, badThenableError);
        });

        rejectedPromise
        .finally(() => {
            return new BadThenable();
        })
        .catch(error => {
            assert.isTrue(wasRunned_1);
            assert.isTrue(wasRunned_2);
            assert.isTrue(wasRunned_3);
            assert.equal(error, badThenableError);
            done();
        });
    });
});