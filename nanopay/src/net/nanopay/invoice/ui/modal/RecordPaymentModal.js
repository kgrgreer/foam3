foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'RecordPaymentModal',
  extends: 'foam.u2.Controller',

  documentation: 'Record Payment Modal',

  requires: [
    'foam.u2.dialog.NotificationMessage',
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
    {
      class: 'Date',
      name: 'paymentDate'
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    'invoice'
  ],

  messages: [
    { name: 'TITLE', message: 'Record payment' },
    { name: 'MSG_1', message: 'Please select a payment date.' },
    { name: 'MSG_2', message: 'Please enter a valid due date yyyy-mm-dd.' },
    { name: 'MSG_3', message: 'Invoice payment recorded.' }
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
      font-family: Roboto;
    }
    ^ .foam-u2-ActionView-close{
      right: -280px !important;
    }
    ^ .popUpHeader {
      width: 448px;
      height: 40px;
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
    ^ .full-width-input {
      padding: 0px;
    }
    ^ .record-payment-button {
      float: right;
      margin: 20px;
    }
    ^ .label {
      margin-left: 25px;
    }
  `,
  
  methods: [
    function initE() {
      this.SUPER();

      this
      .addClass(this.myClass())
      .start()
        .start().addClass('popUpHeader')
          .start().add(this.TITLE).addClass('popUpTitle').end()
        .end()
        .start().addClass('key-value-container')
          .start()
            .start().addClass('key').add('Company').end()
            .start().addClass('value').add(this.invoice.payer.label()).end()
          .end()
        .end()
        .start()
          .start().addClass('label').add('Payment Date').end()
          .start(this.PAYMENT_DATE).addClass('full-width-input').end()
        .end()
        .start()
          .start().addClass('label').add('Note').end()
          .start(this.NOTE).addClass('input-box').end()
        .end()
        .start()
          .tag(this.RECORD, { size: 'MEDIUM' })
          .addClass('record-payment-button')
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'record',
      label: 'Record Payment',
      code: function(X) {
        var paymentDate = X.data.paymentDate;
        if ( ! X.data.paymentDate ) {
          this.add(this.notify(this.MSG_1, 'error'));
          return;
        }
        // By pass for safari & mozilla type='date' on input support
        // Operator checking if dueDate is a date object if not, makes it so or throws notification.
        if ( isNaN(paymentDate) && paymentDate != null ) {
          this.add(this.notify(this.MSG_2, 'error'));
          return;
        }
        
        paymentDate = paymentDate.setMinutes(this.paymentDate.getMinutes() + new Date().getTimezoneOffset());
        
        this.invoice.status = this.InvoiceStatus.PAID;
        this.invoice.paymentDate = paymentDate;

        this.invoice.paymentMethod = this.PaymentStatus.CHEQUE;
        this.invoice.note = X.data.note;
        this.invoiceDAO.put(this.invoice);
        this.notify(this.MSG_3);
        X.closeDialog();
      }
    }
  ]
});
