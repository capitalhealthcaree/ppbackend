const { MongoClient } = require("mongodb");

MongoClient.connect(
  "mongodb://ppbackend:Web786786@healthcarecluster.yhawahg.mongodb.net/priemerpaindb?retryWrites=true&w=majority",
  {
    useMongoClient: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((err) => {
    console.log(err);
    console.log("DB connection failed");
  });
