const axios = require('axios');

const Sim = async (message, lang = "ph") => {
  try {
    const res = await axios.get(`https://simsimi.site/api/v2/?mode=talk&lang=${lang}&message=${encodeURIComponent(message)}&filter=false`);
    return res.data.success;
  } catch (e) {
    if (e.response?.data) throw new Error(`SimSimi API error: ${e.response.data}`);
    throw new Error(`Error: ${e.message}`);
  }
};

module.exports = {
  config: {
    name: "sim",
    author: "Karina",
    version: 1.3,
    role: 0,
    category: "bot",
  },

  onStart: async function ({ message, threadsData, args, event, role }) {
    if (!["on", "off"].includes(args[0])) {
      return message.reply("Invalid option! Use 'on' or 'off'.");
    }

    if (role < 2) {
      return message.reply("You need to be an admin to toggle Sim.");
    }

    const simStatus = args[0] === "on";
    await threadsData.set(event.threadID, { data: { sim: simStatus } });
    message.reply(`Sim has been turned ${simStatus ? "on" : "off"} in this thread.`);
  },

  onChat: async function ({ event, message, threadsData, args }) {
    const simData = await threadsData.get(event.threadID);

    if (!simData?.data.sim || event.senderID === global.botID || !event.body) {
      return;
    }

    try {
      const userMessage = args.slice(1).join(" ");
      const simResponse = await Sim(userMessage);

      const replyResponse = await message.reply(simResponse);

      if (replyResponse && replyResponse.messageID) {
        global.GoatBot.onReply.set(replyResponse.messageID, {
          commandName: "sim",
          sender: event.senderID,
        });
      }
    } catch (e) {
      message.reply(`Failed to communicate with Sim: ${e.message}`);
    }
  },

  onReply: async function ({ message, args, Reply, event }) {
    if (event.senderID !== Reply.sender) return;

    try {
      const simResponse = await Sim(args.join(" "));
      message.reply(simResponse);
    } catch (e) {
      message.reply(`Failed to get SimSimi's response: ${e.message}`);
    }
  }
};
