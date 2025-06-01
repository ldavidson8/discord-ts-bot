import { Collection } from 'discord.js';
import { RateLimitManager } from '@sapphire/ratelimits';
import Context from '../structures/Context.js';
import Command from '../structures/Command.js';
import { limited } from './rate-limiter.js';
import { millisecondsToSeconds } from 'date-fns';

const cooldownRateLimitManager = new RateLimitManager(5000);

export const checkCooldown = async (ctx: Context, command: Command) => {
	const client = ctx.client;
	if (!ctx.author) return;

	if (limited(ctx.author.id)) return true;

	if (!client.cooldown.has(command.name)) {
		client.cooldown.set(command.name, new Collection());
	}

	const now = Date.now();
	const timestamps = client.cooldown.get(command.name);
	const cooldownAmount = command.cooldown * 1000 || 5000;

	if (timestamps.has(ctx.author.id)) {
		const expirationTime = timestamps.get(ctx.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = expirationTime - now;
			const cooldownRlBucket = cooldownRateLimitManager.acquire(`${ctx.author.id}-${command.name}`);
			if (cooldownRlBucket.limited) return true;
			try {
				cooldownRlBucket.consume();
			} catch {
				null;
			}

			let cooldownMsg = await ctx.errorReply(
				`Please wait ${millisecondsToSeconds(
					timeLeft,
				)} more second(s) before reusing this command.`,
			);

			setTimeout(() => {
				cooldownMsg.delete().catch(() => null);
			}, timeLeft);

			return true;
		}
	}

	timestamps.set(ctx.author.id, now);
	setTimeout(() => timestamps.delete(ctx.author?.id), cooldownAmount);
	return false;
};
