import type ExtendedClient from '../structures/ExtendedClient.js';

export interface BotPlugin {
	name: string;
	version: string;
	author: string;
	description?: string;
	initialize: (client: ExtendedClient) => void;
	shutdown?: (client: ExtendedClient) => void;
}
