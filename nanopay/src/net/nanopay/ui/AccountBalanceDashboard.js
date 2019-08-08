foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'AccountBalanceDashboard',
  extends: 'foam.u2.Element',

  documentation: 'View displaying list of Bank Accounts added.',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'user',
    'stack',
    'accountDAO',
    'digitalAccountInfoDAO',
    'addCommas'
  ],
  exports: [
    'as data',
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
    ^ .balanceBox {
      position: relative;
      min-width: 330px;
      max-width: calc(100% - 135px);
      padding-bottom: 15px;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
      display: inline-block;
      vertical-align: middle;
      margin-left: 1px;
      margin-bottom: 10px;
    }
    ^ .balanceBoxTitle {
      color: /*%BLACK%*/ #1e1f21;
      font-size: 12px;
      margin-left: 44px;
      padding-top: 14px;
      line-height: 1.33;
      letter-spacing: 0.2px;
    }
    ^ .balance {
      font-size: 30px;
      font-weight: 300;
      line-height: 1;
      letter-spacing: 0.5px;
      overflow-wrap: break-word;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 27px;
      margin-left: 44px;
      margin-right: 44px;
    }
    ^ .sideBar {
      width: 6px;
      height: 100%;
      background-color: /*%PRIMARY3%*/ #406dea;
      position: absolute;
    }
    ^ table {
      border-collapse: collapse;
      margin: auto;
      width: 962px;
    }
    ^ thead > tr > th {
      font-family: 'Roboto';
      font-size: 14px;
      background: %TABLECOLOR%;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 1.14;
      letter-spacing: 0.3px;
      border-spacing: 0;
      text-align: left;
      padding-left: 15px;
      height: 40px;
    }
    ^ tbody > tr > th > td {
      font-size: 12px;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      padding-left: 15px;
      height: 60px;
    }
    ^ .foam-u2-view-TableView-row:hover {
      cursor: pointer;
      background: /*%GREY4%*/ #e7eaec;
    }
    ^ .foam-u2-view-TableView-row {
      height: 40px;
    }
    
  `,

  properties: [
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
      name: 'allBalance',
    }
  ],

  messages: [
    { name: 'balanceTitle', message: 'Balance' },
  ],

  methods: [
    function initE() {
      this.data.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();
      this.SUPER();
      var self = this;
      
      this      
        .addClass(this.myClass())
        .start('div').addClass('balanceBox')
          .start('div').addClass('sideBar').end()
          .start().add(this.balanceTitle).addClass('balanceBoxTitle').end()
          .start().add(
            this.allBalance$.map(function(a){
            return a == "$NaN" ? 0 : a;
          })).addClass('balance').end()
        .end()
        .tag(this.EXPORT_BUTTON)
        .start()
          .add(this.DATA)
        .end();
    }
  ],
  actions: [
    {
      name: 'exportButton',
      label: 'Export',
      icon: 'images/ic-export.png',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({ class: 'net.nanopay.ui.modal.ExportModal', exportData: X.data.data }));
      }
    }
  ],
  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        var self = this;

        this.digitalAccountInfoDAO.select(this.SUM(this.DigitalAccountInfo.BALANCE)).then(function(sum) {
          self.allBalance = '$' +
          self.addCommas((sum.value / 100).toFixed(2));
        });
      }
    }
  ]
})