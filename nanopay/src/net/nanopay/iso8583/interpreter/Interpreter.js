foam.INTERFACE({
  package: 'net.nanopay.iso8583.interpreter',
  name: 'Interpreter',

  documentation: 'Interface to interpret String data',

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
          type: 'String',
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'uninterpret',
      type: 'String',
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
          name: 'chars',
          type: 'Integer'
        }
      ]
    }
  ]
});
