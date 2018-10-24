foam.INTERFACE({
  package: 'net.nanopay.iso8583.padder',
  name: 'Padder',

  documentation: 'Interface to pad string',

  methods: [
    {
      name: 'pad',
      javaReturns: 'String',
      args: [
        {
          name: 'data',
          javaType: 'String'
        },
        {
          name: 'maxLength',
          javaType: 'int'
        }
      ]
    }
  ]
});
