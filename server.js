const express = require("express");
const dotenv = require("dotenv").config();
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const File = require("./models/File");
const { render } = require("ejs");
const upload = multer({ dest: "uploads/" });
const app = express();

const port = process.env.PORT;
mongoose.connect(process.env.MONGO_URI);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.route("/").get((req, res) => {
  res.render("index");
});

app.route("/upload").post(upload.single("file"), async (req, res) => {
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  };

  if (req.body.password != null && req.body.password != "") {
    fileData.password = await bcrypt.hash(req.body.password, 10);
  }
  const data = await File.create(fileData);

  res.render("index", {
    fileLink: `${req.headers.origin}/file/${data.id}`,
  });
});
app.get("/file/:id", handleDownload);
app.post("/file/:id", handleDownload);

async function handleDownload(req, res) {
  const file = await File.findById(req.params.id);
  console.log(file);
  if (file.password != null) {
    console.log("working");
    if (req.body.password == null) {
      res.render("password");
      return;
    }
  }
  if (!(await bcrypt.compare(req.body.password, file.password))) {
    res.render("password", { error: true });
    return;
  }
  file.downloadCount++;
  await file.save();
  res.download(file.path, file.originalName);
}

app.listen(port, () => console.log(`Server running on ${port}`));
