foam.CLASS({
  package: 'net.nanopay.retail.ui.cashout',
  name: 'SelectBankModal',
  extends: 'foam.u2.View',

  imports: ['stack', 'closeDialog'],

  documentation: 'Pop up modal allowing user to select a new bank to cash out to.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 466px;
          height: 625px;
          margin: auto;
          position: relative;
          }
        ^ .selectBankContainer {
          width: 466px;
          height: 625px;
          border-radius: 2px;
          background-color: #ffffff;
          box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
        }
        ^ .popUpHeader {
          width: 466px;
          height: 40.5px;
          background-color: #093649;
        }
        ^ .popUpTitle {
          width: 198px;
          height: 40px;
          font-family: Roboto;
          font-size: 14px;
          line-height: 40.5px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #ffffff;
          margin-left: 20px;
          display: inline-block;
        }
        ^ .closeButton {
          width: 24px;
          height: 24px;
          margin-top: 8px;
          margin-right: 16px;
          cursor: pointer;
          display: inline-block;
          float: right;
        }
        ^ .verifiedBanksDiv {
          height: 250px;
          width: 466px;
          overflow-y: scroll;
        }
        ^ .pendingBankTitle {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.6;
          letter-spacing: 0.3px;
          color: #8f8f8f;
          margin-top: 20px;
          margin-left: 33px;
        }
        ^ .buttonDiv {
          position: absolute;
          bottom: 20;
          right: 0;
          width: 400px;
          margin: auto;
          }
        ^ .foam-u2-ActionView-closeButton {
          width: 24px;
          height: 24px;
          margin: 0;
          margin-top: 7px;
          margin-right: 20px;
          cursor: pointer;
          display: inline-block;
          float: right;
          outline: 0;
          border: none;
          background: transparent;
        }
        ^ .foam-u2-ActionView-closeButton:hover {
          background: transparent;
          background-color: transparent;
        }
        ^ .foam-u2-ActionView-confirm {
          font-family: Roboto;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: #59a5d5;
          border: solid 1px #59a5d5;
          display: inline-block;
          color: white;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin: 0;
          margin-left: 7px;
          outline: none;
          margin-right: 33px;
          float: right;
        }
        ^ .foam-u2-ActionView-confirm:hover {
          background: #59a5d5;
        }
        ^ .foam-u2-ActionView-addBank {
          font-family: Roboto;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: white;
          border: solid 1px #59a5d5;
          display: inline-block;
          color: #59a5d5;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin: 0;
          outline: none;
          float: right;
        }
        ^ .foam-u2-ActionView-addBank:hover {
          background: white;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start()
          .start().addClass('selectBankContainer')
            .start().addClass('popUpHeader')
              .start().add(this.Title).addClass('popUpTitle').end()
              .add(this.CLOSE_BUTTON)
            .end()
            .start('div').addClass('verifiedBanksDiv')
              .start({ class: 'net.nanopay.retail.ui.cashout.BankContainer', data: { bankLogo: 'ui/images/scotiabank-logo.svg', bankName: 'Scotiabank Chequing', bankNumber: '****1234' } }).end()
              .start({ class: 'net.nanopay.retail.ui.cashout.BankContainer', data: { bankLogo: 'ui/images/td-logo.png', bankName: 'TD Savings', bankNumber: '****3925' } }).end()
            .end()
            .start().add('Pending bank accounts:').addClass('pendingBankTitle').end()
            .start('div').addClass('pendingBanksDiv')
              .start({ class: 'net.nanopay.retail.ui.cashout.BankContainer', data: { bankLogo: 'ui/images/scotiabank-logo.svg', bankName: 'Scotiabank Savings', bankNumber: '****0463' } }).end()
            .end()
            .start().addClass('buttonDiv')
              .add(this.CONFIRM)
              .add(this.ADD_BANK)
            .end()
          .end()
        .end()
    }
  ],

  messages: [
    { name: 'Title', message: 'Choose Your Bank Account' }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'ui/images/ic-cancelwhite.png',
      code: function (X) {
        X.closeDialog();
      }
    },
    {
      name: 'confirm',
      label: 'Confirm',
      code: function (X) {
        X.closeDialog();
      }
    },
    {
      name: 'addBank',
      label: 'Add Bank Account',
      code: function (X) {
        X.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.BankAccountSettingsView' });
      }
    }
  ]

}),

foam.CLASS({
  package: 'net.nanopay.retail.ui.cashout',
  name: 'BankContainer',
  extends: 'foam.u2.View',

  documentation: 'Container displaying a single bank in the select bank modal.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 400px;
          height: 100px;
          margin: auto;
          border: solid 1px #ebebeb;
          margin-top: 20px;
          cursor: pointer;
        }
        ^:hover {
          background-color: #ebebeb;
        }
        ^ .bankLogo {
          width: 60px;
          height: 60px;
          margin-top: 20px;
          margin-left: 20px;
          object-fit: contain;
          display: inline-block
        }
        ^ .inlineDiv {
          height: 100px;
          display: inline-block;
          margin-right: 15px;
          float: right;
          text-align: right;
        }
        ^ .bankName {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #093649;
          margin-top: 17px;
        }
        ^ .bankNumber {
          font-family: Roboto;
          font-size: 32px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.5px;
          color: #093649;
          padding: 0;
          margin-top: 17px;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start().addClass('bankContainer')
          .start({ class: 'foam.u2.tag.Image', data: this.data.bankLogo }).addClass('bankLogo').end()
          .start('div').addClass('inlineDiv')
            .start().add(this.data.bankName).addClass('bankName').end()
            .start().add(this.data.bankNumber).addClass('bankNumber').end()
          .end()
        .end()
    }
  ]
})