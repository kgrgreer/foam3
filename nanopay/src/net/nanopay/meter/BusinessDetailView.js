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
          this.Business.INTEGRATION_CODE,
          this.Business.COUNT_QBO,
          this.Business.COUNT_XERO,
          this.Business.COMPLIANCE,
          this.Business.ONBOARDED,
          this.Business.EMAIL,
          this.Business.BUSINESS_PHONE,
          this.Business.BUSINESS_ADDRESS,
          this.Business.BUSINESS_DIRECTORS,
          this.Business.ACCOUNTS,
          this.Business.CONTACTS,
          this.Business.AGENTS,
          this.Business.COMPLIANCE_RESPONSES,
          this.Business.BENEFICIAL_OWNERS
        ];
      }
    }
  ]
});
