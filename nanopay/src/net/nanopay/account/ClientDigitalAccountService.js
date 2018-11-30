foam.CLASS({
  package: 'net.nanopay.account',
  name: 'ClientDigitalAccountService',

  implements: [
    'net.nanopay.account.DigitalAccountServiceInterface'
  ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName',
      value: 'digitalAccount'
    },
    {
      class: 'Stub',
      of: 'net.nanopay.account.DigitalAccountServiceInterface',
      name: 'delegate',
      factory: function() {
        return this.SessionClientBox.create({
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: this.serviceName
          })
        });
      },
   }
  ]
});
