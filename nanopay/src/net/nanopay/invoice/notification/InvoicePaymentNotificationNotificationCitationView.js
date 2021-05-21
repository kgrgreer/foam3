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
  name: 'InvoicePaymentNotificationNotificationCitationView',
  extends: 'foam.nanos.notification.NotificationCitationView',

  requires: [
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'addCommas',
    'stack'
  ],

  exports: [
    'as data',
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start(this.LINK).end();
    }
  ],

  actions: [
    {
      name: 'link',
      label: 'View Invoice',
      code: function() {
        var paymentMethod = this.data.invoice.paymentMethod;
        var linkView = paymentMethod === this.PaymentStatus.NANOPAY
            ? 'net.nanopay.invoice.ui.SalesDetailView'
            : 'net.nanopay.invoice.ui.ExpensesDetailView';
        this.stack.push({
          class: linkView,
          data: this.data.invoice
        }, this);
      }
    }
  ]
});
