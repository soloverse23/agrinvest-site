import * as migration_20261104_155651_baseline from './20261104_155651_baseline';
import * as migration_20261104_161615_shop_catalogue from './20261104_161615_shop_catalogue';

export const migrations = [
  {
    up: migration_20261104_155651_baseline.up,
    down: migration_20261104_155651_baseline.down,
    name: '20261104_155651_baseline',
  },
  {
    up: migration_20261104_161615_shop_catalogue.up,
    down: migration_20261104_161615_shop_catalogue.down,
    name: '20261104_161615_shop_catalogue'
  },
];
