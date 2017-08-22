foam.CLASS({
  package: 'net.nanopay.retail.ui',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'Top-level Retail Controller',

  implements: [
    'foam.nanos.client.Client',
    'net.nanopay.retail.dao.Storage'
  ],

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.retail.model.Merchant',
    'net.nanopay.retail.model.Device'
  ],

  exports: [
    'merchant',
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
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.retail.model.Merchant',
      name: 'merchant',
      factory: function() { return this.Merchant.create(); }
    },
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    }
  ],

  methods: [
    function init() {
    },

    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.retail.ui.shared.topNavigation.TopNav', data: this.merchant })
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
