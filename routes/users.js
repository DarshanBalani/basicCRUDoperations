const express = require("express");
const router = express.Router();
const User = require("../models/users");
const crypto = require("crypto");

router.post("/signUp", async (req, res, next) => {
  try {
    const { name, password } = req.body;

    let salt = crypto.randomBytes(16).toString("hex");

    const hashedPassword = crypto
      .createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (name) {
      res.status(404).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      salt: salt,
      password: hashedPassword,
    });

    res.status(201).json({ user });
  } catch (error) {
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({ name });

    if (!user) {
      return res.status(404).json({ Message: "User not found" });
    }

    const hashedPassword = user.password;

    const userProvidedHash = crypto
      .createHmac("sha256", user.salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== userProvidedHash) {
      return res.status(404).json({ Message: "Incorrect password" });
    }
    return res.status(201).json({ Message: "Login Successfull" });
  } catch (error) {
    console.log(error);
  }
});

router.put("/update/:name", async (req, res) => {
  try {
    const { name, password } = req.body;
    const UrlName = req.params.name;

    if (!name && !password) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const updateData = {};

    if (name) {
      updateData.name = name;
    }
    if (password) {
      const salt = crypto.randomBytes(16).toString("hex");
      const hashedPassword = crypto
        .createHmac("sha256", salt)
        .update(password)
        .digest("hex");

      updateData.salt = salt;
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findOneAndUpdate(
      { name: UrlName },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({ updatedUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server side error" });
  }
});

router.delete("/delete/:name", async (req, res) => {
  try {
    const name = req.params.name;
    await User.findOneAndDelete({ name: name });

    if (!name) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server side error" });
  }
});

module.exports = router;
