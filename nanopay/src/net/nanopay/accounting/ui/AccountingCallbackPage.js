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
    'ctrl'
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

      let connectedBank = await this.user.accounts.where(
        this.AND(
          this.OR(
            this.EQ(this.Account.TYPE, this.BankAccount.name),
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          ),
          this.NEQ(this.BankAccount.INTEGRATION_ID, '')
        )
      ).select(this.COUNT());

      if ( connectedBank.value === 0 ) {
        this.add(this.Popup.create({
          closeable: false,
          onClose: this.sync.bind(this)
        }).tag({
          class: 'net.nanopay.accounting.ui.IntegrationPopUpView',
          data: this,
          isLandingPage: true
        }));
      } else {
        this.bankMatched = true;
        this.sync();
      }
    },

    async function sync() {
      // reset the url first
      window.history.pushState({}, '', '/#sme.bank.matching')

      if ( ! this.bankMatched )  {
        this.pushMenu('sme.main.dashboard');
        return;
      }

      let service = null;

      if ( this.integrationSoftware === 'Xero' ) {
        service = this.xeroService;
      }
      if ( this.integrationSoftware === 'quickbooks' ) {
        service = this.quickbooksService;
      }

      let contactResult = await service.contactSync(null);
      let invoiceResult = await service.invoiceSync(null);

      if ( contactResult.result === false ) {
        this.ctrl.notify(contactResult.reason, 'error');
        this.pushMenu('sme.main.dashboard');
      }

      if ( invoiceResult.result === false  ) {
        this.ctrl.notify(invoiceResult.reason, 'error');
        this.pushMenu('sme.main.dashboard');
      }

      this.ctrl.notify('All information has been synchronized', 'success');

      this.add(this.Popup.create().tag({
        class: 'net.nanopay.accounting.ui.AccountingReportModal',
        invoiceResult: invoiceResult,
        contactResult: contactResult
      }));

      console.log(contactResult);
      console.log(invoiceResult);
    }
  ]
});
