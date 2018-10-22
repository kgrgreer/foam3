foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISO8583Packager',

  methods: [
    {
      name: 'pack',
      javaReturns: 'byte[]',
      args: [
        {
          name: 'm',
          javaType: 'Object'
        }
      ]
    },
    {
      name: 'unpack',
      javaReturns: 'int',
      args: [
        {
          name: 'm',
          javaType: 'Object'
        },
        {
          name: 'b',
          javaType: 'byte[]'
        }
      ]
    }
  ]
});
