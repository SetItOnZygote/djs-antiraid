const {
	EventEmitter
} = require("events");
const {
	inviteRegex,
	DefaultAntiInvitesOptions
} = require("./util/Constants");

const log = console.log;


class AntiInvites extends EventEmitter {
	/**
	 * 
	 * @param  {Discord.Client}
	 * @param  {object?} AntiInvites options
	 *
	 */
	constructor(client, options = {}) {

		if (!client) throw new Error("Invalid Discord client");

		super();

		/**
		 * The Discord Client
		 * @type {Discord.Client}
		 */
		this.client = client;

		/**
		 * Invite regex
		 * @type {RegExp}
		 */
		this.regex = inviteRegex;

		/**
		 * An a collection of cases
		 * @type {Array}
		 */
		this._cache = [];

		/**
		 * djs-antiraid options
		 * @type {object}
		 */

		this.options = DefaultAntiInvitesOptions;

		for (const prop in options) this.options[prop] = options[prop];

	}
	/**
	 * Message listener
	 * @param  {Discord.Message} user message 
	 * @return {undefined}
	 */
	addCase(message, code) {
		const key = `${message.author.id}-${message.guild.id}-${Date.now()}`;

		this._cache.push({
			key,
			ID: message.author.id,
			guild: message.guild.id,
			date: Date.now(),
			code
		});

		setTimeout(() => {
			this._cache = this._cache.filter(c => c.key !== key);
		}, typeof this.options.maxInterval === "number" ? this.options.maxInterval : 60000 * 30);
	}
	/**
	 * Format a string and returns it.
	 * @param  {string} The string to format.
	 * @param  {Discord.Message} message Context message.
	 * @return {string}
	 */
	format(string, message) {
		return string
			.replace(/{@user}/g, message.author.toString())
			.replace(/{user_tag}/g, message.author.tag)
			.replace(/{server_name}/g, message.guild.name);
	}
	/**
	 * [sendMessage description]
	 * @param  {Discord.Message} message 
	 * @param  {string} type    
	 * @return {undefined} 
	 */
	sendMessage(message, type) {
		if (this.options[type]) {
			message.channel.send(this.format(this.options[type], message)).then(msg => {
				msg.delete({
					timeout: 7000
				}).catch(() => null);
			}).catch(e => {
				if (this.options.verbose) console.error(`AntiRaid (sendMessage#sendMissingPermMessage): ${e.message}`);
			});
		}
	}
	/**
	 * 
	 * @param  {Discord.Message} message
	 * @return {undefined}
	 */
	async punish(message) {

		const member = message.member;

		let level;
		const cases = this._cache.filter(_case => _case.ID === message.author.id && _case.guild === message.guild.id);


		if (cases.length === this.options.warnThreshold) level = 0;
		else if (cases.length === this.options.muteThreshold) level = 1;
		else if (cases.length === this.options.kickThreshold) level = 2;
		else if (cases.length === this.options.banThreshold) level = 3;
		else level = 0;


		switch (level) {
			case 0: // warn.
				this.emit("warnAdd", member);
				this.sendMessage(message, "warnMessage");
				break;
			case 1: // mute
				if (!member.manageable) {
					if (this.options.verbose) log(`AntiRaid (punish#userNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
				} else {
					const muteRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === this.options.muteRoleName.toLowerCase());
					if (!muteRole) {
						if (this.options.verbose) log("AntiRaid (punish#muteRoleNotFound) could not found muted role named " + this.options.muteRoleName);
					} else {
						member.roles.add(muteRole).then(() => {
							this.emit("muteAdd", member);
							this.sendMessage(message, "muteMessage");
						}).catch((e) => this.emit("error", e));
					}
				}
				break;
			case 2: // kick
				if (!member.kickable) {
					if (this.options.verbose) log(`AntiRaid (punish#userNotKickable): ${member.user.tag} (ID: ${member.user.id}) could not be kicked, insufficient permissions`);
				} else {
					member.kick("Anti-Invites")
						.then(() => {
							this.emit("kickAdd", member);
							this.sendMessage(message, "kickMessage");
						})
						.catch(e => this.emit("error", e));
				}
				break;
			case 3: // ban
				if (!member.bannable) {
					if (this.options.verbose) log(`AntiRaid (punish#userNotBannable): ${member.user.tag} (ID: ${member.user.id}) could not be banned, insufficient permissions`);
				} else {
					member.ban({
							reason: "Anti-Invites"
						})
						.then(() => {
							this.emit("banAdd", member);
							this.sendMessage(message, "banMessage");
						})
						.catch(e => this.emit("error", e));
				}
				break;
		}
	}
	/**
	 * Checks a message.
	 * @param  {Discord.Message} message The message to check.
	 * @return {Promise<boolean>} Whether the message has triggered a threshold.
	 *
	 * client.on("message", msg => {
	 * 		anti.message(msg);
	 * });
	 * 
	 */
	async message(message) {
		if (!message.guild) return false;
		if (message.author.bot && this.options.ignoredBots) return false;
		if (message.guild.ownerID === message.author.id) return false;
		if (this.options.ignoredUsers.includes(message.author.id)) return false;
		if (this.options.ignoredRoles.some(r => message.member.roles.cache.has(r))) return false;
		if (this.options.ignoredPermissions.some(permission => message.member.hasPermission(permission))) return false;
		if (!this.regex.test(message.content)) return false;

		const [, code] = message.content.match(this.regex);

		let invite, deleteIt;

		invite = await this.client.fetchInvite(code).catch(() => null);

		if (invite) {
			if (invite.guild.id !== message.guild.id) deleteIt = true;
		} else deleteIt = true;

		if (deleteIt) {
			await message.delete().catch(() => null);
			this.addCase(message, code);
			this.punish(message);
			return true;
		}
		return false;
	}
	/**
	 * Get current cases
	 * @param  {Function}
	 * @return {Array}
	 */
	getCases(func = () => true) {
		return this._cache.filter(func);
	}
}


module.exports = AntiInvites;