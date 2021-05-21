/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.cico.ui.co',
  name: 'ConfirmCashOutModal',
  extends: 'foam.u2.Controller',

  documentation: 'Pop up modal for confirming cash out.',

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'amount',
    'accountDAO as bankAccountDAO',
    'bankList',
    'currentAccount',
    'closeDialog',
    'onCashOutSuccess',
    'cashOut',
    'transactionDAO',
    'notify',
    'user'
  ],

  css: `
    ^ {
      width: 448px;
      height: 288px;
      margin: auto;
    }
    ^ .cashOutContainer {
      width: 448px;
      height: 288px;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
      position: relative;
    }
    ^ .popUpHeader {
      width: 448px;
      height: 40px;
      background-color: /*%BLACK%*/ #1e1f21;
    }
    ^ .popUpTitle {
      width: 198px;
      height: 40px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 40.5px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #ffffff;
      margin-left: 20px;
      display: inline-block;
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
      box-shadow: none;
    }
    ^ .foam-u2-ActionView-closeButton:hover {
      background: transparent;
      background-color: transparent;
    }
    ^ .label {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 20px;
      margin-bottom: 0;
      display: inline-block;
      vertical-align: top;
    }
    ^ .bankInfoDiv {
      display: inline-block;
      margin-left: 35px;
      margin-top: 18px;
    }
    ^ .bankLogo {
      width: 24px;
      height: 24px;
      float: left;
      clear: both;
      margin-bottom: 5px;
    }
    ^ .bankName {
      width: 200px;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      clear: both;
    }
    ^ .accountNumber {
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 5px;
    }
    ^ .amount {
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
      margin-top: 22px;
      margin-left: 75px;
    }
    ^ .foam-u2-ActionView-cashOutBtn {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      width: 136px;
      height: 40px;
      position: static;
      border-radius: 2px;
      background: /*%PRIMARY3%*/ #406dea;
      border: solid 1px /*%PRIMARY3%*/ #406dea;
      display: inline-block;
      color: white;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      margin: 0;
      outline: none;
      float: right;
      box-shadow: none;
      font-weight: normal;
    }
    ^ .foam-u2-ActionView-cashOutBtn:hover {
      background: /*%PRIMARY3%*/ #406dea;
      border-color: /*%PRIMARY3%*/ #406dea;
      opacity: 0.9;
    }
    ^ .foam-u2-ActionView-back {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      width: 136px;
      height: 40px;
      position: static;
      background: rgba(164, 179, 184, 0.1);
      border-radius: 2px;
      border: solid 1px #ebebeb;
      display: inline-block;
      color: /*%BLACK%*/ #1e1f21;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      margin: 0;
      outline: none;
      float: left;
      box-shadow: none;
      font-weight: normal;
    }
    ^ .foam-u2-ActionView-back:hover {
      background: lightgray;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var formattedAmount = this.amount/100;

      this.addClass(this.myClass())
      .start()
        .start().addClass('cashOutContainer')
          .start().addClass('popUpHeader')
            .start().add(this.Title).addClass('popUpTitle').end()
            .add(this.CLOSE_BUTTON)
          .end()
          .start().add(this.bankLabel).addClass('label').end()
          .start('div').addClass('bankInfoDiv')
          .start({ class: 'foam.u2.tag.Image', data: 'images/icon_bank_account_black.png' }).addClass('bankLogo').end()
            .start()
              .addClass('bankName')
              .call(function() {
                self.bankAccountDAO.find(self.bankList).then(function(bank) {
                  this.add(bank.name);
                }.bind(this));
              })
            .end()
            .start().addClass('accountNumber')
            .call(function() {
              self.bankAccountDAO.find(self.bankList).then(function(bank) {
                this.add('***' + bank.accountNumber.substring(bank.accountNumber.length - 3));
              }.bind(this));
            })
            .end()
          .end()
          .br()
          .start().add(this.amountLabel).addClass('label').end()
          .start().add('$', formattedAmount.toFixed(2)).addClass('amount').end()
          .start('div').addClass('modal-button-container')
            .add(this.BACK)
            .add(this.CASH_OUT_BTN)
          .end()
        .end()
      .end()
    }
  ],

  messages: [
    { name: 'Title', message: 'Cash Out' },
    { name: 'bankLabel', message: 'Bank Account' },
    { name: 'amountLabel', message: 'Amount' },
    { name: 'backBtnTitle', message: 'Back' }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'back',
      label: this.backBtnTitle,
      code: function (X) {
        X.closeDialog();
        X.cashOut();
      }
    },
    {
      name: 'cashOutBtn',
      label: 'Cash Out',
      code: function (X) {
        var self = this;

        var cashOutTransaction = this.Transaction.create({
          sourceAccount: this.currentAccount.id,
          destinationAccount:X.bankList,
          amount: X.amount
        });

        X.transactionDAO.put(cashOutTransaction).then(function(response) {
          X.closeDialog();
          X.onCashOutSuccess();
        }).catch(function(error) {
          X.notify(error.message, '', self.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
