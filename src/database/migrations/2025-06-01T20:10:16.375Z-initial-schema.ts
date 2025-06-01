import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Guilds table - stores Discord server information
	await db.schema
		.createTable('guilds')
		.addColumn('id', 'varchar(20)', (col) => col.primaryKey())
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('owner_id', 'varchar(20)', (col) => col.notNull())
		.addColumn('member_count', 'integer', (col) => col.defaultTo(0))
		.addColumn('prefix', 'varchar(10)', (col) => col.defaultTo('!'))
		.addColumn('created_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.execute();

	// Users table - stores Discord user information
	await db.schema
		.createTable('users')
		.addColumn('id', 'varchar(20)', (col) => col.primaryKey())
		.addColumn('username', 'varchar(255)', (col) => col.notNull())
		.addColumn('discriminator', 'varchar(4)')
		.addColumn('avatar', 'varchar(255)')
		.addColumn('bot', 'boolean', (col) => col.defaultTo(false))
		.addColumn('created_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.execute();

	// Guild members table - relationship between users and guilds
	await db.schema
		.createTable('guild_members')
		.addColumn('guild_id', 'varchar(20)', (col) => col.notNull())
		.addColumn('user_id', 'varchar(20)', (col) => col.notNull())
		.addColumn('nickname', 'varchar(255)')
		.addColumn('joined_at', 'timestamptz', (col) => col.notNull())
		.addColumn('roles', 'jsonb') // PostgreSQL JSONB for role IDs array
		.addColumn('created_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addPrimaryKeyConstraint('guild_members_pk', ['guild_id', 'user_id'])
		.addForeignKeyConstraint('guild_members_guild_fk', ['guild_id'], 'guilds', ['id'], (cb) =>
			cb.onDelete('cascade'),
		)
		.addForeignKeyConstraint('guild_members_user_fk', ['user_id'], 'users', ['id'], (cb) =>
			cb.onDelete('cascade'),
		)
		.execute();

	// Commands table - stores command usage statistics
	await db.schema
		.createTable('commands')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('name', 'varchar(255)', (col) => col.notNull())
		.addColumn('guild_id', 'varchar(20)')
		.addColumn('user_id', 'varchar(20)', (col) => col.notNull())
		.addColumn('channel_id', 'varchar(20)', (col) => col.notNull())
		.addColumn('args', 'jsonb') // PostgreSQL JSONB for command arguments
		.addColumn('success', 'boolean', (col) => col.defaultTo(true))
		.addColumn('error_message', 'text')
		.addColumn('executed_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addForeignKeyConstraint('commands_guild_fk', ['guild_id'], 'guilds', ['id'], (cb) =>
			cb.onDelete('set null'),
		)
		.addForeignKeyConstraint('commands_user_fk', ['user_id'], 'users', ['id'], (cb) =>
			cb.onDelete('cascade'),
		)
		.execute();

	// Bot settings table - stores bot configuration per guild
	await db.schema
		.createTable('bot_settings')
		.addColumn('guild_id', 'varchar(20)', (col) => col.primaryKey())
		.addColumn('welcome_channel_id', 'varchar(20)')
		.addColumn('log_channel_id', 'varchar(20)')
		.addColumn('auto_role_id', 'varchar(20)')
		.addColumn('moderation_enabled', 'boolean', (col) => col.defaultTo(false))
		.addColumn('auto_mod_settings', 'jsonb') // PostgreSQL JSONB for auto-moderation settings
		.addColumn('custom_settings', 'jsonb') // PostgreSQL JSONB for additional custom settings
		.addColumn('created_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addColumn('updated_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addForeignKeyConstraint('bot_settings_guild_fk', ['guild_id'], 'guilds', ['id'], (cb) =>
			cb.onDelete('cascade'),
		)
		.execute();

	// Moderation logs table - stores moderation actions
	await db.schema
		.createTable('moderation_logs')
		.addColumn('id', 'serial', (col) => col.primaryKey())
		.addColumn('guild_id', 'varchar(20)', (col) => col.notNull())
		.addColumn('moderator_id', 'varchar(20)', (col) => col.notNull())
		.addColumn('target_id', 'varchar(20)', (col) => col.notNull())
		.addColumn('action', 'varchar(50)', (col) => col.notNull()) // ban, kick, mute, warn, etc.
		.addColumn('reason', 'text')
		.addColumn('duration', 'integer') // duration in seconds for temporary actions
		.addColumn('expires_at', 'timestamptz')
		.addColumn('active', 'boolean', (col) => col.defaultTo(true))
		.addColumn('created_at', 'timestamptz', (col) =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull(),
		)
		.addForeignKeyConstraint('moderation_logs_guild_fk', ['guild_id'], 'guilds', ['id'], (cb) =>
			cb.onDelete('cascade'),
		)
		.addForeignKeyConstraint(
			'moderation_logs_moderator_fk',
			['moderator_id'],
			'users',
			['id'],
			(cb) => cb.onDelete('cascade'),
		)
		.addForeignKeyConstraint('moderation_logs_target_fk', ['target_id'], 'users', ['id'], (cb) =>
			cb.onDelete('cascade'),
		)
		.execute();

	// Create indexes for better query performance
	await db.schema.createIndex('idx_commands_guild_id').on('commands').column('guild_id').execute();
	await db.schema.createIndex('idx_commands_user_id').on('commands').column('user_id').execute();
	await db.schema
		.createIndex('idx_commands_executed_at')
		.on('commands')
		.column('executed_at')
		.execute();
	await db.schema
		.createIndex('idx_moderation_logs_guild_id')
		.on('moderation_logs')
		.column('guild_id')
		.execute();
	await db.schema
		.createIndex('idx_moderation_logs_target_id')
		.on('moderation_logs')
		.column('target_id')
		.execute();
	await db.schema
		.createIndex('idx_moderation_logs_active')
		.on('moderation_logs')
		.column('active')
		.execute();
	await db.schema
		.createIndex('idx_moderation_logs_expires_at')
		.on('moderation_logs')
		.column('expires_at')
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('moderation_logs').execute();
	await db.schema.dropTable('bot_settings').execute();
	await db.schema.dropTable('commands').execute();
	await db.schema.dropTable('guild_members').execute();
	await db.schema.dropTable('users').execute();
	await db.schema.dropTable('guilds').execute();
}
