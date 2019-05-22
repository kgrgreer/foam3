foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakFxTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

   documentation: `Planner for transaction from CA Digital Account (CAD) to IN Bank Account (INR)`,

   javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.fx.KotakFxTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.*',
    'foam.dao.DAO',
    'net.nanopay.tx.KotakCOTransaction',
  ],

   methods: [
    {
      name: 'put_',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      Account sourceAccount = request.findSourceAccount(getX());
      Account destinationAccount = request.findDestinationAccount(getX());
      BankAccount kotakCAbank = BankAccount.findDefault(getX(), destinationAccount.findOwner(getX()), "CAD");
      BankAccount kotakINbank = BankAccount.findDefault(getX(), destinationAccount.findOwner(getX()), "INR");
       if ( sourceAccount instanceof DigitalAccount && destinationAccount instanceof INBankAccount &&
        sourceAccount.getDenomination().equalsIgnoreCase("CAD") && destinationAccount.getDenomination().equalsIgnoreCase("INR") &&
        kotakCAbank != null && kotakCAbank instanceof CABankAccount &&
        kotakINbank != null && kotakINbank instanceof INBankAccount ) {
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
        t3.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
        t3.setIsQuoted(true);
        t3.setSourceAccount(kotakINbank.getId());
        t3.setSourceCurrency(request.getDestinationCurrency());
        txn.addNext(t3);
        txn.setIsQuoted(true);
        quote.addPlan(txn);
      }
       return super.put_(x, quote);
      `
    },
  ]
});
