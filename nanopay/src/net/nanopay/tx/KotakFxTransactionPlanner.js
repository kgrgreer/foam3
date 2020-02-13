foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakFxTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

   documentation: `Planner for transaction from CA Digital Account (CAD) to IN Bank Account (INR)`,

   javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.fx.KotakFxTransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  constants: [
    {
      type: 'Long',
      name: 'KOTAK_OWNER_CA_ID',
      value: 1020
    },
    {
      type: 'Long',
      name: 'KOTAK_PARTNER_IN_ID',
      value: 1021
    },
    {
      type: 'Long',
      name: 'KOTAK_CO_DESTINATION_ACCOUNT_ID',
      value: 9
    }
  ],

   methods: [
    {
      name: 'plannerLogic',
      javaCode: `
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( sourceAccount instanceof DigitalAccount && destinationAccount instanceof INBankAccount &&
      sourceAccount.getDenomination().equalsIgnoreCase("CAD") && destinationAccount.getDenomination().equalsIgnoreCase("INR") ) {
        DAO userDAO = (DAO) x.get("localUserDAO");
        User kotakOwnerCA = (User) userDAO.find(KOTAK_OWNER_CA_ID);
        User KotakPartnerIN = (User) userDAO.find(KOTAK_PARTNER_IN_ID);
        BankAccount kotakCAbank = BankAccount.findDefault(x, kotakOwnerCA, "CAD");
        BankAccount kotakINbank = BankAccount.findDefault(x, kotakOwnerCA, "INR");
        BankAccount kotakINPartnerBank = BankAccount.findDefault(x, KotakPartnerIN, "INR");

        if (kotakCAbank == null || ! ( kotakCAbank instanceof CABankAccount ) ||
          kotakINbank == null || ! ( kotakINbank instanceof INBankAccount ) ) return null;

        // txn 1: Kotak CA bank -> Kotak IN bank (manual FX rate)
        KotakFxTransaction txn = new KotakFxTransaction.Builder(x).build();
        txn.copyFrom(requestTxn);
        txn.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
        txn.setIsQuoted(true);
        txn.setSourceAccount(kotakCAbank.getId());
        txn.setDestinationAccount(kotakINbank.getId());

        // txn 2: CO transaction to move funds out of system.
        // funds will be manualy moved by ops team and approve the KotakFXTransaction once they are complete
        TrustAccount trustAccount = TrustAccount.find(getX(), requestTxn.findSourceAccount(x));
        KotakCOTransaction kotakCO = new KotakCOTransaction.Builder(x).build();
        kotakCO.setAmount(requestTxn.getAmount());
        kotakCO.setSourceAccount(requestTxn.getSourceAccount());
        kotakCO.setDestinationAccount(this.KOTAK_CO_DESTINATION_ACCOUNT_ID);
        kotakCO.setIsQuoted(true);
        txn.addNext(kotakCO);

        // txn 3: Kotak IN bank -> destination IN bank
        KotakPaymentTransaction t3 = new KotakPaymentTransaction.Builder(x).build();
        t3.copyFrom(requestTxn);
        t3.setAmount(requestTxn.getDestinationAmount());
        t3.addLineItems(
          new TransactionLineItem[] {
            new PurposeCodeLineItem.Builder(x).setPurposeCode("P1099").build(),
            new AccountRelationshipLineItem.Builder(x).setAccountRelationship("Employee").build(),
            new ETALineItem.Builder(x).setEta(/* 12 hours */ 43200000L).build()
          },
          null);
        t3.setIsQuoted(true);
        t3.setSourceAccount(kotakINPartnerBank.getId());
        t3.setSourceCurrency(requestTxn.getDestinationCurrency());
        txn.addNext(t3);
        txn.setIsQuoted(true);
        return txn;
      }
      return null;`
    },
  ]
});
