// TODO: Going to be reworked

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
  package: 'net.nanopay.cb.central',
  name: 'Dashboard',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.layout.Card',
    'foam.u2.layout.Grid',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.comics.v2.DAOBrowserView',
    'foam.comics.v2.DAOControllerConfig',
    'net.nanopay.liquidity.ui.dashboard.accounts.DashboardAccounts',
    'net.nanopay.liquidity.ui.dashboard.liquidity.DashboardLiquidity',
    'net.nanopay.liquidity.ui.dashboard.currencyExposure.CurrencyExposureDAO'
  ],

  imports: [
    'accountBalanceWeeklyCandlestickDAO as accountBalancesOverTime',
    'liquidityThresholdWeeklyCandlestickDAO',
    'transactionDAO',
    'accountDAO'
  ],

  exports: [
    'filteredAccountDAO',
    'liquidityAccountDAO'
  ],

  css: `
    ^header-container {
      padding: 32px 32px 0px 32px;
    }

    ^header {
      font-size: 36px;
      font-weight: 600;
      line-height: 1.33;
    }

    ^last-updated {
      margin-left: 24px;
    }

    ^dashboard-container {
      grid-column-gap: 16px;
      grid-row-gap: 32px;
      padding: 32px;
    }

    ^ .foam-u2-ActionView-refresh span {
      vertical-align: middle;
    }

    ^ .foam-u2-tag-Select {
      font-size: 10px;
    }
  `,

  properties: [
    {
      class: 'DateTime',
      name: 'lastUpdated',
      factory: function() {
        return new Date();
      }
    },
    {
      name: 'filteredAccountDAO',
      expression: function(accountDAO){
        return accountDAO.where(
          this.AND(
            this.INSTANCE_OF(net.nanopay.account.TrustAccount),
            this.EQ(net.nanopay.account.Account.DENOMINATION,"CAD"),
            this.NOT(this.EQ(net.nanopay.account.Account.ID,99999))
          )
        )
      }
    },
    {
      name: 'liquidityAccountDAO',
      expression: function(accountDAO){
        return accountDAO.where(
          this.AND(
            this.INSTANCE_OF(net.nanopay.settlement.SettlementAccount),
            this.EQ(net.nanopay.account.Account.DENOMINATION,"CAD")
          )
        )
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'currencyExposureDAO',
      expression: function(lastUpdated,filteredAccountDAO) {
        return this.CurrencyExposureDAO.create();
      },
    }
  ],

  messages: [
    {
      name: 'UPDATED',
      message: 'Last updated at',
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
          .start(this.Cols).addClass(this.myClass('header-container'))
            .start(this.Cols).style({'align-items': 'baseline'})
              .start().add(this.cls_.name).addClass(this.myClass('header')).end()
              .start()
                .add(this.lastUpdated$.map(v => `${this.UPDATED}: ${v.toLocaleString()}`))
                .addClass(this.myClass('last-updated'))
              .end()
            .end()
            .startContext({data: this})
              .tag(this.REFRESH, { icon: 'images/refresh-icon.svg' })
            .endContext()
          .end()
          .tag(this.lastUpdated$.map(_ => {
            return this.Grid.create()
              .addClass(this.myClass('dashboard-container'))
              .start(this.Card, { columns: 7 }).addClass(this.myClass('accounts'))
                .tag(this.DashboardAccounts, {
                  currency: this.currencyExposureDAO$proxy,
                  config: this.DAOControllerConfig.create({
                    daoKey:"accountDAO",
                    cannedQueries: [
                      {
                        class: 'foam.comics.v2.CannedQuery',
                        label: 'Trust',
                        predicateFactory: function(e) {
                          return e.AND(
                            e.INSTANCE_OF(net.nanopay.account.TrustAccount),
                            e.EQ(net.nanopay.account.Account.DENOMINATION,"CAD"),
                            e.NOT(e.EQ(net.nanopay.account.Account.ID,99999))
                          )
                        }
                      },
                      {
                        class: 'foam.comics.v2.CannedQuery',
                        label: 'Settlement',
                        predicateFactory: function(e) {
                          return e.INSTANCE_OF(net.nanopay.settlement.SettlementAccount);
                        }
                      },
                      {
                        class: 'foam.comics.v2.CannedQuery',
                        label: 'Reserve',
                        predicateFactory: function(e) {
                          return e.INSTANCE_OF(net.nanopay.settlement.ReserveAccount);
                        }
                      },
                      {
                        class: 'foam.comics.v2.CannedQuery',
                        label: 'Bank Play',
                        predicateFactory: function(e) {
                          return e.INSTANCE_OF(net.nanopay.settlement.BankPlayAccount);
                        }
                      },
                      {
                        class: 'foam.comics.v2.CannedQuery',
                        label: 'Common Pool',
                        predicateFactory: function(e) {
                          return e.EQ(net.nanopay.account.Account.ID,15)
                        }
                      }
                    ],
                    defaultColumns:["name","balance"],

                  })
                })
              .end()
              .start(this.Card, { columns: 5 }).addClass(this.myClass('liquidity'))
                .tag(this.DashboardLiquidity)
              .end()
          }))
    }
  ],
  actions: [
    {
      name: 'refresh',
      code: function() {
        this.lastUpdated = undefined;
      }
    },
  ]
});
