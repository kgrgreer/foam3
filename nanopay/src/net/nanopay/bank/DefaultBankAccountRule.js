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
  name: 'DefaultBankAccountRule',

  documentation: `
      Set newly verified bank account to default if owner 
      has no default bank accounts in the verified bank accounts denomination.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'foam.core.ContextAgent',
    'foam.core.X'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            BankAccount bankAccount = (BankAccount) obj;

            BankAccount currentDefault = BankAccount.findDefault(x, bankAccount.findOwner(x), bankAccount.getDenomination());
            if ( currentDefault == null ) {
              bankAccount.setIsDefault(true);
            } 
          }
        }, "Default newly verfied bank account.");
      `
    }
  ]
});
