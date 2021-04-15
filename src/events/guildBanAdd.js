module.exports = class {
	constructor(anti) {
		this.anti = anti;
		this.filename = __filename.slice(__dirname.length + 1, -3);
	}
	async run(guild, user) {
		if (!guild.hasOwnProperty("fetchAuditLogs")) return;
		guild.fetchAuditLogs({
			type: "MEMBER_KICK"
		}).then(audit => audit.entries.first()).then(async entry => {
			if (user.id !== entry.target.id) return;
			let member = await guild.members.fetch(entry.executor.id).catch(() => null);
			if (!member || this.anti.isIgnored(member, this.filename)) return;
			if (this.anti.checkCase(member, this.filename)) this.anti.punish(member, this.filename);
			else this.anti.addCase(member, this.filename);
		}).catch(() => null);
	}
};