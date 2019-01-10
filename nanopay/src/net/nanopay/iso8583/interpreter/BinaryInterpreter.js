foam.INTERFACE({
  package: 'net.nanopay.iso8583.interpreter',
  name: 'BinaryInterpreter',

  documentation: 'Interface to interpret byte array data',

  methods: [
    {
      name: 'interpret',
      javaType: 'void',
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
      javaType: 'byte[]',
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
      javaType: 'int',
      args: [
        {
          name: 'bytes',
          javaType: 'int'
        }
      ]
    }
  ]
});
