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
  package: 'net.nanopay.bank.ruler',
  name: 'CapabilityAddBankAccountRule',

  documentation: 'Adding a bank account through capability',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.StrategizedBankAccount',
    'net.nanopay.model.Business',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
          UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
          User user = ucj.getSubject(x).getUser();
          if ( ! ( user instanceof Business ) ) throw new RuntimeException("Error in ucj source user - Not a business.");
          
          StrategizedBankAccount bankInfo = (StrategizedBankAccount) ucj.getData();
          BankAccount bank = (BankAccount) (bankInfo.getBankAccount()).fclone();
          bank.clearSpid();
          bank.setOwner(user.getId());
          
          DAO accountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
          accountDAO.put(bank);
         }
        }, "Create bank account for a user submitting a strategized bank account capability");
      `
    }
  ]
});
