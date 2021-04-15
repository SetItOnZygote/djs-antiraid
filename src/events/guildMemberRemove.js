module.exports = class {
	constructor(anti) {
		this.anti = anti;
		this.filename = __filename.slice(__dirname.length + 1, -3);
	}
	async run(m) {
		if (!m || !m.guild || !m.guild.hasOwnProperty("fetchAuditLogs")) return;
		m.guild.fetchAuditLogs({
			type: "MEMBER_KICK"
		}).then(audit => audit.entries.first()).then(async entry => {
			if (m.id !== entry.target.id) return;
			let member = await m.guild.members.fetch(entry.executor.id).catch(() => null);
			if (!member || this.anti.isIgnored(member, this.filename)) return;
			if (this.anti.checkCase(member, this.filename)) this.anti.punish(member, this.filename);
			else this.anti.addCase(member, this.filename);
		}).catch(() => null);
	}
};