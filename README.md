# OneOffChat
A node/socket.io/heroku app to start a one time chat.

Check it out : https://oneoffchat.herokuapp.com/

This app makes use of socket.io's room feature. Every user that connects (to https://oneoffchat.herokuapp.com/) gets their own unique URL which they can share with a friend. When that friend connects to that URL (https://oneoffchat.herokuapp.com/UNIQUE_ID), they are only part of that specific room.
