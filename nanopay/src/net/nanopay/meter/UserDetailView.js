foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'UserDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'foam.nanos.auth.User'
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
          this.User.ID,
          this.User.LEGAL_NAME,
          this.User.EMAIL,
          this.User.STATUS,
          this.User.COMPLIANCE,
          this.User.BIRTHDAY,
          this.User.PHONE_NUMBER,
          this.User.ADDRESS,
          this.User.CREATED,
          this.User.TWO_FACTOR_ENABLED,
          this.User.ENTITIES.clone().copyFrom({ label: 'Businesses' }),
          this.User.COMPLIANCE_RESPONSES
        ];
      }
    }
  ]
});
