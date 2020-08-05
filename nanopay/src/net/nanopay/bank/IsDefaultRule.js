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
  package: 'net.nanopay.bank',
  name: 'IsDefaultRule',

  documentation: `
      Rule prevents users from setting default on non verified bank accounts
      as well as setting old default account to false if isDefault is being set to true on obj.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        BankAccount bankAccount = (BankAccount) obj;
        if ( ! bankAccount.getStatus().equals(BankAccountStatus.VERIFIED) && ! SafetyUtil.isEmpty(bankAccount.getVerifiedBy()) ) {
          throw new RuntimeException("Unable to set unverified bank accounts as default");
        }

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO accountDAO = (DAO) x.get("accountDAO");

            BankAccount currentDefault = BankAccount.findDefault(x, bankAccount.findOwner(x), bankAccount.getDenomination());
            
            if ( currentDefault != null ) {
              currentDefault = (BankAccount) currentDefault.fclone();
              currentDefault.setIsDefault(false);
              accountDAO.put(currentDefault);
            }
         }
        }, "Sets old account isDefault to false.");
      `
    }
  ]
});
