// Setup basic express server
var express = require('express');
var app = express();
var url = require('url');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

var cleanup = null;
var chats = {};

io.on('connection', function (socket) {
    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (data) {
        //if the room is not around - 404
        if(!chats[data.room]){
            socket.emit('404', {});
            return;
        }
        socket.room = data.room;
        socket.join(data.room);
        // we store the username in the socket session for this client
        socket.username = data.username;
        // add the client's username to the global list
        chats[data.room].shouldDelete = false;
        chats[data.room].usernames[data.username] = data.username;
        chats[data.room].numUsers += 1;
        chats[data.room].addedUser = true;
        socket.emit('login', {
            numUsers: chats[data.room].numUsers,
            username: socket.username
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.to(data.room).emit('user joined', {
            username: socket.username,
            numUsers: chats[data.room].numUsers
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (chats && socket.room && chats[socket.room] && chats[socket.room].addedUser) {
            delete chats[socket.room].usernames[socket.username];
            chats[socket.room].numUsers -= 1;
            if(chats[socket.room].numUsers === 0){
                chats[socket.room].shouldDelete = true;
                if(!cleanup){
                    cleanup = setInterval(function() {
                        if(Object.keys(chats).length === 0){
                            if(cleanup){
                                clearInterval(cleanup);
                                cleanup = null;
                            }
                            return;
                        }
                        for (var chat in chats) {
                            console.log(chat);
                            if (chats[chat].shouldDelete) {
                                delete chats[chat];
                            }
                        }
                    }, 60 * 60 * 1000);
                }
                return;
            }
            // echo globally that this client has left
            socket.broadcast.to(socket.room).emit('user left', {
                username: socket.username,
                numUsers: chats[socket.room].numUsers
            });
        }
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function (data) {
        socket.broadcast.to(data.room).emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function (data) {
        socket.broadcast.to(data.room).emit('stop typing', {
            username: socket.username
        });
    });

    socket.on('start', function (data) {
        var chatId = '';
        if(data.name && data.name.length > 0){
            chatId = data.name;// name the chat the userentered name
        }else{
            chatId = socket.id;// use the socket id as a random URL
        }
        if(!chats[chatId]){// if the chat doesn't already exist
            chats[chatId] = {// create it
                usernames: {},
                numUsers: 0,
                addedUser: false,
                shouldDelete: false
            };
        }
        socket.emit('go chat', {
            socket: chatId
        });
    });
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.to(data.room).emit('new message', {
            username: socket.username,
            message: data.message
        });
    });
});

// Routing
app.use(express.static(__dirname + '/public'));

app.get('/*', function(req, res){
    if(chats[req.url.substring(1)]){
        res.sendFile(__dirname + '/public/chat.html');
    }else{
        res.sendFile(__dirname + '/public/404.html');
    }
});
