[![downloadsBadge](https://img.shields.io/npm/dt/djs-antiraid?style=for-the-badge)](https://npmjs.com/djs-antiraid)
[![versionBadge](https://img.shields.io/npm/v/djs-antiraid?style=for-the-badge)](https://npmjs.com/djs-antiraid)
[![discord](https://discord.com/api/guilds/645066074148306969/widget.png)](https://discord.gg/bGtutc9GnB)
# I am NOT the rightful owner of this package
The rightful owner belongs to [TheMaestro0](https://github.com/TheMaestro0).

The reason im posting this package is because my discord bot uses this package and TheMaestro0 deleted the package for no reason at all and maybe you can also use it too.

if you are the rightful owner of this package and wants me to delete it, please contact me on Discord SetItOnZygote#6969 with evidence that it is you. Then i'll delete it right away.

# djs-antiraid
it's a package to protect your discord server from any kind of "raid attacks"

Installation:
```
npm i djs-antiraid
```

Example Anti Raid:
```js
const { Client } = require("discord.js");
const client = new Client();


const { AntiRaid } = require("djs-antiraid"); // import djs-antiraid

const antiRaid = new AntiRaid(client, {
    rateLimit: 3, // Rate limit of actions.
    time: 30000, // Amount of time (in milliseconds)
    punishType: "removeRole", // ban, kick, editRole, removeRole
    verbose: true, // Extended Logs from module.
    ignoredUsers: [], // Array of User IDs that get ignored.
    ignoredRoles: [], // Array of Role IDs that get ignored.
    ignoredEvents: [] 
});



antiRaid.on("trying", (member, event, punishType) => {
    console.log(`I will trying do ${punishType} to stop ${member.user.tag} for ${event}`);
});

antiRaid.on("action", (member, type) => {
    console.log(`${member.user.tag} has been ${type}`);
});



client.on("ready", () => {
    console.log("Ready!");
});

client.login("YOUR_TOKEN_HERE");
```

Example Anti Invites:
```js
const { Client } = require("discord.js");
const client = new Client();


const { AntiInvites } = require("djs-antiraid"); // import djs-antiraid


const antiInvites = new AntiInvites(client, {
    maxInterval: 60000 * 60 * 2, // Amount of time (in milliseconds)
    warnThreshold: 1,
    kickThreshold: 5,
    banThreshold: 8,
    muteThreshold: 3,
    warnMessage: "{@user}, Please don't advertising",
    kickMessage: "**{user_tag}** has been kicked for advertising.", // Message that will be sent in chat upon kicking a user.
    banMessage: "**{user_tag}** has been banned for advertising.", // Message that will be sent in chat upon banning a user.
    muteMessage: "**{user_tag}** has been muted for advertising.",
    verbose: true, // Extended Logs from module.
    ignoredPermissions: ["MANAGE_MESSAGES"], // Bypass users with any of these permissions.
    ignoredBots: true, // Ignore bot messages.
    ignoredUsers: [], // Array of User IDs that get ignored.
    ignoredRoles: [] // Array of Role IDs that get ignored.
});

antiInvites.on("warnAdd", member => console.log(`${member.user.tag} has been warned for advertising.`));
antiInvites.on("muteAdd", member => console.log(`${member.user.tag} has been muted for advertising.`));
antiInvites.on("kickAdd", member => console.log(`${member.user.tag} has been kicked for advertising.`));
antiInvites.on("banAdd", member => console.log(`${member.user.tag} has been banned for advertising.`));


client.on("ready", () => {
    console.log("Ready!");
});

client.on("message", (msg) => antiInvites.message(msg));

client.login("YOUR_TOKEN_HERE");
```


#### Anti spam coming soon..!

## Docs
Comming soon.!

## Support Server

Join our [Support Server](https://discord.gg/bGtutc9GnB) where we help you with issues regarding the module.