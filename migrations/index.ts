import * as migration_20260922_073920_initial_runtime_schema from './20260922_073920_initial_runtime_schema';
import * as migration_20260926_152500_auth_hardening from './20260926_152500_auth_hardening';

export const migrations = [
  {
    up: migration_20260922_073920_initial_runtime_schema.up,
    down: migration_20260922_073920_initial_runtime_schema.down,
    name: '20260922_073920_initial_runtime_schema'
  },
  {
    up: migration_20260926_152500_auth_hardening.up,
    down: migration_20260926_152500_auth_hardening.down,
    name: '20260926_152500_auth_hardening'
  },
];
