const express = require("express");
const app = express();
const authRoute = require("./routes/auth");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
  },
  () => console.log("connected to db")
);

app.use(express.json());

app.use("/api/user", authRoute);

app.listen(5000, () => console.log("Server started"));
