foam.CLASS({
  package: 'net.nanopay.liquidity.ui.account',
  name: 'AccountDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  // TODO: Remove this when CRUNCH is capable of handling this via capabilities.
  documentation: 'A view for creating an account in Liquid.',

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],

  imports: [
    'group'
  ],

  properties: [
    {
      name: 'propertyWhitelist',
      // NOTE: We're invalidating when 'of' changes here because
      // liquiditySettings is only defined on certain subclasses of Account.
      // When the adapt function tries to look up that axiom, it may or may not
      // find it, depending on 'of'. Therefore, whenever 'of' changes, we look
      // again.
      expression: function(of) {
        var config = {
          name: {
            required: true,
            validateObj: undefined // reset
          },
          desc: {},
          denomination: {},
          parent: {
            required: this.group.id === 'liquidBasic'
          },
          liquiditySetting: {}
        };

        // FIXME: This is kinda hacky, but adapt doesn't apply to the return value of expressions.
        return foam.u2.detail.AbstractSectionedDetailView.PROPERTY_WHITELIST.adapt.call(this, undefined, config);
      }
    }
  ]
});
