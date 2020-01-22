foam.CLASS({
  package: 'net.nanopay.liquidity.ui.transaction',
  name: 'TransactionDAOBrowserView',
  extends: 'foam.comics.v2.DAOBrowserView',

  exports: [
    'searchColumns'
  ],

  css: `
    ^centering {
      text-align: center;
      width: 100%;
      padding-top: 1vh;
      padding-bottom: 1vh;
      border-bottom: solid 1px #e7eaec;
    }
    ^ .foam-u2-view-RichChoiceView {
      display: inline-block;
      position: relative;
      z-index: 2000;
    }

  `,
  properties: [
    {
      name: 'searchColumns',
      value: [
        'type',
        'sourceAccount',
        'destinationAccount',
        'created'
      ]
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'predicatedDAO',
      expression: function(config, cannedPredicate, searchPredicate, accountSelectionPredicate) {
        return config.dao$proxy.where(this.AND(cannedPredicate, searchPredicate, accountSelectionPredicate));
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'accountSelectionPredicate',
      expression: function(accountSelection) {
        return this.OR(
          this.EQ(net.nanopay.tx.model.Transaction.SOURCE_ACCOUNT, accountSelection),
          this.EQ(net.nanopay.tx.model.Transaction.DESTINATION_ACCOUNT, accountSelection));
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'accountSelection',
      view: function(_, X) {
        sec = [
          {
            dao: X.accountDAO.where(X.data.AND( // TODO confirm these filters.***
              X.data.EQ(net.nanopay.account.Account.DELETED, false),
              X.data.EQ(net.nanopay.account.Account.ENABLED, true),
              X.data.EQ(net.nanopay.account.Account.LIFECYCLE_STATE, foam.nanos.auth.LifecycleState.ACTIVE),
              X.data.OR(
                foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' }),
                X.data.INSTANCE_OF(net.nanopay.account.ShadowAccount)
              ))).orderBy(net.nanopay.account.Account.NAME),
            objToChoice: function(a) {
              return [a.id, a.summary];
            }
          }
        ];
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: sec
        };
      },
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.addClass(this.myClass());
      this
        .add(this.slot(function(data, config$cannedQueries, searchFilterDAO, accountSelection) {
          return self.E()
            .startContext({ data: self }).addClass(self.myClass('centering'))
              .start('h3').add('Select an Account to see associated transactions').end()
              .start(self.ACCOUNT_SELECTION).end()
            .endContext();
        }));
        this.SUPER();
    }
  ]
});
