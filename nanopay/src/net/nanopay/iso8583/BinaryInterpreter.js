foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'BinaryInterpreter',

  methods: [
    {
      name: 'interpret',
      javaReturns: 'void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'data',
          javaType: 'byte[]',
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    }
  ]
});
