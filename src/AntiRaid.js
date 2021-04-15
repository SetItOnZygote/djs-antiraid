const {
	EventEmitter
} = require("events");
const {
	readdirSync
} = require("fs");
const {
	join
} = require("path");

const {
	DefaultAntiRaidOptions,
	blacklistedPermissions
} = require("./util/Constants");

const log = console.log;


class AntiRaid extends EventEmitter {
	/**
	 * Main Class
	 * @param  {Discord.Client}
	 * @param  {object?} AntiRaid options
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
		 * djs-antiraid options
		 * @type {object}
		 */

		this.options = DefaultAntiRaidOptions;

		for (const prop in options) this.options[prop] = options[prop];

		/**
		 * An a collection of cases
		 * @type {Array}
		 */
		this._cases = [];

		for (const file of readdirSync(join(__dirname, "./events"))) {
			try {
				const event = new(require(`./events/${file}`))(this);
				this.client.on(file.split(".")[0], (...args) => event.run(...args));
			} catch (error) {
				this.emit("error", error);
			}
		}
	}
	/**
	 * @param  {Discord.GuildMember}
	 * @param  {string}
	 * @return {boolean}
	 */
	isIgnored(member, event) {
		if (member.guild.ownerID === member.id) return true;
		if (this.options.ignoredRoles.some(r => member.roles.cache.has(r))) return true;
		if (this.options.ignoredUsers.includes(member.id)) return true;
		if (this.options.ignoredEvents.includes(event)) return true;
		return false;
	}
	/**
	 * @param {Discord.GuildMember}
	 * @param {string}
	 */
	addCase(member, event) {
		const key = `${member.id}-${member.guild.id}-${Date.now()}`;
		this._cases.push({
			ID: member.id,
			key,
			guild: member.guild.id,
			event: event,
			date: Date.now()
		});
		setTimeout(() => {
			this._cases = this._cases.filter(c => c.key !== key);
		}, typeof this.options.time === "number" ? this.options.time : 10000);
	}
	/**
	 * @param  {Discord.GuildMember}
	 * @param  {string}
	 * @return {boolean}
	 */
	checkCase(member, event) {
		const _case = this._cases.filter(c => c.ID === member.id && c.guild === member.guild.id && event === c.event);
		if (_case && (_case.length - 1) >= this.options.rateLimit) return true;
		return false;
	}
	/**
	 * @param  {Discord.GuildMember}
	 * @param  {string}
	 * @param  {string}
	 * @return {undefined}
	 */
	punish(member, event, punishType = this.options.punishType) {

		this.emit("trying", member, event, punishType);

		switch (punishType) {
			case "removeRole":
				if (!member.manageable) {
					if (this.options.verbose) log(`AntiRaid (punish#userNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
				} else {
					const roles = member.roles.cache.filter(r => r.name !== "@everyone");
					if (!roles || roles.size <= 0) {
						this.punish(member, event, "kick"); // if the member don't have roles
						break;
					}
					for (const role of roles.array()) {
						if (role.permissions.toArray().find(p => blacklistedPermissions.includes(p))) {
							if (!role.editable) {
								if (this.options.verbose) log(`AntiRaid (punish#roleNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
							} else {
								if (member.user.bot) {
									role.setPermissions(0, "Anti-Raid")
										.then(() => this.emit("action", member, "roleEdited"))
										.catch(e => this.emit("error", e));
								} else {
									member.roles.remove(role)
										.then(() => this.emit("action", member, "roleRemoved"))
										.catch(e => this.emit("error", e));
								}
							}
						}
					}
				}
				break;
			case "editRole":
				if (!member.manageable) {
					if (this.options.verbose) log(`AntiRaid (punish#userNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
				} else {
					const roles = member.roles.cache.filter(r => r.name !== "@everyone");
					if (!roles || roles.size <= 0) {
						this.punish(member, event, "kick"); // if the member don't have roles
						break;
					}
					for (const role of roles.array()) {
						if (role.permissions.toArray().find(p => blacklistedPermissions.includes(p))) {
							if (!role.editable) {
								if (this.options.verbose) log(`AntiRaid (punish#roleNotManageable): ${member.user.tag} (ID: ${member.user.id}) could not be manageable, insufficient permissions`);
							} else {
								role
									.setPermissions(0, "Anti-Raid")
									.then(() => this.emit("action", member, "roleEdited"))
									.catch(e => this.emit("error", e));
							}
						}
					}
				}
				break;
			case "kick":
				if (!member.kickable) {
					if (this.options.verbose) log(`AntiRaid (punish#userNotKickable): ${member.user.tag} (ID: ${member.user.id}) could not be kicked, insufficient permissions`);
				} else {
					member.kick("Anti-Raid")
						.then(() => this.emit("action", member, "kicked"))
						.catch(e => this.emit("error", e));
				}
				break;
			case "ban":
				if (!member.bannable) {
					if (this.options.verbose) log(`AntiRaid (punish#userNotBannable): ${member.user.tag} (ID: ${member.user.id}) could not be banned, insufficient permissions`);
				} else {
					member.ban({
							reason: "Anti-Raid"
						})
						.then(() => this.emit("action", member, "banned"))
						.catch(e => this.emit("error", e));
				}
				break;
			default:
				throw new Error("Invalid punishType");
		}
	}
	/**
	 * Get current cases
	 * @param  {Function}
	 * @return {Array}
	 */
	getCases(func = () => true) {
		return this._cases.filter(func);
	}
}

module.exports = AntiRaid;