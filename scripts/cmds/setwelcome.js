const { getTime, drive } = global.utils;

const fs = require('fs');

const axios = require('axios');

const path = require('path');



if (!global.temp.welcomeEvent)

    global.temp.welcomeEvent = {};



module.exports = {

    config: {

        name: "welcome",

        version: "1.8",

        author: "NTKhang", //add some image by Deku

        category: "events"

    },



    langs: {

        vi: {

            session1: "sáng",

            session2: "trưa",

            session3: "chiều",

            session4: "tối",

            welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",

            multiple1: "bạn",

            multiple2: "các bạn",

            defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"

        },

        en: {

            session1: "morning",

            session2: "noon",

            session3: "afternoon",

            session4: "evening",

            welcomeMessage: "Thank you for inviting me to the group!\nBot prefix: %1\nTo view the list of commands, please enter: %1help",

            multiple1: "you",

            multiple2: "you guys",

            defaultWelcomeMessage: `Hello {userName}.\nWelcome {multiple} to the chat group: {boxName}\nHave a nice {session} 😊`

        }

    },

    onStart: async ({ threadsData, message, event, api, getLang }) => {

        if (event.logMessageType == "log:subscribe")

            return async function () {

                const hours = getTime("HH");

                const { threadID } = event;

                const { nickNameBot } = global.GoatBot.config;

                const prefix = global.utils.getPrefix(threadID);

                const dataAddedParticipants = event.logMessageData.addedParticipants;

                if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {

                    if (nickNameBot)

                        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());

                    return message.send(getLang("welcomeMessage", prefix));

                }

                if (!global.temp.welcomeEvent[threadID])

                    global.temp.welcomeEvent[threadID] = {

                        joinTimeout: null,

                        dataAddedParticipants: []

                    };

                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);

                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);



                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {

                    const threadData = await threadsData.get(threadID);

                    if (threadData.settings.sendWelcomeMessage == false)

                        return;

                    const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;

                    const dataBanned = threadData.data.banned_ban || [];

                    const threadName = threadData.threadName;

                    const userName = [],

                        mentions = [];

                    let multiple = false;



                    if (dataAddedParticipants.length > 1)

                        multiple = true;



                    for (const user of dataAddedParticipants) {

                        if (dataBanned.some((item) => item.id == user.userFbId))

                            continue;

                        userName.push(user.fullName);

                        mentions.push({

                            tag: user.fullName,

                            id: user.userFbId

                        });

                    }

                    if (userName.length == 0) return;

                    let { welcomeMessage = getLang("defaultWelcomeMessage") } =

                        threadData.data;

                    const form = {

                        mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null

                    };

                    welcomeMessage = welcomeMessage

                        .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))

                        .replace(/\{boxName\}|\{threadName\}/g, threadName)

                        .replace(

                            /\{multiple\}/g,

                            multiple ? getLang("multiple2") : getLang("multiple1")

                        )

                        .replace(

                            /\{session\}/g,

                            hours <= 10

                                ? getLang("session1")

                                : hours <= 12

                                    ? getLang("session2")

                                    : hours <= 18

                                        ? getLang("session3")

                                        : getLang("session4")

                        );

                    form.body = welcomeMessage;

                    const apiUrl = `https://joshweb.click/canvas/welcome?name=${encodeURIComponent(userName.join(", "))}&groupname=${encodeURIComponent(threadName)}&groupicon=https://i.ibb.co/G5mJZxs/rin.jpg&member=${dataAddedParticipants.length}&uid=4&background=https://i.ibb.co/4YBNyvP/images-76.jpg`;

                    try {

                        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

                        const imagePath = path.join(__dirname, 'cache', 'welcome_image.jpg');

                        fs.writeFileSync(imagePath, response.data);

                        form.attachment = [fs.createReadStream(imagePath)];

                        await message.send(form);

                        fs.unlinkSync(imagePath); // delete

                    } catch (error) {

                        console.error(error.message);

                        await message.send(form);

                    }

                    delete global.temp.welcomeEvent[threadID];

                }, 1500);

            };

    }

};
