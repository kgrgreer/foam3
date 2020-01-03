foam.CLASS({
  package: 'net.nanopay.liquidity.ui.user',
  name: 'LiquidUserDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  // TODO: Remove this when CRUNCH is capable of handling this via capabilities.
  documentation: 'A view for creating a Liquid user.',

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User'
  ],

  properties: [
    ['of', 'foam.nanos.auth.User'],
    {
      name: 'propertyWhitelist',
      factory: function() {
        return [
          this.User.FIRST_NAME.clone().copyFrom({
            gridColumns: 6
          }),
          this.User.LAST_NAME.clone().copyFrom({
            gridColumns: 6
          }),
          this.User.EMAIL,
          this.User.DESIRED_PASSWORD.clone().copyFrom({
            validateObj: function(desiredPassword) {
              if ( desiredPassword.length < 6 ) {
                return 'Password must be at least 6 characters long.';
              }
            }
          }),
          this.User.PHONE_NUMBER,
          this.User.ORGANIZATION.clone().copyFrom({
            label: 'Company Name'
          }),
          this.User.JOB_TITLE,
          this.User.ADDRESS.clone().copyFrom({
            label: '',
            view: {
              class: 'foam.u2.detail.VerticalDetailView',
              of: 'foam.nanos.auth.Address',
              propertyWhitelist: [
                this.Address.COUNTRY_ID.clone().copyFrom({
                  validateObj: function() {},
                  gridColumns: 12
                })
              ]
            }
          })
        ];
      }
    }
  ]
});
