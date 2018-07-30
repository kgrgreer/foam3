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
    'digitalAccountInfoDAO'
  ],
  exports: [
    'as data',
    'filter',
    'filteredDigitalAccountInfoDAO'
  ],
  requires: [
    'net.nanopay.account.DigitalAccountInfo',
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
        return this.digitalAccountInfoDAO;
      },
      view: {
        class: 'foam.u2.view.ScrollTableView',
        columns: [
        'accountId', 'owner', 'currency' ,'balance', 'transactionsRecieved','transactionsSumRecieved', 'transactionsSent', 'transactionsSumSent'
        ]
      }
    },
    {
      name: 'filteredDigitalAccountInfoDAO',
      expression: function(data, filter) {
        
        return filter ? data.where(this.EQ(this.DigitalAccountInfo.ACCOUNT_ID
          , filter)):data;
      },
      
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
          .add(this.DATA)
        .end();
    }
  ],
})