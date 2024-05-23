const express = require("express");
const router = express.Router();
const Karyakarni = require("../models/Karyakarni");
const { allowAdmin } = require("../middlewares/authMiddleware");

router.post("/registerKaryakarni", allowAdmin, async (req, res) => {
    try {
        const karyakarni = new Karyakarni(req.body);
        const karyakarniJob = await karyakarni.save();
        if (!karyakarniJob) {
        throw new Error("Couldn't add karyakarni");
        }
        res.status(200).json({ status: true, message: "Karyakarni added successfully" });
    } catch (err) {
        res.status(400).json({ status: false, message: err.message });
    }
});

router.get("/getKaryakarnis", async (req, res) => {
    try {
        const {city, state, name} = req.query;
        let query = {};

        if (city) {
            query.city = city;
        }

        if (state) {
            query.state = state;
        }

        if (name) {
            query.name = name;
        }

        const excludeFields = ["limit", "sort", "page"];
        excludeFields.foreach(el => delete req.query[el]);

        // Sorting
        const sortBy = req.query.sort
        ? req.query.sort.split(",").join(" ")
        : "name";

        // Pagination settings
        const page = parseInt(rew.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const total  = await Karyakarni.countDocuments(query);
        if (skip >= total) {
            return res.status(400).json({ message: "page does not exist!"})
        }

        let karyakarnis = await Karyakarni.find(JSON.parse(filterStr))
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

        const karyakarniList = karyakarnis;

        res.status(200).json({
            karyakarni: karyakarniList,
            count: karyakarniList.length,
            status: true,
            message: "Karyakarnis fetched successfully!"
        });

    }catch (error) {
        console.error("Error fetching karyakarnis:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}) ;

module.exports = router;