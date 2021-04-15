module.exports = class {
	constructor(anti) {
		this.anti = anti;
		this.filename = __filename.slice(__dirname.length + 1, -3);
	}
	async run(role) {
		if (!role || !role.guild || !role.guild.hasOwnProperty("fetchAuditLogs")) return;
		role.guild.fetchAuditLogs({
			type: "ROLE_CREATE"
		}).then(audit => audit.entries.first()).then(async entry => {
			if (role.id !== entry.target.id) return;
			let member = await role.guild.members.fetch(entry.executor.id).catch(() => null);
			if (!member || this.anti.isIgnored(member, this.filename)) return;
			if (this.anti.checkCase(member, this.filename)) this.anti.punish(member, this.filename);
			else this.anti.addCase(member, this.filename);
		}).catch(() => null);
	}
};