const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};
// middleware
app.use(express.json());
app.use(cors(corsOptions));

// mongo functions
var uri = `mongodb://${process.env.MONGO_USER}:${process.env.USER_KEY}@ac-7tpcbvv-shard-00-00.ex2dsg0.mongodb.net:27017,ac-7tpcbvv-shard-00-01.ex2dsg0.mongodb.net:27017,ac-7tpcbvv-shard-00-02.ex2dsg0.mongodb.net:27017/?ssl=true&replicaSet=atlas-b84r1c-shard-0&authSource=admin&retryWrites=true&w=majority`;
// const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.USER_KEY}@cluster0.ex2dsg0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    // client.connect();

    const toyCollection = client
      .db("toy-marketplace-project")
      .collection("toysCollection");

    app.get("/toySearch/:text", async (req, res) => {
      const text = req.params.text;
      const Alldata = await toyCollection.find().toArray();
      const result = Alldata.filter((data) =>
        data.toyname.toLowerCase().includes(text.toLowerCase())
      );
      res.send(result);
    });

    app.post("/toysCollection", async (req, res) => {
      const newToy = req.body;
      // const result = await toyCollection.insertOne(newToy);
      const result = await toyCollection.insertOne({
        ...newToy,
        toyprice: parseFloat(newToy.toyprice),
      });
      res.send(result);
    });

    

    app.get("/singleToy/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(filter);
      res.send(result);
    });

    app.get("/toysCollectionAll", async (req, res) => {
      const result = await toyCollection
        .aggregate([{ $sample: { size: 20 } }])
        .toArray();
      res.send(result);
    });

    app.get("/toysCollection", async (req, res) => {
      const result = await toyCollection.find().toArray();
      res.send(result);
    });

    app.get("/MytoysCollection/:sort", async (req, res) => {
      const sort = req.params.sort;
      const options = {
        sort: {
         "toyprice": sort === "asc"? 1 : -1,
       }
     }
      const query = { selleremail: req.query.email };
      const result = await toyCollection.find(query,options).toArray();
      res.send(result);
    });

    app.get("/toysCollectionByCategory", async (req, res) => {
      const category = req.query.category || "";
      const query = category !== "" ? { category } : {};
      const result = await toyCollection.find(query).limit(6).toArray();
      res.send(result);
    });
   
    app.delete("/deleteFromToyCollection/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(filter);
      res.send(result);
    });
    app.put("/updateToys/:id", async (req, res) => {
      const id = req.params.id;
      const toy = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          toyname: toy.toyname,
          category: toy.category,
          sellername : toy.sellername,
          toydescription: toy.toydescription,
          toyprice: toy.toyprice,
          quantity: toy.quantity,
          ratings: toy.ratings,
          toyphoto: toy.toyphoto,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server running!");
});
app.listen(port, () => {
  console.log("running", port);
});
