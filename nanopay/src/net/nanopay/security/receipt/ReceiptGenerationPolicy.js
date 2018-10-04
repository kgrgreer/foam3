foam.INTERFACE({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGenerationPolicy',

  implements: [
    'foam.nanos.NanoService'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.OnGenerateReceiptListener',
      name: 'listener',
    }
  ],

  methods: [
    {
      name: 'update',
      documentation: 'Update function which updates some internal state of the policy.',
      args: [
        { class: 'FObjectProperty', name: 'obj' }
      ]
    }
  ]
});
