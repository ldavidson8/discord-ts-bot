import pc from 'picocolors';
import { format } from 'date-fns';
import { pino } from 'pino';
import type ExtendedClient from '../structures/ExtendedClient.js';

export type LogLevel = keyof typeof styles;

const styles = {
	info: { color: pc.cyan, display: 'INFO' },
	debug: { color: pc.gray, display: 'DEBUG' },
	error: { color: pc.red, display: 'ERROR' },
	warn: { color: pc.yellow, display: 'WARNING' },
	success: { color: pc.green, display: 'SUCCESS' },
	log: { color: pc.white, display: 'LOG' },
	start: { color: pc.yellow, display: 'READY' },
};

const pinoLogger = pino({ transport: { target: 'pino-pretty' } });

export default class Logger {
	private static logger(level: LogLevel, content: string) {
		const style = styles[level];

		const now = new Date();
		const formattedTime = format(now, 'dd-MM-yyyy HH:mm:ss') + ' UTC';

		const message = `${pc.gray(formattedTime)} - ${style.color(
			style.display,
		)} - ${pc.white(content)}`;

		switch (level) {
			case 'info':
			case 'log':
			case 'success':
			case 'start':
				pinoLogger.info(message);
				break;
			case 'debug':
				pinoLogger.debug(message);
				break;
			case 'warn':
				pinoLogger.warn(message);
				break;
			case 'error':
				pinoLogger.error(message);
				break;
			default:
				pinoLogger.info(message); // Fallback for any unmapped levels
		}
	}

	static info(content: string) {
		this.logger('info', content);
	}

	static debug(content: string) {
		const sanitizedContent = content.replace(/\n/g, ',');
		this.logger('debug', sanitizedContent);
	}

	static warn(content: string) {
		this.logger('warn', content);
	}

	static success(content: string) {
		this.logger('success', content);
	}

	static log(content: string) {
		this.logger('log', content);
	}

	static start(content: string) {
		this.logger('start', content);
	}

	static error(content: any, client: ExtendedClient) {
		this.logger('error', content);
		client.webhooks.errorlogs.send({
			username: `error-logs`,
			avatarURL: `${client.user?.displayAvatarURL() || ''}`,
			embeds: [client.embed(client.color.error).desc(content)],
		});
	}
}
