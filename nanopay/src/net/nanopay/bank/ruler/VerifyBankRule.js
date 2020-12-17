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
  name: 'VerifyBankRule',

  documentation: 'Rule creates a verification transaction when a new canadian bank account is added',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.cico.VerificationTransaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

          BankAccount account = (BankAccount) obj;

          long randomDepositAmount = (long) (1 + Math.floor(Math.random() * 99));
          account.setRandomDepositAmount(randomDepositAmount);

          User user = ((Subject) x.get("subject")).getUser();

          VerificationTransaction transaction = new VerificationTransaction();

          transaction.setDestinationAccount(account.getId());
          transaction.setAmount(randomDepositAmount);
          transaction.setSourceCurrency(account.getDenomination());
          transaction.setSourceAccount(DigitalAccount.findDefault(getX(), user, transaction.getSourceCurrency()).getId());

          DAO txDao = (DAO) (getX().get("localTransactionDAO"));
          txDao.put_(x, transaction);

         }
        }, "Creates a microdeposit verification transaction");
      `
    }
  ]
});
