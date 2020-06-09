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
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'BankAccountVerified',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(BankAccount.class)), true),
          EQ(DOT(NEW_OBJ, BankAccount.STATUS), BankAccountStatus.VERIFIED),
          OR(
            EQ(OLD_OBJ, null),
            NEQ(DOT(OLD_OBJ, BankAccount.STATUS), BankAccountStatus.VERIFIED)
          )
        ).f(obj);
      `
    }
  ]
});
