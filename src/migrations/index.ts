import * as migration_20261104_155651_baseline from './20261104_155651_baseline';
import * as migration_20261104_161615_shop_catalogue from './20261104_161615_shop_catalogue';
import * as migration_20261104_181555_storage_fields from './20261104_181555_storage_fields';
import * as migration_20261104_184009_enrichment_ledger from './20261104_184009_enrichment_ledger';
import * as migration_20261104_195035_shop_orders from './20261104_195035_shop_orders';
import * as migration_20261105_093331_finance_model from './20261105_093331_finance_model';
import * as migration_20261105_102608_finance_pages from './20261105_102608_finance_pages';

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
    name: '20261104_181555_storage_fields',
  },
  {
    up: migration_20261104_184009_enrichment_ledger.up,
    down: migration_20261104_184009_enrichment_ledger.down,
    name: '20261104_184009_enrichment_ledger',
  },
  {
    up: migration_20261104_195035_shop_orders.up,
    down: migration_20261104_195035_shop_orders.down,
    name: '20261104_195035_shop_orders',
  },
  {
    up: migration_20261105_093331_finance_model.up,
    down: migration_20261105_093331_finance_model.down,
    name: '20261105_093331_finance_model',
  },
  {
    up: migration_20261105_102608_finance_pages.up,
    down: migration_20261105_102608_finance_pages.down,
    name: '20261105_102608_finance_pages'
  },
];
