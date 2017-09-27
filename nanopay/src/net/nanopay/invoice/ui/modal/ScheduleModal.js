
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'ScheduleModal',
  extends: 'foam.u2.Controller',

  documentation: 'Schedule Payment Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  imports: [
    'user'
  ],

  properties: [
    'invoice',
    {
      name: 'type',
      expression: function(invoice, user){
        return user.id ? invoice.payeeId : invoice.payerId
      }
    },
    {
      class: 'Date',
      name: 'paymentDate'
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
      ^{
        width: 448px;
        margin: auto;
        font-family: Roboto;
      }
      ^ .blue-button{
        margin: 20px 20px;
        float: right;
      }
      ^key-value{
        margin-top: 10px;
        margin-bottom: 25px;
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
        title: 'Schedule'
      }))
      .addClass(this.myClass())
        .start()
          .start().addClass('key-value-container')
            .start()
              .start().addClass('key').add("Company").end()
              .start().addClass('value').add(this.type ? this.invoice.payeeName : this.invoice.payerName).end()
            .end()
            .start()
              .start().addClass('key').add("Amount").end()
              .start().addClass('value').add(this.invoice.currencyType, ' ', this.invoice.amount.toFixed(2)).end()
            .end()
          .end()
          .start().addClass('label').add("Payment Method").end()
          .start('select').addClass('full-width-input').end()
          .start().addClass('label').add("Schedule a Date").end()
          .start(this.PAYMENT_DATE).addClass('full-width-input').end()
          .start().addClass('label').add("Note").end()
          .start(this.NOTE).addClass('input-box').end()
          .start(this.SCHEDULE).addClass('blue-button').end()
        .end()
      .end()
    } 
  ],

  actions: [
    {
      name: 'schedule',
      label: 'Confirm',
      code: function(X){
        var invoice = X.data.invoice;
        invoice.paymentDate = this.paymentDate;
        invoice.note = this.note;

        X.invoiceDAO.put(invoice);
        X.closeDialog();
      }
    }
  ]
})