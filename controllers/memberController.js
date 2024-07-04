const express = require("express");
const router = express.Router();
const Member = require("../models/Member");
const fs = require("fs");
const path = require("path");
const {uploadImage} = require('../middlewares/multerMiddleware');
const { allowAuth } = require("../middlewares/authMiddleware");
const { captFirstLetter } = require("../middlewares/capitalizationMiddleware");

router.post('/addMember/:id', allowAuth, captFirstLetter,async (req, res) => {
  try {
    const { memberData } = req.body;

    let family = await Member.findById(req.params.id);
    if (!family) {
      return res.status(404).json({ message: "Family not found." });
    }

    family.members.push(memberData);
    await family.save();

    res.status(201).json({ family, message: "Family member added successfully!" });
  } catch (error) {
    console.error("Error adding family member:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post('/createFamily',uploadImage, captFirstLetter, async (req, res) => {
  try {
    const { familyID, memberData } = req.body;
    const memberDataParsed = JSON.parse(memberData);

    if (req.file) {
      memberDataParsed.profilePic = `/uploads/${req.file.filename}`;
    }

    const family = new Member({
      familyID,
      members: [memberDataParsed],
    });
    await family.save();

    res.status(201).json({ family, message: "Family created successfully!" });
  } catch (error) {
    console.error("Error creating family:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/viewFamilies", allowAuth, async (req, res) => {
  try {
      const { limit, page, sort, contact } = req.query;
      const filter = { ...req.query };
      ["limit", "sort", "page"].forEach(el => delete filter[el]);

      let filterStr = JSON.stringify(filter);
      
      const sortBy = sort ? sort.split(",").join(" ") : "_id";
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;
      const skip = (pageNum - 1) * limitNum;
      let total = 0
      if(filterStr && filterStr.includes("contact")){
        total = await Member.find({ "members.0.contact": contact }).countDocuments();
      }
      else{
        total = await Member.countDocuments(JSON.parse(filterStr));
      }
      const totalPages = Math.ceil(total / limitNum);
      if (skip >= total) {
          return res.status(400).json({ message: "Page does not exist!" });
      }
      
      let families = []
      if(filterStr && filterStr.includes("contact")){
        families = await Member.find({ "members.0.contact": contact })
                                .sort(sortBy)
                                .skip(skip)
                                .limit(limitNum);
      }
      else{
        families = await Member.find(JSON.parse(filterStr))
                                .sort(sortBy)
                                .skip(skip)
                                .limit(limitNum);
      }

      const baseUrl = req.protocol + '://' + req.get('host');
      families.forEach(family => {
          family.members.forEach(member => {
              if (member.profilePic) {
                  member.profilePic = `${baseUrl}${member.profilePic}`;
              }
          });
      });

      res.status(200).json({
          families: families,
          count: families.length,
          totalPages: totalPages,
          status: true,
          message: "Families fetched successfully!"
      });
  } catch (error) {
      console.error("Error viewing families:", error.message);
      res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/update/:id/:memberId",allowAuth,  captFirstLetter,async (req, res) => {
  try {
    const { memberData } = req.body;

    const family = await Member.findById(req.params.id);
    if (!family) {
      res.status(404).json({ status: false, message: "Family not found" });
    }

    const memberToUpdate = family.members.find(member => member._id.toString() == req.params.memberId);
    if (!memberToUpdate) {
      res.status(404).json({ status: false, message: "Member not found" });
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

router.delete("/delete/:id/:memberId?",allowAuth,  async (req, res) => {
  try {
    const { id, memberId } = req.params;

    if (id && memberId) {
      const family = await Member.findById(id);
      if (!family) {
        res.status(404).json({ status: false, message: "Family not found" });
      }

      const memberIndex = family.members.findIndex(member => member._id.toString() == memberId);
      if (memberIndex === -1) {
        res.status(404).json({ status: false, message: "Member not found in the family" });
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
        res.status(404).json({ status: false, message: "Family not found" });
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
      res.status(400).json({ status: false, message: "Invalid request" });
    }
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

module.exports = router;