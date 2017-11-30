
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'RecordPaymentModal',
  extends: 'foam.u2.Controller',

  documentation: 'Record Payment Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
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

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 448px;
          margin: auto;
          font-family: Roboto;
        }
        ^ .net-nanopay-ui-ActionView-close{
          right: -280px !important;
        }
    */}
    })
  ],
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
      .tag(this.ModalHeader.create({
        title: 'Record Payment'
      }))
      .addClass(this.myClass())
      .start()
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
        .start(this.RECORD).addClass('blue-button btn').end()
      .end()
    } 
  ],

  actions: [
    {
      name: 'record',
      label: 'Record Payment',
      code: function(X){
        if(!X.data.paymentDate){
          this.add(this.NotificationMessage.create({ message: 'Please select a payment date.', type: 'error' }));
          return;
        }

        this.invoice.status = 'Paid';
        this.invoice.paymentDate = X.data.paymentDate;
        this.invoice.paymentMethod = 'CHEQUE';
        this.invoice.note = X.data.note;
        this.invoiceDAO.put(this.invoice);
        ctrl.add(this.NotificationMessage.create({ message: 'Invoice payment recorded.', type: '' }));        
        X.closeDialog();
      }
    }
  ]
})