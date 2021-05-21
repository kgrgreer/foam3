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
  package: 'net.nanopay.partner.afex.crunch',
  name: 'BusinessHasVerifiedBankAccount',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        UserCapabilityJunction ucj = (UserCapabilityJunction) x.get("NEW");
        User user = (User) ucj.findSourceId(x);
        Business business;
        try {
          business = (Business) user;
        } catch (Exception e) {
          return false;
        }
        BankAccount bankAccount = (BankAccount) ((DAO) x.get("localAccountDAO")).find(AND(
          EQ(BankAccount.OWNER, business.getId()),
          INSTANCE_OF(BankAccount.class)));
        return bankAccount != null 
          && BankAccountStatus.VERIFIED == bankAccount.getStatus();
      `
    }
  ]
});