import * as migration_20261104_155651_baseline from './20261104_155651_baseline';
import * as migration_20261104_161615_shop_catalogue from './20261104_161615_shop_catalogue';
import * as migration_20261104_181555_storage_fields from './20261104_181555_storage_fields';

export const migrations = [
  {
    up: migration_20261104_155651_baseline.up,
    down: migration_20261104_155651_baseline.down,
    name: '20261104_155651_baseline',
  },
  {
    up: migration_20261104_161615_shop_catalogue.up,
    down: migration_20261104_161615_shop_catalogue.down,
    name: '20261104_161615_shop_catalogue',
  },
  {
    up: migration_20261104_181555_storage_fields.up,
    down: migration_20261104_181555_storage_fields.down,
    name: '20261104_181555_storage_fields'
  },
];
