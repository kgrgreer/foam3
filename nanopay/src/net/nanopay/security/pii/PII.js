foam.INTERFACE({
  package: 'net.nanopay.security.pii',
  name: 'PII',

  methods: [
    {
      name: 'getPIIData',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          class: 'Long',
          documentation: 'id of the user for whom the data is being reported'
        }
      ]
    }
    // TODO - implement method to deletablePII
    // {
    //   name: 'deletePIIData',
    //   type: 'void',
    // }
  ]
});
