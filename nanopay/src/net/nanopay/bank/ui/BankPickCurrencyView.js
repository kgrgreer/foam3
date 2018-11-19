foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankPickCurrencyView',
  extends: 'foam.u2.View',

  imports: [
    'ctrl',
    'stack',
    'user'
  ],

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
  ],

  css: `

  ^ {
    width: 60%;
    height: 60%;
    margin-left: 5%;
  }
  ^ .net-nanopay-cico-ui-bankAccount-form-AddBankView {
    width: 70%;
  }
  ^ .net-nanopay-ui-wizard-WizardView {
    width: 10%;
  }
  ^ .net.nanopay.flinks.view.form.FlinksForm {
    width: 10%;
  }
  `,

  messages: [
    { name: 'TITLE', message: 'Add a new bank' },
    { name: 'SUB_TITLE', message: 'Choose your banking provider below to get started' },
  ],

  properties: [
    {
     name: 'selectedCAD',
     class: 'Boolean',
     value: true
    },
    {
      name: 'selectedUSD',
      class: 'Boolean',
      value: false
     }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
      .start().style({ 'margin-left': '50px', 'margin-bottom': '30px', 'margin-top': '24px' })
        .start()
          //.start({ class: 'foam.u2.tag.Image', data: 'images/ic-approve.svg' }).end()
          .start('span').add('<- ').add('Go back').end()
        .on('click', () => {
          this.stack.back();
        }).end()
        .start('h1').add(this.TITLE).style({ 'margin-left': '5px', 'margin-right': '10px' }).end()
        .start('h4').add(this.SUB_TITLE).style({ 'margin-left': '5px', 'margin-right': '10px' }).end()
        .start('span').addClass('resting')
        .startContext({ data: this })
          .start(this.CURRENCY_ONE).style({ 'margin-left': '5px', 'margin-right': '10px' }).end()
          .start(this.CURRENCY_TWO).style({ 'margin-left': '5px', 'margin-right': '5px' }).end()
        .endContext()
        .end()
      .end()
      .start().show(this.selectedCAD$)
        .start().style({ 'width': '20%' }).tag({ class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true, hideBottomBar: true }).end()
      .end();
    }
  ],

  actions: [
    {
      name: 'currencyOne',
      label: 'Canada',
      code: function() {
        this.selectedCAD = true;
        this.selectedUSD = false;
      }
    },
    {
      name: 'currencyTwo',
      label: 'U.S',
      code: function() {
        this.selectedCAD = false;
        this.selectedUSD = true;
        this.ctrl.add(this.Popup.create().tag({ class: 'net.nanopay.bank.ui.USBankModal.BankModalUSD' }));
      }
    },
  ]
});
