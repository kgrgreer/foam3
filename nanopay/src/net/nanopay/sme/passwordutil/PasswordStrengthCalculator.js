foam.CLASS({
  package: 'net.nanopay.sme.passwordutil',
  name: 'PasswordStrengthCalculator',

  javaImports: [
    'com.nulabinc.zxcvbn.Zxcvbn'
  ],

  implements: [
    'net.nanopay.sme.passwordutil.PasswordEntropy'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data:
          `protected ThreadLocal<Zxcvbn> zxcvbn = new ThreadLocal<Zxcvbn>() {
            @Override
            protected Zxcvbn initialValue() {
              return new Zxcvbn();
            }
          };`
        }));
      }
    }
  ],

  methods: [
    {
      name: 'getPasswordStrength',
      javaCode: `
        return zxcvbn.get().measure(password).getScore();
      `
    }
  ]
});
