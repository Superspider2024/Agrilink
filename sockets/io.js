const Messages = require("../models/messages.js");
const Chats = require("../models/chats.js");

const socketHandler = (socket, io) => {
  // The outer try/catch is okay, but we need one inside the event listener.
  try {
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat ${chatId}`);
    });

    socket.on('sendMessage', async (data) => {
      // --- FIX #1: Added a try...catch block HERE to see the real error ---
      try {
        const { chatId, sender, receiver, content, imageTrue } = data;

        // --- FIX #2: Removed the 'receiver' field which doesn't exist in your Message model ---
        const newMessage = new Messages({
          sender,
          content,
          imageTrue,
          chatId,
          // 'created' is handled by default: Date.now() in your model, so this is optional
        });

        await newMessage.save(); // This should now work correctly.

        // The rest of your logic for updating the chat list is great.
        const updatedChat = await Chats.findOneAndUpdate(
          { chatId },
          {
            $set: { lastUpdated: Date.now(), latestMessage: content },
            ...(imageTrue && { $push: { images: content } }),
          },
          { new: true }
        );

        if (!updatedChat) {
          const chatData = {
            chatId,
            participants: [sender, receiver],
            latestMessage: content,
            lastUpdated: Date.now(),
          };
          if (imageTrue) {
            chatData.images = [content];
          }
          await Chats.create(chatData);
        }

        // Your broadcast logic is perfect.
        io.to(chatId).emit('newMessage', {
          chatId,
          sender,
          content,
          imageTrue,
          created: newMessage.created,
        });

      } catch (e) {
        // This will now log the specific error if .save() fails.
        console.error("!!! FAILED TO SEND/SAVE MESSAGE:", e.message);
      }
    });

    socket.on("messagesReadByReceiver", async (data) => {
      // This logic is fine.
      const chatId = data.chatId;
      const sender = data.sender.toLowerCase();
      await Messages.updateMany(
        { chatId, sender, isRead: false },
        { $set: { isRead: true } }
      );
      socket.to(chatId).emit("MessagesReadToSender", { sender });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });

  } catch (e) {
    console.error("SOCKET HANDLER ERROR:", e.message);
  }
};

module.exports = socketHandler;
