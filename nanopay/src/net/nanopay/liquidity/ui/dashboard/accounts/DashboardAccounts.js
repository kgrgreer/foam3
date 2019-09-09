/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
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
    'accountDAO',
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
      padding: 34px 16px;
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
  `,

  requires: [
    'foam.dao.ArraySink',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.mlang.sink.GroupBy',
    'foam.u2.borders.CardBorder',
    'net.nanopay.account.Account',
    'foam.comics.v2.DAOBrowserView',
    'foam.comics.v2.DAOControllerConfig'
  ],
  exports: [
    'controllerMode'
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
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({
          defaultColumns: ["name","balance","homeBalance"],
          dao: this.accountDAO,
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
        .add(self.slot(function(homeDenomination, currency, accountDAO, config) {
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
                  .start(foam.comics.v2.DAOBrowserView, {
                    data: accountDAO.where(self.TRUE),
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
