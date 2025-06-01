import { Pool } from 'pg';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import env from '../env.js';
import type { DB } from './types.js';

const dialect = new PostgresDialect({
	pool: new Pool({
		connectionString: env.DATABASE_URL,
		port: 5432,
		max: 20,
		min: 4,
		client_encoding: 'utf8',
		idleTimeoutMillis: 1000,
		connectionTimeoutMillis: 1000,
	}),
});

export const db = new Kysely<DB>({
	dialect,
	plugins: [new CamelCasePlugin()],
});

export async function connectDb(): Promise<Kysely<DB>> {
	try {
		// Test the connection with a simple query
		await db.selectFrom('guildSettings').select('guildId').limit(1).execute();
		return db;
	} catch (error) {
		console.error('Database connection failed:', error);
		throw error;
	}
}
