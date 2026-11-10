# AEO queries · Întrebări pentru motoarele de răspuns

Representative questions people ask search engines and AI assistants about Agrinvest's business, each mapped to the page that should answer it. `npm run check:aeo` fetches each page and checks that the **evidence** (a phrase from the expected answer, case-insensitive) is in the server-rendered HTML, and that the page shows an update date. Re-run after launch (Phase 10) together with real assistant answers.

The answers must stay consistent with the figures register: evidence phrases avoid numbers that are still "to confirm" wherever a wording does the job.

| #   | Locale | Query                                                  | Page                                          | Evidence                                   |
| --- | ------ | ------------------------------------------------------ | --------------------------------------------- | ------------------------------------------ |
| 1   | ro     | unde vând grâu în Buzău                                | /cereale/grau                                 | baza cea mai apropiată                     |
| 2   | ro     | cine cumpără cereale direct de la fermieri             | /cereale                                      | direct de la fermieri                      |
| 3   | ro     | când primesc banii pe cereale la Agrinvest             | /cereale                                      | imediat după recepție                      |
| 4   | ro     | Agrinvest capacitate depozitare                        | /depozitare                                   | capacitatea totală                         |
| 5   | ro     | depozitare cereale siloz pentru fermieri               | /depozitare                                   | depozitare                                 |
| 6   | ro     | uscare porumb la recepție                              | /depozitare/uscare                            | umiditatea de depozitare                   |
| 7   | ro     | cât costă uscarea cerealelor                           | /depozitare/uscare                            | costul depinde                             |
| 8   | ro     | baza Agrinvest Pogoanele                               | /baze/pogoanele                               | Baza Agrinvest Pogoanele                   |
| 9   | ro     | vând floarea-soarelui Agrinvest                        | /cereale/floarea-soarelui                     | floarea-soarelui direct de la fermieri     |
| 10  | ro     | preț porumb la recepție cum se stabilește              | /cereale/porumb                               | masă hectolitrică                          |
| 11  | ro     | credit agricol rate după recoltă                       | /finantare                                    | rate                                       |
| 12  | ro     | Agrinvest Credit IFN registrul BNR                     | /finantare                                    | Registrul Special                          |
| 13  | ro     | ce garanții acceptă Agrinvest Credit IFN               | /finantare                                    | subvenții APIA                             |
| 16  | ro     | transport cereale de la fermă                          | /logistica                                    | flota proprie                              |
| 17  | ro     | Agrinvest capital românesc                             | /despre                                       | capital                                    |
| 18  | ro     | locuri de muncă agronom Agrinvest                      | /cariere                                      | agronomi                                   |
| 19  | ro     | Agrinvest contact telefon                              | /contact                                      | Cu cine vorbești                           |
| 20  | ro     | cum devin partener Agrinvest                           | /parteneri                                    | parteneri                                  |
| 21  | en     | Romanian wheat supplier                                | /en/grain/wheat                               | Romanian farmers                           |
| 22  | en     | grain storage Romania                                  | /en/storage                                   | storage bases                              |
| 23  | en     | grain drying Romania at reception                      | /en/storage/drying                            | storage moisture                           |
| 24  | en     | agricultural lending Romania non-bank                  | /en/financing                                 | non-bank financial institution             |
| 25  | en     | Agrinvest Credit IFN guarantees                        | /en/financing                                 | APIA subsidies                             |
| 26  | en     | Romanian corn supplier                                 | /en/grain/corn                                | corn directly from Romanian farmers        |
| 27  | en     | Agrinvest Romania company                              | /en/about                                     | Romanian capital                           |
| 28  | en     | partner with a Romanian agribusiness input distributor | /en/partners                                  | Input makers                               |
| 29  | en     | grain logistics Romania own fleet                      | /en/logistics                                 | own fleet                                  |
| 30  | en     | Agrinvest Pogoanele base                               | /en/bases/pogoanele                           | Agrinvest Pogoanele base                   |
| 32  | en     | how to sell grain to Agrinvest                         | /en/grain                                     | How selling grain to Agrinvest works       |
| 33  | ro     | magazin semințe și erbicide Agrinvest                  | /magazin                                      | Semințe                                    |
| 34  | ro     | ce erbicide vinde Agrinvest                            | /magazin/erbicide                             | Erbicide pentru porumb, cereale            |
| 35  | ro     | număr de omologare Karate Zeon                         | /magazin/insecticide/karate-zeon              | 1812/04.12.1997                            |
| 36  | ro     | substanța activă din Karate Zeon                       | /magazin/insecticide/karate-zeon              | Lambda-cihalotrin                          |
| 37  | ro     | produse pentru grâu                                    | /magazin/cultura/grau                         | Produse pentru grâu                        |
| 38  | en     | Agrinvest farm input shop                              | /en/shop                                      | Seeds, crop protection                     |
| 39  | en     | Karate Zeon active ingredient                          | /en/shop/insecticides/karate-zeon             | lambda-cyhalothrin                         |
| 40  | ro     | simulator credit agricol                               | /finantare/simulator                          | Vezi cum ar putea cădea                    |
| 41  | ro     | cerere credit agricol online                           | /finantare/aplica                             | Trimite o cerere de finanțare              |
| 42  | ro     | ce este Agrinvest Credit IFN                           | /finantare/despre-ifn                         | Agrinvest Credit IFN este instituția       |
| 43  | ro     | credit pentru inputuri agricole                        | /finantare/credit-productie                   | Creditul de producție acoperă cheltuielile |
| 44  | ro     | credit pentru utilaje agricole                         | /finantare/credit-investitii/utilaje          | Finanțăm tractoare, combine și alte        |
| 45  | ro     | credit pentru irigații                                 | /finantare/credit-investitii/irigatii         | Finanțăm sisteme de irigații pentru        |
| 46  | ro     | finanțare stocuri de cereale                           | /finantare/finantare-stocuri                  | Finanțarea stocurilor îți aduce bani       |
| 47  | ro     | credit pe contract de vânzare cereale                  | /finantare/credit-contracte-cereale           | Dacă ai deja un contract                   |
| 48  | ro     | restructurare datorii fermă                            | /finantare/restructurare                      | Dacă ferma are datorii greu                |
| 49  | ro     | credit pe adeverința APIA                              | /finantare/ghiduri/credit-adeverinta-apia     | Creditul pe adeverința APIA îți            |
| 50  | ro     | când plătește APIA subvențiile                         | /finantare/ghiduri/plata-subventii-apia       | Pentru campania 2026, APIA plătește        |
| 51  | ro     | ce garantează FGCR                                     | /finantare/ghiduri/fonduri-garantare          | FGCR și FNGCIMM nu dau                     |
| 52  | ro     | IFN sau bancă pentru fermieri                          | /finantare/ghiduri/ifn-sau-banca              | Banca are de regulă costuri                |
| 53  | ro     | credit sau leasing pentru tractor                      | /finantare/ghiduri/credit-sau-leasing-utilaje | La credit, utilajul este al                |
| 54  | ro     | costul real al unui credit agricol                     | /finantare/ghiduri/costul-real-al-creditului  | Costul real al unui credit                 |
| 55  | ro     | ce înseamnă marjă la credit                            | /finantare/ghiduri/glosar                     | Marjă                                      |
| 56  | en     | farm loan repayment simulator Romania                  | /en/financing/simulator                       | See how the instalments of                 |
| 57  | en     | apply for a farm loan in Romania                       | /en/financing/apply                           | Send a financing application to            |
| 58  | en     | Agrinvest Credit IFN production loan                   | /en/financing/production-credit               | A production loan covers the               |
| 59  | en     | APIA certificate loan interest cap                     | /en/financing/guides/apia-certificate-credit  | An APIA certificate loan brings            |
