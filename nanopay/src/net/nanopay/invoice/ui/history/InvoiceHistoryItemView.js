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
  package: 'net.nanopay.invoice.ui.history',
  name: 'InvoiceHistoryItemView',
  extends: 'foam.u2.View',
  documentation: 'View displaying history for each history object.',

  implements: [
    'foam.u2.history.HistoryItemView'
  ],

  requires: [
    'net.nanopay.invoice.ui.history.InvoiceStatusHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceReceivedHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceCreatedHistoryItemView',
    'net.nanopay.invoice.ui.history.InvoiceApprovedHistoryItemView',
  ],

  imports: [
    'user'
  ],

  properties: [
    {
      name: 'invoiceStatusHistoryItemView',
      factory: function() {
        return this.InvoiceStatusHistoryItemView.create();
      }
    },
    {
      name: 'invoiceReceivedHistoryItemView',
      factory: function() {
        return this.InvoiceReceivedHistoryItemView.create();
      }
    },
    {
      name: 'invoiceCreatedHistoryItemView',
      factory: function() {
        return this.InvoiceCreatedHistoryItemView.create();
      }
    },
    {
      name: 'invoiceApprovedHistoryItemView',
      factory: function() {
        return this.InvoiceApprovedHistoryItemView.create();
      }
    }
  ],

  methods: [
    function outputRecord(parentView, record) {
      const currentUser = this.user.id;
      const recordUser = record.userId;
      const isFirstHistoryEvent = record.updates.length === 0;
      const updatesContainRelevantChange = record.updates.some((update) => {
        if ( update.name === 'status' ) {
          return update.oldValue.name !== 'DRAFT';
        }
        return update.name === 'paymentDate';
      });
      const updatesContainApprovalChange = record.updates.some((update) => {
        return update.name === 'approvedBy';
      });

      if ( isFirstHistoryEvent ) {
        if ( currentUser === recordUser ) {
          this.invoiceCreatedHistoryItemView.outputRecord(parentView, record);
        } else {
          this.invoiceReceivedHistoryItemView.outputRecord(parentView, record);
        }
      } else if ( updatesContainRelevantChange ) {
        this.invoiceStatusHistoryItemView.outputRecord(parentView, record);
        if ( updatesContainApprovalChange && currentUser === recordUser ) {
          this.invoiceApprovedHistoryItemView.outputRecord(parentView, record);
        }
      }
    },

    /* a function that extracts id from a formatted user string */
    function getId(formattedUser) {
      // a string has a format 'lastName, firstName(id)'
      const start = formattedUser.lastIndexOf('(') + 1;
      const end = formattedUser.lastIndexOf(')');
      const id = parseInt(formattedUser.slice(start, end));
      return id;
    }
  ]
});
