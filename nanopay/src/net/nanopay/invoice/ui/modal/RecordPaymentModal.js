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
  name: 'RecordPaymentModal',
  extends: 'foam.u2.Controller',

  documentation: 'Record Payment Modal',

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  imports: [
    'invoiceDAO',
    'notify'
  ],

  properties: [
    net.nanopay.invoice.model.Invoice.CHEQUE_AMOUNT.clone().copyFrom({
      expression: function(invoice) {
        return invoice.amount;
      }
    }),
    net.nanopay.invoice.model.Invoice.PAYMENT_DATE.clone().copyFrom({
      view: { class: 'foam.u2.DateView' }
    }),
    net.nanopay.invoice.model.Invoice.NOTE.clone().copyFrom({
      expression: function(invoice) {
        return invoice.note;
      }
    }),
    {
      name: 'currencyType',
      view: { class: 'net.nanopay.sme.ui.CurrencyChoice' },
      value: 'CAD'
    },
    {
      name: 'mode',
      value: foam.u2.DisplayMode.DISABLED
    },
    'invoice'
  ],

  messages: [
    { name: 'TITLE', message: 'Mark as Complete?' },
    { name: 'MSG_1', message: 'Once this invoice is marked as complete, it cannot be edited.' },
    { name: 'MSG_INVALID_DATE', message: 'Please enter a valid paid date' },
    { name: 'MSG_RECEIVE_DATE', message: 'Please enter the date you received payment' },
    { name: 'SUCCESS_MESSAGE', message: 'Invoice has been marked completed' },
    { name: 'PLACEHOLDER_TEXT', message: '(i.e. What method of payment was it paid in?)' },
    { name: 'DATE_LABEL', message: 'Date Paid' },
    { name: 'AMOUNT_LABEL', message: 'Amount Paid' },
    { name: 'NOTE_LABEL', message: 'Notes' }
  ],

  css: `
    ^ {
      width: 330px;
      padding: 25px;
      margin: auto;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice {
      width: 90px;
      padding-left: 5px;
      background: #ffffff;
      display: inline-block;
      height: 38px;
      vertical-align: top;
      border-style: solid;
      border-width: 1px 0 1px 1px;
      border-color: #8e9090;
      border-radius: 4px 0 0 4px;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice-carrot {
      margin-top: 0px;
    }
    ^ .foam-u2-ActionView-close {
      right: -280px !important;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice-container {
      margin-top: 9px;
      height: auto;
    }
    ^ .record-payment-button {
      float: right;
      margin: 20px;
    }
    ^ .property-chequeAmount {
      display: inline-block;
      height: 40px;
      width: 70%;
    }
    ^ .property-note {
      width: 100%;
    }
    ^ .property-paymentDate {
      width: 100%;
    }
    ^ .label {
      margin-top: 15px;
    }
    ^ p {
      margin-bottom: 25px;
    }
    ^ .button-container {
      margin-top: 20px;
      float: right;
    }
    ^ .foam-u2-CurrencyView {
      width: 100%;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
      .addClass(this.myClass())
      .start()
        .start('h2')
          .add(this.TITLE)
        .end()
        .start('p')
          .add(this.MSG_1)
        .end()
        .start()
          .start().addClass('label').add(this.DATE_LABEL).end()
          .start(this.PAYMENT_DATE).end()
        .end()
        .start()
          .start().addClass('label').add(this.AMOUNT_LABEL).end()
          .start(this.CURRENCY_TYPE, { mode$: this.mode$ }).end()
          .start(this.CHEQUE_AMOUNT, { mode$: this.mode$ }).end()
        .end()
        .start()
          .start().addClass('label').add(this.NOTE_LABEL).end()
          .start(this.NOTE, { placeholder: this.PLACEHOLDER_TEXT }).end()
        .end()
        .start()
          .addClass('button-container')
          .tag(this.CANCEL, { buttonStyle: 'TERTIARY' })
          .tag(this.RECORD)
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'record',
      label: 'Complete',
      code: function(X) {
        if ( ! X.data.paymentDate ) {
          this.add(this.notify(this.MSG_RECEIVE_DATE, '', this.LogLevel.ERROR, true));
          return;
        }

        // By pass for safari & mozilla type='date' on input support
        // Operator checking if dueDate is a date object if not, makes it so or throws notification.
        let paymentDateInTime = this.paymentDate.getTime();
        let paymentDate_ = this.paymentDate.toISOString().substring(0, 10).replace(/-/gi, '');
        const issueDate_ = this.invoice.issueDate.toISOString().substring(0, 10).replace(/-/gi, '');
        const currentDate_ = (new Date()).toISOString().substring(0, 10).replace(/-/gi, '');

        let isInvalidPaymentDate = isNaN(paymentDate_) || Number(paymentDate_) > Number(currentDate_) || Number(paymentDate_) < Number(issueDate_);

        if ( isInvalidPaymentDate ) {
          this.notify(this.MSG_INVALID_DATE, '', this.LogLevel.ERROR, true);
          return;
        }

        // when user selects payment date, the date is set in UTC time zone
        // so we need to take difference between UTC time zone and user's local time zone
        // into account when calculating payment date
        paymentDateInTime += this.paymentDate.getTimezoneOffset() * 60000;

        this.invoice.paymentDate = new Date(paymentDateInTime);
        this.invoice.chequeAmount = X.data.chequeAmount;
        this.invoice.chequeCurrency = X.data.currencyType.id;
        this.invoice.paymentMethod = this.PaymentStatus.CHEQUE;
        this.invoice.note = X.data.note;
        this.invoiceDAO.put(this.invoice);
        this.notify(this.SUCCESS_MESSAGE, '', this.LogLevel.INFO, true);
        X.closeDialog();
      }
    }
  ]
});
