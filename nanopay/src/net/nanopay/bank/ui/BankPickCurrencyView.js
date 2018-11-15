foam.CLASS({
  package: 'net.nanopay.bank.ui',
  name: 'BankPickCurrencyView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.core.Action',
    //'foam.u2.Entity',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
  ],

  css: `
  .Rectangle {
    width: 192px;
    height: 44px;
    border-radius: 4px;
    box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
    border: solid 1px #604aff;
    background-color: #ffffff;
  }
  .resting {
    width: 192px;
    height: 44px;
    border-radius: 4px;
    box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
    background-color: #ffffff;
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
        .start({ class: 'foam.u2.tag.Image', data: 'images/ic-approve.svg' }).add('Go back')
          .on('click', function() {
            self.stack.push({ class: 'net.nanopay.bank.BankAccountController' });
          })
        .end()
        .start().add(this.TITLE).addClass('sme-title').end()
        .start().add(this.SUB_TITLE).addClass('sme-subTitle').end()
          .start('span')//.addClass('resting')
            .start(this.CURRENCY_ONE).enableClass('Rectangle', this.selectedCAD$).end()
            .start(this.CURRENCY_TWO).enableClass('Rectangle', this.selectedUSD$).end()
          .end()
        .start().tag({ class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true, hideBottomBar: true }).end();
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
      }
    },
  ]
});
