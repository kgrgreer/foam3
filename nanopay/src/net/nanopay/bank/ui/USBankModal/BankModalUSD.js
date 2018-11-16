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
    width: 700px;
    height: 1000px;
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
    margin-left: 0;
    margin-bottom: -1.5px;
  }
  ^ .largeInput {
    width: 222px;
    height: 40px;
    border-radius: 3px;
    box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
    border: solid 1px #8e9090;
    background-color: #ffffff;
  }
  `,

  messages: [
    { name: 'TITLE', message: 'Connect using a void check' },
    { name: 'SUB_TITLE', message: 'Connect to your account without signing in to online banking.' },
    { name: 'SUB_TITLE1', message: 'Please ensure your details are entered correctly.' },
    { name: 'ROUT', message: 'Routing #' },
    { name: 'ACC', message: 'Account' },
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
            .start('h4').add(this.SUB_TITLE).end()
            .start('h4').add(this.SUB_TITLE1).end()
          .end()
          .start({ class: 'foam.u2.tag.Image', data: 'USA-Check.png' }).addClass('img').end()
          .start('span').add(this.ROUT).addClass('label').end()
          .start(this.ROUTING_NUM).addClass('largeInput').end()
          .start('span').add(this.ACC).addClass('label').end()
          .start(this.ACCOUNT_NUM).addClass('largeInput').end()
        .end();
    }
  ],

  // actions: [
  // ]
});
