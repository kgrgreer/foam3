foam.CLASS({
  package: 'net.nanopay.bank.ui.USBankModal',
  name: 'BankModalUSD',
  extends: 'foam.u2.Controller',

  imports: [
    'ctrl',
    'stack'
  ],

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
  ^ {
    width: 780px;
    padding: 20px;
  }
  ^ .label {
    font-size: 14px;
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: 0.2px;
    text-align: left;
    color: #093649;
    display: inheret;
  }
  ^ .largeInput {
    //width: 40%;
    height: 40px;
    border-radius: 3px;
    box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
    border: solid 1px #8e9090;
    background-color: #ffffff;
  }
  ^ .img {
    width: 100%;
    margin-right: 15px;
    margin-top: 25px;
    margin-bottom: 10px;
  }
  ^ .sub-tit {
    font-size: 24px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: #8e9090;
  }
  ^ .tit {
    font-size: 36px;
    font-weight: 900;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: #2b2b2b;
  }
  ^ .sec-border {
    border-style: ridge;
    color: grey;
    margin-top: 24px;
    margin-bottom: 15px;
  }
  ^ .sec-tit {
    margin-top: 10px;
    font-size: 10px;
    font-weight: 900;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: #2b2b2b;
  }
  ^ .sec-sub-tit {
    margin-top: 0px;
    font-size: 10px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: #8e9090;
  }
  ^ .sec-img {
    margin-top: 10px;
    float: left;
    width: 7%;
  }
  ^ .net-nanopay-ui-ActionView-cancelB {
    width: 49px;
    height: 24px;
    font-family: Lato;
    font-size: 16px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: #525455;
  }
  ^ .net-nanopay-ui-ActionView-connect {
    width: 96px;
    height: 36px;
    border-radius: 4px;
    box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
    border: solid 1px #4a33f4;
    background-color: #604aff;
  }
  `,

  messages: [
    { name: 'TITLE', message: 'Connect using a void check' },
    { name: 'SUB_TITLE', message: 'Connect to your account without signing in to online banking.' },
    { name: 'SUB_TITLE1', message: 'Please ensure your details are entered correctly.' },
    { name: 'ROUT', message: 'Routing #' },
    { name: 'ACC', message: 'Account #' },
    { name: 'SEC_TITLE', message: 'Your safety is our top priority' },
    { name: 'SEC_SUBTITLE', message: 'Ablii uses state-of-the art security and encryption measures when handling your data' },
  ],

  properties: [
    {
     name: 'routingNum',
     class: 'String'
    },
    {
      name: 'accountNum',
      class: 'String'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start()
          .start('h2').add(this.TITLE).addClass('tit').end()
          .start().addClass('sub-tit')
            .start().add(this.SUB_TITLE).end()
            .start().add(this.SUB_TITLE1).end()
          .end()
          .start({ class: 'foam.u2.tag.Image', data: 'images/USA-Check.png' }).addClass('img').end()
          .start().style({ 'display': 'inline-flex' })
            .start('span')
              .start().add(this.ROUT, { placeholder: '123456789' }).addClass('label').end()
              .start(this.ROUTING_NUM).addClass('largeInput').end()
            .end()
            .start('span').style({ 'margin-left': '40px' })
              .start().add(this.ACC, { placeholder: '1234567' }).addClass('label').end()
              .start(this.ACCOUNT_NUM).addClass('largeInput').end()
            .end()
          .end()
          .start().addClass('sec-border')
            .start({ class: 'foam.u2.tag.Image', data: 'images/security-icon.svg' }).addClass('sec-img').end()
            .start().add(this.SEC_TITLE).addClass('sec-tit').end()
            .start('p').add(this.SEC_SUBTITLE).addClass('sec-sub-tit').end()
          .end()
          .start().style({ 'display': 'inline-flex', 'float': 'right' })
            .start().add(this.CONNECT).end()
            .start().add(this.CANCEL_B).end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'connect',
      label: 'Connect',
      code: function(X) {
        // TODO
      }
    },
    {
      name: 'cancelB',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
  ]
});
