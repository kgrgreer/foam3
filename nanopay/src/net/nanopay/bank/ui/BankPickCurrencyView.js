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
    margin: auto;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm {
    background-color: #f9fbff;
    margin-left: 28px;
    height: auto;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .net-nanopay-ui-ActionView {
    background-color: %SECONDARYCOLOR%;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .positionColumn {
    width: 260px;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .stackColumn,
  ^ .net-nanopay-flinks-view-form-FlinksForm .foam-u2-stack-StackView {
    height: auto;
  }
  .net-nanopay-flinks-view-form-FlinksForm .wizardBody {
    background-color: transparent;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .subTitle {
    display: none;
  }
  ^ .net-nanopay-flinks-view-form-FlinksForm .subTitleFlinks {
    height: 16px;
    line-height: 16px;
    font-size: 14px;
    letter-spacing: 0.3px;
    margin-bottom: 24px;
    font-family: 'Lato', sans-serif;
  }
  ^ .net-nanopay-flinks-view-form-FlinksInstitutionForm .optionSpacer.selected,
  ^ .net-nanopay-flinks-view-form-FlinksAccountForm .account:hover {
    border: solid 1px %SECONDARYCOLOR%;
  }
  ^ .net-nanopay-flinks-view-form-FlinksAccountForm .account.selected {
    border: solid 3px %SECONDARYCOLOR%;
  }
  .net-nanopay-flinks-view-form-FlinksForm .institution,
  .net-nanopay-flinks-view-form-FlinksForm .subContent,
  .net-nanopay-flinks-view-form-FlinksForm .infoContainer-wizard {
    box-shadow: 0 1px 1px 0 #dae1e9;
  }
  .net-nanopay-flinks-view-form-FlinksForm .title {
    display: none !important;
  }
  .net-nanopay-ui-ActionView-closeButton{
    display: none;
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
      name: 'selection',
      class: 'Int',
      value: 1
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
          .start(this.CURRENCY_ONE).addClass('white-radio').enableClass('selected', this.selection$.map(function(v) { return v === 1; })).style({ 'margin-left': '5px', 'margin-right': '10px' }).end()
          .start(this.CURRENCY_TWO).addClass('white-radio').enableClass('selected', this.selection$.map(function(v) { return v === 2; })).style({ 'margin-left': '5px', 'margin-right': '5px' }).end()
        .endContext()
        .end()
      .end()
      .start().show(this.selection$.map(function(v) { return v === 1; }))
        .start().tag({ class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true, hideBottomBar: true }).end()
      .end();
    }
  ],

  actions: [
    {
      name: 'currencyOne',
      label: 'Canada',
      code: function() {
        this.selection = 1;
      }
    },
    {
      name: 'currencyTwo',
      label: 'U.S',
      code: function() {
        this.selection = 2;
        this.ctrl.add(this.Popup.create().tag({ class: 'net.nanopay.bank.ui.USBankModal.BankModalUSD' }));
      }
    },
  ]
});
