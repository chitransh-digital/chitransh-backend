const express = require("express");
const router = express.Router();
const Karyakarni = require("../models/Karyakarni");
const { allowAdmin } = require("../middlewares/authMiddleware");
const fs = require("fs");
const path = require("path");

router.post("/registerKaryakarni", async (req, res) => {
    try {
        const karyakarni = new Karyakarni(req.body);
        const newKaryakarni = await karyakarni.save();
        if (!newKaryakarni) {
        throw new Error("Couldn't add karyakarni");
        }
        res.status(200).json({ status: true, message: "Karyakarni added successfully" });
    } catch (err) {
        res.status(400).json({ status: false, message: err.message });
    }
});

router.get("/getKaryakarnis", async (req, res) => {
    try {
        const { city, state, name } = req.query;
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
        excludeFields.forEach(el => delete req.query[el]);

        // Sorting
        const sortBy = req.query.sort
        ? req.query.sort.split(",").join(" ")
        : "name";

        // Pagination settings
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const total  = await Karyakarni.countDocuments(query);
        if (skip >= total) {
            return res.status(400).json({ message: "page does not exist!"})
        }

        let karyakarnis = await Karyakarni.find(query)
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

router.patch("/update/:id", async (req, res) => {
    try {
      const karyakarni = await Karyakarni.findByIdAndUpdate(req.params.id, req.body);
      if (!karyakarni) {
        throw new Error("Couldn't update karyakarni");
      }
      res.status(200).json({ status: true, message: "Karyakarni updated successfully" });
    } catch (err) {
      res.status(400).json({ status: false, message: err.message });
    }
  });

  router.delete("/delete/:id", async (req, res) => {
    try {
      const karyakarni = await Karyakarni.findById(req.params.id);
      if (!karyakarni) {
        throw new Error("Couldn't find karyakarni");
      }
      try {
        const karyakarniLogo = karyakarni.logo;
        const filePath = path.join(__dirname, karyakarniLogo);
        if(karyakarniLogo !== "" && fs.existsSync(filePath)){
          fs.unlink(filePath, (err) => {
            if (err) {
              if (err.code === 'ENOENT') {
                return res.status(404).json({ message: 'File not found' });
              }
              return res.status(500).json({ message: 'Failed to delete file' });
            }
        
            console.log('File deleted successfully');
          });
        }
      } catch (error) {
        console.error("Error deleting logo:", error.message)
      }
      await Karyakarni.findByIdAndDelete(req.params.id);
      res.status(200).json({ status: true, message: "Karyakarni deleted successfully" });
    } catch (err) {
      res.status(400).json({ status: false, message: err.message });
    }
  });


module.exports = router;