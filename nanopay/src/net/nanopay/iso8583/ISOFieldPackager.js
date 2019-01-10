foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOFieldPackager',

  documentation: `
    FieldPackager interface to determine how to pack a specific field of an ISO 8583 message
  `,

  methods: [
    {
      name: 'createComponent',
      documentation: 'Creates a new ISO 8583 Component',
      javaType: 'net.nanopay.iso8583.ISOComponent',
      args: [
        {
          name: 'fieldNumber',
          javaType: 'int'
        }
      ]
    },
    {
      name: 'pack',
      documentation: 'Packs an ISO 8583 component into the OutputStream',
      javaType: 'void',
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
      documentation: 'Unpacks an ISO 8583 component from an InputStream',
      javaType: 'void',
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
