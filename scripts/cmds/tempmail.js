const { TempMail } = require("1secmail-api");

function g() {
  var length = 6;
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var randomId = '';

  for (var i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return randomId;
}

module.exports = {
  akane: {
    name: "tempm",
    permission: 0,
    author: "Deku",
    category: "tools",
    description: "Generate temporary email (auto get inbox)",
    usages: "[tempmail]",
    prefix: false
  },
  start: async function({reply}){
    try {
    //generate tempmail
    const mail = new TempMail(g());
    
    //auto fetch
    mail.autoFetch();
    
    if (mail) reply("Your temporarily email: "+mail.address)
        
    const fetch = () => {
    mail.getMail().then((mails) => {
      //console.log(mails);
      if (!mails[0]) {
      	return;
      	} else {
      	  let b = mails[0]
      	  var msg = `You have a message!\n\nFrom: ${b.from}\n\nSubject: ${b.subject}\n\nMessage: ${b.textBody}\nDate: ${b.date}`
      	 reply(msg+`\n\nOnce the email and message is received it will be automatically deleted.`)

            return mail.deleteMail();
     }
     // delete the mail(s)
     
      
    });
  }; // end of fetch
  // auto fetch
  fetch();
  setInterval(fetch, 3 * 1000); //every 3 sec
  
    } catch (err){
      console.log(err)
      return reply(err.message)
    }
  }
    }
