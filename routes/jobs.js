"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {ensureAdmin, ensureLoggedIn } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Jobs = require("../models/jobs");
const jobsUpdate = require("../schemas/jobsUpdate.json");
const jobsNew = require("../schemas/jobsNew.json")
const router = express.Router({ mergeParams: true });

router.get('/', ensureLoggedIn, async function (req, res, next) {
    try {
        const results = await Jobs.getAll(req.query)
        return res.json({jobs: results})
    } catch (err) {
        return next(err)
    }
})

router.get('/:id', ensureLoggedIn, async function (req, res, next) {
    try {
        const id = req.params.id
        const results = await Jobs.get(id)
        return res.json({job: results})
    } catch (err) {
        return next(err)
    }
})

router.post('/', ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobsNew);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
    
        const result = await Jobs.create(req.body);
        return res.status(201).json({ job: result });
    } catch (err) {
        return next(err);
    }
})

router.patch('/:id', ensureAdmin, async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, jobsUpdate)
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack)
            throw new BadRequestError(errs)
        }
        const job = await Jobs.update(req.params.id, req.body)
        return res.json({job})
    } catch(err) {
        return next(err)
    }
})

router.delete('/:id', ensureAdmin, async function (req, res, next) {
    try {
        const job = await Jobs.remove(req.params.id)
        return res.json({job})
    } catch(err) {
        return next(err)
    }
})

module.exports = router