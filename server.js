// Import required libs
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const PORT = 3000;

const app = express();

// Define MongoDB connection URI and options
const mongoURI =
  "mongodb+srv://keertenk:qwerty098@default.dqbtdwf.mongodb.net/project";
// Depricated in upcoming versions of MongoDB
// const mongoOptions = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// };

// Function to connect to MongoDB Atlas
const connecttoAtlas = async () => {
  try {
    await mongoose.connect(mongoURI /*, mongoOptions*/);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("ERROR: Connection not established due to:", error);
  }
};

// Connect to MongoDB Atlas
connecttoAtlas();

// Create a schema for the playlist items
const song_collectionSchema = new mongoose.Schema({
  title: String,
  artist: String,
  image: String,
});
const playlist_entries_collectionSchema = new mongoose.Schema({
  title: String,
  artist: String,
  image: String,
});

// Create a model for the playlist items
const song_collection = mongoose.model(
  "song_collection",
  song_collectionSchema
);
const playlist_entries_collection = mongoose.model(
  "playlist_entries_collection",
  playlist_entries_collectionSchema
);

// Set up the view engine and static files
app.set("view engine", "ejs");
app.use(express.static("public"));

// Set up the body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Seed the database with 10 book records
    const musicDB = [
      {
        title: "Drippy",
        artist: "Sidhu Moose Wala , AR Paisley , MXRCI",
        image:
          "https://i1.sndcdn.com/artworks-QKrtMOYHGQSkBC1N-pyT8Yw-t500x500.jpg",
      },
      {
        title: "Palpita",
        artist: "Diljit Dosanjh, Camilo",
        image:
          "https://cdns-images.dzcdn.net/images/cover/9f46cf5a4570a5fea66b2ed19ec7be56/264x264.jpg",
      },
      {
        title: "Jheeley",
        artist: "Satinder Sartaj",
        image:
          "https://pbs.twimg.com/amplify_video_thumb/1717764006528872448/img/mnU5F4aNMFYC4mlu.jpg",
      },
      {
        title: "Jatt Life",
        artist: "Varinder Brar",
        image:
          "https://i1.sndcdn.com/artworks-000468666183-a342pn-t500x500.jpg",
      },
    ];
    await song_collection.insertMany(musicDB);

    console.log("Database seeded with initial records");
  } catch (error) {
    console.error("Error seeding database: ", error);
  }
};

// Seed the database (***Used once for prepopulating***)
// seedDatabase();

// Set up the routes

// Home Route "/"
app.get("/", async (req, res) => {
  try {
    const allItems = await song_collection.find();
    const playlistItems = await playlist_entries_collection.find();
    return res.render("index", { allItems, playlistItems });
  } catch (error) {
    console.error("Error finding database: ", error);
  }
});

// Route to add song to my playlist "/add" "Button"
app.post("/add", async (req, res) => {
  try {
    const { idToAdd } = req.body;
    const songToAdd = await song_collection.findById(idToAdd);
    await playlist_entries_collection.create({
      title: songToAdd.title,
      artist: songToAdd.artist,
      image: songToAdd.image,
    });
    console.log("DEBUG: Song Added to Playlist:", songToAdd.title);
    return res.redirect("/");
  } catch (error) {
    console.error("Error adding song to playlist:", error);
  }
});

// Route to remove song from my playlist "/remove" "Button"
app.post("/remove", async (req, res) => {
  try {
    const { idToDelete } = req.body;
    const removedEntry = await playlist_entries_collection.findOneAndDelete({
      _id: idToDelete,
    });
    console.log("DEBUG: Removed song from playlist:", removedEntry.title);
    return res.redirect("/");
  } catch (error) {
    console.error("Error deleting song:", error);
  }
});

// Route to add new song to Website
app.post("/add-song", async (req, res) => {
  const newSong = {
    title: req.body.songName,
    artist: req.body.songArtist,
    image: req.body.songImage,
  };
  const songToAdd = new song_collection(newSong);
  const savedEntry = await songToAdd.save();
  console.log("DEBUG: Song to be added to the website:", savedEntry);

  return res.redirect("/");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
