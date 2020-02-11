/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.recentTransactions',
  name: 'DashboardRecentTransactions',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
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
      margin-bottom: 8px;
    }

    ^card-container {
      padding: 34px 16px;
    }
  `,

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
    'foam.u2.ControllerMode',
    'foam.comics.v2.DAOBrowserView'
  ],
  exports: [
    'controllerMode'
  ],

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'RECENT TRANSACTIONS',
    }
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
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.SUPER();
      this
        .addClass(this.myClass())
        .add(self.slot(function(data) {
          return self.E()
              .start(self.Rows).addClass(this.myClass('card-container'))
                .start()
                  .add(self.CARD_HEADER).addClass(this.myClass('card-header-title'))
                .end()
                .tag(foam.comics.v2.DAOBrowserView, {
                  data: data.where(self.TRUE).orderBy(this.DESC(net.nanopay.tx.model.Transaction.CREATED)).limit(20)
                })
              .end();
        }));
    }
  ]
});
