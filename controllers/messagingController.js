const express = require("express");
const router = express.Router();
const { getMessaging } = require("firebase-admin/messaging");

router.post("/send", function (req, res) {
  const message = {
    notification: req.body,
    topic: "notify",
  };
  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).json({
        message: "successfully sent notification",
        response: response,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "couldn't send notification",
        error: error,
      });
    });
});

router.post("/send-image", function (req, res) {
  const message = {
    notification: {
      title: req.body.title,
    },
    android: {
      notification: {
        imageUrl: req.body.image,
      },
    },
    apns: {
      payload: {
        aps: {
          "mutable-content": 1,
        },
      },
      fcm_options: {
        image: req.body.image,
      },
    },
    webpush: {
      headers: {
        image: req.body.image,
      },
    },
    topic: "notify",
  };
  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).json({
        message: "successfully sent notification",
        response: response,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: "couldn't send notification",
        error: error,
      });
    });
});

module.exports = router;
