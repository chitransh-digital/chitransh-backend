const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

router.post("/addMember", async (req, res) => {
  try {
    const { familyID, memberData } = req.body;

    let family = await Member.findOne({ familyID });

    if (!family) {
      family = new Member({ familyID, members: [memberData] });
    } else {
      family.members.push(memberData);
    }

    await family.save();

    res.status(201).json(family);
  } catch (error) {
    console.error("Error adding member:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/viewFamilies", async (req, res) => {
    try {
        const { city, state, familyID } = req.query;
        let query = {};
  
        if (city) {
            query["members.city"] = city;
        }
  
        if (state) {
            query["members.state"] = state;
        }
  
        if (familyID) {
            query.familyID = familyID;
        }

        const excludeFields = ["limit", "sort", "page"];
        excludeFields.forEach(el => delete req.query[el]);

        // Sorting
        const sortBy = req.query.sort ? req.query.sort.split(",").join(" ") : "createdAt"; 

        // Pagination settings
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const total = await Member.countDocuments(query);
        if (skip >= total) {
            return res.status(400).json({ message: "Page does not exist!" });
        }

        let families = await Member.find(query)
                                   .sort(sortBy)
                                   .skip(skip)
                                   .limit(limit);

        if (!families || families.length === 0) {
            return res.status(404).json({ message: "No families found." });
        }

        const filteredFamilies = city || state ? families.filter(family => {
            const head = family.members.find(member => member.relation.toLowerCase() === "head");
            return head && head.city.toLowerCase() === city.toLowerCase() && head.state.toLowerCase() === state.toLowerCase();
        }) : families;

        res.status(200).json({
            families: filteredFamilies,
            count: filteredFamilies.length,
            status: true,
            message: "Families fetched successfully!"
        });
    } catch (error) {
        console.error("Error viewing families:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;