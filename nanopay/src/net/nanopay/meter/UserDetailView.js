foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'UserDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  requires: [
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.User.ID,
          this.User.LEGAL_NAME.clone().copyFrom({
            createVisibility: 'HIDDEN',
            updateVisibility: 'HIDDEN',
            readVisibility: 'RO',
          }),
          this.User.FIRST_NAME.clone().copyFrom({
            createVisibility: 'RW',
            updateVisibility: 'RW',
            readVisibility: 'HIDDEN',
          }),
          this.User.LAST_NAME.clone().copyFrom({
            createVisibility: 'RW',
            updateVisibility: 'RW',
            readVisibility: 'HIDDEN',
          }),
          this.User.EMAIL,
          this.User.STATUS,
          this.User.COMPLIANCE,
          this.User.BIRTHDAY,
          this.User.PHONE_NUMBER,
          this.User.ADDRESS,
          this.User.CREATED,
          this.User.TWO_FACTOR_ENABLED,
          this.User.ENTITIES.clone().copyFrom({ label: 'Businesses' }),
          this.User.COMPLIANCE_RESPONSES,
          this.User.DESIRED_PASSWORD,
          this.User.GROUP
        ];
      }
    }
  ]
});
