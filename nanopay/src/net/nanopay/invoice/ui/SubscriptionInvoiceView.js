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
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionInvoiceView',
  extends: 'foam.u2.View',

  requires: [ 
    'net.nanopay.invoice.model.Invoice', 
    'foam.u2.dialog.Popup' 
  ],

  imports: [ 
    'stack', 
    'invoiceDAO', 
    'ctrl',
    'hideSubscription'
  ],
  
  implements: [
    'foam.mlang.Expressions', 
  ],

  css: `
    ^ h5{
      opacity: 0.6;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      color: /*%BLACK%*/ #1e1f21;
      padding-top: 70px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.hideSubscription = true;

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
            subMenu1: 'Edit Invoice',
            subMenu2: 'Void' 
          }
        })
        .start('h5').add('Bill to ', this.data.payeeName).end()
        .tag({ class: 'net.nanopay.invoice.ui.shared.SingleItemView', data: this.data })
    }
  ],

  listeners: [
    function recordPaymentModal(){
      this.ctrl.add(this.Popup.create().tag({class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal', invoice: this.data }));
    }
  ],

  actions: [
    {
      name: 'backAction',
      label: 'Back',
      code: function(X){
        X.hideSubscription$.set(false);
        X.stack.back();
      }
    }
  ]
});