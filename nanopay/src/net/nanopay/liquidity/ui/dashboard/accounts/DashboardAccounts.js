/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.accounts',
  name: 'DashboardAccounts',
  extends: 'foam.u2.View',

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
  ],
  exports: [
    'controllerMode'
  ],
  properties: [
    {
      class: 'FObjectProperty',
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
      debugger;
      this.SUPER();
      this
        .addClass(this.myClass())
        .start('h1').add('test').end()
        .add(self.slot(function(data, config, data$id, data$denomination) {
          return self.E()
            .start(self.Rows)
              .start(self.CardBorder).addClass(this.myClass('balance-card'))
                .start(self.Rows)
                  .start()
                    .add(self.CARD_HEADER).addClass(this.myClass('card-header'))
                  .end()
                  .start().addClass(this.myClass('balance'))
                    .add(data.findBalance(self.__context__).then(balance => self.parseBalanceToDollarString(balance)))
                  .end()
                  .start().addClass(this.myClass('balance-note'))
                    .add(self.BALANCE_NOTE)
                    .add(` (${data$denomination})`)
                  .end()
                .end()
              .end()
              .start(self.CardBorder)
                .start().add(self.TABLE_HEADER).addClass(this.myClass('table-header')).end()
                .start(foam.comics.v2.DAOBrowserView, {
                  data: self.transactionDAO
                          .where
                            (self.OR(self.EQ(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, data$id)),
                                    (self.EQ(net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, data$id))  
                            ),
                })
                  .addClass(this.myClass('transactions-table'))
                .end()
              .end()
            .end();
        }));
    }
  ]
});
