const express = require("express");
const router = express.Router();
const Karyakarni = require("../models/Karyakarni");
const { allowAdmin, allowAuth } = require("../middlewares/authMiddleware");
const fs = require("fs");
const path = require("path");
const { captFirstLetter } = require("../middlewares/capitalizationMiddleware");

router.post("/registerKaryakarni",allowAdmin,  captFirstLetter,async (req, res) => {
    try {
        const karyakarni = new Karyakarni(req.body);
        const newKaryakarni = await karyakarni.save();
        if (!newKaryakarni) {
          res.status(400).json({ status: false, message: "Failed to add Karyakarni" });
        }
        res.status(200).json({ status: true, message: "Karyakarni added successfully" });
    } catch (err) {
        res.status(400).json({ status: false, message: err.message });
    }
});

router.post("/addMember/:id",allowAdmin,  captFirstLetter,async (req, res) => {
  try {
    const { memberData } = req.body;

    let karyakarni = await Karyakarni.findById(req.params.id);
    if(!karyakarni){
      res.status(404).json({ message: "Karyakarni not found." });
    }
    karyakarni.members.push(memberData);
    const newMember = await karyakarni.save();

    res.status(200).json({ newMember, message: "Karyakarni member added successfully!" });
  } catch (error) {
    console.error("Error adding karyakarni member:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getKaryakarnis",allowAuth,  async (req, res) => {
    try {
      const { limit, page, sort } = req.query;

      const filter = { ...req.query };
      ["limit", "sort", "page"].forEach(el => delete filter[el]);

      let filterStr = JSON.stringify(filter);
      
      const sortBy = sort ? sort.split(",").join(" ") : "_id";
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;
      const skip = (pageNum - 1) * limitNum;

        const total  = await Karyakarni.countDocuments();
        const totalPages = Math.ceil(total / limitNum);
        if (skip >= total) {
            return res.status(400).json({ message: "Page does not exist!"})
        }

        let karyakarnis = await Karyakarni.find(JSON.parse(filterStr))
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum);

        const baseUrl = req.protocol + '://' + req.get('host');
        const karyakarniList = karyakarnis.map(karyakarni => {
          if (karyakarni.logo) {
            karyakarni.logo = `${baseUrl}${karyakarni.logo}`;
          }
          if (karyakarni.members && karyakarni.members.length > 0) {
            karyakarni.members = karyakarni.members.map(member => {
              if (member.profilePic) {
                member.profilePic = `${baseUrl}${member.profilePic}`;
              }
              return member;
            });
          }
          return karyakarni;
        });

        res.status(200).json({
            karyakarni: karyakarniList,
            count: karyakarniList.length,
            totalPages: totalPages,
            status: true,
            message: "Karyakarnis fetched successfully!"
        });

    }catch (error) {
        console.error("Error fetching karyakarnis:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
}) ;

router.patch("/update/:id",  allowAdmin, captFirstLetter,async (req, res) => {
  try {
    const karyakarni = await Karyakarni.findById(req.params.id);
    if (!karyakarni) {
      res.status(404).json({ status: false, message: "Karyakarni not found" });
    }
    if (req.body.logo) {
      const baseUrl = req.protocol + '://' + req.get('host');
      req.body.logo = req.body.logo.replace(baseUrl, '');
  }
    if(req.body.members && req.body.members.length > 0){
      req.body.members.forEach(member => {
        if (member.profilePic) {
          const baseUrl = req.protocol + '://' + req.get('host');
          member.profilePic = member.profilePic.replace(baseUrl, '');
        }
      });
    }
    if (req.body.logo) {
      if (karyakarni.logo && karyakarni.logo !== req.body.logo) {
        const oldLogoPath = path.join(__dirname, '..', karyakarni.logo);
        fs.unlink(oldLogoPath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete old logo:', err.message);
          }
        });
      }
    }

    const updatedKaryakarni = await Karyakarni.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedKaryakarni) {
      res.status(400).json({ status: false, message: "Failed to update karyakarni" });
    }
    const baseUrl = req.protocol + '://' + req.get('host');
    updatedKaryakarni.logo = `${baseUrl}${updatedKaryakarni.logo}`;
    res.status(200).json({ status: true, message: "Karyakarni updated successfully", karyakarni: updatedKaryakarni });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

router.patch("/update/:id/:memberId", allowAdmin,  captFirstLetter,async (req, res) => {
  try {
    const karyakarni = await Karyakarni.findById(req.params.id);
    if (!karyakarni) {
      res.status(404).json({ status: false, message: "Karyakarni not found" });
    }
    const { newData } = req.body;
    const karyakarniMember = karyakarni.members.find(member => member._id.toString() == req.params.memberId);
    if (!karyakarniMember) {
      res.status(404).json({ status: false, message: "Member not found in the karyakarni" });
    }
    if (newData.profilePic) {
      const baseUrl = req.protocol + '://' + req.get('host');
      newData.profilePic = newData.profilePic.replace(baseUrl, '');
  }
    if (req.body.profilePic) {
      if (karyakarniMember.profilePic && karyakarniMember.profilePic !== req.body.profilePic) {
        const oldPicPath = path.join(__dirname, '..', karyakarniMember.profilePic);
        fs.unlink(oldPicPath, (err) => {
          if (err && err.code !== 'ENOENT') {
            console.error('Failed to delete old logo:', err.message);
          }
        });
      }
    }

    karyakarni.members = karyakarni.members.map(member => {
      if (member._id.toString() === req.params.memberId) {
        return { ...member.toObject(), ...newData };
      }
      return member;
    });
    await karyakarni.save();

    const baseUrl = req.protocol + '://' + req.get('host');
    karyakarni.members = karyakarni.members.map(member => {
      if (member.profilePic) {
        member.profilePic = `${baseUrl}${member.profilePic}`;
      }
      return member;
    });
    res.status(200).json({ status: true, message: "Karyakarni updated successfully", karyakarni: karyakarni });
  } catch (err) {
    res.status(400).json({ status: false, message: err.message });
  }
});

  router.delete("/delete/:id/:memberId?",allowAdmin,  async (req, res) => {
    try {
      const { id, memberId } = req.params;
  
      if (id && memberId) {
        const karyakarni = await Karyakarni.findById(id);
        if (!karyakarni) {
          res.status(404).json({ status: false, message: "Karyakarni not found" });
        }
  
        const memberIndex = karyakarni.members.findIndex(member => member._id.toString() == memberId);
        if (memberIndex === -1) {
          res.status(404).json({ status: false, message: "Member not found in the karyakarni" });
        }
  
        const deletedMember = karyakarni.members.splice(memberIndex, 1)[0];
        await karyakarni.save();
  
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
        const deletedKaryakarni = await Karyakarni.findByIdAndDelete(id);
        if (!deletedKaryakarni) {
          res.status(404).json({ status: false, message: "Karyakarni not found" });
        }
        deletedKaryakarni && deletedKaryakarni.members.forEach(member => {
          if (member.profilePic) {
            const oldImagePath = path.join(__dirname, '..', member.profilePic);
            fs.unlink(oldImagePath, (err) => {
              if (err && err.code !== 'ENOENT') {
                console.error('Failed to delete old image:', err.message);
              }
            });
          }
        });
  
        res.status(200).json({ status: true, message: "Karyakarni deleted successfully", deletedFamily });
      } else {
        res.status(400).json({ status: false, message: "Invalid request" });
      }
    } catch (err) {
      res.status(400).json({ status: false, message: err.message });
    }
  });


module.exports = router;