foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOPackager',

  methods: [
    {
      name: 'pack',
      javaReturns: 'void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'm',
          javaType: 'net.nanopay.iso8583.ISOComponent'
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'unpack',
      javaReturns: 'int',
      args: [
        {
          name: 'm',
          javaType: 'net.nanopay.iso8583.ISOComponent'
        },
        {
          name: 'b',
          javaType: 'byte[]'
        }
      ]
    }
  ]
});
