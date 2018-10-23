foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'Interpreter',

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
          javaType: 'String',
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    }
  ]
});
