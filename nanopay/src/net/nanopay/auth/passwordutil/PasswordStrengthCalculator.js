/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.auth.passwordutil',
  name: 'PasswordStrengthCalculator',

  javaImports: [
    'com.nulabinc.zxcvbn.Zxcvbn'
  ],

  implements: [
    'net.nanopay.auth.passwordutil.PasswordEntropy'
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
