import express, { request, response } from "express";
import fileUpload from "express-fileupload";
import bcrypt from "bcryptjs";
import { User } from "../models";
import { File } from "../models";
import { requireAuth } from "../middleware";
const path = require("path");
const multer = require("multer");
require("../models");

const mongoose = require("mongoose");

const router = express.Router();

router.get("/", async (req, res, next) => {
  const files = await File.find({});
  res.send(files);
});

router.post("/", async (request, response) => {
  let userUpload;
  let uploadPath;

  if (!request.files || Object.keys(request.files).length === 0) {
    return response.status(400).send("No files were uploaded.");
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  userUpload = request.files.userUpload;

  const userUploadName = userUpload.name.replace(/[^a-zA-Z0-9]/g, "-");
  uploadPath =
    path.join(__dirname, "../../../packages/client/public/") + userUploadName;

  // Use the mv() method to place the file somewhere on your server

  userUpload.mv(uploadPath, function (err) {
    if (err) return request.status(500).send(err);
    response.send({ name: `/${userUploadName}`, path: `/${uploadPath}` });
  });
});

module.exports = router;
