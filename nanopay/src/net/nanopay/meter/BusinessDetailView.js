foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'BusinessDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'net.nanopay.model.Business'
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
          this.Business.ID,
          this.Business.BUSINESS_NAME,
          this.Business.CREATED,
          this.Business.DELETED,
          this.Business.STATUS,
          this.Business.COMPLIANCE,
          this.Business.ONBOARDED,
          this.Business.BUSINESS_PHONE,
          this.Business.BUSINESS_ADDRESS,
          this.Business.ACCOUNTS,
          this.Business.CONTACTS,
          this.Business.AGENTS,
        ];
      }
    }
  ]
});
