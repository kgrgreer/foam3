foam.CLASS({
  package: 'net.nanopay.retail.ui.cashout',
  name: 'CashOutView',
  extends: 'foam.u2.View',

  requires: [ 'foam.u2.dialog.Popup' ],

  imports: [ 'stack' ],

  exports: [ 'onCashOutSuccess',  'popUpConfirmCashOut' ],

  documentation: 'View for cashing out device balances to a bank account.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 100%;
          background-color: #edf0f5;
        }
        ^ .cashOutContainer {
          width: 992px;
          margin: auto;
        }
        ^ .tabDiv {
          height: 16px;
          line-height: 16px;
        }
        ^ .tabStyleCashOut {
          font-family: Roboto;
          font-size: 14px;
          font-weight: bold;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: black;
          display: inline-block;
          margin: 0;
        }
        ^ .divider {
          width: 2px;
          height: 16px;
          background-color: #8f8f8f;
          margin-left: 10px;
          margin-right: 10px;
          display: inline-block;
          vertical-align: middle;
        }
        ^ .balanceBoxDiv {
          width: 466px;
          height: 140px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
        }
        ^ .balanceBoxTitle {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          font-weight: normal;
          padding-left: 53px;
          padding-top: 21px;
          color: #093649;
          margin: 0;
        }
        ^ .balance {
          font-family: Roboto;
          font-size: 32px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.5px;
          color: #093649;
          padding-left: 53px;
          padding-top: 54px;
          margin: 0;
        }
        ^ .bankBoxDiv {
          width: 466px;
          height: 140px;
          margin-top: 20px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
          display: inline-block;
        }
        ^ .bankBoxTitle {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          font-weight: normal;
          padding-left: 53px;
          padding-top: 21px;
          color: #093649;
          margin: 0;
          display: inline-block;
        }
        ^ .changeLink {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #2cab70;
          text-decoration: underline;
          display: inline-block;
          margin: 0;
          float: right;
          padding-top: 21px;
          padding-right: 53px;
          cursor: pointer;
        }
        ^ .bankImage {
          display: inline-block;
          padding-left: 53px;
          padding-top: 23px;
        }
        ^ .bankNumber {
          font-family: Roboto;
          font-size: 32px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.5px;
          color: #093649;
          margin: 0;
          float: right;
          padding-top: 36px;
          padding-right: 53px;
          display: inline-block;
        }
        ^ .cashOutBoxDiv {
          width: 466px;
          height: 300px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
          float: right;
        }
        ^ .inlineDiv {
          display: inline-block;
          vertical-align: top;
        }
        ^ .inlineDivCashOut {
          display: inline-block;
          vertical-align: top;
          float: right;
        }
        ^ .cashOutSelectionText {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #2cab70;
          display: inline-block;
          margin: 0;
          margin-left: 6px;
        }
        ^ .minCashOutText {
          font-family: Roboto;
          font-size: 10px;
          line-height: 1.6;
          letter-spacing: 0.3px;
          color: #8f8f8f;
          margin: 0;
          margin-top: 20px;
          margin-left: 52px;
          margin-bottom: 39px;
        }
        ^ .cashOutField {
          width: 218px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px #ededed;
          display: inline-block;
          outline: none;
          margin-left: 52px;
          padding: 10px;
        }
        ^ .foam-u2-ActionView-transactionTab {
          font-family: Roboto;
          font-size: 14px;
          font-weight: normal;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #8f8f8f;
          display: inline-block;
          cursor: pointer;
          margin: 0;
          margin-top: 40px;
          margin-bottom: 40px;
          border: none;
          background: transparent;
          padding: 0;
          outline: none;
        }
        ^ .foam-u2-ActionView-cashOut {
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
        }
        ^ .foam-u2-ActionView-cashOut:hover {
          background: #59a5d5;
        }
        ^ .foam-u2-ActionView-changePlan {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #2cab70;
          text-decoration: underline;
          display: inline-block;
          margin: 0;
          float: right;
          border: none;
          background: transparent;
          padding: 0;
          outline: none;
          padding-top: 87px;
          padding-right: 53px;
          cursor: pointer;
        }
    */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start('div').addClass('cashOutContainer')
          .start('tabDiv')
            .add(this.TRANSACTION_TAB)
            .start('div').addClass('divider').end()
            .start('h6').add('Cash Out').addClass('tabStyleCashOut').end()
          .end()
          .start('div')
            .start('div').addClass('inlineDiv')
              .start('div').addClass('balanceBoxDiv')
                .start('h6').add('Balance - All').addClass('balanceBoxTitle').end()
                .start('h2').add('$0.00').addClass('balance').end()
              .end()
              .tag({class:'net.nanopay.retail.ui.cashout.CashOutBank'})
            .end()
            .start('div').addClass('inlineDivCashOut')
              .start('div').addClass('cashOutBoxDiv')
                .start('h6').add('You have selected:').addClass('bankBoxTitle').end()
                .start('h6').add('Pay-as-you-Go ($1 per cashout).').addClass('cashOutSelectionText').end()
                .start('h6').add(this.MinCashOut).addClass('minCashOutText').end()
                .start('input').addClass('cashOutField').end()
                .add(this.CASH_OUT)
                .add(this.CHANGE_PLAN)
              .end()
            .end()
          .end()
        .end();
    },

    function popUpConfirmCashOut() {
      this.add(this.Popup.create().tag({class: 'net.nanopay.retail.ui.cashout.ConfirmCashOutModal'}));
    },

    function onCashOutSuccess() {
			this.add(this.Popup.create().tag({class: 'net.nanopay.retail.ui.cashout.CashOutSuccessModal'}));
		}
  ],

  messages: [
    { name: 'MinCashOut', message: '* Minimum cashout is $5. To cash out less than the minimum, contact us at support@mintchip.ca'}
  ],

  actions: [
    {
      name: 'transactionTab',
      label: 'Transaction',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.retail.ui.transactions.TransactionsView' });
      }
    },
    {
      name: 'cashOut',
      label: 'Cash Out',
      code: function(X) {
        X.popUpConfirmCashOut();
      }
    },
    {
      name: 'changePlan',
      label: 'Change Plan',
      code: function(X) {
        // change plan action
      }
    }
  ]

});

