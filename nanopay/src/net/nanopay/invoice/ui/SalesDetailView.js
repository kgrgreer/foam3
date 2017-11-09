foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SalesDetailView',
  extends: 'foam.u2.View',

  requires: [ 
    'net.nanopay.invoice.model.Invoice', 
    'foam.u2.dialog.Popup' 
  ],

  imports: [ 
    'stack', 
    'hideReceivableSummary', 
    'invoiceDAO', 
    'ctrl'
  ],

  exports: [ 'hideReceivableSummary' ],
  
  implements: [
    'foam.mlang.Expressions', 
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ h5{
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          color: #093649;
          padding-top: 70px;
        }
        */
      }
    })
  ],


  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.hideReceivableSummary = true;

      this
        .addClass(this.myClass())
        .start(this.BACK_ACTION).end()
        .tag({ 
          class: 'net.nanopay.invoice.ui.shared.ActionInterfaceButton', 
          data: this.data,
          detailActions: { 
            invoice: this.data,
            buttonLabel: 'Record Payment', 
            buttonAction: this.recordPaymentModal,
            subMenu1: 'Void',
            subMenuAction1: this.voidPopUp 
          }
        })
        .start('h5').add('Bill to ', this.data.payerName).end()
        .tag({ class: 'net.nanopay.invoice.ui.shared.SingleItemView', data: this.data })
    }
  ],

  listeners: [
    function recordPaymentModal(){
      if(this.data.paymentDate){
        this.add(net.nanopay.ui.NotificationMessage.create({ message: 'Invoice has already been paid.', type: 'error' }));   
        return;             
      }
      else if(this.data.voided){
        this.add(net.nanopay.ui.NotificationMessage.create({ message: 'Invoice has already been voided.', type: 'error' }));   
        return;
      }
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal', invoice: this.data }));
    },
    function voidPopUp(){
      if(this.data.paymentDate && this.data.paymentDate < new Date()){
        this.add(net.nanopay.ui.NotificationMessage.create({ message: 'Invoice has already been paid.', type: 'error' })); 
        return;    
      }      
      else if(this.data.voided){
        this.add(net.nanopay.ui.NotificationMessage.create({ message: 'Invoice has already been voided.', type: 'error' }));   
        return;
      }
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.DisputeModal', invoice: this.data }));
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'net.nanopay.invoice.ui.SalesView'});
      }
    }
  ]
});