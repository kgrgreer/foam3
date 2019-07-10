foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'InvoiceDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'net.nanopay.invoice.model.Invoice'
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
          this.Invoice.PAYER_ID.clone().copyFrom({
            label: 'Payer'
          }),
          this.Invoice.PAYEE_ID.clone().copyFrom({
            label: 'Payee'
          }),
          this.Invoice.ACCOUNT.clone().copyFrom({
            label: `Payee's Account`
          }),
          this.Invoice.DESTINATION_ACCOUNT.clone().copyFrom({
            label: `Payer's Account`
          })
        ];
      }
    }
  ]
});
