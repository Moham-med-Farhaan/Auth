const express = require("express");
const router = express.Router();
const User = require("../model/User");
const joi = require("joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//validation for registration

const schema = joi.object({
  name: joi.string().min(5).max(255).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).max(1024).required(),
});

//validation for login

const schemalogin = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).max(1024).required(),
});

router.post("/register", async (req, res) => {
  //validation....
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
  });

  //if error exists...

  if (error) {
    return res.status(400).send(error.message);
  }

  //check if user email already exists...
  const emailcheck = await User.findOne({ email: req.body.email });

  if (emailcheck) {
    return res.status(400).send({
      message: "email already exists...",
    });
  }

  // hashing password...

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //creating a user and saving into DB

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/login", async (req, res) => {
  //validation
  const { error, value } = schemalogin.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).send(error.message);
  }

  //check if user email does not exists...
  const wholeUser = await User.findOne({ email: req.body.email });

  if (!wholeUser) {
    return res.status(400).send({
      message: "email does not exists...",
    });
  }

  //password validation...

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    wholeUser.password
  );

  if (!isPasswordValid) {
    return res.status(400).send({ message: "password is wrong" });
  }

  //if everything is right... adding jwt...
  const token = jwt.sign({ _id: wholeUser._id }, process.env.TOKEN_SECRET);
  res.header("authenti-token", token);
  res.send(`logged In!`);
});

module.exports = router;
