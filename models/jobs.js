"use strict"

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Jobs {
    static async create({title, salary, equity, company_handle}) {
        const duplicateCheck = await db.query(
            `SELECT title, company_handle
             FROM jobs
             WHERE title = $1 AND company_handle = $2`,
        [title, company_handle]);

        if (duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate job: ${title}, ${company_handle}`);
        }

        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, salary, equity, company_handle`,
        [title, salary, equity, company_handle]);

        return result.rows[0]
    }

    static async get(id) {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE id = $1`, 
        [id]);

        if (!result.rows[0]) throw new NotFoundError(`No job: ${id}`);
        
        return result.rows[0]
    }

    static async getAll({ minSalary, hasEquity, title } = {}) {
        let queryFilter = [];
        let queryValues = [];
        let query = `SELECT j.id, j.title, j.salary, j.equity, j.company_handle , c.name
                     FROM jobs j 
                     LEFT JOIN companies AS c ON c.handle = j.company_handle`

        if (minSalary !== undefined) {
            queryValues.push(minSalary);
            queryFilter.push(`salary >= $${queryValues.length}`);
        } else if (hasEquity === true) {
            queryFilter.push(`equity > 0`);
        } else if (title !== undefined) {
            queryValues.push(`%${title}%`);
            queryFilter.push(`title ILIKE $${queryValues.length}`);
        }
        
        if (queryFilter.length > 0) {
            query += " WHERE " + queryFilter.join(" AND ");
        }

        query += " ORDER BY salary"
        const jobs = await db.query(query, queryValues);
        return jobs.rows;
    }

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});

        const idVarIdx = "$" + (values.length + 1);
    
        const querySql = `UPDATE jobs 
                          SET ${setCols} 
                          WHERE id = ${idVarIdx} 
                          RETURNING id, title, salary, equity, company_handle`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];
    
        if (!job) throw new NotFoundError(`No job: ${id}`);
    
        return job;
    }

    static async remove(id) {
        const result = await db.query(
              `DELETE
               FROM jobs
               WHERE id = $1
               RETURNING title, company_handle`,
        [id]);
    
        if (!result.rows[0]) throw new NotFoundError(`No job: ${handle}`);

        return result.rows[0]
    }
}

module.exports = Jobs