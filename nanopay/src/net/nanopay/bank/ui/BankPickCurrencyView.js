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
    //width: 60%;
    //height: 100%;
    margin: auto;
  }
  .net-nanopay-flinks-view-form-FlinksForm .positionColumn {
    width: 150px !important;
    margin-left: 5px !important;
  }
  .net-nanopay-flinks-view-form-FlinksForm .subTitleFlinks {
    display: none !important;
  }
  .net-nanopay-flinks-view-form-FlinksForm .title {
    display: none !important;
  }
  .net-nanopay-flinks-view-form-FlinksForm {
    width: 95%;
    height: 110% !important;
  }
  // .net-nanopay-flinks-view-form-FlinksForm linkk {
  //   margin-left: 330px !important;
  // }

  // .net-nanopay-cico-ui-bankAccount-form-AddBankView {
  //   width: 70%;
  //   background-color: blue;
  // }
  // .net-nanopay-ui-wizard-WizardCssView {
  //  // width: 90%
  //   background-color: red;
  // }
  .net-nanopay-sme-ui-SMEWizardOverview{
    width: 10% !important;
  }
  .top {
    margin-left: 20px;
    margin-bottom: 30px;
    margin-top: 24px;
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
      .start().addClass('top')
        .start()
          .start({ class: 'foam.u2.tag.Image', data: 'images/ablii/gobackarrow-grey.svg' }).end()
          .start().add('Go back').style({ 'margin-left': '19px', 'margin-top': '-17px' }).end()
        .on('click', () => {
          this.stack.back();
        }).end()
        .start('h1').add(this.TITLE).style({ 'margin-left': '5px', 'margin-right': '10px' }).end()
        .start('h4').add(this.SUB_TITLE).style({ 'margin-left': '5px', 'margin-right': '10px' }).end()
        .start('span').addClass('resting')
        .startContext({ data: this })
          .start(this.CURRENCY_ONE).focus().addClass('white-radio').style({ 'margin-left': '5px', 'margin-right': '10px' }).end()
          .start(this.CURRENCY_TWO).addClass('white-radio').style({ 'margin-left': '5px', 'margin-right': '5px' }).end()
        .endContext()
        .end()
      .end()
      .start().show(this.selectedCAD$)
        .start().tag({ class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true, hideBottomBar: true }).end()
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