foam.CLASS({
  package: 'net.nanopay.retail.ui.cashout',
  name: 'CashOutBank',
  extends: 'foam.u2.View',

  requires: [ 'foam.u2.dialog.Popup'],

  exports: [ 'popUpChangeBank' ],

  properties: [ 'bankName', 'bankLogo', 'bankNumber' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{

        }
        ^ .bankBoxDiv {
          width: 466px;
          height: 140px;
          margin-top: 20px;
          background-color: #ffffff;
          box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
          display: inline-block;
        }
        ^ .bankBoxTitle {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          font-weight: normal;
          padding-left: 53px;
          padding-top: 21px;
          color: #093649;
          margin: 0;
          display: inline-block;
        }
        ^ .bankImage {
          display: inline-block;
          padding-left: 53px;
          padding-top: 23px;
        }
        ^ .bankNumber {
          font-family: Roboto;
          font-size: 32px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.5px;
          color: #093649;
          margin: 0;
          float: right;
          padding-top: 36px;
          padding-right: 53px;
          display: inline-block;
        }
        ^ .foam-u2-ActionView-changeBank {
          font-family: Roboto;
          font-size: 14px;
          line-height: 1.33;
          letter-spacing: 0.3px;
          color: #2cab70;
          text-decoration: underline;
          display: inline-block;
          margin: 0;
          float: right;
          border: none;
          background: transparent;
          padding: 0;
          outline: none;
          padding-top: 21px;
          padding-right: 53px;
          cursor: pointer;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      self.bankName = "Bank Account - Scotiabank Chequing";
      self.bankLogo = "ui/images/scotiabank-logo.svg";
      self.bankNumber = "****1234";

      this
        .addClass(this.myClass())
        .start('div').addClass('bankBoxDiv')
          .start('div')
            .start('h6').add(this.bankName$).addClass('bankBoxTitle').end()
            .add(this.CHANGE_BANK)
          .end()
          .start('div')
            .start({class:'foam.u2.tag.Image', data: this.bankLogo$}).addClass('bankImage').end()
            .start('h2').add(this.bankNumber$).addClass('bankNumber').end()
          .end()
        .end()
    },

    function popUpChangeBank() {
      this.add(this.Popup.create().tag({class: 'net.nanopay.retail.ui.cashout.SelectBankModal'}));
    }
  ],

  actions: [
    {
      name: 'changeBank',
      label: 'Change',
      code: function(X) {
        X.popUpChangeBank();
      }
    }
  ]
})