require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 8080;
const statusText = require("./utils/httpStatusText");
const cookieParser = require('cookie-parser');

const app = express();


app.use(cors({
    origin: process.env.FRONT_END_LINK,
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser())


app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/posts", require("./routes/post.routes"));
app.use("/api/comments", require("./routes/comment.routes"));
app.use("/api/categories", require("./routes/categories.routes"));



app.all('*', (req, res, next)=>{
    res.status(404).json({status: statusText[404]  ,message: "This source is not found"});
})

// globle error hundler
app.use((err ,req, res, next)=>{
    res.status(err.statusCode || 500).json(
        {status: err.statusText || statusText[500],
         message: err.message || "Invailde error", data: null })
})


const server = http.createServer(app);
connectDB().then(()=>{
    server.listen(PORT, ()=>{
        console.log(`server in running on http://localhost:${PORT}`);  
    })
})
