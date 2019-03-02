foam.INTERFACE({
  package: 'net.nanopay.iso8583.interpreter',
  name: 'BinaryInterpreter',

  documentation: 'Interface to interpret byte array data',

  methods: [
    {
      name: 'interpret',
      type: 'Void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'data',
          type: 'Byte[]',
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'uninterpret',
      type: 'Byte[]',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'length',
          type: 'Integer'
        },
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    },
    {
      name: 'getPackedLength',
      type: 'Integer',
      args: [
        {
          name: 'bytes',
          type: 'Integer'
        }
      ]
    }
  ]
});
