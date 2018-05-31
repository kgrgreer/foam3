
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'RecordPaymentModal',
  extends: 'foam.u2.Controller',

  documentation: 'Record Payment Modal',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  imports: [
    'invoiceDAO'
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
    { name: 'Title', message: 'Record Payment' }
  ],

  constants: {
    RECORDED_PAYMENT: -2
  },

  css: `
    ^ {
      width: 448px;
      margin: auto;
      font-family: Roboto;
    }
    ^ .net-nanopay-ui-ActionView-close{
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
    ^ .net-nanopay-ui-ActionView-closeButton {
      width: 24px;
      height: 24px;
      margin: 0;
      margin-top: 7px;
      margin-right: 20px;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      background: transparent;
      box-shadow: none;
    }
    ^ .net-nanopay-ui-ActionView-closeButton:hover {
      background: transparent;
      background-color: transparent;
    }
  `,
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
      .addClass(this.myClass())
      .start()
        .start().addClass('popUpHeader')
          .start().add(this.Title).addClass('popUpTitle').end()
          .add(this.CLOSE_BUTTON)
        .end()
        .start().addClass('key-value-container')
          .start()
            .start().addClass('key').add('Company').end()
            .start().addClass('value').add(this.invoice.payerName).end()
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
        .start(this.RECORD).addClass('blue-button').addClass('btn').end()
      .end()
    } 
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
      name: 'record',
      label: 'Record Payment',
      code: function(X){
        var paymentDate = X.data.paymentDate;
        if(!X.data.paymentDate){
          this.add(this.NotificationMessage.create({ message: 'Please select a payment date.', type: 'error' }));
          return;
        }
        // By pass for safari & mozilla type='date' on input support
        // Operator checking if dueDate is a date object if not, makes it so or throws notification.
        if( isNaN(paymentDate) && paymentDate != null ){
          this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Please Enter Valid Due Date yyyy-mm-dd.', type: 'error' }));            
          return;  
        }
        
        paymentDate = paymentDate.setMinutes(this.paymentDate.getMinutes() + new Date().getTimezoneOffset());
        
        this.invoice.status = 'Paid';
        this.invoice.paymentDate = paymentDate;
        // Avoids schedule invoice payments in cron.
        this.invoice.paymentId = this.RECORDED_PAYMENT;
        this.invoice.paymentMethod = 'CHEQUE';
        this.invoice.note = X.data.note;
        this.invoiceDAO.put(this.invoice);
        ctrl.add(this.NotificationMessage.create({ message: 'Invoice payment recorded.', type: '' }));        
        X.closeDialog();
      }
    }
  ]
})