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

  documentation: `
    A configurable view to to render a card with 
    configurable contents and rich choice view dropdowns
  `,

  css:`
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.comics.v2.DAOBrowserView',
    'foam.u2.borders.CardBorder'
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
      name: 'data'
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(data) {
          return self.E()
            .start(self.Rows)
              .start(self.CardBorder).addClass(this.myClass('balance-card'))
                .start(self.Rows)
                  .start()
                    .add(self.CARD_HEADER).addClass(this.myClass('card-header'))
                  .end()
                  .start().addClass(this.myClass('balance'))
                    // TODO: Work with exchange rates
                    // .add(data.findBalance(self.__context__).then(balance => self.parseBalanceToDollarString(balance)))
                  .end()
                  .start().addClass(this.myClass('balance-note'))
                    .add(self.BALANCE_NOTE)
                    // .add(` (${data$denomination})`)
                  .end()
                .end()
              .end()
              .start(self.CardBorder)
                .start(foam.comics.v2.DAOBrowserView, {
                  data: data.where(self.TRUE)
                })
                  .addClass(this.myClass('accounts-table'))
                .end()
              .end()
            .end();
        }));
    }
  ]
});
