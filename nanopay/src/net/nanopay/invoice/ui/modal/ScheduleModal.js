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
  package: 'net.nanopay.invoice.ui.modal',
  name: 'ScheduleModal',
  extends: 'foam.u2.Controller',

  documentation: 'Schedule Payment Modal',

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling',
    'foam.mlang.Expressions'
  ],

  imports: [
    'account',
    'invoiceDAO',
    'notify',
    'user'
  ],

  properties: [
    'invoice',
    {
      name: 'otherPartyName',
      documentation: `The name of the other party involved with the invoice.`,
      expression: function(invoice, user) {
        return user.id !== invoice.payeeId ?
            this.invoice.payee.toSummary() :
            this.invoice.payer.toSummary();
      }
    },
    {
      class: 'Date',
      name: 'paymentDate',
      expression: function(invoice) {
        return invoice.paymentDate;
      }
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    'currency',
    {
      name: 'accounts',
      view: function(_, X) {
        var expr = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.ChoiceView',
          dao: X.user.accounts.where(
                expr.EQ(
                  net.nanopay.bank.BankAccount.STATUS,
                  net.nanopay.bank.BankAccountStatus.VERIFIED
                )),
          objToChoice: function(account) {
            return [
              account.id,
              `${account.name} ${X.bankAccount.mask(account.accountNumber)}`
            ];
          }
        };
      }
    }
  ],

  css: `
    ^{
      width: 448px;
      margin: auto;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    ^ .blue-button{
      margin: 20px 20px;
      float: right;
    }
    ^key-value{
      margin-top: 10px;
      margin-bottom: 25px;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 40px;
      border-radius: 0;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      padding: 12px 20px;
      padding-right: 35px;
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      background-color: white;
      outline: none;
      cursor: pointer;
    }
    ^ .foam-u2-tag-Select:disabled {
      cursor: default;
      background: white;
    }
    ^ .foam-u2-tag-Select:focus {
      border: solid 1px #59A5D5;
    }
    ^ .dropdownContainer {
      position: relative;
      margin-bottom: 20px;
    }
    ^ .caret {
      position: relative;
      pointer-events: none;
      left: 75px;
    }
    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 295px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }
    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }
    ^ .confirmationContainer {
      margin-top: 18px;
      width: 100%;
    }
    ^ input[type='checkbox'] {
      display: inline-block;
      vertical-align: top;
      margin:0 ;
      border: solid 1px rgba(164, 179, 184, 0.75);
      cursor: pointer;
    }
    ^ input[type='checkbox']:checked {
      background-color: black;
    }
    ^ .confirmationLabel {
      margin-top: 0;
      display: inline-block;
      vertical-align: top;
      width: 80%;
      font-size: 12px;
      cursor: pointer;
    }
    ^ .choice {
      margin: 20px;
    }
    ^ .choice .label {
      margin-left: 0;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.getDefaultBank();

      this
      .tag(this.ModalHeader.create({
        title: 'Schedule'
      }))
      .addClass(this.myClass())
        .start()
          .start().addClass('key-value-container')
            .start()
              .start().addClass('key').add('Company').end()
              .start().addClass('value').add(this.otherPartyName).end()
            .end()
            .start()
              .start().addClass('key')
                .add('Amount')
              .end()
              .start().addClass('value')
                .add(this.invoice.destinationCurrency, ' ', (this.invoice.amount/100).toFixed(2))
              .end()
            .end()
          .end()
          .start().addClass('choice')
            .start('div').addClass('confirmationContainer')
              .start('p').addClass('label').add('Pay from account')
              .end()
            .end()
            .start('div').addClass('dropdownContainer').show(this.accountCheck$)
              .start(self.ACCOUNTS).end()
              .start('div').addClass('caret').end()
            .end()
          .end()

          .start().addClass('label').add('Schedule a Date').end()
          .start(this.PAYMENT_DATE).addClass('full-width-input').end()
          .start().addClass('label').add('Note').end()
          .start(this.NOTE).addClass('input-box').end()
          .start(this.SCHEDULE).addClass('blue-button').addClass('btn').end()
        .end()
      .end();
    },

    function getDefaultBank() {
      var self = this;
      this.user.accounts.where(
        this.AND(
          this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED),
          this.EQ(this.BankAccount.SET_AS_DEFAULT, true)
        )
      ).select().then(function(a) {
        if ( a.array.length == 0 ) return;
        self.accounts = a.array[0].id;
        self.account = a.array[0];
      });
    }
  ],

  actions: [
    {
      name: 'schedule',
      label: 'Confirm',
      code: function(X) {
        var paymentDate = X.data.paymentDate;
        if ( ! X.data.paymentDate ) {
          this.notify('Please select a schedule date.', '', this.LogLevel.ERROR, true);
          return;
        } else if ( X.data.paymentDate < Date.now() ) {
          this.notify('Cannot schedule a payment date for the past. Please try again.', '', this.LogLevel.ERROR, true);
          return;
        }

        if ( isNaN(paymentDate) && paymentDate != null ) {
          this.notify('Please enter a valid due date yyyy-mm-dd.', '', this.LogLevel.ERROR, true);
          return;
        }

        if ( this.accountCheck ) this.invoice.accountId = this.accounts;

        if ( this.paymentDate ) {
          this.paymentDate = this.paymentDate.setMinutes(
            this.paymentDate.getMinutes() + new Date().getTimezoneOffset()
          );
        }

        this.invoice.paymentDate = this.paymentDate;
        this.invoice.note = this.note;

        this.invoiceDAO.put(this.invoice);

        this.notify('Invoice payment has been scheduled.', '', this.LogLevel.INFO, true);
        X.closeDialog();
      }
    }
  ]
});
