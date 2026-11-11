import * as migration_20261104_155651_baseline from './20261104_155651_baseline';
import * as migration_20261104_161615_shop_catalogue from './20261104_161615_shop_catalogue';
import * as migration_20261104_181555_storage_fields from './20261104_181555_storage_fields';
import * as migration_20261104_184009_enrichment_ledger from './20261104_184009_enrichment_ledger';
import * as migration_20261104_195035_shop_orders from './20261104_195035_shop_orders';
import * as migration_20261105_093331_finance_model from './20261105_093331_finance_model';
import * as migration_20261105_102608_finance_pages from './20261105_102608_finance_pages';
import * as migration_20261105_104230_finance_calendar from './20261105_104230_finance_calendar';
import * as migration_20261110_100846_phase5_platform from './20261110_100846_phase5_platform';
import * as migration_20261110_103557_phase5_grain_prices from './20261110_103557_phase5_grain_prices';
import * as migration_20261110_153625_phase6_articles from './20261110_153625_phase6_articles';
import * as migration_20261110_160527_phase7_social from './20261110_160527_phase7_social';
import * as migration_20261110_183406_home_nav from './20261110_183406_home_nav';
import * as migration_20261111_065829_home_slides from './20261111_065829_home_slides';
import * as migration_20261111_155707_shop_foundations from './20261111_155707_shop_foundations';

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
    name: '20261105_102608_finance_pages',
  },
  {
    up: migration_20261105_104230_finance_calendar.up,
    down: migration_20261105_104230_finance_calendar.down,
    name: '20261105_104230_finance_calendar',
  },
  {
    up: migration_20261110_100846_phase5_platform.up,
    down: migration_20261110_100846_phase5_platform.down,
    name: '20261110_100846_phase5_platform',
  },
  {
    up: migration_20261110_103557_phase5_grain_prices.up,
    down: migration_20261110_103557_phase5_grain_prices.down,
    name: '20261110_103557_phase5_grain_prices',
  },
  {
    up: migration_20261110_153625_phase6_articles.up,
    down: migration_20261110_153625_phase6_articles.down,
    name: '20261110_153625_phase6_articles',
  },
  {
    up: migration_20261110_160527_phase7_social.up,
    down: migration_20261110_160527_phase7_social.down,
    name: '20261110_160527_phase7_social',
  },
  {
    up: migration_20261110_183406_home_nav.up,
    down: migration_20261110_183406_home_nav.down,
    name: '20261110_183406_home_nav',
  },
  {
    up: migration_20261111_065829_home_slides.up,
    down: migration_20261111_065829_home_slides.down,
    name: '20261111_065829_home_slides',
  },
  {
    up: migration_20261111_155707_shop_foundations.up,
    down: migration_20261111_155707_shop_foundations.down,
    name: '20261111_155707_shop_foundations'
  },
];
