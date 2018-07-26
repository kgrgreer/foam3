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
    'accountDAO',
    'balanceDAO'
  ],
  exports: [
    'as data',
    'filter',
    'filteredAccountDAO'
  ],
  requires: [
    'net.nanopay.account.Balance',
    'net.nanopay.account.Account',
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
        placeholder: 'Account ID',
        onKey: true
      }
    },
    {
      name: 'data',
      factory: function() {
        
        return this.accountDAO.where(this.EQ(this.Account.TYPE,"DigitalAccount"));
      }
    },
    {
      name: 'filteredAccountDAO',
      expression: function(data, filter) {
        return filter ? data.where(this.EQ(this.Account.ID, filter)):data;
      },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
        'id', 'owner'
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
          .add(this.FILTERED_ACCOUNT_DAO)
        .end();
    }
  ],
})