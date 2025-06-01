import Event from '../../structures/Event.js';
import type ExtendedClient from '../../structures/ExtendedClient.js';

export default class Ready extends Event {
	constructor(client: ExtendedClient, file: string) {
		super(client, file, {
			name: 'ready',
		});
	}

	public async run(): Promise<void> {
		this.client.guilds.fetch();
		this.client.logger.start(`[CLIENT] ${this.client.user?.tag} is ready!`);
		await this.client.deployCommands();
		this.client.logger.success('[CLIENT] Slash commands have been deployed globally.');
	}
}
