foam.CLASS({
  package: 'net.nanopay.retail.ui.cashout',
  name: 'ConfirmCashOutModal',
  extends: 'foam.u2.View',
  implements: ['net.nanopay.retail.ui.cashout.CashOutView'],

  requires: ['foam.u2.dialog.Popup'],

  imports: ['closeDialog', 'onCashOutSuccess'],

  documentation: 'Pop up modal allowing user to confirm their cash out',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
        width: 466px;
        height: 322px;
        margin: auto;
        }
        ^ .confirmCashOutContainer {
        width: 466px;
        height: 319px;
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
        ^ .amountTitle {
        width: 72px;
        height: 20px;
        opacity: 0.6;
        font-family: Roboto;
        font-size: 20px;
        font-weight: 300;
        line-height: 1;
        letter-spacing: 0.3px;
        color: #093649;
        margin-top: 20px;
        margin-left: 54px;
        }
        ^ .totalTitle {
        font-family: Roboto;
        font-size: 12px;
        font-weight: bold;
        line-height: 1.33;
        letter-spacing: 0.3px;
        color: #8f8f8f;
        display: inline-block;
        width: 48px;
        }
        ^ .totalDiv {
        margin-left: 54px;
        margin-top: 10px;
        }
        ^ .amount {
        font-family: Roboto;
        font-size: 12px;
        line-height: 1.33;
        letter-spacing: 0.3px;
        color: #093649;
        margin-left: 107px;
        display: inline-block;
        }
        ^ .totalAmount {
        font-family: Roboto;
        font-size: 12px;
        line-height: 1.33;
        letter-spacing: 0.3px;
        color: #2cab70;
        margin-left: 107px;
        display: inline-block;
        }
        ^ .bankAccountTitle {
        opacity: 0.6;
        font-family: Roboto;
        font-size: 20px;
        font-weight: 300;
        line-height: 20px;
        letter-spacing: 0.3px;
        color: #093649;
        margin-top: 30px;
        margin-left: 54px;
        margin-bottom: 10px;
        }
        ^ .bankAccount {
        font-family: Roboto;
        font-size: 12px;
        line-height: 16px;
        letter-spacing: 0.3px;
        color: #093649;
        margin-left: 54px;
        margin-bottom: 29px;
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
        margin-right: 53px;
        outline: none;
        float: right;
        }
        ^ .foam-u2-ActionView-cashOut:hover {
        background: #59a5d5;
        }
        ^ .foam-u2-ActionView-cancel {
        font-family: Roboto;
        width: 136px;
        height: 40px;
        background-color: rgba(164, 179, 184, 0.1);
        box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
        border-radius: 2px;
        border: solid 1px #ebebeb;
        display: inline-block;
        color: #093649;
        text-align: center;
        cursor: pointer;
        font-size: 14px;
        margin: 0;
        outline: none;
        float: left;
        margin-left: 53px;
        }
        ^ .foam-u2-ActionView-cancel:hover {
        background: rgba(164, 179, 184, 0.1);
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start()
          .start().addClass('confirmCashOutContainer')
            .start().addClass('popUpHeader')
              .start().add(this.Title).addClass('popUptitle').end()
              .add(this.CLOSE_BUTTON)
            .end()
            .start().add(this.Amount).addClass('amountTitle').end()
            .start('div').addClass('totalDiv')
              .start().add(this.Subtotal).addClass('totalTitle').end()
              .start().add('$0.00').addClass('amount').end()
            .end()
            .start('div').addClass('totalDiv')
              .start().add(this.Fee).addClass('totalTitle').end()
              .start().add('$0.00').addClass('amount').end()
            .end()
            .start('div').addClass('totalDiv')
              .start().add(this.Total).addClass('totalTitle').end()
              .start().add('$0.00').addClass('totalAmount').end()
            .end()
            .start().add(this.BankAccount).addClass('bankAccountTitle').end()
            .start().add('Scotiabank Chequing ****1234').addClass('bankAccount').end()
            .add(this.CANCEL)
            .add(this.CASH_OUT)
          .end()
        .end();
    },
  ],

  messages: [
    { name: 'Title', message: 'Cash Out Confirmation' },
    { name: 'Amount', message: 'Amount' },
    { name: 'Subtotal', message: 'Subtotal' },
    { name: 'Fee', message: 'Fee' },
    { name: 'Total', message: 'Total' },
    { name: 'BankAccount', message: 'Bank Account' },
    { name: 'CancelBtnTitle', message: 'Cancel' },
    { name: 'CashOutBtnTitle', message: 'Cash Out' }
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
      name: 'cancel',
      label: this.CancelBtnTitle,
      code: function (X) {
        X.closeDialog();
      }
    },
    {
      name: 'cashOut',
      label: this.CashOutBtnTitle,
      code: function (X) {
        X.closeDialog();
        X.onCashOutSuccess();
      }
    }
  ]
});