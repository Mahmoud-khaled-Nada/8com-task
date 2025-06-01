import request from "supertest";
import app from "../main.js";

describe("Express App API users", () => {
    it("user already exists", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .send({
                name: "Nada Seller",
                email: "seller@shop.com",
                role: "seller",
                password: "seller123"
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            success: false,
            message: "User already exists with this email"
        });
    });

    it("User registered successfully", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .send({
                name: "Nada2 Seller",
                email: "seller2@shop.com",
                role: "seller",
                password: "seller123"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toMatchObject({
            success: true,
            message: "User registered successfully"
        });
    });
});
