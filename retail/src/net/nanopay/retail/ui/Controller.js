foam.CLASS({
  package: 'net.nanopay.retail.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'Top-level Retail Controller',

  arequire: function() { return foam.nanos.client.ClientBuilder.create(); }, 
  
  implements: [    
    'foam.nanos.client.Client',
    'net.nanopay.client.Client',
    'net.nanopay.tx.client.Client',
    'net.nanopay.retail.dao.Storage'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.retail.model.Device'
  ],

  exports: [
    'user',
    'stack'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        */}
    })
  ],

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'user',
      factory: function() { return this.User.create(); }
    },
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    }
  ],

  methods: [
    function init() {
      this.stack.push({ class: 'net.nanopay.retail.ui.onboarding.SignInView' });
    },

    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.retail.ui.shared.topNavigation.TopNav', data: this.user })
        .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
    }
  ],

  actions: [
    {
      name: 'logout',
      label: 'Sign Out',
      code: function() {
        console.log('TODO: logout')
      }
    }
  ]
});
