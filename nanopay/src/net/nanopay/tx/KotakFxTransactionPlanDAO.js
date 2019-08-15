foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakFxTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

   documentation: `Planner for transaction from CA Digital Account (CAD) to IN Bank Account (INR)`,

   javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.fx.KotakFxTransaction',
    'net.nanopay.tx.model.Transaction'
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
    }
  ],

   methods: [
    {
      name: 'put_',
      javaCode: `TransactionQuote quote = (TransactionQuote) obj;
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
          kotakINbank == null || ! ( kotakINbank instanceof INBankAccount ) ) return getDelegate().put_(x, quote);
        Transaction request = quote.getRequestTransaction();
        Transaction txn;
        // txn 1: CA digital -> Kotak CA bank
        TransactionQuote q1 = new TransactionQuote.Builder(x).build();
        q1.copyFrom(quote);
        Transaction t1 = new Transaction.Builder(x).build();
        t1.copyFrom(request);
        t1.setDestinationAccount(kotakCAbank.getId());
        t1.setDestinationCurrency(request.getSourceCurrency());
        q1.setRequestTransaction(t1);
        TransactionQuote c1 = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, q1);
        Transaction cashOutPlan = c1.getPlan();
        if ( cashOutPlan != null ) {
          txn = (Transaction) cashOutPlan.fclone();
        } else {
          return super.put_(x, quote);
        }
        // txn 2: Kotak CA bank -> Kotak IN bank (manual FX rate)
        KotakFxTransaction t2 = new KotakFxTransaction.Builder(x).build();
        t2.copyFrom(request);
        t2.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
        t2.setIsQuoted(true);
        t2.setSourceAccount(kotakCAbank.getId());
        t2.setDestinationAccount(kotakINbank.getId());
        txn.addNext(t2);
        // txn 3: Kotak IN bank -> destination IN bank
        KotakCOTransaction t3 = new KotakCOTransaction.Builder(x).build();
        t3.copyFrom(request);
        t3.addLineItems(
          new TransactionLineItem[] {
            new InfoLineItem.Builder(x).setName("PurposeCode").setNote("P1301").build(),
            new InfoLineItem.Builder(x).setName("AccountRelationship").setNote("spouse").build(),
            new ETALineItem.Builder(x).setEta(/* 12 hours */ 43200000L).build()
          },
          null);
        t3.setIsQuoted(true);
        t3.setSourceAccount(kotakINPartnerBank.getId());
        t3.setSourceCurrency(request.getDestinationCurrency());
        txn.addNext(t3);
        txn.setIsQuoted(true);
        quote.addPlan(txn);
      }
      return super.put_(x, quote);`
    },
  ]
});
