"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");


const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


async function ids () {
    const theJob = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('test-job', 100000, '0', 'c1')
    RETURNING id`);

    return theJob.rows[0].id
}

describe('POST /', function () {
    const newJob = {
        title: "test4",
        salary: 1000,
        equity: "0.1",
        company_handle: "c1"
    }
    test('works', async function () {
        const res = await request(app)
        .post('/jobs')
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(201)
        expect(res.body).toEqual({
            job: {
                id: expect.any(Number),
                ...newJob
            }
        })
    })
})

describe('GET /', function () {
    test('works', async function () {
        const res = await request(app)
        .get('/jobs')
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('jobs')
        expect(res.body.jobs).toHaveLength(4)
    })
})

describe('GET /:id', function () {
    test('works', async function () {
        const id = await ids()
        const res = await request(app)
        .get(`/jobs/${id}`)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body.job).toHaveProperty('id', id)
    })
})

describe('PATCH /:id', function () {
    const editJob = {
        title: "best-job",
        salary: 1000,
        equity: '0',
    }
    test('works', async function () {
        const id = await ids()
        const res = await request(app)
        .patch(`/jobs/${id}`)
        .send(editJob)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body.job).toHaveProperty('title', editJob.title)
    })
})

describe('DELETE /:id', function () {
    test('works', async function () {
        const id = await ids()
        const res = await request(app)
        .delete(`/jobs/${id}`)
        .set("authorization", `Bearer ${u1Token}`)
        expect(res.statusCode).toEqual(200)
        try {
            await request(app).get(`/jobs/${id}`)
        } catch (err) {
            expect(err.message).toEqual(`No job: ${id}`)
        }
    })
})