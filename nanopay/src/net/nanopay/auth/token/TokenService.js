foam.INTERFACE({
  package: 'net.nanopay.auth.token',
  name: 'TokenService',

  documentation: 'Generates and processes tokens',

  methods: [
    {
      name: 'generateToken',
      swiftThrows: true,
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          swiftType: 'User'
        }
      ]
    },
    {
      name: 'processToken',
      swiftThrows: true,
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User',
          swiftType: 'User'
        },
        {
          name: 'token',
          javaType: 'String',
          swiftType: 'String'
        }
      ]
    }
  ]
});
