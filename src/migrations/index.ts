import * as migration_20260704_160722_initial from './20260704_160722_initial';
import * as migration_20260705_170608_add_profile_outcome from './20260705_170608_add_profile_outcome';

export const migrations = [
  {
    up: migration_20260704_160722_initial.up,
    down: migration_20260704_160722_initial.down,
    name: '20260704_160722_initial',
  },
  {
    up: migration_20260705_170608_add_profile_outcome.up,
    down: migration_20260705_170608_add_profile_outcome.down,
    name: '20260705_170608_add_profile_outcome'
  },
];
