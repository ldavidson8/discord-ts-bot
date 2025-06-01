import Command from '../../structures/Command.js';
import type ExtendedClient from '../../structures/ExtendedClient.js';
import type Context from '../../structures/Context.js';

export default class InfoCommand extends Command {
	constructor(client: ExtendedClient, file: string) {
		super(client, {
			name: 'info',
			description: {
				content: 'Display information about the bot including latency and system stats',
				usage: 'info',
				examples: ['info'],
			},
			category: 'information',
			aliases: ['botinfo', 'stats'],
			cooldown: 5,
			permissions: {
				dev: false,
				client: ['SendMessages', 'ReadMessageHistory', 'ViewChannel', 'EmbedLinks'],
				user: [],
			},
			slashCommand: true,
			options: [],
		});
	}

	public async run(client: ExtendedClient, ctx: Context): Promise<void> {
		try {
			const apiLatency = client.ws.ping;
			const start = Date.now();
			await client.database?.selectFrom('guilds').select('id').limit(1).execute();
			const dbLatency = Date.now() - start;
			const createdTimestamp = ctx.isInteraction
				? ctx.interaction?.createdTimestamp
				: ctx.message?.createdTimestamp;

			const responseTime = createdTimestamp ? Date.now() - createdTimestamp : 0;

			const cpuUsage =
				((process.cpuUsage().user + process.cpuUsage().system) / 1000 / 100).toFixed(2) + '%';
			const memoryUsage = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;
			const platform = process.platform;

			// Safely access uptime, providing a fallback if client.uptime is null
			const uptimeInSeconds = client.uptime ? Math.floor(client.uptime / 1000) : 0;

			const descArr = [
				`**Bot Information**`,
				`> -# **Name:** \`${client.user?.username}\``,
				`> -# **ID:** \`${client.user?.id}\``,
				`> -# **Guilds:** \`${client.guilds.cache.size}\``,
				`> -# **Uptime:** \`${uptimeInSeconds} seconds\``,
				`**Latency Details**`,
				`> -# **API Latency:** \`${apiLatency}ms\``,
				`> -# **Response Time:** \`${responseTime}ms\``,
				`> -# **Database Latency:** \`${dbLatency}ms\``,
				`**System Details**`,
				`> -# **CPU Usage:** \`${cpuUsage}\``,
				`> -# **Memory Usage:** \`${memoryUsage}\``,
				`> -# **Platform:** \`${platform}\``,
			];

			const embed = this.client
				.embed()
				.author({
					name: `Bot Information`, // Changed from "Bot Latency" for better context
					iconURL: this.client.user?.displayAvatarURL(),
				})
				.desc(descArr.join('\n'));

			await ctx.sendMessage({
				// Added await
				embeds: [embed],
			});
		} catch (error) {
			console.error('Error in InfoCommand:', error);
			// You might want to inform the user that an error occurred:
			// try {
			//   await ctx.sendMessage({ content: "Sorry, an error occurred while fetching bot information." });
			// } catch (sendError) {
			//   console.error("Error sending error message to user:", sendError);
			// }
		}
	}
}
