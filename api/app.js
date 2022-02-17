const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const cors = require("cors");
const io = require("socket.io")(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["X-Requested-With,content-type"],
        credentials: true,
    },
});

app.use(cors());

app.get("/", (req, res) => {
    res.json({
        title: "Anonym Chat With NodeJS",
        created_at: new Date(),
    });
});

let chats = JSON.parse(fs.readFileSync("./chats.json", "utf-8"));
let users = JSON.parse(fs.readFileSync("./users.json", "utf-8"));

app.get("/chats", (req, res) => {
    return res.json(chats);
});

app.get("/chats/users", (req, res) => {
    res.json(users);
});

app.get("/chats/users/:name", (req, res) => {
    const user = users.find((name) => name.toLowerCase() == req.params.name.toLowerCase());

    if (user) {
        res.json({ success: true, search: req.params.name });
    } else {
        res.json({ success: false, search: req.params.name });
    }
});

io.on("connection", (socket) => {
    socket.on("add__typing", ({ name }) => {
        io.emit("add__typing", { name });
    });

    socket.on("remove__typing", ({ name }) => {
        io.emit("remove__typing", { name });
    });

    socket.on("add__user", ({ name }) => {
        users.push(name.toLowerCase());

        fs.writeFileSync("./users.json", JSON.stringify(users), "utf-8");

        users = JSON.parse(fs.readFileSync("./users.json", "utf-8"));
    });

    socket.on("add__chat", (data) => {
        chats.push(data);

        fs.writeFileSync("./chats.json", JSON.stringify(chats), "utf-8");

        chats = JSON.parse(fs.readFileSync("./chats.json", "utf-8"));

        io.emit("reload__chat");
    });
});

http.listen(3001, () => console.log("Listening on port 3001..."));
