foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOPackager',

  documentation: `
    ISO 8583 message packer interface. ISO 8583 has many different implementations. In order to facilitate this,
    a packager interface must be used. The packager will determine how to package the fields rather than subclassing,
    the ISO 8583 message type for every implementation.
  `,

  methods: [
    {
      name: 'pack',
      documentation: 'Packs an ISO 8583 Component into the OutputStream',
      type: 'Void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'm',
          type: 'net.nanopay.iso8583.ISOComponent'
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'unpack',
      documentation: 'Reads an ISO 8583 Component from an InputStream',
      type: 'Void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'm',
          type: 'net.nanopay.iso8583.ISOComponent'
        },
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    }
  ]
});
