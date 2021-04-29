/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.accounts',
  name: 'DashboardAccounts',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'homeDenomination',
    'tableViewAccountDAO',
    'balanceDAO',
    'user'
  ],

  documentation: `
    A configurable view to to render a card with
    configurable contents and rich choice view dropdowns
  `,

  css:`
    ^card-header-title {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }

    ^card-header-container {
      margin-bottom: 8px;
    }

    ^card-container {
      padding: 34px 0;
    }

    ^balance-card {
      padding: 0 16px;
    }

    ^balance-note {
      font-style: italic;
      font-size: 12px;
      line-height: 1.5;
      color: #5e6061;
    }

    ^balance {
      font-size: 20px;
      font-weight: 600;
      line-height: 1.2;
      margin-bottom: 4px;
    }

    ^ .net-nanopay-account-AccountDAOBrowserView-browse-view-container {
      margin: 0;
    }
  `,

  requires: [
    'foam.dao.ArraySink',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.mlang.sink.GroupBy',
    'foam.u2.borders.CardBorder',
    'net.nanopay.account.Account',
    'foam.comics.v2.DAOBrowserView',
    'foam.comics.v2.DAOControllerConfig'
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'ACCOUNTS',
    },
    {
      name: 'BALANCE_NOTE',
      message: 'Total value shown in home currency',
    },
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'currency'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({
          defaultColumns: [
            ['name', { tableWidth: undefined }],
            ['balance', { tableWidth: 200 }],
            ['homeBalance', { tableWidth: 200 }]
          ],
          filterExportPredicate: this.NEQ(foam.nanos.export.ExportDriverRegistry.ID, 'CSV'),
          dao: this.tableViewAccountDAO.where(this.OR(this.INSTANCE_OF(net.nanopay.account.ShadowAccount),
            this.INSTANCE_OF(net.nanopay.account.AggregateAccount),
            foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.SecuritiesAccount' }),
foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' })
          ))
        });
      }
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(homeDenomination, currency, tableViewAccountDAO, config) {
          return self.E()
              .start(self.Rows).addClass(this.myClass('card-container'))
                .start().addClass(this.myClass('balance-card'))
                  .start(self.Rows)
                    .start(self.Cols).style({'align-items': 'center'}).addClass(this.myClass('card-header-container'))
                      .start().add(self.CARD_HEADER).addClass(this.myClass('card-header-title')).end()
                    .end()
                    .start().addClass(this.myClass('balance'))
                      .add(
                            currency.select().then(denomBalances => {
                              let baseTotal = 0;
                              denomBalances.array.forEach(denomBalance => {
                                baseTotal += denomBalance.total;
                              })

                              // for inversing sign because of trusts temp fix
                              if ( baseTotal < 0) baseTotal *= -1;

                              return self.__subSubContext__.currencyDAO.find(homeDenomination).then(curr => baseTotal != null ?  curr.format(baseTotal) : 0);
                            })
                          )
                    .end()
                    .start().addClass(this.myClass('balance-note'))
                      .add(self.BALANCE_NOTE)
                      .add(` (${homeDenomination})`)
                    .end()
                  .end()
                .end()
                .start()
                  .start(net.nanopay.account.AccountDAOBrowserView, {
                    config
                  })
                    .addClass(this.myClass('accounts-table'))
                  .end()
                .end()
            .end();
        }));
    }
  ]
});
