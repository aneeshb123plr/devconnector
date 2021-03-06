const express = require('express');;
const cors = require('cors')
const connectDB = require('./config/db');
const app = express();

// connect Database
connectDB();

app.get("/", (req, res) => res.send("API Running"))

//Init middleware:
app.use(express.json({ extended: false }))
app.use(cors());

// Define routes

app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/auth", require("./routes/api/auth"));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`The server is running on port ${PORT}`));