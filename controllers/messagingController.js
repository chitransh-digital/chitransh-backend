const express = require("express");
const router = express.Router();
const { getMessaging } = require("firebase-admin/messaging");
const NotificationLogs = require("../models/NotificationLog");

router.post("/send", async function (req, res) {
  const itemId = req.body.itemId;
  if (itemId) {
    const checkLastNotification = await checkLastUpdate(itemId);
    if (!checkLastNotification.shouldSend) {
      res.status(200).json({ cooldown: checkLastNotification.cooldown });
      return;
    }
  }

  const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
    topic: "notify",
  };
  getMessaging()
    .send(message)
    .then(async (response) => {
      // Save the notification log
      if (itemId) {
        await updateLog(itemId);
      }

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

router.post("/send-image", async function (req, res) {
  const itemId = req.body.itemId;
  const checkLastNotification = await checkLastUpdate(itemId);
  if (!checkLastNotification.shouldSend) {
    res.status(200).json({ cooldown: checkLastNotification.cooldown });
    return;
  }

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
    .then(async (response) => {
      // Save the notification log
      await updateLog(itemId);

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

async function checkLastUpdate(itemId) {
  try {
    const document = await NotificationLogs.findOne({ itemId });
    if (!document) {
      return {
        cooldown: 0,
        shouldSend: true,
      };
    }
    const lastUpdateTime = document.updatedAt;
    const currentTime = new Date();
    const timeDifference = currentTime - lastUpdateTime;
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    if (hoursDifference < 24) {
      return {
        cooldown: 24 - hoursDifference,
        shouldSend: false,
      };
    } else {
      return {
        cooldown: 0,
        shouldSend: true,
      };
    }
  } catch (error) {
    console.error("Error checking last update:", error);
    return {
      cooldown: 0,
      shouldSend: true,
    };
  }
}

async function updateLog(itemId) {
  let document = await NotificationLogs.findOne({ itemId });
  if (document) {
    document.updatedAt = new Date();
    await document.save();
  } else {
    document = new NotificationLogs({
      itemId,
      updatedAt: new Date(),
    });
    await document.save();
  }
}

module.exports = router;
