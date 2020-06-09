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
  package: 'net.nanopay.invoice.notification',
  name: 'NewInvoiceNotificationNotificationCitationView',
  extends: 'foam.nanos.notification.NotificationCitationView',

  requires: [
    'net.nanopay.invoice.notification.InvoiceNotificationType'
  ],

  imports: [
    'addCommas',
    'invoiceDAO',
    'stack'
  ],

  exports: [
    'as data',
  ],

  properties: [
    'invoice',
    'message'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;
      this.invoiceDAO.find(this.data.invoiceId).then(function(result) {
        self.invoice = result;
        if ( self.invoice == null ) {
          self.message = 'The invoice for this notification can no longer be found.';
        } else {
          var senderName = self.invoice.payeeId !== self.invoice.createdBy
              ? self.invoice.payer.toSummary()
              : self.invoice.payee.toSummary();
          var invoiceType = self.getInvoiceNotificationType(self.invoice);
          var amount = self.addCommas((self.invoice.amount / 100).toFixed(2));
          self.message = `${senderName} just sent you a ${invoiceType.label} invoice
              of $${amount}.`;
        }
      });
      this
        .addClass(this.myClass())
        .start()
          .addClass('msg')
          .add(this.message$)
        .end()
        .start(this.LINK).end();
    },
    function getInvoiceNotificationType(invoice) {
      return invoice.payeeId === invoice.createdBy
          ? this.InvoiceNotificationType.PAYABLE
          : this.InvoiceNotificationType.RECEIVABLE;
    }
  ],

  actions: [{
    name: 'link',
    label: 'View Invoice',
    isEnabled: function(invoice) {
      return invoice != null;
    },
    code: function() {
      if ( this.getInvoiceNotificationType(this.invoice)
          === this.InvoiceNotificationType.RECEIVABLE ) {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.SalesDetailView',
          data: this.invoice
        }, this);
      } else {
        this.stack.push({
          class: 'net.nanopay.invoice.ui.ExpensesDetailView',
          data: this.invoice
        }, this);
      }
    }
  }]
});
