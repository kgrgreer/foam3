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
  package: 'net.nanopay.tx.planner',
  name: 'SecurityCIPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'A planner for ingesting securities',

  javaImports: [
    'net.nanopay.tx.SecurityTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.SecuritiesAccount',
    'net.nanopay.account.SecuritiesTrustAccount',
    'foam.dao.DAO',
  ],

  properties: [
    {
      name: 'securityTrustId',
      class: 'Long',
      value: 21
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `

        SecurityTransaction secTx = new SecurityTransaction();
        secTx.copyFrom(requestTxn);

        DAO accountDAO = (DAO) x.get("localAccountDAO");
        SecuritiesTrustAccount secTrust = (SecuritiesTrustAccount) accountDAO.find(this.getSecurityTrustId());
        String transferAccount = ((SecuritiesAccount) quote.getDestinationAccount()).getSecurityAccount(x, quote.getDestinationUnit()).getId();
        secTx.setName("Security CI of "+quote.getSourceUnit());
        secTx.setDestinationAmount(secTx.getAmount());

        quote.addTransfer(true, secTrust.getSecurityAccount(x, quote.getDestinationUnit()).getId(), -secTx.getAmount(), 0);
        quote.addTransfer(true, transferAccount, secTx.getAmount(), 0);

        return secTx;
      `
    }
  ]
});
