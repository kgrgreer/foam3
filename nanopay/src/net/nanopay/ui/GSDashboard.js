foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'GSDashboard',
  extends: 'foam.u2.Element',

  documentation: 'View displaying list of Bank Accounts added.',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'user',
    'stack',
    'accountDAO as bankAccountDAO',
    'balanceDAO'
  ],
  exports: [
    'as data',
    'filter',
    'filteredBalanceDAO'
  ],
  requires: [
    'net.nanopay.account.Balance',
    'foam.nanos.auth.User'

  ],

  css: `
    ^ {
      width: 962px;
      margin: 0 auto;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'filter',
      view: {
        class: 'foam.u2.TextField',
        type: 'search',
        placeholder: 'balance ID',
        onKey: true
      }
    },
    {
      name: 'data',
      factory: function() {
        return this.balanceDAO.where();
      }
    },
    {
      name: 'filteredBalanceDAO',
      expression: function(data, filter) {
        return filter ? data.where(this.EQ(this.Balance.Balance, filter)):data;
      },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
          'balance'
        ]
      }
    }
  ],

  messages: [
    
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start().addClass('button-div')
              .start(this.FILTER).addClass('filter-search').end()
            .end()
          .end()
          .add(this.FILTERED_BALANCE_DAO)
        .end();
    }
  ],
})