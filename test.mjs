"use strict";

import fs from "fs";
import app, { server } from "./app.mjs";
import { closeDb } from "./models/db.mjs";
import supertest from "supertest";

const request = supertest(app);

const statuses = [
  "611fcaf640148d94e2a469c7",
  "6175c92c969d515951edefa3",
  "6175c9a2969d515951edefa4",
  "6175c9e3969d515951edefa5",
  "6175ca53969d515951edefa6",
  "6175ca7a969d515951edefa7",
  "6175cb11969d515951edefa8",
  "6175cb4a969d515951edefa9",
  "6175ccbe969d515951edefaa",
  "6175ccc7969d515951edefab",
  "6175ccd3969d515951edefac",
  "6175ccde969d515951edefad",
  "6175cce8969d515951edefae",
  "6175ccf1969d515951edefaf",
  "6175ccfa969d515951edefb0"
];

const users = [
  "kevinaangstadt",
  "ed",
  "choongsool",
  "ltorrey"
];

beforeAll(async () => {
  // wait five seconds
  await new Promise(resolve => setTimeout(resolve, 5000));
});

afterAll(async () => {
  await server.close()
  await closeDb();
});

describe("requests that require authentication", () => {
  const agent = supertest.agent(app);

  // always log out
  afterAll(async () => {
    await agent.get("/api/logout");
  });

  test('should get 400 when not logged in', async () => {
    const res = await agent.get("/api/statuses/replies/611fcaf640148d94e2a469c7.json");
    expect(res.statusCode).toBe(400);
  });

  test("should be able to log in and out", async () => {
    
    const res = await agent.post("/api/login").send({
      username: "kevinaangstadt",
      password: "password"
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toStrictEqual({
      "username": "kevinaangstadt",
      "message": "Welcome to slugfest!"
    });

    const res2 = await agent.get("/api/statuses/replies/611fcaf640148d94e2a469c7.json");
    expect(res2.statusCode).toBe(200);

    const res3 = await agent.get("/api/logout");
    expect(res3.statusCode).toBe(200);
    expect(res3.body).toStrictEqual({
      "message": "Goodbye!"
    });
  }); // /login

  describe("/api/favorites", () => {
    beforeAll(async () => {
      const res = await agent.post("/api/login").send({
        username: "kevinaangstadt",
        password: "password"
      });
    });

    describe("/list.json", () => {
      test("no screen_name should match the authenticated user", async () => {  
        const res = await agent.get("/api/favorites/list.json");
        expect(res.statusCode).toBe(200);
        const oracle = JSON.parse(fs.readFileSync("./test_data/api/favorites/list.json", "utf8"));
        expect(res.body).toStrictEqual(oracle);
      });

      test.each(users)("%s", async (username) => {
        const res = await agent.get("/api/favorites/list.json")
          .query({screen_name: username});
        expect(res.statusCode).toBe(200);
        const oracle = JSON.parse(fs.readFileSync(`./test_data/api/favorites/${username}.json`, "utf8"));
        expect(res.body).toStrictEqual(oracle);
      });
    }); // /list
  }); // /api/favorites


  describe("/api/statuses", () => {
    beforeAll(async () => {
      const res = await agent.post("/api/login").send({
        username: "kevinaangstadt",
        password: "password"
      });
    });

    test("/api/statuses/home_timeline.json", async () => {
      const res = await agent.get("/api/statuses/home_timeline.json");
      expect(res.statusCode).toBe(200);
      const oracle = JSON.parse(fs.readFileSync("./test_data/api/statuses/home_timeline.json", "utf8"));
      expect(res.body).toStrictEqual(oracle);
    });

    test("/api/status/activity.json", async () => {
      const res = await agent.get("/api/statuses/activity.json");
      expect(res.statusCode).toBe(200);
      const oracle = JSON.parse(fs.readFileSync("./test_data/api/statuses/activity.json", "utf8"));
      expect(res.body).toStrictEqual(oracle);
    });

    describe("/replies", () => {
      test.each(statuses)("/api/statuses/replies/%s.json", async (id) => {
        const res = await agent.get(`/api/statuses/replies/${id}.json`);
        expect(res.statusCode).toBe(200);
        const oracle = JSON.parse(fs.readFileSync(`./test_data/api/statuses/replies/${id}.json`, "utf8"));
        expect(res.body).toStrictEqual(oracle);
      });
    }); // /replies

    describe("/show", () => {
      test.each(statuses)("/api/statuses/show/%s.json", async (id) => {
        const res = await agent.get(`/api/statuses/show/${id}.json`);
        expect(res.statusCode).toBe(200);
        const oracle = JSON.parse(fs.readFileSync(`./test_data/api/statuses/show/${id}.json`, "utf8"));
        expect(res.body).toStrictEqual(oracle);
      });
    }); // /show

    describe("/user_timeline", () => {
      test("no screen_name should match the authenticated user", async () => {
        const res = await agent.get(`/api/statuses/user_timeline.json`);
        expect(res.statusCode).toBe(200);
        const oracle = JSON.parse(fs.readFileSync(`./test_data/api/statuses/user_timeline/kevinaangstadt.json`, "utf8"));
        expect(res.body).toStrictEqual(oracle);
      });
      test.each(users)("%s", async (username) => {
        const res = await agent.get(`/api/statuses/user_timeline.json`)
          .query({screen_name: username});
        expect(res.statusCode).toBe(200);
        const oracle = JSON.parse(fs.readFileSync(`./test_data/api/statuses/user_timeline/${username}.json`, "utf8"));
        expect(res.body).toStrictEqual(oracle);
      });
    }); // /user_timeline
    
  }); // /api/statuses

  describe("/api/user", () => {
    beforeAll(async () => {
      const res = await agent.post("/api/login").send({
        username: "kevinaangstadt",
        password: "password"
      });
    });

    describe("/get", () => {
      test("no screen_name should match the authenticated user", async () => {
        const res = await agent.get(`/api/user/get.json`);
        expect(res.statusCode).toBe(200);
        const oracle = JSON.parse(fs.readFileSync(`./test_data/api/user/get/kevinaangstadt.json`, "utf8"));
        expect(res.body).toStrictEqual(oracle);
      });
      test.each(users)("%s", async (username) => {
        const res = await agent.get(`/api/user/get.json`)
          .query({screen_name: username});
        expect(res.statusCode).toBe(200);
        const oracle = JSON.parse(fs.readFileSync(`./test_data/api/user/get/${username}.json`, "utf8"));
        expect(res.body).toStrictEqual(oracle);
      });

    }); // /get
    
  }); // /api/user

}); // requests that require authentication