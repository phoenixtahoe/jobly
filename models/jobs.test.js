"use strict";

const db = require("../db.js");
const Job = require("./jobs");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


async function getID () {
    const theJob = await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('test-job', 100000, '0', 'c1')
    RETURNING id`);

    return theJob.rows[0].id
}

describe('create', function () {
    
    const newJob = {
        title: "test-job",
        salary: '100000',
        equity: '0',
        company_handle: "c1",
    };

    test('works', async function () {
        let job = await Job.create(newJob);
        expect(job.id).toBeDefined()
    })
})



describe('update', function () {

    const jobEdit = {
        title: "best-job",
        salary: '100000',
        equity: '0',
    }

    test('works', async function () {
        let id = await getID()
        let result = await Job.update(id, jobEdit)
        expect(result).toHaveProperty('id', id);
    })

})

describe('get', function () {
    test('works', async function () {
        let id = await getID()
        let result = await Job.get(id)
        expect(result).toHaveProperty('id', id)
        expect(result).toHaveProperty('title')
    })
})

describe('getAll', function () {
    test('no filter', async function () {
        let result = await Job.getAll()
        expect(result).toHaveLength(4)
    })
    test ('minSalary', async function () {
        let result = await Job.getAll({ minSalary: 1000})
        expect(result).toHaveLength(1)
        expect(result[0]).toHaveProperty('salary', 1000)
    })
    test ('hasEquity', async function () {
        let result = await Job.getAll({ hasEquity: true })
        expect(result).toHaveLength(1)
        expect(result[0]).toHaveProperty('equity', '0.1')
    })
})

describe('remove', function () {
    test('works', async function () {
        let id = await getID()
        let result = await Job.remove(id)
        expect(result).toEqual({ title: 'test-job', company_handle: 'c1' })
        try {
            await Job.get(id)
        } catch (err) {
            expect(err.message).toEqual(`No job: ${id}`)
        }
    })
})