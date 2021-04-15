exports.blacklistedPermissions = [
	"ADMINISTRATOR",
	"BAN_MEMBERS",
	"KICK_MEMBERS",
	"MANAGE_CHANNELS",
	"MANAGE_ROLES",
	"MANAGE_EMOJIS",
	"MANAGE_WEBHOOKS"
];

exports.DefaultAntiRaidOptions = {
	rateLimit: 3,
	time: 45000,
	punishType: "removeRole",
	verbose: true,
	ignoredUsers: [],
	ignoredRoles: [],
	ignoredEvents: []
};


exports.DefaultAntiInvitesOptions = {
	maxInterval: 60000,
	warnThreshold: 3,
	kickThreshold: 7,
	banThreshold: 7,
	muteThreshold: 5,
	warnMessage: "{@user}, Please don't advertising",
    kickMessage: "**{user_tag}** has been kicked for advertising.",
    banMessage: "**{user_tag}** has been banned for advertising.", 
    muteMessage: "**{user_tag}** has been muted for advertising.",
	muteRoleName: "Muted",
	verbose: true,
	ignoredPermissions: [],
	ignoredBots: false,
	ignoredUsers: [],
	ignoredRoles: []
};
exports.inviteRegex = /(?:https?:\/\/)?(?:www\.)?(?:disco|discord(?:app)?)\.(?:com|gg|io|li|me|net|org)(?:\/invite)?\/([a-z0-9-.]+)/i;