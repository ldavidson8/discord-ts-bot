import fs from 'node:fs';
import {
	ApplicationCommandType,
	Client,
	type ClientOptions,
	Collection,
	type ColorResolvable,
	PermissionsBitField,
	REST,
	type RESTPostAPIApplicationCommandsJSONBody,
	Routes,
	WebhookClient,
} from 'discord.js';
import config from '../config.js';
import { ClusterClient } from 'discord-hybrid-sharding';
import logger from '../utils/logger.js';
import type Command from './Command.js';
import { ExtendedEmbedBuilder } from '../functions/embed.js';
import { ExtendedButtonBuilder } from '../functions/button.js';
import env from '../env.js';
import type { DB } from '../database/types.js';
import { connectDb } from '../database/index.js';
import type { Kysely } from 'kysely';

interface WebhookConfig {
	cmdlogs: string;
	guildlogs: string;
	errorlogs: string;
}

export default class ExtendedClient extends Client {
	constructor(options: ClientOptions) {
		super(options);
		this.on('debug', (data) => this.logger.debug(data));
	}
	public commands: Collection<string, any> = new Collection();
	public aliases: Collection<string, string> = new Collection();
	public cooldown: Collection<string, any> = new Collection();
	public config = config.client;
	public cluster = new ClusterClient(this);
	public logger = logger;
	public readonly color = config.color;
	public readonly links = config.links;
	private body: RESTPostAPIApplicationCommandsJSONBody[] = [];
	public database: Kysely<DB> | null = null;

	public readonly prefix = config.commands.prefix;

	public readonly development = this.config.development;

	public embed = (color?: ColorResolvable) => new ExtendedEmbedBuilder(color || '#5865F2');

	public button = () => new ExtendedButtonBuilder();

	public webhooks = Object.fromEntries(
		Object.entries(config.webhooks).map(([hook, url]) => [
			hook as keyof WebhookConfig,
			new WebhookClient({ url }),
		]),
	) as { [key in keyof WebhookConfig]: WebhookClient };

	public async start(token: string): Promise<void> {
		await this.loadCommands();
		this.logger.info('[CLIENT] Commands loaded successfully.');
		await this.loadEvents();
		this.logger.info('[CLIENT] Events loaded successfully.');

		this.database = await connectDb();
		await this.login(token);
	}

	private async loadCommands(): Promise<void> {
		const commandsPath = fs.readdirSync(new URL('../commands', import.meta.url));

		for (const dir of commandsPath) {
			const commandFiles = fs
				.readdirSync(new URL(`../commands/${dir}`, import.meta.url))
				.filter((file) => file.endsWith('.js'));
			for (const file of commandFiles) {
				const cmdModule = await import(`../commands/${dir}/${file}`);
				const command: Command = new cmdModule.default(this, file);
				command.category = dir;

				this.commands.set(command.name, command);
				command.aliases.forEach((alias: string) => {
					this.aliases.set(alias, command.name);
				});

				if (command.slashCommand) {
					const data: RESTPostAPIApplicationCommandsJSONBody = {
						name: command.name,
						description: command.description.content,
						type: ApplicationCommandType.ChatInput,
						options: command.options || [],
						default_member_permissions:
							Array.isArray(command.permissions.user) && command.permissions.user.length > 0
								? PermissionsBitField.resolve(command.permissions.user as any).toString()
								: null,
						name_localizations: null,
						description_localizations: null,
					};
					this.body.push(data);
				}
			}
		}
	}

	public async deployCommands(guildId?: string): Promise<void> {
		const route = guildId
			? Routes.applicationGuildCommands(this.user?.id ?? '', guildId)
			: Routes.applicationCommands(this.user?.id ?? '');

		try {
			const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN ?? '');
			await rest.put(route, {
				body: this.body,
			});
		} catch (error) {
			this.logger.error(error, this);
		}
	}

	private async loadEvents(): Promise<void> {
		const eventsPath = fs.readdirSync(new URL('../events', import.meta.url));

		for (const dir of eventsPath) {
			const eventFiles = fs
				.readdirSync(new URL(`../events/${dir}`, import.meta.url))
				.filter((file) => file.endsWith('.js'));
			for (const file of eventFiles) {
				const eventModule = await import(`../events/${dir}/${file}`);
				const event = new eventModule.default(this, file);

				this.on(event.name, (...args) => event.run(...args));
			}
		}
	}
}
