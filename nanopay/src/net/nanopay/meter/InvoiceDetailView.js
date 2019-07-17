foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'InvoiceDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
    'net.nanopay.accounting.xero.model.XeroInvoice'
  ],

  css: `
    ^ {
      background-color: #fafafa;
      border: 1px solid #e2e2e3;
      border-radius: 4px;
      margin-top: 8px;
    }

    ^ td {
      padding: 8px 16px;
    }

    ^ .foam-u2-PropertyView-label {
      font-weight: bold;
    }

    ^ .property-account,
    ^ .property-destinationAccount {
      cursor: pointer;
      text-decoration: underline;
      color: blue;
    }
  `,

  properties: [
    {
      name: 'properties',
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
