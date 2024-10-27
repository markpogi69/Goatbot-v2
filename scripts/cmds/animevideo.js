module.exports = {
  config: {
    name: "animevideo",
    aliases: ["randomanime"],
    version: "1.0",
    author: "kshitiz // api by ace gerome ",
    countDown: 20,
    role: 0,
    shortDescription: "get anime video",
    longDescription: "get random anime video",
    category: "anime",
    guide: "{pn} animevideo",
  },
  onStart: async function ({ api, event }) {
    const axios = require('axios');
    const request = require('request');
    const fs = require("fs");

    try {
      const response = await axios.get('https://ace-rest-api.vercel.app/api/animevid?');
      const ext = response.data.url.substring(response.data.url.lastIndexOf(".") + 1);

      const callback = function () {
        api.sendMessage({
          body: `HERE'S YOUR ANIME VIDEO BRO 😊`,
          attachment: fs.createReadStream(__dirname + `/cache/codm.${ext}`)
        }, event.threadID, () => fs.unlinkSync(__dirname + `/cache/codm.${ext}`));
      };

      request(response.data.url).pipe(fs.createWriteStream(__dirname + `/cache/codm.${ext}`)).on("close", callback);
    } catch (err) {
      api.sendMessage("[ ANIME ]\nApi error status: 200\nContact the owner to fix immediately", event.threadID);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    }
  }
};
