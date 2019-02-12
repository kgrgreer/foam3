foam.INTERFACE({
  package: 'net.nanopay.auth.passwordutil',
  name: 'PasswordEntropy',

  methods: [
    {
      name: 'getPasswordStrength',
      args: [
        {
          name: 'password',
          class: 'String'
        }
      ],
      async: true,
      type: 'Integer'
    }
  ]
});
