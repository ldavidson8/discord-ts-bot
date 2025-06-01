import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('guild_settings')
		.addColumn('guild_id', 'varchar(20)', (col) => col.primaryKey())
		.addColumn('prefix', 'varchar(10)', (col) => col.defaultTo('!'))
		.addColumn('welcome_channel_id', 'varchar(20)')
		.addColumn('log_channel_id', 'varchar(20)')
		.addColumn('moderation_enabled', 'boolean', (col) => col.defaultTo(false))
		.addColumn('created_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('guild_settings').execute();
}
