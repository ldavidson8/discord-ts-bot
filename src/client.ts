import { getInfo } from 'discord-hybrid-sharding';
import { type ClientOptions, GatewayIntentBits, Partials } from 'discord.js';
import env from './env.js';
import ExtendedClient from './structures/ExtendedClient.js';

const options: ClientOptions = {
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
	shards: getInfo().SHARD_LIST,
	shardCount: getInfo().TOTAL_SHARDS,
	failIfNotExists: false,
	sweepers: {
		users: {
			filter: () => (user) => user.id !== env.CLIENT_ID,
			interval: 3600,
		},
		guildMembers: {
			filter: () => (member) => member.user.id !== env.CLIENT_ID,
			interval: 3600,
		},
	},
	partials: [
		Partials.User,
		Partials.Channel,
		Partials.Message,
		Partials.GuildMember,
		Partials.Reaction,
	],
};

const client = new ExtendedClient(options);
client.start(env.DISCORD_TOKEN);
