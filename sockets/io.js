const Messages = require("../models/messages.js");
const Chats = require("../models/chats.js");

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ A user connected');

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`✅ User joined chat ${chatId}`);
    });

    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, sender, receiver, content, imageTrue } = data;

        const newMessage = new Messages({
          sender,
          content,
          imageTrue,
          chatId,
        });

        await newMessage.save();

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

        console.log(`📢 Emitting message to room: ${chatId}`);

        io.to(chatId).emit('newMessage', {
          chatId,
          sender,
          content,
          imageTrue,
          created: newMessage.created,
        });

      } catch (e) {
        console.error("❌ FAILED TO SEND/SAVE MESSAGE:", e.message);
      }
    });

    socket.on("messagesReadByReceiver", async (data) => {
      const { chatId, sender } = data;
      await Messages.updateMany(
        { chatId, sender: sender.toLowerCase(), isRead: false },
        { $set: { isRead: true } }
      );
      socket.to(chatId).emit("MessagesReadToSender", { sender });
    });

    socket.on('disconnect', () => {
      console.log('❎ User disconnected');
    });
  });
};

module.exports = socketHandler;
