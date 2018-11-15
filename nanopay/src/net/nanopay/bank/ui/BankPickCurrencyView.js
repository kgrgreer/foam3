foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankPickCurrencyView',
  extends: 'foam.u2.View',

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
  ],

  // implements: [
  //   'foam.mlang.Expressions',
  // ],

  // imports: [
  // ],

  // exports: [
  //   'selectedCurrency'
  // ],

  messages: [
    { name: 'TITLE', message: 'Add a new bank' },
    { name: 'SUB_TITLE', message: 'Choose your banking provider below to get started' },
  ],

  properties: [
    'selectedCurrencyView'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start({ class: 'foam.u2.tag.Image', data: 'images/ic-approve.svg' }).add('Go back')
          .on('click', function() {
            self.stack.push({ class: 'net.nanopay.bank.BankAccountController' })
          })
        .start().add(this.TITLE).addClass('sme-title').end()
        .start().add(this.SUB_TITLE).addClass('sme-subTitle').end()
          .start().addClass('sme.button')
            .start().addClass('button-div')
              .start(this.CURRENCY_ONE).end()
              .start(this.CURRENCY_ONE).end()
            .end()
          .end()
          .add(this.selectedCurrencyView$)
        .end();
    }
  ],

  actions: [
    {
      name: 'currencyOne',
      label: 'Canada',
      code: function() {
        this.selectedCurrencyView = this.E().tag({
          class: 'net.nanopay.flinks.view.form.FlinksForm',
          isCustomNavigation: true,
          hideBottomBar: true
        });
      }
    },
    {
      name: 'currencyTwo',
      label: 'U.S',
      code: function() {
        this.selectedCurrencyView = '';
      }
    },
  ]
});
