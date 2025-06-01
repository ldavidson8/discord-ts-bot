import { ChatInputCommandInteraction, CommandInteraction } from 'discord.js';
import Context from '../../structures/Context.js';
import Event from '../../structures/Event.js';
import type ExtendedClient from '../../structures/ExtendedClient.js';
import config from '../../config.js';

export default class InteractionCreate extends Event {
	constructor(client: ExtendedClient, file: string) {
		super(client, file, {
			name: 'interactionCreate',
		});
	}

	public async run(interaction: CommandInteraction): Promise<any> {
		if (!interaction.isCommand()) return;
		if (interaction.user.bot) return;

		if (!config.commands.application_commands.chat_input && interaction.isChatInputCommand())
			return;

		const context = new Context(
			interaction as ChatInputCommandInteraction,
			interaction.options.data as any,
		);
		context.setArgs(interaction.options.data as any);

		return this.client.emit('ctxCreate', context);
	}
}
