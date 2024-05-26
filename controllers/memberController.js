const express = require("express");
const router = express.Router();
const Member = require("../models/Member");

router.post("/addMember", async (req, res) => {
  try {
    const { familyID, memberData } = req.body;

    let family = await Member.findOne({ familyID });
    if (family && memberData.relation !== "head") {
      family.members.push(memberData);
    }
    else if (family && memberData.relation === "head") {
      return res.status(400).json({ message: "Family already exists." });
    }
    else {
    family = new Member({
      familyID,
      members: [memberData]
    });
    }
    await family.save();

    res.status(201).json({ family, message: "Family member created successfully!" });
  } catch (error) {
    console.error("Error adding family:", error.message);
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

router.patch("/update/:familyID", async (req, res) => {
  try {
    const { name, memberData } = req.body;

    const family = await Member.findOneAndUpdate(
      { familyID: req.params.familyID, "members.name": name },
      {
        $set: {
          "members.$": memberData
        }
      },
      { new: true, runValidators: true }
    );

    if (!family) {
      throw new Error("Couldn't update family member");
    }

    res.status(200).json({ status: true, message: "Member updated successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.delete("/delete/:familyID/:name", async (req, res) => {
  try {
    const { familyID, name } = req.params;

    const family = await Member.findOneAndUpdate(
      { familyID: familyID },
      {
        $pull: { members: { name: name } }
      },
      { new: true }
    );

    if (!family) {
      throw new Error("Couldn't delete family member");
    }

    res.status(200).json({ status: true, message: "Member deleted successfully" });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;