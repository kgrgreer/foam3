foam.INTERFACE({
  package: 'net.nanopay.iso8583.padder',
  name: 'Padder',

  documentation: 'Interface to pad string',

  methods: [
    {
      name: 'pad',
      javaType: 'String',
      args: [
        {
          name: 'data',
          javaType: 'String'
        },
        {
          name: 'maxLength',
          javaType: 'int'
        }
      ]
    },
    {
      name: 'unpad',
      javaType: 'String',
      args: [
        {
          name: 'data',
          javaType: 'String'
        }
      ]
    }
  ]
});
