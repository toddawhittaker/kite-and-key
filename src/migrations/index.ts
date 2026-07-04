import * as migration_20260704_160722_initial from './20260704_160722_initial';

export const migrations = [
  {
    up: migration_20260704_160722_initial.up,
    down: migration_20260704_160722_initial.down,
    name: '20260704_160722_initial'
  },
];
