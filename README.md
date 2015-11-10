# OneOffChat
A node/socket.io/heroku app to start a one time chat.

Check it out : https://oneoffchat.herokuapp.com/

This app makes use of socket.io's room feature. Every user that connects (to https://oneoffchat.herokuapp.com/) gets their own unique URL which they can share with a friend. When that friend connects to that URL (https://oneoffchat.herokuapp.com/UNIQUE_ID), they are only part of that specific room.

Node.js + Express is handling all the routing, and socket.io is handling all the communication between the client and server. The application is hosted on heroku which makes life really easy.
