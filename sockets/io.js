const Messages = require("../models/messages.js");
const Chats = require("../models/chats.js");

const socketHandler = (io) => { 
  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat room: ${chatId}`);
    });

    socket.on('sendMessage', async (data) => {
      // --- FIX: Added a try...catch block INSIDE the event handler ---
      try {
        // We expect the frontend to send IDs for sender and receiver
        const { chatId, senderId, receiverId, content } = data;

        if (!chatId || !senderId || !receiverId || !content) {
          throw new Error("Missing data for sending message.");
        }

        // 1. Create and save the new message document
        const newMessage = new Messages({
          chatId: chatId,
          sender: senderId,
          content: content,
        });
        await newMessage.save();

        // 2. Update the parent chat document with the latest message
        await Chats.findByIdAndUpdate(chatId, {
          latestMessage: content,
        });

        // 3. Populate the sender's details to send back to the frontend
        const populatedMessage = await newMessage.populate('sender', 'name role');

        // 4. Broadcast the new message to everyone in the private chat room
        io.to(chatId).emit('newMessage', populatedMessage);

      } catch (e) {
        // Now, if an error occurs, we will see it clearly in the backend console.
        console.error("!!! SOCKET ERROR on sendMessage:", e.message);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
