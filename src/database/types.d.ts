/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface GuildSettings {
  createdAt: Generated<Timestamp>;
  guildId: string;
  logChannelId: string | null;
  moderationEnabled: Generated<boolean | null>;
  prefix: Generated<string | null>;
  updatedAt: Generated<Timestamp>;
  welcomeChannelId: string | null;
}

export interface DB {
  guildSettings: GuildSettings;
}
