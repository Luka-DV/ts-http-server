
export class NotFoundError extends Error {
    constructor(text: string) {
        super(text);
        this.name = "NotFoundError";
    }
}

export class ForbiddenError extends Error {
    constructor(text: string) {
        super(text);
        this.name = "ForbiddenError";
    }
}

export class UnauthorizedError extends Error {
    constructor(text: string) {
        super(text);
        this.name = "UnauthorizedError";
    }
}

export class BadRequestError extends Error {
    constructor(text: string) {
        super(text);
        this.name = "BadRequestError";
    }
}

export class ConflictError extends Error {
    constructor(text: string) {
        super(text);
        this.name = "ConflictError";
    }
}