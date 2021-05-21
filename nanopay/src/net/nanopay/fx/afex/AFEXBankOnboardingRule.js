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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBankOnboardingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Onboards bank account owner to AFEX if it is a business and passed comliance.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.afex.AFEXServiceProvider',
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! (obj instanceof BankAccount) ) {
              return;
            }
            BankAccount bankAccount = (BankAccount) obj;
            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
            afexServiceProvider.onboardBusiness(bankAccount);
          }
        }, "Onboards bank account owner to AFEX if it is a business and passed comliance.");
      `
    }
  ]
 });
