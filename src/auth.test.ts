
import { describe, it, expect, beforeAll, test } from "vitest";
import { hashPassword, checkPasswordHash, makeJWT, validateJWT, getBearerToken } from "./auth.js";
import { UnauthorizedError } from "./errors.js";
import { Request } from "express";



describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the wrong password", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  })

  it("should return false for an empty password", async () => {
    const result = await checkPasswordHash("", hash1);
    expect(result).toBe(false);
  });

   it("should return false for an invalid hash", async () => {
    const result = await checkPasswordHash(password1, "invalidhash");
    expect(result).toBe(false);
  });
  
});


//Create and validate JWTs, JWTs signed with the wrong secret are rejected and expired tokens are rejected.1

describe("Creating and validating JWTs", () => {

    const userID1 = "potato";
    const userID2 = "cucumber";
    let jwt1: string;
    let jwt2: string;
    let expiredJwt3: string;
    const secret1 = "shhh";
    const secret2 = "blue";

    beforeAll(() => {
        jwt1 = makeJWT(userID1, 5, secret1);
        jwt2 = makeJWT(userID2, 10, secret2);
        expiredJwt3 = makeJWT(userID1, 0, secret1)
    })

    test("should return the correct payload(userID) for the right secret", () => {
        const payload = validateJWT(jwt1, secret1);
        expect(payload).toBe(userID1);
    })

    test("should throw right error when signed with wrong secret", () => {
        expect(() => validateJWT(jwt1, secret2)).toThrowError(expect.objectContaining({
            message: 'invalid signature',
        }))
    })

     /* This also works:
    > constructor match 
        expect(() => validateJWT(jwt1, secret2)).toThrowError(UnauthorizedError)

    > regex string message match
        expect(() => validateJWT(jwt1, secret2)).toThrowError(/^invalid signature$/);
    */

    setTimeout(() => {}, 50);

    test("should throw right error if token expires", () => {
        expect(() => validateJWT(expiredJwt3, secret1)).toThrowError(expect.objectContaining({
            message: 'Token has expired',
        }))
    })
});


describe("Get token string from request", () => {
/* 
    const mockHeader = new Headers();
    mockHeader.append("Authorization", "Bearer mockTokenString");
    const mockRequest = new Request("/", {headers: mockHeader});
*/
   
    const mockTokenString = "Bearer mockTokenString";

    const mockRequestObjectOK = {
        get(auth: string): string | undefined {
            if(auth !== "Authorization") {
                return undefined;
            }
            return mockTokenString;
        }
    }

    const mockRequestObjectUndefined = {
        get(auth: string): undefined {
            return undefined;
        }
    }

    const mockRequestObjectWrongString = {
        get(auth: string): string | undefined {
            if(auth === "Authorization") {
                return "   node   ";
            }
            return undefined;
        }
    }

    test("should return correct token string", () => {
        const tokenString = getBearerToken(mockRequestObjectOK as Request);
        expect(tokenString).toBe("mockTokenString");
    })

    test("should throw an error for missing token string", () => {
        expect(() => getBearerToken(mockRequestObjectUndefined as Request)).toThrowError(expect.objectContaining({
            message: "Missing header",
        }))
    })

    test("should throw an error for wrong token string", () => {
        expect(() => getBearerToken(mockRequestObjectWrongString as Request)).toThrowError(expect.objectContaining({
            message: "Wrong token format",
        }))
    })
})



/* Vitest docs examples

function getFruitStock(type: string) {
  if (type === 'pineapples') {
    throw new Error('Pineapples are not in stock')
  }

  // Do some other stuff
}

test('throws on pineapples', () => {
  // Test that the error message says "stock" somewhere: these are equivalent
  expect(() => getFruitStock('pineapples')).toThrowError(/stock/)
  expect(() => getFruitStock('pineapples')).toThrowError('stock')

  // Test the exact error message
  expect(() => getFruitStock('pineapples')).toThrowError(
    /^Pineapples are not in stock$/,
  )

  expect(() => getFruitStock('pineapples')).toThrowError(
    new Error('Pineapples are not in stock'),
  )
  expect(() => getFruitStock('pineapples')).toThrowError(expect.objectContaining({
    message: 'Pineapples are not in stock',
  }))
}) */