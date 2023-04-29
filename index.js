const express = require("express");
const appPort = 5000;
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const nodemailer = require("nodemailer");
const cors = require("cors");
const Blog = require("./model/Blogs");
const News = require("./model/News");
const Appointment = require("./model/appointment");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());


mongoose.connect(
  "mongodb+srv://ppbackend:Web786786@healthcarecluster.yhawahg.mongodb.net/priemerpaindb?retryWrites=true&w=majority"
);
const db = mongoose.connection;
db.on("connected", () => {
  console.log("db connected");
});

db.on("disconnected", (err, res) => {
  console.log("db disconnected", err, "###", res);
});

app.get("/", async (req, res) => {
  res.send("Welcome");
});
//................................................Appointment............

app.post("/appointment/create", async (req, res) => {
  const { firstName, lastName, phone, email, patientType, message } = req.body;

  try {
    const appointment = await Appointment.create({
      firstName,
      lastName,
      phone,
      email,
      patientType,
      message,
    });

    res
      .status(200)
      .json({ data: appointment, mesasge: "Appointment done successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

  // Send an email to the admin
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "webdevelopercapital@gmail.com",
      pass: "ulgfizctvtqktylr",
    },
  });

  const mailOptions = {
    from: email,
    to: "webdevelopercapital@gmail.com",
    subject: "Patient's Appointment Details",
    html: `
    <html>
      <head>
        <style>
          h1 {
            color: #003062;
          }
          p {
            font-size: 18px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <h1>Patient Details</h1>
        <p>Name : ${firstName + " " + lastName}</p>
        <p>Email : ${email}</p>
        <p>Category : ${patientType}</p>
        <p>Contact Number : ${phone}</p>
        <p>Message : ${message}</p>
      </body>
    </html>`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(info);
    }
  });
});
//get all appointments
app.get("/appointment/getAll", async (req, res) => {
  let data = await Appointment.find();
  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).json({ err: "getting some error" });
  }
});
// ...................................................For BLOGS..............
//get all blogs
app.get("/blogs/getAll", async (req, res) => {
  let data = await Blog.find();
  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).json({ err: "getting some error" });
  }
});
// get last three blogs
app.get("/blogs/getLastThree", async (req, res) => {
  try {
    const data = await Blog.find().sort({ _id: -1 }).limit(3);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ err: "error getting blogs" });
  }
});
// get all blogs by pagination
app.get("/blogs/getAll/pagination", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default to first page if page is not specified
  const limit = parseInt(req.query.limit) || 21; // default to 10 documents per page if limit is not specified
  const startIndex = (page - 1) * limit;

  try {
    const totalDocs = await Blog.countDocuments();
    const data = await Blog.find().skip(startIndex).limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      data
    });
  } catch (err) {
    res.status(500).json({ err: "getting some error" });
  }
});
// get single blog by id
app.get("/blogs/id/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    res.status(200).json({ data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
//filte by category
//BackPain LegPain NeckPain JointPain ShoulderPain News Treatments InjuryTreatment
app.get("/blogs/getByCategory", async (req, res) => {
  try {
    let category = req.query.category;
    let result = await Blog.aggregate([
      { $match: { category: new RegExp(category, "i") } },
    ]);
    res.status(200).json({ data: result, mesasge: "get blogs by category" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// get single blog by slug
app.get("/blogs/:category/:slug", async (req, res) => {
  try {
    let slugs = "/" + req.params.category + "/" + req.params.slug + "/";
    const blog = await Blog.findOne({
      category: req.params.category,
      slug: slugs,
    });
    if (!blog) {
      return res.status(404).json({ error: "Blogs not found" });
    }
    res.status(200).json({ data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/blogs/create", async (req, res) => {
  try {
    let result = await Blog.create({
      title: req.body.title,
      metaDes: req.body.metaDes,
      foucKW: req.body.foucKW,
      slug: req.body.slug,
      seoTitle: req.body.seoTitle,
      category: req.body.category,
      image: req.body.image,
    });
    res
      .status(200)
      .json({ data: result, mesasge: "blogs is created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/blogs/:blogId", async (req, res) => {
  try {
    let deleted = await Blog.deleteOne({
      _id: new mongodb.ObjectId(req.params.blogId),
    });
    res
      .status(200)
      .json({ data: deleted, mesasge: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update blog
app.patch("/blogs/update/:blogId", async (req, res) => {
  try {
    let id = req.params.blogId;

    let blog = await Blog.updateOne(
      { _id: id },
      {
        $set: {
          title: req.body.title,
          metaDes: req.body.metaDes,
          foucKW: req.body.foucKW,
          slug: req.body.slug,
          seoTitle: req.body.seoTitle,
          category: req.body.category,
          image: req.body.image,
        },
      }
    );

    res.status(200).json({ mesasge: "Blog updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//..................................................................FOR NEWS
app.post("/news/create", async (req, res) => {
  try {
    let result = await News.create({
      title: req.body.title,
      metaDes: req.body.metaDes,
      foucKW: req.body.foucKW,
      slug: req.body.slug,
      seoTitle: req.body.seoTitle,
      category: "news",
      image: req.body.image,
    });
    res
      .status(200)
      .json({ data: result, mesasge: "News created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all news

app.get("/news/getAll", async (req, res) => {
  let data = await News.find();
  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).json({ err: "getting some error" });
  }
});

// get all news by pagination
app.get("/news/getAll/pagination", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default to first page if page is not specified
  const limit = parseInt(req.query.limit) || 21; // default to 10 documents per page if limit is not specified
  const startIndex = (page - 1) * limit;

  try {
    const totalDocs = await News.countDocuments();
    const data = await News.find().skip(startIndex).limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      data
    });
  } catch (err) {
    res.status(500).json({ err: "getting some error" });
  }
});

app.delete("/news/:blogId", async (req, res) => {
  try {
    let deleted = await News.deleteOne({
      _id: new mongodb.ObjectId(req.params.blogId),
    });
    res
      .status(200)
      .json({ data: deleted, mesasge: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//update news api
app.patch("/news/update/:blogId", async (req, res) => {
  try {
    let id = req.params.blogId;

    let news = await News.updateOne(
      { _id: id },
      {
        $set: {
          title: req.body.title,
          metaDes: req.body.metaDes,
          foucKW: req.body.foucKW,
          slug: req.body.slug,
          seoTitle: req.body.seoTitle,
          image: req.body.image,
        },
      }
    );

    res.status(200).json({ mesasge: "News updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// get single News by slug
app.get("/news/slug/:slug", async (req, res) => {
  try {
    let slugs = "/" + req.params.slug + "/";
    const news = await News.findOne({
      slug: slugs,
    });
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }
    res.status(200).json({ data: news });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// get single news by id
app.get("/news/id/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }
    res.status(200).json({ data: news });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
//Server
app.listen(appPort, () => {
  console.log(`Server running at http://localhost/:${appPort}/`);
});
