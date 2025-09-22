

export class NotFoundError extends Error {
    constructor(text: string) {
        super(text);
    }
}

export class ForbiddenError extends Error {
    constructor(text: string) {
        super(text);
    }
}

export class UnauthorizedError extends Error {
    constructor(text: string) {
        super(text);
    }
}

export class BadRequestError extends Error {
    constructor(text: string) {
        super(text);
    }
}