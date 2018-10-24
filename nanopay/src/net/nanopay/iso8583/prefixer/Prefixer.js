foam.INTERFACE({
  package: 'net.nanopay.iso8583.prefixer',
  name: 'Prefixer',

  methods: [
    {
      name: 'encodeLength',
      javaReturns: 'void',
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
      javaReturns: 'int',
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
      javaReturns: 'int'
    }
  ]
});
