foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOFieldPackager',

  methods: [
    {
      name: 'createComponent',
      javaReturns: 'net.nanopay.iso8583.ISOComponent',
      args: [
        {
          name: 'fieldNumber',
          javaType: 'int'
        }
      ]
    },
    {
      name: 'pack',
      javaReturns: 'void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'c',
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
      javaReturns: 'void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'c',
          javaType: 'net.nanopay.iso8583.ISOComponent'
        },
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    }
  ]
});
