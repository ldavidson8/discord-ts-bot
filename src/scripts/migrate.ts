import * as path from 'node:path';
import { Pool } from 'pg';
import { promises as fs } from 'node:fs';
import { Kysely, Migrator, PostgresDialect, FileMigrationProvider } from 'kysely';
import env from '../env.js';

async function migrateToLatest() {
	const pool = new Pool({
		connectionString: env.DATABASE_URL,
	});

	const db = new Kysely<any>({
		dialect: new PostgresDialect({ pool }),
	});

	const migrationProvider = new FileMigrationProvider({
		fs,
		path,
		migrationFolder: path.join(process.cwd(), 'src', 'database', 'migrations'),
	});

	const migrator = new Migrator({
		db,
		provider: migrationProvider,
	});

	try {
		const { error, results } = await migrator.migrateToLatest();
		if (error) {
			console.error('Migration failed:', error);
			return;
		}
		console.log('Migration results:', results);
	} catch (err) {
		console.error('An error occurred during migration:', err);
	} finally {
		await db.destroy();
	}
}

migrateToLatest();
