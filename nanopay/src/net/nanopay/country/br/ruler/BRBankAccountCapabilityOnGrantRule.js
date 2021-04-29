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
  package: 'net.nanopay.country.br.ruler',
  name: 'BRBankAccountCapabilityOnGrantRule',

  documentation: `Creates bank account when BRBankAccount capability is granted.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',

    'net.nanopay.bank.BRBankAccount',
    'net.nanopay.partner.treviso.onboarding.BRBankAccountData'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction o          = (UserCapabilityJunction) oldObj;
            UserCapabilityJunction n          = (UserCapabilityJunction) obj;
            DAO                    accountDAO = (DAO)                    x.get("accountDAO");

            if ( o != null && o.getStatus() == CapabilityJunctionStatus.GRANTED ) {
              return;
            }

            BRBankAccountData data = (BRBankAccountData) n.getData();
            BRBankAccount account = (BRBankAccount) data.getBankAccount();

            if ( data.getHasBankAccount() ) {
              return;
            }
            account = (BRBankAccount) accountDAO.put_(x, account);
            if ( account.getStatus() == net.nanopay.bank.BankAccountStatus.VERIFIED ) {
              data.setHasBankAccount(true);
              n.setData(data);
            }
         }
        }, "Creates bank account when BRBankAccount capability is granted.");
      `
    }
  ]
});
