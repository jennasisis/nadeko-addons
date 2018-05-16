const Discord = require(`discord.js`);
const client = new Discord.Client({disableEveryone: true});
var akiiID = `107599228900999168`;
const config = require(`./config.json`);

// debug capability
var debug = true;

var usChnl = `396746152168652810`,      // #mod_logs: Visual Novel Center
  usGuild = `389486485155479563`,       // Visual Novel Center
  usMediaChnl = `436877775224307713`,   // #media: Visual Novel Center
  sMonitChnl = `430472413042704386`,    // #type-here
  token = config.token,                 // Nadeko's token
  errorChnl = `389524577178353674`;     // #best_staff_2020: VNC

if (debug) {
  usChnl = `332632603737849856`;        // #general: Some bot shit or somethin idk
  usMediaChnl = `332632603737849856`;   // #general: Some bot shit or somethin idk
  usGuild = `332632603737849856`;       // Some bot shit or somethin idk
  sMonitChnl = `436989848658771973`;    // #testing: Some bot shit or somethin idk
  token = config.devToken;              // Debug Bot's token
  errorChnl = `332632603737849856`;     // #general: SBSOSIDK
}

function clean(text) {
  if (typeof(text) === `string`)
    return text.replace(/`/g, `\`` + String.fromCharCode(8203)).replace(/@/g, `@` + String.fromCharCode(8203));
  else
    return text;
}

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, `g`), replacement);
};

async function unScrungo() {
  var chnl = client.channels.get(usChnl);
  var guild = client.guilds.get(usGuild);
  var scrungo = guild.roles.find(`name`, `Scrungo`);
  var club_member = guild.roles.find(`name`, `Club Members`);

  await chnl.send(`:gear: **Scrungo prune process begun.** Caching members...`);

  await guild.fetchMembers();
  await chnl.send(`:white_check_mark: **Done caching members**`);
  
  await chnl.send(`:gear: **Checking for Scrungos to prune...**`);
  if (!scrungo) return await chnl.send(`:x: No \`Scrungo\` role detected!`);
  if (!club_member) return await chnl.send(`:x: No \`Club Members\` role detected!`);

  await guild.members.forEach(async member => {
    if (member.roles.has(scrungo.id) && member.roles.has(club_member.id)) {
      await chnl.send(`:warning: __**${member.user.tag}**__ **has the Scrungo role. Removing...**`);
      await member.removeRole(scrungo, `Scrungo prune`);
    }
  });

  await chnl.send(`:white_check_mark: **Done**`);
}

client.on(`ready`, async () => {
  console.log(`Nadeko Addons Ready`);
  if (debug) console.log(`⚠️  DEBUG FUNCTION ENABLED ️️️⚠️`);
  
  //client.users.get(`107599228900999168`).send(`**\`[Nadeko Addons]\` |** Bot is online! Starting the Scrungo prune...`); // Akii's ID
  
  var guild = client.guilds.get(usGuild);
  var scrungo = guild.roles.find(`name`, `Scrungo`);
  await guild.fetchMembers();
  var scrungoMembers = await guild.roles.get(scrungo.id).members;
  await scrungoMembers.forEach(async member => {
    await member.removeRole(scrungo);
    await member.user.send(new Discord.RichEmbed().setAuthor(guild.name, guild.iconURL).setTitle(`Sorry for the inconvenience, but this bot has just restarted, and as a result, your Scrungo role has been removed. Please reapply it to have access to the server.`).setColor(`0x7289da`));
    console.log(`[READY] Removed the Scrungo role from ${member.user.tag}`);
    await client.users.get(`107599228900999168`).send(`**\`[Nadeko Addons]\` |** *\`[READY]\`* - Removed Scrungo role from ${member.user.tag}`);
  });
});

client.on(`message`, async message => {
  try { // HAHAHAHAHAHA SHIT
    if (message.author.bot) return;
    const args = message.content.split(` `).slice(1);
  
    if (message.channel.type !== `dm` && message.guild.id === usGuild) {
      if (message.attachments.map(g => g.id)[0]) {
        if (message.channel.topic && message.channel.topic.includes(`<monika:noImageDelete>`)) return;
        if (message.channel.id === usMediaChnl) return;
        message.delete();
      }
    }

    // for akii commands only
    if (message.author.id === akiiID) {
    // eval
      if (message.content.startsWith(`+eval`)) {
        try {
          const code = args.join(` `);
          let evaled = eval(code);
  
          if (typeof evaled !== `string`)
            evaled = require(`util`).inspect(evaled);
  
          message.channel.send(clean(evaled), {code:`xl`}).catch(err => {
            message.channel.send(`:x: Whoops, error. Check logs.`);
            console.error(err);
            console.log(evaled);
          });
        } catch (err) {
          message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
      }

      // sys
      if (message.content.startsWith(`+sys`)) {
        require(`child_process`).exec(args.join(` `), (e, out, err) => {
          if (e || err) {message.channel.send(`Whoops, error.\n\`\`\`bash\n${e | err}\n\`\`\``);}
          message.channel.send(`\`\`\`bash\n${out}\n\`\`\``);
        });}
    }

    // unScrungo
    if (message.content.toLowerCase() === `+unscrungo`) {
      if (message.member.permissions.has(`ADMINISTRATOR`)) {
        message.delete();
        unScrungo();
      } else {message.delete(); message.author.send(`:x: You do not have access to this command!`);}
    }

    // ping
    if (message.content === `+aPing`) return message.channel.send(`:ping_pong: Nadeko Addons: ${Math.round(client.ping)}ms`);

    // debug
    if (message.content === `+debug?`) return message.channel.send(`\`\`\`xl\n${debug}\n\`\`\``);

    // auto scrungo function
    if (message.channel.id === sMonitChnl) {
      // roles and stuff
      var scrungoRole = message.guild.roles.find(`name`, `Scrungo`);
      var clubRole = message.guild.roles.find(`name`, `Club Members`);

      if (message.content !== `Scrungo`) return message.delete();
      message.delete();
      message.member.addRole(scrungoRole.id, `Auto-scrungo addition process`);
      client.channels.get(usChnl).send(`:white_check_mark: **\`${message.author.tag}\` | Approved for server entry**`);
      setTimeout(async () => {
        await message.member.removeRole(scrungoRole.id, `Auto-scrungo removal process`);
        await client.channels.get(usChnl).send(`:gear: **\`${message.author.tag}\` | Removed Scrungo role**`);
      }, 2.592e+8);
    }
  } catch (e) {client.users.get(`107599228900999168`).send(`:x: **Error:** \n\`\`\`xl\n${e.stack}\n\`\`\``);}
});

client.login(token);
