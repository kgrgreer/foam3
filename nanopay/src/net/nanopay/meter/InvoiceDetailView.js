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
  package: 'net.nanopay.meter',
  name: 'InvoiceDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.accounting.xero.model.XeroInvoice'
  ],

  properties: [
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.Invoice.ID,
          this.Invoice.CREATED.clone().copyFrom({
            label: 'Date Created'
          }),
          this.Invoice.CREATED_BY,
          this.Invoice.STATUS,
          this.Invoice.APPROVED_BY,
          this.Invoice.ISSUE_DATE.clone().copyFrom({
            label: 'Issue Date'
          }),
          this.Invoice.DUE_DATE.clone().copyFrom({
            label: 'Due Date'
          }),
          this.Invoice.PAYMENT_DATE.clone().copyFrom({
            label: 'Completion Date'
          }),
          this.Invoice.SOURCE_CURRENCY,
          this.Invoice.SOURCE_AMOUNT,
          this.Invoice.DESTINATION_CURRENCY,
          this.Invoice.AMOUNT,
          this.Invoice.EXCHANGE_RATE,
          this.Invoice.IS_SYNCED_WITH_ACCOUNTING,
          this.XeroInvoice.LAST_DATE_UPDATED,
          this.QuickbooksInvoice.LAST_DATE_UPDATED,
          this.Invoice.PAYER_ID.clone().copyFrom({
            label: 'Payer'
          }),
          this.Invoice.PAYEE_ID.clone().copyFrom({
            label: 'Payee'
          }),
          this.Invoice.ACCOUNT.clone().copyFrom({
            label: `Payee's Account`,
            view: function(_, x) {
              return foam.u2.Element.create(null, x)
              .add(x.data.account$.map((a) => {
                return x.data.account$find.then((a) => a.toSummary());
              }))
              .on('click', function() {
                x.stack.push({
                  class: 'foam.comics.DAOUpdateControllerView',
                  detailView: 'net.nanopay.meter.BankAccountDetailView',
                  dao: x.accountDAO,
                  key: x.data.account
                }, this);
              });
            }
          }),
          this.Invoice.DESTINATION_ACCOUNT.clone().copyFrom({
            label: `Payer's Account`,
            view: function(_, x) {
              return foam.u2.Element.create(null, x)
              .add(x.data.destinationAccount$.map((a) => {
                return x.data.destinationAccount$find.then((a) => a.toSummary());
              }))
              .on('click', function() {
                x.stack.push({
                  class: 'foam.comics.DAOUpdateControllerView',
                  detailView: 'net.nanopay.meter.BankAccountDetailView',
                  dao: x.accountDAO,
                  key: x.data.destinationAccount
                }, this);
              });
            }
          }),
        ];
      }
    }
  ]
});
