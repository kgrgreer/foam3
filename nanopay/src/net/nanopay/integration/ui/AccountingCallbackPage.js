foam.CLASS({
  package: 'net.nanopay.integration.ui',
  name: 'AccountingCallbackPage',
  extends: 'foam.u2.Controller',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'accountDAO',
    'bankIntegrationsDAO',
    'pushMenu',
    'quickSignIn',
    'user',
    'xeroSignIn',
    'ctrl'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.ui.LoadingSpinner'
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
      class: 'Boolean',
      name: 'syncing'
    }
  ],

  methods: [
    async function initE() {
      this.SUPER();

      let service = null;
      let parsedUrl = new URL(window.location.href);
      let integraition = parsedUrl.searchParams.get('accounting');
      this.syncing = true;

      if ( integraition === 'xero' ) {
        service = this.xeroSignIn;
      }

      if ( integraition === 'quickbook' ) {
        service = this.quickSignIn;
      }

      // display loading icon
      this
        .addClass(this.myClass())
        .start('h1')
          .add('Syncing ' + integraition + ' to Ablii')
        .end()
        .add(this.loadingSpinner)

      let contacts = await service.contactSync(null);
      let invoices = await service.invoiceSync(null);

      this.syncing = false;

      console.log(contacts);
      console.log(invoices);

      if ( contacts.result === true && invoices.result === true ) {
        ctrl.stack.push({
          class: 'net.nanopay.integration.IntegrationPopUpView',
          invoice: this.invoice
        });
      }
    }
  ]
});
