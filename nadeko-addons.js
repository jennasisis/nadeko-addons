const Discord = require('discord.js');
const client = new Discord.Client({disableEveryone: true});
var akiiID = '107599228900999168';
const config = require('./config.json');

// debug capability
var debug = true;

var usChnl = '396746152168652810',          // #mod_logs: Visual Novel Center
    usGuild = '389486485155479563',         // Visual Novel Center
    sMonitChnl = '430472413042704386',      // #type-here
    token = config.token                    // Nadeko's token

if(debug){
  usChnl = '332632603737849856';            // #general: Some bot shit or somethin idk
  usGuild = '332632603737849856';           // Some bot shit or somethin idk
  token = config.devToken                   // Debug Bot's token
}

function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

async function unScrungo() {
  var chnl = client.channels.get(usChnl);
  var guild = client.guilds.get(usGuild);
  var scrungo = guild.roles.find('name', 'Scrungo');
  var club_member = guild.roles.find('name', 'Club Members');

  await chnl.send(':gear: **Scrungo prune process begun.** Caching members...');

  await guild.fetchMembers();
  await chnl.send(`:white_check_mark: **Done caching members**`);
  
  await chnl.send(':gear: **Checking for Scrungos to prune...**');
  if(!scrungo) {await chnl.send(':x: No `Scrungo` role detected!'); await exit();}
  if(!club_member) {await chnl.send(':x: No `Club Members` role detected!'); await exit();}

  await guild.members.forEach(async member => {
    if(member.roles.has(scrungo.id) && member.roles.has(club_member.id)) {
        await chnl.send(`:warning: __**${member.user.tag}**__ **has the Scrungo role. Removing...**`);
        await member.removeRole(scrungo, "Scrungo prune");
    }
  });

  await chnl.send(':white_check_mark: **Done**');
}

client.on('ready', async () => {
  console.log('Nadeko Sideloader Ready');
  if(debug) console.log('⚠️  DEBUG FUNCTION ENABLED ️️️⚠️');
});

client.on('message', message => {
  if(message.author.bot) return;
  const args = message.content.split(" ").slice(1);

  // Guild restricted commands
  if(message.guild.id === usGuild){
    if(message.channel.id == usChnl && message.attachments) return message.delete();
  }

  // roles and stuff
  var scrungoRole = message.guild.roles.find('name', 'Scrungo');
  var clubRole = message.guild.roles.find('name', 'Club Members');

  // for akii commands only
  if(message.author.id === akiiID){
    // eval
    if(message.content.startsWith("+eval")){
      try {
        const code = args.join(" ");
        let evaled = eval(code);
  
        if (typeof evaled !== "string")
          evaled = require("util").inspect(evaled);
  
        message.channel.send(clean(evaled), {code:"xl"}).catch(err => {
          message.channel.send(':x: Whoops, error. Check logs.');
          console.error(err);
          console.log(evaled);
        })
      } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
      }
    }

    // sys
    if(message.content.startsWith(`+sys`)){
      require('child_process').exec(args.join(" "), (e, out, err) => {
      if(e || err) {message.channel.send(`Whoops, error.\n\`\`\`bash\n${e | err}\n\`\`\``);}
      message.channel.send(`\`\`\`bash\n${out}\n\`\`\``);
    })}
  }

  // unScrungo
  if(message.content.toLowerCase() === "+unscrungo"){
    if(message.member.permissions.has('ADMINISTRATOR')){
      message.delete();
      unScrungo();
    }
  }

  // ping
  if(message.content === "+sPing") return message.channel.send(`:ping_pong: Nadeko Sideloader: ${Math.round(client.ping)}ms`);

  // debug
  if(message.content === "+debug?") return message.channel.send(`\`\`\`xl\n${debug}\n\`\`\``);

  // auto scrungo function
  if(message.channel.id === sMonitChnl){
    if(message.content !== "Scrungo") return message.delete();
    message.delete();
    message.member.addRole(scrungoRole.id, 'Auto-scrungo addition process');
    client.channels.get(usChnl).send(`:white_check_mark: **\`${message.author.tag}\` | Approved for server entry**`);
    setTimeout(async () => {
      await message.member.removeRole(scrungoRole.id, 'Auto-scrungo removal process');
      await client.channels.get(usChnl).send(`:gear: **\`${message.author.tag}\` | Removed Scrungo role**`);
    }, 2.592e+8);
  }
});

client.login(token);
