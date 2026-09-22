import * as migration_20260922_073920_initial_runtime_schema from './20260922_073920_initial_runtime_schema';

export const migrations = [
  {
    up: migration_20260922_073920_initial_runtime_schema.up,
    down: migration_20260922_073920_initial_runtime_schema.down,
    name: '20260922_073920_initial_runtime_schema'
  },
];
