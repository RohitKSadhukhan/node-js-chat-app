const express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var fs = require("fs");
const port = process.env.PORT || 3000
app.use(express.static(__dirname + "/"));

app.get("/", function (req, res) {
  //console.log(req.url);
  res.sendFile("E:/sem6/it/a2/main.html");
});
users = [];
io.on("connection", function (socket) {
  console.log("A user connected");
  socket.on("setUsername", function (data) {
   
    if (users.indexOf(data) > -1) {
      socket.emit(
        "userExists",
        data + " username is taken! Try some other username."
      );
    } else {
      users.push(data);
      socket.emit("userSet", { username: data });
    }
  });
  socket.on("join-room", function (data) {
    console.log(data.roomname);
    socket.join(data.roomname);

    socket.broadcast
      .to(data.roomname)
      .emit("status", {
        message: "joined chat room",
        user: data.user,
        roomname: data.roomname,
      });
  });
  socket.on("exit-room", function (data) {
    try {
      console.log(data.user + " leaving room named : ", data.room);
      socket.leave(data.room);
      socket.broadcast
        .to(data.room)
        .emit("status", {
          message: "leaved chat room",
          user: data.user,
          roomname: data.room,
        });
    } catch (e) {
      console.log("[error]", "leave room :", e);
    }
  });
  
  socket.on("sendImage", function (data){
    
    if (data.roomname != "") {
      socket.broadcast.to(data.roomname).emit("recvImage", data);
      socket.broadcast.to(data.roomname).emit("play");
    } else {
      socket.broadcast.emit("recvImage", data);
      socket.broadcast.emit("play");
    }
    
  });
  socket.on("msg", function (data) {
    //Send message to everyone
    console.log("user from  " + data.roomname + data.user);

    if (data.roomname != "") {
      socket.broadcast.to(data.roomname).emit("newmsg", data);
      socket.broadcast.to(data.roomname).emit("play");
    } else {
      socket.broadcast.emit("newmsg", data);
      socket.broadcast.emit("play");
    }
  });
  socket.on("test", function (data) {
    console.log("user from  " + data);
  });
});
http.listen(port, function () {
  console.log("listening on localhost:3000");
});
