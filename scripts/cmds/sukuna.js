const { get } = require('axios');
const sukunaApiUrl = 'https://deku-rest-apis.ooguy.com/pai/sukuna?';

module.exports = {
  config: {
    name: 'sukuna',
    aliases: [],
    version: '1.0.0',
    author: 'kshitiz',
    countdown: 0,
    role: 0,
    shortdescription: { en: 'Talk with Sukuna.' },
    longdescription: { en: 'Talk with Sukuna' },
    category: 'ai',
    guide: { en: '{p}zoro <query>' },
  },

  async zoro(query) {
    try {
      const response = await get(`${sukunaApiUrl}?query=${encodeURIComponent(query)}`);
      return response.data.response;
    } catch (error) {
      console.error('Error fetching Sukuna response:', error);
      throw error;
    }
  },

  sendMessage(message, body, onReplyCallback) {
    message.reply({ body: body }, (err, info) => {
      if (!err) {
        onReplyCallback(info.messageID);
      } else {
        console.error('Error sending message:', err);
      }
    });
  },

  onStart: async function ({ message, args }) {
    try {
      const query = args.join(' ');
      if (!query) {
        this.sendMessage(message, `Missing input!\n\nUsage: ${this.config.name} <query>`, (messageID) => {
          global.goatbot.onReply.set(messageID, {
            commandName: this.config.name,
            messageID,
            author: message.senderID,
            tempFilePath: null,
          });
        });
        return;
      }

      try {
        const sukunaInfo = await this.sukuna(query);
        this.sendMessage(message, sukunaInfo, (messageID) => {
          global.goatbot.onReply.set(messageID, {
            commandName: 'zoro',
            messageID,
            author: message.senderID,
            tempFilePath: null,
          });
        });
      } catch (error) {
        console.error('Error:', error);
        this.sendMessage(message, 'An error occurred while processing your request.', (messageID) => {
          global.goatbot.onReply.set(messageID, {
            commandName: this.config.name,
            messageID,
            author: message.senderID,
            tempFilePath: null,
          });
        });
      }
    } catch (error) {
      console.error('Error:', error);
      this.sendMessage(message, error.message, (messageID) => {
        global.goatbot.onReply.set(messageID, {
          commandName: this.config.name,
          messageID,
          author: message.senderID,
          tempFilePath: null,
        });
      });
    }
  },

  onReply: async function ({ message, reply, args }) {
    const { author, commandName, tempFilePath } = reply;
    try {
      const query = args.join(' ');
      if (!query) {
        this.sendMessage(message, `Missing input!\n\nUsage: ${this.config.name} <query>`, (messageID) => {
          global.goatbot.onReply.set(messageID, {
            commandName: this.config.name,
            messageID,
            author: message.senderID,
            tempFilePath: null,
          });
        });
        return;
      }

      const zoroInfo = await this.sukuna(query);
      this.sendMessage(message, zoroInfo, (messageID) => {
        global.goatbot.onReply.set(messageID, {
          commandName: 'sukuna',
          messageID,
          author: message.senderID,
          tempFilePath: null,
        });
      });
    } catch (error) {
      console.error('Error:', error);
      this.sendMessage(message, 'An error occurred while processing your request.', (messageID) => {
        global.goatbot.onReply.set(messageID, {
          commandName: this.config.name,
          messageID,
          author: message.senderID,
          tempFilePath: null,
        });
      });
    }
  },
};
