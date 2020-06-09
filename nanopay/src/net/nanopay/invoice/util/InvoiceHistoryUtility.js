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
  package: 'net.nanopay.invoice.util',
  name: 'InvoiceHistoryUtility',

  methods: [

    function getId(formattedUser) {
      // a string has a format 'lastName, firstName(id)'
      const start = formattedUser.lastIndexOf('(') + 1;
      const end = formattedUser.lastIndexOf(')');
      const id = parseInt(formattedUser.slice(start, end));
      return id;
    },

    function getName(formattedUser) {
      // a string has a format 'lastName, firstName(id)'
      const start = formattedUser.lastIndexOf(',') === -1 ? 0: formattedUser.lastIndexOf(',') + 2;
      const end = formattedUser.lastIndexOf('(') === -1 ? formattedUser.length : formattedUser.lastIndexOf('(');
      const firstName = formattedUser.slice(start, end);
      return firstName;
    },

    function getDisplayName(record, user, invoice) {
      var business = invoice.createdBy === invoice.payer.id ? invoice.payer : invoice.payee;
      return record.agent && user.id === this.getId(record.user) ?
                                      this.getName(record.agent) : business.toSummary();
    },

    function formatDate(timestamp) {
      var locale = 'en-US';
      return timestamp.toLocaleTimeString(locale, { hour12: false }) +
        ' ' + timestamp.toLocaleString(locale, { month: 'short' }) +
        ' ' + timestamp.getDate() +
        ', ' + timestamp.getFullYear();
    },

    function getAttributes(record) {
      var status = record.updates.find((u) => u.name === 'status');

      if ( status === undefined ) return null;

      switch ( status.newValue ) {
        case this.InvoiceStatus.VOID:
          return {
            labelText: this.InvoiceStatus.VOID.label,
            labelDecoration: 'Invoice-Status-Void',
            icon: 'images/ic-void.svg'
          };
        case this.InvoiceStatus.FAILED:
          return {
            labelText: this.InvoiceStatus.FAILED.label,
            labelDecoration: 'Invoice-Status-Void',
            icon: 'images/ic-void.svg'
          };
        case this.InvoiceStatus.PROCESSING:
          return {
            labelText: this.InvoiceStatus.PROCESSING.label,
            labelDecoration: 'Invoice-Status-Processing',
            icon: 'images/ic-pending.svg',
          };
        case this.InvoiceStatus.PAID:
          return {
            labelText: this.InvoiceStatus.PAID.label,
            labelDecoration: 'Invoice-Status-Paid',
            icon: 'images/ic-approve.svg'
          };
        case this.InvoiceStatus.SCHEDULED:
          return {
            labelText: this.InvoiceStatus.SCHEDULED.label,
            labelDecoration: 'Invoice-Status-Scheduled',
            icon: 'images/ic-scheduled.svg'
          };
        case this.InvoiceStatus.OVERDUE:
          return {
            labelText: this.InvoiceStatus.OVERDUE.label,
            labelDecoration: 'Invoice-Status-Overdue',
            icon: 'images/ic-overdue.svg'
          };
        case this.InvoiceStatus.UNPAID:
          return {
            labelText: this.InvoiceStatus.UNPAID.label,
            labelDecoration: 'Invoice-Status-Unpaid',
            icon: 'images/ic-scheduled.svg'
          };
        case this.InvoiceStatus.PENDING_APPROVAL:
          var user = ctrl.user;
          var currentUser = `${user.lastName}, ${user.firstName}(${user.id})`;
          if ( record.user === currentUser ) {
            return {
              labelText: this.InvoiceStatus.PENDING_APPROVAL.label,
              labelDecoration: 'Invoice-Status-Pending-approval',
              icon: 'images/ic-scheduled.svg'
            };
          } else return null;
        case this.InvoiceStatus.PENDING_ACCEPTANCE:
          return {
            labelText: this.InvoiceStatus.PENDING_ACCEPTANCE.label,
            labelDecoration: 'Invoice-Status-Pending-approval',
            icon: 'images/ic-scheduled.svg'
          };
        case this.InvoiceStatus.DEPOSITING_MONEY:
          return {
            labelText: this.InvoiceStatus.DEPOSITING_MONEY.label,
            labelDecoration: 'Invoice-Status-Pending-approval',
            icon: 'images/ic-scheduled.svg'
          };
        // add default if no case matches
        default:
          return null
      }
    },
  ]
});
