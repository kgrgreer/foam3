foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'ClientIntegrationService',
  documentation: 'Stub for Integration Services',

  implements: [
    'net.nanopay.integration.xero.IntegrationService',
  ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      of: 'net.nanopay.integration.xero.IntegrationService',
      name: 'delegate',
      factory: function() {
        return this.SessionClientBox.create({ delegate: this.HTTPBox.create({
          method: 'POST',
          url: this.serviceName
        })
      });
      },
      swiftFactory: `
return SessionClientBox_create(["delegate": HTTPBox_create([
  "method": "POST",
  "url": serviceName
])])
      `
    }
  ]
});
