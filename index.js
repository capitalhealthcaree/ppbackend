const express = require("express");
const bodyParser = require("body-parser");
const appPort = 5000;
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const nodemailer = require("nodemailer");
const cors = require("cors");
const Blog = require("./model/Blogs");
const Count = require("./model/Counter");
const News = require("./model/News");
const Appointment = require("./model/appointment");
const Faq = require("./model/Faq");
const ChatID = require("./model/ChatID");
const Treatments = require("./model/Treatments");
const Assets = require("./model/Assets");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "dngmflrpx",
  api_key: "318672834237286",
  api_secret: "wfYy9bxFmryvrNpZvhRN9AxCCzY",
});
const app = express();
//....
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

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

//......................... Assets ..........................
app.post("/createAssets", async (req, res) => {
  try {
    let result = await Assets.create({
      folderName: req.body.folderName,
      fileName: req.body.fileName,
      filePath: req.body.filePath,
    });
    res
      .status(200)
      .json({ data: result, mesasge: "Assets is addedd successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//......get all Assets
app.get("/allAssets", async (req, res) => {
  let data = await Assets.find();
  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).json({ err: "getting some error" });
  }
});

app.get("/getAssetsGrouped", async (req, res) => {
  try {
    // Fetch all the assets from the database
    const assets = await Assets.find();

    // Filter out assets where folderName is an empty string
    const filteredAssets = assets.filter((asset) => asset.folderName !== "");

    // Group assets by folderName
    const groupedAssets = filteredAssets.reduce((group, asset) => {
      const { folderName } = asset;
      if (!group[folderName]) {
        group[folderName] = [];
      }
      group[folderName].push(asset);
      return group;
    }, {});

    res
      .status(200)
      .json({ data: groupedAssets, message: "Assets grouped successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// app.get("/getAssetsGrouped", async (req, res) => {
//   try {
//     // Fetch all the assets from the database
//     const assets = await Assets.find();

//     // Group assets by folderName
//     const groupedAssets = assets.reduce((group, asset) => {
//       const { folderName } = asset;
//       if (!group[folderName]) {
//         group[folderName] = [];
//       }
//       group[folderName].push(asset);
//       return group;
//     }, {});

//     res
//       .status(200)
//       .json({ data: groupedAssets, message: "Assets grouped successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

app.get("/getAssetsWithEmptyFolderName", async (req, res) => {
  try {
    // Fetch assets with an empty folderName
    const assets = await Assets.find({ folderName: "" });

    res.status(200).json({
      data: assets,
      message: "Assets with empty folderName fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/deleteAsset/:id", async (req, res) => {
  try {
    // Get the asset ID from the URL parameter
    const assetId = req.params.id;

    // Find the asset in the database
    const asset = await Assets.findById(assetId);

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    // Deleting the asset from Cloudinary using the public_id
    if (asset.filePath) {
      // Extract the public_id from the filePath (assuming filePath contains the URL from Cloudinary)
      const publicId = asset.filePath.split("/").pop().split(".")[0]; // Assuming URL format

      // Call Cloudinary to delete the image
      const cloudinaryResponse = await cloudinary.uploader.destroy(publicId);

      if (cloudinaryResponse.result !== "ok") {
        return res
          .status(500)
          .json({ message: "Error deleting image from Cloudinary" });
      }
    }

    // Delete the asset from the database
    await Assets.findByIdAndDelete(assetId);

    res.status(200).json({ message: "Asset and image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// app.delete("/deleteAsset/:id", async (req, res) => {
//   try {
//     // Get the asset ID from the URL parameter
//     const assetId = req.params.id;

//     // Find the asset by ID and delete it
//     const result = await Assets.findByIdAndDelete(assetId);

//     if (!result) {
//       return res.status(404).json({ message: "Asset not found" });
//     }

//     res.status(200).json({ message: "Asset deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

//......................... ChatID ..........................
app.post("/chatId/create", async (req, res) => {
  try {
    let result = await ChatID.create({
      chatIdKey: req.body.chatIdKey,
    });
    res
      .status(200)
      .json({ data: result, mesasge: "chatIdKey is addedd successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//......update chat id
app.patch("/chatId/update/:chatbotId", async (req, res) => {
  try {
    let id = req.params.chatbotId;

    let blog = await ChatID.updateOne(
      { _id: id },
      {
        $set: {
          chatIdKey: req.body.chatIdKey,
        },
      }
    );

    res.status(200).json({ mesasge: "Blog updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//......get chat id
app.get("/chatId/get", async (req, res) => {
  let data = await ChatID.find();
  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).json({ err: "getting some error" });
  }
});

//................................................Appointment............

app.post("/appointment/create", async (req, res) => {
  const { firstName, lastName, phone, email, patientType, message, location } =
    req.body;

  try {
    const appointment = await Appointment.create({
      firstName,
      lastName,
      phone,
      email,
      patientType,
      message,
      location,
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
      pass: "uvgqevylpebrtvgj",
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
         <p>Location : ${location}</p>
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
  let data = await Appointment.find().sort({ createdAt: -1 });
  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).json({ err: "getting some error" });
  }
});
// delete specific appointment
app.delete("/deleteAppointment/:appointmentId", async (req, res) => {
  try {
    let deleted = await Appointment.deleteOne({
      _id: new mongodb.ObjectId(req.params.appointmentId),
    });
    res
      .status(200)
      .json({
        data: deleted,
        mesasge: "Specific Appointment deleted successfully",
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
// get last five blogs
app.get("/blogs/getLastFive", async (req, res) => {
  try {
    const data = await Blog.find().sort({ _id: -1 }).limit(5);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ err: "error getting blogs" });
  }
});
// get all blogs by pagination
app.get("/blogs/getAll/pagination", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default to first page if page is not specified
  const limit = parseInt(req.query.limit) || 9; // default to 10 documents per page if limit is not specified
  const startIndex = (page - 1) * limit;

  try {
    const totalDocs = await Blog.countDocuments();
    const data = await Blog.find()
      .sort({ _id: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      data,
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
app.get("/blogs/:category/:slug?", async (req, res) => {
  try {
    const { category, slug } = req.params;

    let blog;

    if (slug) {
      // Case: /blogs/category/slug
      const slugs = "/" + category + "/" + slug + "/";
      blog = await Blog.findOne({
        category: category,
        slug: slugs,
      });
    } else {
      // Case: /blogs/slug (no category)
      const slugs = "/" + category + "/";
      blog = await Blog.findOne({
        slug: slugs,
      });
    }

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json({ data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// app.get("/blogs/:category/:slug", async (req, res) => {
//   try {
//     let slugs = "/" + req.params.category + "/" + req.params.slug + "/";
//     const blog = await Blog.findOne({
//       category: req.params.category,
//       slug: slugs,
//     });
//     if (!blog) {
//       return res.status(404).json({ error: "Blogs not found" });
//     }
//     res.status(200).json({ data: blog });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });
// create blog
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
// get last five News
app.get("/news/getLastFive", async (req, res) => {
  try {
    const data = await News.find().sort({ _id: -1 }).limit(5);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ err: "error getting news" });
  }
});
// get all news by pagination
app.get("/news/getAll/pagination", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // default to first page if page is not specified
  const limit = parseInt(req.query.limit) || 9; // default to 10 documents per page if limit is not specified
  const startIndex = (page - 1) * limit;

  try {
    const totalDocs = await News.countDocuments();
    const data = await News.find()
      .sort({ _id: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      data,
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
// ...................................................For FAQs..............
//get all faqs
app.get("/faq/getAll", async (req, res) => {
  let data = await Faq.find();
  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).json({ err: "getting some error" });
  }
});
// get last three blogs
// app.get("/blogs/getLastThree", async (req, res) => {
//   try {
//     const data = await Blog.find().sort({ _id: -1 }).limit(3);
//     res.status(200).json({ data });
//   } catch (err) {
//     res.status(500).json({ err: "error getting blogs" });
//   }
// });
// get all blogs by pagination
// app.get("/blogs/getAll/pagination", async (req, res) => {
//   const page = parseInt(req.query.page) || 1; // default to first page if page is not specified
//   const limit = parseInt(req.query.limit) || 21; // default to 10 documents per page if limit is not specified
//   const startIndex = (page - 1) * limit;

//   try {
//     const totalDocs = await Blog.countDocuments();
//     const data = await Blog.find().skip(startIndex).limit(limit);

//     res.status(200).json({
//       currentPage: page,
//       totalPages: Math.ceil(totalDocs / limit),
//       data,
//     });
//   } catch (err) {
//     res.status(500).json({ err: "getting some error" });
//   }
// });
// get single blog by id
// app.get("/blogs/id/:id", async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);
//     if (!blog) {
//       return res.status(404).json({ error: "Blog not found" });
//     }
//     res.status(200).json({ data: blog });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });
//filte by category
//BackPain LegPain NeckPain JointPain ShoulderPain News Treatments InjuryTreatment
// app.get("/blogs/getByCategory", async (req, res) => {
//   try {
//     let category = req.query.category;
//     let result = await Blog.aggregate([
//       { $match: { category: new RegExp(category, "i") } },
//     ]);
//     res.status(200).json({ data: result, mesasge: "get blogs by category" });
//   } catch (error) {
//     res.status(500).json({ err: error.message });
//   }
// });

// get single faq by slug
app.get("/faq/:slug", async (req, res) => {
  try {
    let slugs = "/" + req.params.slug + "/";
    const faq = await Faq.findOne({
      slug: slugs,
    });
    if (!faq) {
      return res.status(404).json({ error: "Faq not found" });
    }
    res.status(200).json({ data: faq });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// create faq
app.post("/faq/create", async (req, res) => {
  try {
    let result = await Faq.create({
      question: req.body.question,
      answer: req.body.answer,
      metaDes: req.body.metaDes,
      foucKW: req.body.foucKW,
      slug: req.body.slug,
      seoTitle: req.body.seoTitle,
    });
    res
      .status(200)
      .json({ data: result, mesasge: "Faq is created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// delete Faq
app.delete("/faq/:faqId", async (req, res) => {
  try {
    let deleted = await Faq.deleteOne({
      _id: new mongodb.ObjectId(req.params.faqId),
    });
    res
      .status(200)
      .json({ data: deleted, mesasge: "Faq deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update Faq
app.patch("/faq/update/:faqId", async (req, res) => {
  try {
    let id = req.params.faqId;

    let faq = await Faq.updateOne(
      { _id: id },
      {
        $set: {
          question: req.body.question,
          answer: req.body.answer,
          metaDes: req.body.metaDes,
          foucKW: req.body.foucKW,
          slug: req.body.slug,
          seoTitle: req.body.seoTitle,
        },
      }
    );

    res.status(200).json({ mesasge: "Faq updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//post Counter
app.post("/counter", async (req, res) => {
  try {
    const { count, kw } = req.body;

    // Create a new Count document
    const counter = new Count({ count, kw });

    // Save the count to the database
    await counter.save();

    // Send a success response
    res.status(201).json({ message: "Count saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//get Counter
app.get("/counters", async (req, res) => {
  try {
    const count = await Count.find();

    if (!count) {
      return res
        .status(404)
        .json({ error: "Count not found for the requested date" });
    }

    res.json({ count });
  } catch (error) {
    console.error("Error retrieving count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//get Counter Date Wise
app.get("/countersDateWise", async (req, res) => {
  try {
    const count = await Count.find();

    // Group data by date
    const groupedByDate = count.reduce((acc, curr) => {
      const date = new Date(curr.createdAt).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(curr);
      return acc;
    }, {});

    // Transform grouped data into desired format
    const transformedData = Object.entries(groupedByDate).map(
      ([date, items]) => {
        const totalCounts = items.reduce((total, item) => {
          const existingItem = total.find((t) => t.kw === item.kw);
          if (existingItem) {
            existingItem.totalCount += item.count;
          } else {
            total.push({ kw: item.kw, totalCount: item.count });
          }
          return total;
        }, []);

        // Calculate overall total count for the date
        const overallTotalCount = totalCounts.reduce(
          (total, item) => total + item.totalCount,
          0
        );

        return {
          date,
          totalCounts,
          overallTotalCount,
        };
      }
    );

    return res.status(200).json({ data: transformedData });
  } catch (error) {
    console.error("Error retrieving count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//get Counter by Date
app.get("/counter/:date", async (req, res) => {
  try {
    const requestedDate = new Date(req.params.date);

    // Get the counts for the requested date
    const count = await Count.findOne({ date: requestedDate });

    if (!count) {
      return res
        .status(404)
        .json({ error: "Count not found for the requested date" });
    }

    res.json({ date: count.date, count: count.count });
  } catch (error) {
    console.error("Error retrieving count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// create treatments page content
app.post("/treatments/create", async (req, res) => {
  try {
    let result = await Treatments.create({
      content: req.body.content,
      slug: req.body.slug,
    });
    res
      .status(200)
      .json({ data: result, mesasge: "treatments is created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all  treatment content pages
app.get("/treatments/getAll", async (req, res) => {
  let data = await Treatments.find();
  if (data) {
    res.status(200).json({ data });
  } else {
    res.status(500).json({ err: "getting some error" });
  }
});
// Get single treatment content page by slug
app.get("/treatments/:slug", async (req, res) => {
  try {
    // Find the treatment by slug
    const treatment = await Treatments.findOne({ slug: req.params.slug });

    // Check if the treatment exists
    if (!treatment) {
      return res
        .status(404)
        .json({ error: "Single treatment content page not found" });
    }
    // Return the found treatment
    res.status(200).json({ data: treatment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
// delete Treatments specific page content
app.delete("/treatments/:treatmentsId", async (req, res) => {
  try {
    let deleted = await Treatments.deleteOne({
      _id: new mongodb.ObjectId(req.params.treatmentsId),
    });
    res.status(200).json({
      data: deleted,
      mesasge: "Treatments specific page content deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update treatments specific page content api
app.patch("/treatmentsUpdate/:treatmentsId", async (req, res) => {
  try {
    let id = req.params.treatmentsId;

    let treatments = await Treatments.updateOne(
      { _id: id },
      {
        $set: {
          content: req.body.content,
          slug: req.body.slug,
        },
      }
    );
    res.status(200).json({ mesasge: "treatments updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//..................................................................Server
app.listen(appPort, () => {
  console.log(`Server running at http://localhost:${appPort}/`);
});
