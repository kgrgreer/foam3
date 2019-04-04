foam.CLASS({
  package: 'net.nanopay.accounting.ui',
  name: 'AccountingCallbackPage',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'pushMenu',
    'quickbooksService',
    'user',
    'xeroService',
    'ctrl',
    'stack',
    'accountingIntegrationUtil'
  ],

  exports: [
    'bankMatched'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.ui.LoadingSpinner',
    'foam.u2.dialog.Popup'
  ],

  css: `
  ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: #f9fbff;
    }
  .net-nanopay-accounting-ui-AccountingCallbackPage {
      margin: auto;
      text-align: center;
    }
  ^ .spinner-container {
      z-index: 1;
    }
  ^ .spinner-container-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
  }
  ^ .spinner-container .net-nanopay-ui-LoadingSpinner img {
    width: 200px;
    height: 200px;
  }
  `,

  properties: [
    {
      name: 'bankMatchingLogo'
    },
    {
      name: 'abliiBankData',
      factory: function() {
        var dao = this.user.accounts.where(
          this.OR(
            this.EQ(this.Account.TYPE, this.BankAccount.name),
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          )
        );
        dao.of = this.BankAccount;
        return dao;
      }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      name: 'bankMatched',
      type: 'Boolean',
      value: false
    },
    {
      name: 'integrationSoftware',
      type: 'String',
      factory: function() {
        let parsedUrl = new URL(window.location.href);
        return parsedUrl.searchParams.get('accounting');
      }
    },
    {
      name: 'doSync',
      type: 'Boolean',
      value: false
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();

      // display loading icon
      this
        .start().addClass(this.myClass())
          .start('h1').addClass('title')
            .add('Syncing ' + this.integrationSoftware + ' to Ablii')
          .end()
          .start().addClass('spinner-container')
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
            .end()
          .end()
        .end();

      if ( this.doSync ) {
        let result = await this.accountingIntegrationUtil.doSync();
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingReportPage1',
          reportResult: result
        })

        return ;
      }

      let connectedBank = await this.countConnectedBank();
      if ( connectedBank.value === 0 ) {
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingBankMatching'
        });
      } else {
        let result = await this.accountingIntegrationUtil.doSync();
        this.stack.push({
          class: 'net.nanopay.accounting.ui.AccountingReportPage1',
          reportResult: result
        })
      }
    },

    async function countConnectedBank() {
      return await this.user.accounts.where(
        this.AND(
          this.OR(
            this.EQ(this.Account.TYPE, this.BankAccount.name),
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          ),
          this.NEQ(this.BankAccount.INTEGRATION_ID, '')
        )
      ).select(this.COUNT());
    }
  ]
});
