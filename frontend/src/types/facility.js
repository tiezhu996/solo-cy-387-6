export class ApiBusinessError extends Error {
    constructor(code, message) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = 'ApiBusinessError';
        this.code = code;
    }
}
