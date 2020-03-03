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
        Long transferAccount = ((SecuritiesAccount) quote.getDestinationAccount()).getSecurityAccount(x, quote.getDestinationUnit()).getId();

        secTx.setName("Security CI of "+quote.getSourceUnit());
        secTx.setDestinationAmount(secTx.getAmount());

        addTransfer(secTrust.getSecurityAccount(x, quote.getDestinationUnit()).getId(), -secTx.getAmount());
        addTransfer(transferAccount, secTx.getAmount());

        return secTx;
      `
    }
  ]
});
