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
    'foam.comics.v2.DAOBrowserView',
    'foam.comics.v2.DAOControllerConfig',
    'net.nanopay.liquidity.ui.transaction.TransactionDAOBrowserView'
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
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({
          defaultColumns:["summary","lastModified","sourceAccount","destinationAccount","destinationCurrency","destinationAmount"],
          filterExportPredicate: this.NEQ(foam.nanos.export.ExportDriverRegistry.ID, 'CSV'),
          dao: this.data,
          editEnabled: false,
          deleteEnabled: false
        });
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
              .start(net.nanopay.liquidity.ui.transaction.TransactionDAOBrowserView, {
                data: data.where(self.TRUE).orderBy(this.DESC(net.nanopay.tx.model.Transaction.CREATED)).limit(20),
                config: self.config
              }).end()
            .end();
        }));
    }
  ]
});
