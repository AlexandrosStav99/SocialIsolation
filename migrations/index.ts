import * as migration_20260922_073920_initial_runtime_schema from './20260922_073920_initial_runtime_schema';
import * as migration_20260926_152500_auth_hardening from './20260926_152500_auth_hardening';
import * as migration_20260926_190000_production_handoff from './20260926_190000_production_handoff';
import * as migration_20260926_203000_retention_deletion from './20260926_203000_retention_deletion';
import * as migration_20260926_220000_api_abuse_hardening from './20260926_220000_api_abuse_hardening';
import * as migration_20260927_132000_production_directory_onboarding from './20260927_132000_production_directory_onboarding';

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
  {
    up: migration_20260926_190000_production_handoff.up,
    down: migration_20260926_190000_production_handoff.down,
    name: '20260926_190000_production_handoff'
  },
  {
    up: migration_20260926_203000_retention_deletion.up,
    down: migration_20260926_203000_retention_deletion.down,
    name: '20260926_203000_retention_deletion'
  },
  {
    up: migration_20260926_220000_api_abuse_hardening.up,
    down: migration_20260926_220000_api_abuse_hardening.down,
    name: '20260926_220000_api_abuse_hardening'
  },
  {
    up: migration_20260927_132000_production_directory_onboarding.up,
    down: migration_20260927_132000_production_directory_onboarding.down,
    name: '20260927_132000_production_directory_onboarding'
  },
];
