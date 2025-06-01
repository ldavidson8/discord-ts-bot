import { z } from 'zod';
import 'dotenv/config';
import pc from 'picocolors';

const envSchema = z.object({
	CLIENT_ID: z.string().min(1, { message: 'CLIENT_ID is required' }),
	DISCORD_TOKEN: z.string().min(1, { message: 'DISCORD_TOKEN is required' }),
	DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),
});

export type env = z.infer<typeof envSchema>;

const { data: env, error } = envSchema.safeParse(process.env);

if (error) {
	console.error(pc.red('❌ Invalid env:'));
	console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
	process.exit(1);
}

export default env!;
