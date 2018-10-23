foam.INTERFACE({
  package: 'net.nanopay.iso8583',
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
      args: [
        {
          name: 'b',
          javaType: 'byte[]'
        },
        {
          name: 'offset',
          javaType: 'int'
        }
      ]
    }
  ]
});
