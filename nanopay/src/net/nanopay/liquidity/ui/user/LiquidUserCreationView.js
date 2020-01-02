foam.CLASS({
  package: 'net.nanopay.liquidity.ui.user',
  name: 'LiquidUserCreationView',
  extends: 'foam.u2.detail.SectionedDetailView',

  // TODO: Remove this when CRUNCH is capable of handling this via capabilities.
  documentation: 'A view for creating a Liquid user.',

  imports: [
    'countryDAO'
  ],

  properties: [
    ['of', 'foam.nanos.auth.User'],
    {
      name: 'propertyWhitelist',
      factory: function() {
        var self = this;
        return [
          foam.nanos.auth.User.FIRST_NAME.clone().copyFrom({
            gridColumns: 6
          }),
          foam.nanos.auth.User.LAST_NAME.clone().copyFrom({
            gridColumns: 6
          }),
          foam.nanos.auth.User.EMAIL,
          foam.nanos.auth.User.DESIRED_PASSWORD.clone().copyFrom({
            validateObj: function(desiredPassword) {
              if ( desiredPassword.length < 6 ) {
                return 'Password must be at least 6 characters long.';
              }
            }
          }),
          foam.nanos.auth.User.PHONE_NUMBER,
          foam.nanos.auth.Address.COUNTRY_ID.clone().copyFrom({
            postSet: function(_, n) {
              self.data.address.countryId = n;
            }
          }),
          foam.nanos.auth.User.ORGANIZATION.clone().copyFrom({
            label: 'Company Name'
          }),
          foam.nanos.auth.User.JOB_TITLE,
          foam.nanos.auth.User.ADDRESS.clone().copyFrom({
            label: '',
            view: {
              class: 'foam.u2.detail.VerticalDetailView',
              of: 'foam.nanos.auth.Address',
              propertyWhitelist: [
                foam.nanos.auth.Address.COUNTRY_ID.clone().copyFrom({
                  validateObj: function() {},
                  gridColumns: 12
                })
              ]
            }
          }),
          foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
            createMode: 'HIDDEN'
          })
        ];
      }
    }
  ]
});
