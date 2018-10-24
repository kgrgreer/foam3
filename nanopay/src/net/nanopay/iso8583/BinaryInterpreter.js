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
    },
    {
      name: 'uninterpret',
      javaReturns: 'byte[]',
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
          name: 'bytes',
          javaType: 'int'
        }
      ]
    }
  ]
});
