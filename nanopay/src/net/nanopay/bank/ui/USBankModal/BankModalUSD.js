foam.CLASS({
  package: 'net.nanopay.bank.ui.USBankModal',
  name: 'BankModalUSD',
  extends: 'foam.u2.View',

  imports: [
    'accountDAO',
    'ctrl',
    'menuDAO',
    'stack',
    'user'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.core.Action',
    'foam.u2.dialog.Popup',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.USBankAccount',
    'foam.u2.dialog.NotificationMessage',
    'foam.mlang.MLang'
  ],

  css: `
  ^ {
    width: 90%;
    height: 90%;
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
    font-size: 20px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: normal;
    color: #8e9090;
  }
  ^ .tit {
    margin-top: -2%;
    font-size: 32px;
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
    margin-top: 5px;
    float: left;
    width: 7%;
  }
  ^ .net-nanopay-ui-ActionView {
    border-radius: 4px;
    box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
    border: solid 1px #4a33f4;
    background-color: #604aff;
    margin-bottom: 30px;
    margin-top: 45px;
    float: right;
    margin-right: 10px;
  }
    .net-nanopay-sme-ui-SMEModal-content {
      width: 650px;
      height: 680px;
    }
    .foam-u2-dialog-Popup-inner {
      width: 650px;
      height: 680px;
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
     class: 'String',
     view: {
      class: 'foam.u2.TextField',
      placeholder: ' 123456789'
    }
    },
    {
      name: 'accountNum',
      class: 'String',
      view: {
        class: 'foam.u2.TextField',
        placeholder: ' 1234567'
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start()
        .startContext({ data: this })
          .start('h2').add(this.TITLE).addClass('tit').end()
          .start().addClass('sub-tit')
            .start().add(this.SUB_TITLE).end()
            .start().add(this.SUB_TITLE1).end()
          .end()
          .start({ class: 'foam.u2.tag.Image', data: 'images/USA-Check.png' }).addClass('img').end()
          .start().style({ 'display': 'inline-flex' })
            .start('span')
              .start().add(this.ROUT).addClass('label').end()
              .start(this.ROUTING_NUM).addClass('largeInput').end()
            .end()
            .start('span').style({ 'margin-left': '14%' })
              .start().add(this.ACC).addClass('label').end()
              .start(this.ACCOUNT_NUM).addClass('largeInput').end()
            .end()
          .end()
          .start().addClass('sec-border')
            .start({ class: 'foam.u2.tag.Image', data: 'images/security-icon.svg' }).addClass('sec-img').end()
            .start().add(this.SEC_TITLE).addClass('sec-tit').end()
            .start('p').add(this.SEC_SUBTITLE).addClass('sec-sub-tit').end()
          .end()
          .start().style({ 'display': 'inline-flex', 'margin-left': '50%', 'margin-top': '-5%' })
            .start().add(this.CANCEL_B).addClass('can').end()
            .start().add(this.CONNECT).style( { 'margin-left': '10px' }).end()
          .end()
        .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'connect',
      label: 'Connect',
      code: async function(X) {
          var accSize = 0;
          await this.accountDAO.where(this.EQ(this.Account.DENOMINATION, 'USD'))
            .select(this.COUNT()).then( (count) => {
              accSize = count.value;
            });

          const newAccount = this.USBankAccount.create({
            name: `USBank ${accSize}`,
            branchId: this.routingNum,
            accountNumber: this.accountNum,
            status: this.BankAccountStatus.VERIFIED,
            owner: this.user.id,
            denomination: 'USD'
          }, X);

          if ( newAccount.errors_ ) {
            this.ctrl.add(foam.u2.dialog.NotificationMessage.create({ message: newAccount.errors_[0][1], type: 'error' }));
            return;
          }
          this.accountDAO.put(newAccount).then( (acct) => {
            if ( ! acct ) {
              this.ctrl.add(foam.u2.dialog.NotificationMessage.create({ message: 'Ooops, something went wrong. Please try again', type: 'error' }));
            } else {
              this.ctrl.add(foam.u2.dialog.NotificationMessage.create({ message: 'Congratulations, your USD Bank Account has been added to your usable accounts.'}));
            }
          });

          X.closeDialog();
          // FUTURE: Better feature:> 'GET THIS TO WORK-->this.ctrl.menuDAO.find('sme.main.banking').then((menu) => menu.launch());
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
