const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const fs = require("fs");
const path = require("path");
const { allowAdmin } = require("../middlewares/authMiddleware");

router.post("/addMember/:id?",allowAdmin, async (req, res) => {
  try {
    const { familyID, memberData } = req.body;

    let family;
    if(req.params.id){
      family = await Member.findById(req.params.id);
      if (!family) {
        return res.status(404).json({ message: "Family not found." });
      }
      family.members.push(memberData);
      await family.save();
    }
    else{
       family = new Member({
        familyID,
        members: [memberData]
      });
      await family.save();
    }

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

        const baseUrl = req.protocol + '://' + req.get('host');
        filteredFamilies.forEach(family => {
            family.members.forEach(member => {
                if (member.profilePic) {
                    member.profilePic = `${baseUrl}${member.profilePic}`;
                }
            });
        });

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

router.patch("/update/:id/:memberId",allowAdmin, async (req, res) => {
  try {
    const { memberData } = req.body;

    const family = await Member.findById(req.params.id);
    if (!family) {
      throw new Error("Family not found");
    }

    const memberToUpdate = family.members.find(member => member._id.toString() == req.params.memberId);
    if (!memberToUpdate) {
      throw new Error("Member not found in the family");
    }

    const oldProfilePic = memberToUpdate.profilePic;

    if (memberData.profilePic) {
      const baseUrl = req.protocol + '://' + req.get('host');
      memberData.profilePic = memberData.profilePic.replace(baseUrl, '');
    }

    family.members = family.members.map(member => {
      if (member._id.toString() === req.params.memberId) {
        return { ...member.toObject(), ...memberData };
      }
      return member;
    });
    await family.save();

    if (oldProfilePic && memberData.profilePic !== oldProfilePic) {
      const oldImagePath = path.join(__dirname, '..', oldProfilePic);
      fs.unlink(oldImagePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Failed to delete old image:', err.message);
        }
      });
    }

    const baseUrl = req.protocol + '://' + req.get('host');
    family.members = family.members.map(member => {
      if (member.profilePic) {
        member.profilePic = `${baseUrl}${member.profilePic}`;
      }
      return member;
    });

    res.status(200).json({ status: true, message: "Member updated successfully", family});
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.delete("/delete/:id/:memberId?",allowAdmin, async (req, res) => {
  try {
    const { id, memberId } = req.params;

    if (id && memberId) {
      const family = await Member.findById(id);
      if (!family) {
        throw new Error("Family not found");
      }

      const memberIndex = family.members.findIndex(member => member._id.toString() == memberId);
      if (memberIndex === -1) {
        throw new Error("Member not found in the family");
      }

      const deletedMember = family.members.splice(memberIndex, 1)[0];
      await family.save();

      if (deletedMember.profilePic) {
        const oldImagePath = path.join(__dirname, '..', deletedMember.profilePic);
        fs.unlink(oldImagePath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete old image:', err.message);
          }
        });
      }

      res.status(200).json({ status: true, message: "Member deleted successfully", deletedMember });
    } else if (id && !memberId) {
      const deletedFamily = await Member.findByIdAndDelete(id);
      if (!deletedFamily) {
        throw new Error("Family not found");
      }
      deletedFamily.members.forEach(member => {
        if (member.profilePic) {
          const oldImagePath = path.join(__dirname, '..', member.profilePic);
          fs.unlink(oldImagePath, (err) => {
            if (err && err.code !== 'ENOENT') {
              console.error('Failed to delete old image:', err.message);
            }
          });
        }
      });

      res.status(200).json({ status: true, message: "Family deleted successfully", deletedFamily });
    } else {
      throw new Error("Invalid request parameters");
    }
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;