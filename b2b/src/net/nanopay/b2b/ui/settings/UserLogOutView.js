
foam.CLASS({
  package: 'net.nanopay.b2b.ui.settings',
  name: 'UserLogOutView',
  extends: 'foam.u2.Element',

  documentation: 'User Log out',

  imports: [
    'user',
    'business',
    'stack',
    'expensesDAO',
    'salesDAO'
  ],

  requires: [
    'net.nanopay.b2b.model.Business',
    'net.nanopay.b2b.model.Invoice',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'emptyUser',
      factory: function() { return this.User.create(); }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.b2b.model.Business',
      name: 'emptyBusiness',
      factory: function() { return this.Business.create(); }
    }
  ],

  methods: [
    function initE() {
      location.reload();
      // this.user.copyFrom(this.emptyUser);
      // this.business.copyFrom(this.emptyBusiness);
      // this.stack.push({ class: 'foam.nanos.auth.SignInView' })
    }
  ],
});