foam.CLASS({
  package: 'net.nanopay.sme.passwordutil',
  name: 'zxcvbn',

  javaImports: [
    'com.nulabinc.zxcvbn.Zxcvbn'
  ],

  implements: [
    'net.nanopay.sme.passwordutil.PasswordEntropy'
  ],

  methods: [
    {
      name: 'getPasswordStrength',
      javaCode: `
        Zxcvbn zxcvbn = new Zxcvbn();
        return zxcvbn.measure(password).getScore();
      `
    }
  ]
});
