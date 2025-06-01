import type ExtendedClient from '../structures/ExtendedClient.js';
import type { BotPlugin } from './index.js';

const updateStatusPlugin: BotPlugin = {
	name: 'Update Status Plugin',
	version: '1.0.0',
	author: 'ldavidson8',
	initialize: (client: ExtendedClient) => {
		client.on('ready', () => {
			const { user } = client;
			if (user) {
				user.setPresence(client.config.presence);
			}
		});
	},
};

export default updateStatusPlugin;
