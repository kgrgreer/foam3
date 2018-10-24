foam.INTERFACE({
  package: 'net.nanopay.iso8583.interpreter',
  name: 'Interpreter',

  documentation: 'Interface to interpret String data',

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
    },
    {
      name: 'uninterpret',
      javaReturns: 'String',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'length',
          javaType: 'int'
        },
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    },
    {
      name: 'getPackedLength',
      javaReturns: 'int',
      args: [
        {
          name: 'chars',
          javaType: 'int'
        }
      ]
    }
  ]
});
