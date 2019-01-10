foam.INTERFACE({
  package: 'net.nanopay.iso8583.prefixer',
  name: 'Prefixer',

  documentation: 'Interface for prefixing data',

  methods: [
    {
      name: 'encodeLength',
      javaType: 'void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'length',
          javaType: 'int'
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'decodeLength',
      javaType: 'int',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    },
    {
      name: 'getPackedLength',
      javaType: 'int'
    }
  ]
});
