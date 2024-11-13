const { post, get } = require("axios");
module.exports = {
  config: { 
name: "gpt", 
category: "ai" 
},
  onStart() {},  
  onChat: async ({
     message: { reply: r },
     args: a, 
     event: { senderID: s, threadID: t, body: b, messageReply: msg }, 
    commandName, 
    usersData, 
    globalData,
    role 
}) => {
const cmd = `${module.exports.config.name}`;
const pref = `${utils.getPrefix(t)}`;
const pr = [`${pref}${cmd}`, `${cmd}`];
const _m = "gpt";
 const { name, settings = {}, gender } = await usersData.get(s) || {};
const ownKeys = Object.keys(settings.own || {});
const ownSettings = settings.own || {}; 
let Gpt = await globalData.get(_m);  
     const gen = gender === 2 ? 'male' : 'female';
      const sys = settings.system || "helpful";
const csy = settings.own ? Object.keys(settings.own).map(key => ({ [key]: settings.own[key] })) : [];
let customSystem = [
    {
default: "You are helpful assistant"
    },   
];
if (Array.isArray(csy) && csy.length > 0) {
    customSystem = customSystem.concat(csy);
}
    if (a[0] && pr.some(x => a[0].toLowerCase() === x)) {
    const p = a.slice(1);
 let assistant = [
"lover", 
"helpful", 
"friendly", 
"toxic", 
"bisaya", 
"horny", 
"tagalog"
/*"makima", 
"godmode", 
"default"*/
];
const userAssistant = Object.keys(ownSettings).filter(key => ownSettings[key]);
const ass = assistant.filter(key => !userAssistant.includes(key));
assistant.push(...userAssistant);
const models = {
     1: "llama", 
     2: "gemini" 
          };
    let ads = "";
if(role === 2) {
ads = `For admin only:\nTo change model use:\n${cmd} model <num>\nTo allow NSFW use:\n${cmd} nsfw on/off`;
}

let url = undefined;
if (msg && ["photo", "audio", "sticker"].includes(msg.attachments[0]?.type)) {
  url = { link: msg.attachments[0].url, type: msg.attachments[0].type === "photo" || mgs.attachments[0].type === "sticker" ? "image" : "mp3" };
}
let output = ass.map((key, i) => `${i + 1}. ${key.charAt(0).toUpperCase() + key.slice(1)}`).join("\n");
if (userAssistant.length > 0) {
  output += `\n\nYour own assistant:\n` +
    userAssistant.map((key, i) => `${i + 1}. ${key.charAt(0).toUpperCase() + key.slice(1)}`).join("\n");
}

     if (!p.length) return r(`Hello ${name}, choose ur assistant:\n`+ output + `\nexample: ${cmd} set friendly\n\n${cmd} system <add/delete/update> <system name> <your instructions>\n\nexample:\n${cmd} system add cat You are a cat assistant\n${cmd} delete cat\n\n${ads}`)
 const mods = await globalData.get(_m) || { data: {} };
    const [__, _, sy, key, ...rest] = a;
    const value = rest.join(" ");
if(p[0].toLowerCase() === "system") {
if(p.length < 2) {
return r(`Usage:\n${cmd} system <add/delete/update> <system name> <your instructions>\n\nexample:\n${cmd} system add cat You are a cat assistant\n${cmd} delete cat`);
} 
    if (sy === "add" || sy === "update") {
      if (!key || !value) return r(`Please add system name and system prompt.\nExample: system ${sy} cat "You are a cat assistant"`);
      if (sy === "add" && (assistant.includes(key) || ownKeys.length >= 2 && !ownKeys.includes(key))) return r("You cannot add more systems.");
      settings.own = { ...settings.own, [key]: value };
await usersData.set(s, {
  settings: {
    ...settings,
    own: settings.own
  }
});
      return r(`System "${key}" ${sy === "add" ? "added" : "updated"} successfully.`);
    }
    if (sy === "delete" && ownKeys.includes(key)) {
      delete settings.own[key];
await usersData.set(s, {
  settings: {
    ...settings,
    own: settings.own
  }
});
      return r(`System "${key}" deleted successfully.`);
    }
}

   if (p[0].toLowerCase() === "set" && p[1]?.toLowerCase()) {
        const choice = p[1].toLowerCase();
       if (assistant.includes(choice)) {
        await usersData.set(s, { settings: { ...settings, system: choice } });

          return r(`Assistant changed to ${choice}`);
        }
        return r(`Invalid choice.\n${output}\nExample: ${cmd} set friendly`);
      }
if (p[0] === 'nsfw') {
if (role < 2) {
  return r("You don't have permission to use this.");
}
      if (p[1].toLowerCase() === 'on') {
        mods.data.nsfw = true; 
        await globalData.set(_m, mods);
     return r(`Successfully turned on NSFW. NSFW features are now allowed to use.`);
      } else if (p[1].toLowerCase() === 'off') {
        mods.data.nsfw = false; 
        await globalData.set(_m, mods);
        return r(`Successfully turned off NSFW. NSFW features are now disabled.`);
      } else {
        return r(`Invalid usage: to toggle NSFW, use 'nsfw on' or 'nsfw off'.`);
      }
    }
if (p[0].toLowerCase() === "model") {
if (role < 2) {
  return r("You don't have permission to use this.");
}
  const _model = models[p[1]];  
  if (_model) {
    try {
      mods.data.model = _model;
      await globalData.set(_m, mods);
 return r(`Successfully changed model to ${_model}`);
    } catch (error) {
return r(`Error setting model: ${error}`);
    }
  } else {
return r(`Please choose only number\navailabale model\n${Object.entries(models).map(([id, name]) => `${id}: ${name}`).join("\n")}\n\nexample: ${pref}${cmd} model 1`);
  }
}

if (!Gpt || Gpt === "undefined") {
  await globalData.create(_m, { data: { model: "llama", nsfw: false } }); 
  Gpt = await globalData.get(_m);
}
const { data: { nsfw, model } } = Gpt;
  const { result, media } = await ai(p.join(" "), s, name, sys, gen, model, nsfw, customSystem, url);

let attachments;
if (media && media.startsWith("https://cdn")) {
    attachments = await global.utils.getStreamFromURL(media, "spotify.mp3");
} else if (media) {
    attachments = await global.utils.getStreamFromURL(media);
}

const rs = {
    body: result.replace(/😂/g, "🤭"),
    mentions: [{ id: s, tag: name }]
};

if (attachments) {
   rs.attachment = attachments;
}

  const { messageID: m } = await r(rs);
  global.GoatBot.onReply.set(m, { commandName, s, model, nsfw, customSystem });
    }
  },
 onReply: async ({ 
    Reply: { s, commandName, model, nsfw, customSystem }, 
    message: { reply: r }, 
    args: a, 
    event: { senderID: x, body: b, attachments, threadID: t }, 
    usersData 
}) => {
const cmd = `${module.exports.config.name}`;
const pref = `${utils.getPrefix(t)}`;
    const { name, settings, gender } = await usersData.get(x);
    const sys = settings.system || "helpful";
    if (s !== x || b?.toLowerCase().startsWith(cmd) || b?.toLowerCase().startsWith(pref + cmd) || b?.toLowerCase().startsWith(pref + "unsend")) return;

 let url = null;
let prompt = a.join(" ");
if (!b.includes(".")) {
    const img = attachments?.[0];
    if (img) {
        if (img.type === "sticker" && img.ID === "369239263222822") {
            prompt = "👍";
            //url = null;
        } else {
            url = (img.type === "sticker") 
                ? { link: img.url, type: "image" } 
                : (img.type === "photo") 
                ? { link: img.url, type: "image" } 
                : (img.type === "audio") 
                ? { link: img.url, type: "mp3" } 
                : null;
            if (url) prompt = ".";
        }
    }
}
   
    
const { result, media } = await ai(prompt || ".", s, name, sys, gender === 2 ? 'male' : 'female', model, nsfw, customSystem, url);
const rs = {
    body: result.replace(/😂/g, "🤭"),
    mentions: [{ id: x, tag: name }]
};
if (media) {
    if (media.startsWith('https://cdn')) {
        rs.attachment = await global.utils.getStreamFromURL(media, "spotify.mp3");
    } else {
        rs.attachment = await global.utils.getStreamFromURL(media);
    }
}
 const { messageID } = await r(rs);       global.GoatBot.onReply.set(messageID, { commandName, s, sys, model, nsfw,  customSystem, url });
}
};
//llama3-70b-8192
async function ai(prompt, id, name, system, gender, model, nsfw, customSystem, link = "") {
  const g4o = async (p, m = "gemma2-9b-it") => post(atob(String.fromCharCode(...atob((await get(atob("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2p1bnpkZXZvZmZpY2lhbC90ZXN0L3JlZnMvaGVhZHMvbWFpbi90ZXN0LnR4dA=="))).data).split(" ").map(Number))),
    { 
      id, 
      prompt: p, 
      name, 
      model, 
      system, 
   customSystem, //array [{ }]
      gender, 
      nsfw,
      url: link ? link : undefined, /*@{object}  { link, type: "image or mp3" } */
config: [{ 
 gemini: {
 apikey: "AIzaSyAqigdIL9j61bP-KfZ1iz6tI9Q5Gx2Ex_o", 
model:  "gemini-1.5-flash"
},
llama: { model: m }
}]
    },
    {
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer test' 
      } 
    });

  try {
    let res = await g4o(prompt);
    if (["i cannot", "i can't"].some(x => res.data.result.toLowerCase().startsWith(x))) {
      await g4o("clear");
      res = await g4o(prompt, "llama-3.1-70b-versatile");
    }
    return res.data;
  } catch {
    try {
    await g4o("clear");
      return (await g4o(prompt, "llama-3.1-70b-versatile")).data;
    } catch (err) {
      const e = err.response?.data;
      const errorMessage = typeof e === 'string' ? e : JSON.stringify(e);

      return errorMessage.includes("Payload Too Large") ? { result: "Your text is too long" } :            errorMessage.includes("Service Suspended") ? { result: "The API has been suspended, please wait for the dev to replace the API URL"  }:
         { result: e?.error || e || err.message };
    }
  }
}
