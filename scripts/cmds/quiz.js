const { utils: { getPrefix: pr, getStreamFromURL: st }, GoatBot: { onReaction: reac, onReply: rep } } = global;
const { post, put } = require("axios");

function reward() {
  return Math.floor(Math.random() * (1000 - 500) + 500);
}

async function quiz({ type, playerid, option, category, name }) {
  if (!["quiz", "scores"].includes(type)) return { msg: 'You probably modified something' };

  try {
    const [request, payload] = type === 'scores'
      ? [put, { playerid, option }]
      : [post, { category, name, playerid }];

    const { data } = await request("https://quizz-vqgf.onrender.com/" + type, payload);
    return data.message || data;
  } catch (error) {
    return { msg: error.message };
  }
}

async function onReply({ message: { unsend, reply }, Reply: { playerid, messageID, answer }, usersData: { set, get }, event: { body, senderID } }) {
  if (senderID !== playerid) return reply("⚠ You are not the player of this question!");

  const m = await quiz({
    type: "scores",
    playerid,
    option: body?.toLowerCase() === answer.toLowerCase() ? 'correct' : 'wrong'
  });

  const rew = reward();
  let user = await get(senderID);

  if (body?.toLowerCase() === answer.toLowerCase()) {
    user.money += rew;
    await set(senderID, user);
  }

  reply({
    body: m.replace(/{reward}/g, `${rew}`).replace(/{name}/g, user.name),
    mentions: [{ id: playerid, tag: user.name }]
  });

  unsend(messageID);
}

async function onReaction({ message: { unsend, reply }, usersData: { set, get }, event: { reaction, userID }, Reaction: { answer, messageID, playerid } }) {
  if (userID !== playerid || (reaction !== "😆" && reaction !== "😠")) return;

  unsend(messageID);

  const m = await quiz({
    type: "scores",
    playerid,
    option: reaction === answer ? 'correct' : 'wrong'
  });

  const rew = reward();
  let user = await get(userID);

  if (reaction === answer) {
    user.money += rew;
    await set(userID, user);
  }

  reply({
    body: m.replace(/{reward}/g, `${rew}`).replace(/{name}/g, user.name),
    mentions: [{ id: playerid, tag: user.name }]
  });
}

async function onStart({
  message: { reply, unsend },
  args,
  usersData: { getName },
  event: {
    senderID: playerid,
    threadID
  },
  commandName
}) {
  const name = await getName(playerid);
  const { msg, link, question: body, answer } = await quiz({
    type: "quiz",
    category: args.join(" "),
    name,
    playerid
  });

  if (msg) return reply(msg.replace(/{p}/g, await pr(threadID) + this.config.name));

  const o = { body };
  if (link) o.attachment = await st(link);

  const { messageID } = await reply(o);

  /^(true|false)$/i.test(answer.trim())
    ? reac.set(messageID, {
      commandName,
      playerid,
      answer: answer.toLowerCase() === "true" ? "😆" : "😠",
      messageID
    })
    : rep.set(messageID, {
      commandName,
      messageID,
      playerid,
      answer
    });

  setTimeout(() => unsend(messageID), 60000);
}

module.exports = {
  config: {
    name: "quiz",
    version: 2.0,
    role: 0,
    countDown: 0,
    author: "",
    Description: {
      en: "Compete with other players and enhance your IQ and earn money by playing this quiz"
    },
    category: "games",
  },
  onStart,
  onReply,
  onReaction
};
