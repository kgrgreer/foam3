foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ClientAuthService',

  implements: [
    'foam.nanos.auth.AuthService'
  ],

  requires: [
    'foam.box.HTTPBox',
    'net.nanopay.auth.AuthServiceClientBox',
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      name: 'delegate',
      of: 'foam.nanos.auth.AuthService',
      factory: function() {
        return this.AuthServiceClientBox.create({ delegate: this.HTTPBox.create({
          method: 'POST',
          url: this.serviceName
        })});
      }
    }
  ]
});
