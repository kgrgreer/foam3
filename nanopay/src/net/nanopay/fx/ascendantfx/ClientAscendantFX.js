foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'ClientAscendantFX',

  implements: [
    'net.nanopay.fx.ascendantfx.AscendantFX'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      name: 'delegate',
      of: 'net.nanopay.fx.ascendantfx.AscendantFX',
      factory: function() {
        return this.SessionClientBox.create({ delegate: this.HTTPBox.create({
          method: 'POST',
          url: this.serviceName
        })});
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
