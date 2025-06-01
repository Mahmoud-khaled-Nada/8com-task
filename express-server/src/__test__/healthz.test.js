import request from "supertest";
import app from "../main.js";


describe("Express App API", () => {
  it("backend is working", async () => {
    const res = await request(app).get("/api/v1/healthz");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Up and running v1");
  });
});
