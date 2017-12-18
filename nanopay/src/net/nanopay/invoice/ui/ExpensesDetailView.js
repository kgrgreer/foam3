foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'ExpensesDetailView',
  extends: 'foam.u2.View',

  requires: [ 
    'foam.u2.dialog.Popup'
  ],

  imports: [ 
    'stack', 
    'hideSaleSummary', 
    'invoiceDAO', 
    'ctrl'
  ],
  
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
      this.hideSaleSummary = true;

      this
        .addClass(this.myClass())
        .start(this.BACK_ACTION).end()
        .tag({ 
          class: 'net.nanopay.invoice.ui.shared.ActionInterfaceButton', 
          data: this.data,
          detailActions: { 
            invoice: this.data,
            buttonLabel: 'Pay Now', 
            buttonAction: this.payNowPopUp, 
            subMenu1: 'Schedule a Payment', 
            subMenuAction1: this.schedulePopUp, 
            subMenu2: 'Void', 
            subMenuAction2: this.voidPopUp 
          }
        })
        .start('h5').add('Invoice from ', this.data.payeeName).end()
        .tag({ class: 'net.nanopay.invoice.ui.shared.SingleItemView', data: this.data })
        .start('h2').addClass('light-roboto-h2').style({ "margin-bottom": "0px"})
          .add('Note:')
        .end()
        .start('br').end()
        .start('h2').addClass('light-roboto-h2')
          .add(this.data.note)
        .end();
    }
  ],

  listeners: [
    function payNowPopUp(){
      if(this.data.paymentMethod.name != 'NONE'){
        debugger;
        this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Invoice has been ' + this.data.paymentMethod.label + '.', type: 'error' }));
        return;
      }
      this.stack.push({ class: 'net.nanopay.ui.transfer.TransferWizard', type: 'regular', invoice: this.data });
    },

    function voidPopUp(){
      if(this.data.paymentMethod.name != 'NONE'){
        this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Invoice has been ' + this.data.paymentMethod.label + '.', type: 'error' }));
        return;
      }
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.DisputeModal', invoice: this.data }));
    },

    function schedulePopUp(){
      if(this.data.paymentMethod.name != 'NONE'){
        this.add(foam.u2.dialog.NotificationMessage.create({ message: 'Invoice has been ' + this.data.paymentMethod.label + '.', type: 'error' }));
        return;
      }
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.ScheduleModal', invoice: this.data }));
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.stack.push({ class: 'net.nanopay.invoice.ui.ExpensesView'});
      }
    }
  ]
});