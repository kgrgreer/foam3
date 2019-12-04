foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GsTxAssembly',
  extends: 'foam.util.concurrent.AbstractAssembly',

  implements: [
    'foam.core.ContextAware'
  ],

  javaImports: [
    'foam.core.X',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.gs.GsTxCsvRow',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'foam.dao.MDAO',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.util.SafetyUtil',
    'foam.lib.parse.CSVParser',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.dao.ArraySink',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.fx.ExchangeRate'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.GsTxCsvRow',
      name: 'row1',
      documentation: 'The first row',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.GsTxCsvRow',
      name: 'row2',
      documentation: 'The second row',
    },
    {
      class: 'Boolean',
      name: 'isInternal',
      value: false,
    },
    {
      class: 'Boolean',
      name: 'concurrentPuts',
      value: false,
      documentation: `
        If true, records will not be added to the DAO in sequential order.
      `
    },
    {
      class: 'String',
      name: 'settleType',
      documentation: 'one of either: DVP, FOP, Cash'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
      documentation: `
        Intermediate property used internally. Do not set this.
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'outputDAO'
    }
  ],

  methods: [
    {
      name: 'startJob',
      javaCode: `
      `
    },
    {
      name: 'executeJob',
      javaCode: `
        Transaction t;
        if (getIsInternal())
          t = parseInternal(getX(),getRow1(),getRow2());
        else
          t = parseExternal(getX(),getRow1());



          setTransaction(t);
      `
    },
    {
      name: 'endJob',
      javaCode: `
        checkTrusty(getX(), getTransaction());
        verifyBalance(getX(),getTransaction());
        getOutputDAO().put(getTransaction());
      `
    },
    /* TODO: need to verify trust account has enough $, and account have enough $
              checkTrusty(x,t);
              if (! verifyBalance(x,t))
                ci++;
              transactionDAO.put(t);*/

     /* TODO: timing..
             long startTime = System.currentTimeMillis();
             Long begining = cleanTimeStamp(r.getTimeStamp());
             Long offset = startTime - begining-14400000;
             */
    {
      documentation: 'Makes a transaction out of two GS rows.',
      name: 'parseInternal',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'row1', type: 'net.nanopay.tx.gs.GsTxCsvRow' },
        { name: 'row2', type: 'net.nanopay.tx.gs.GsTxCsvRow' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        Transaction t = new Transaction();

        GsTxCsvRow sourceRow = row2;
        GsTxCsvRow destRow = row1;
        if ( row1.getCashUSD() < row2.getCashUSD() ) {
          sourceRow = row1;
          destRow = row2;
        }
        
        t.setSourceAccount(findAcc(x,sourceRow));
        t.setDestinationAccount(findAcc(x,destRow));
        t.setSourceCurrency(sourceRow.getCurrency());
        t.setDestinationCurrency(destRow.getCurrency());
        if (isCash(sourceRow)) {
          t.setAmount((long) Math.abs(sourceRow.getCashQty()));
          t.setDestinationAmount((long) Math.abs(destRow.getCashQty()));
        }
        else {
          t.setAmount((long) Math.abs(sourceRow.getMarketValueLocal()));
          t.setDestinationAmount((long) Math.abs(destRow.getMarketValueLocal()));
        }
        t = assembleIFLs(t,sourceRow,destRow);

        t.setProperty("lastStatusChange",cleanTimeStamp(row1.getTimeStamp()));
        return t;
      `
    },
    {
      documentation: 'Makes a transaction out of an external GS row.',
      name: 'parseExternal',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'row1', type: 'net.nanopay.tx.gs.GsTxCsvRow' },
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      DAO accountDAO = (DAO) x.get("localAccountDAO");
        Transaction t = new Transaction();
        t.setProperty("lastStatusChange",cleanTimeStamp(row1.getTimeStamp()));
        if ( row1.getCashUSD() < 0 ){
          //sending
          t.setSourceAccount(findAcc(x,row1));
          t.setDestinationAccount(((Account) accountDAO.find(MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId());
          t.setSourceCurrency(row1.getCurrency());
          t.setDestinationCurrency("USD");
          if(isCash(row1)) {
            t.setAmount((long) Math.abs(row1.getCashQty()));
            t.setDestinationAmount((long) Math.abs(row1.getCashUSD()));
          }
          else {
            t.setAmount((long) Math.abs(row1.getMarketValueLocal()));
            t.setDestinationAmount((long) Math.abs(row1.getMarketValue()));
          }
        }
        else {
          //receiving
          t.setSourceAccount(((Account)accountDAO.find( MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId());
          t.setDestinationAccount(findAcc(x,row1));
          t.setSourceCurrency("USD");
          t.setDestinationCurrency(row1.getCurrency());
          if(isCash(row1)) {
            t.setAmount((long) Math.abs(row1.getCashUSD()));
            t.setDestinationAmount((long) Math.abs(row1.getCashQty()));
          }
          else {
            t.setAmount((long) Math.abs(row1.getMarketValue()));
            t.setDestinationAmount((long) Math.abs(row1.getMarketValueLocal()));
          }
        }
        t = assembleIFLs(t,row1,row1);

        return t;
      `
    },

    {
      name: 'isCash',
      args: [
      { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow'}
      ],
      type: 'Boolean',
      javaCode: `
        if ( SafetyUtil.equals(row.getSettleType(),"Cash") )
          return true;
        return false;
      `
    },

    {
      name: 'findAcc',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow'}
      ],
      type: 'long',
      javaCode: `
      DAO accountDAO = ((DAO) x.get("localAccountDAO"));
      String type = "SECURITIES";
      if (SafetyUtil.equals("Cash",row.getSettleType())){
        type = "CASH";
      }
      String name = row.getCompany()+" "+type+" ("+row.getCurrency()+")";
      Account a = (Account) (accountDAO.find(MLang.EQ(Account.NAME, name)));
      if (a == null){
        System.out.println("Missing account: "+name+"  ... creating...");

      DigitalAccount da = new DigitalAccount.Builder(x)
        .setOwner(8005)
        .setDenomination(row.getCurrency())
        .setName(name)
        .build();
      return ((Account) accountDAO.put(da)).getId();
    }
    return a.getId();
    `
    },

    {
      name: 'verifyBalance',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction'}
      ],
      type: 'Boolean',
      javaCode: `
        DAO accountDAO = ((DAO) x.get("accountDAO"));
        DAO transactionDAO = ((DAO) x.get("transactionDAO"));

        Account source = txn.findSourceAccount(x);
        Account b = null;
        if(! (source instanceof net.nanopay.account.ShadowAccount) ){
            b = (Account) accountDAO.find(MLang.EQ(Account.NAME,((source.getName()).substring(0,4)+" Shadow Account")));
        }
        else {
          b = (BankAccount) (accountDAO.find(MLang.EQ(Account.NAME,source.getDenomination()+" Bank Account")));
        }
        if ( b == null ) {
          b = new BankAccount.Builder(x)
            .setOwner(8005)
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setDenomination(txn.getSourceCurrency())
            .setName(txn.getSourceCurrency() +" Bank Account")
            .setAccountNumber("000000")
            .build();
          b = (BankAccount) accountDAO.put_(x,b).fclone();
          System.out.println("woops "+txn.getSourceCurrency());
        }
         Long topUp = txn.getAmount() - (long) source.findBalance(x);
         if ( topUp > 0 ) {
           Transaction ci = new Transaction.Builder(x)
             .setDestinationAccount(source.getId())
             .setSourceAccount(b.getId())
             .setDestinationCurrency(txn.getSourceCurrency())
             .setSourceCurrency(b.getDenomination())
             .setDestinationAmount(topUp)
             .setLastStatusChange(txn.getLastStatusChange())
             .build();
          if ( SafetyUtil.equals(ci.getSourceCurrency(),ci.getDestinationCurrency())) {
            ci.setAmount(ci.getDestinationAmount());
          } else {
            double w = 1.0;
            ArraySink ex = (ArraySink) ((DAO) x.get("exchangeRateDAO")).where(
              MLang.AND(
                MLang.EQ(ExchangeRate.FROM_CURRENCY, ci.getDestinationCurrency()),
                MLang.EQ(ExchangeRate.TO_CURRENCY, ci.getSourceCurrency())
              )).select(new ArraySink());
            if ( ((ex.getArray().toArray())).length == 0 ){
              ex = (ArraySink) ((DAO) x.get("exchangeRateDAO")).where(
                MLang.AND(
                  MLang.EQ(ExchangeRate.FROM_CURRENCY, ci.getSourceCurrency()),
                  MLang.EQ(ExchangeRate.TO_CURRENCY, ci.getDestinationCurrency())
                )
              ).select(new ArraySink());
              w = (double) ((1/(((ExchangeRate)(ex.getArray().toArray())[0]).getRate())));
            } else {
              w = (double) ((((ExchangeRate)(ex.getArray().toArray())[0]).getRate()));
            }
            if ( w == 0) System.out.println("uuuuhhhohhh");
            ci.setAmount((long) ((double) ci.getDestinationAmount()*w));
          }
          if (! (b instanceof BankAccount) ){
            verifyBalance(x,ci);
          }
          checkTrusty(x,ci);
          Transaction tx = (Transaction) transactionDAO.put(ci).fclone();
          if (tx.getStatus() != net.nanopay.tx.model.TransactionStatus.COMPLETED){
            tx.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
            transactionDAO.put(tx);
          }
          return false;
        }
        return true;
      `
    },
    {
      name: 'assembleIFLs',
      args: [
      { name: 'txn', type: 'net.nanopay.tx.model.Transaction'},
      { name: 'row1', type: 'net.nanopay.tx.gs.GsTxCsvRow'},
      { name: 'row2', type: 'net.nanopay.tx.gs.GsTxCsvRow'},
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      if (! SafetyUtil.equals(row1.getCompany(),row2.getCompany()))
        txn.addLineItems(new InfoLineItem[] {
          createInfoLineItem("Sending Company",row1.getCompany()),
          createInfoLineItem("Receiving Company",row2.getCompany()),
        },null);
        txn.addLineItems(new InfoLineItem[] {
          createInfoLineItem("Memo",row1.getDescriptionTag()),
          createInfoLineItem("Ref#",row1.getTransactionId()),
          createInfoLineItem("Product Type",row1.getProductType()),
          createInfoLineItem("Settlement Type",row1.getSettleType()),
          createInfoLineItem("Liquidity Bucket",row1.getLiquidityBucket()),
          createInfoLineItem("Liquidity Hierarchy 2",row1.getProto_Liquidity_Hierarchy2()),
          createInfoLineItem("Liquidity Hierarchy 3",row1.getProto_Liquidity_Hierarchy3()),
          createInfoLineItem("Liquidity Hierarchy 4",row1.getProto_Liquidity_Hierarchy4()),
        },null);
        return txn;
      `
    },
    {
      name: 'checkTrusty',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction'}
      ],
      javaCode: `
         DAO accountDAO = ((DAO) x.get("localAccountDAO"));
          TrustAccount sourceTrust = (TrustAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getSourceCurrency() +" Trust Account"));
          BankAccount sourceBank = (BankAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getSourceCurrency() +" Bank Account"));
          if(sourceTrust == null){
          System.out.println("Trustie not found for "+txn.getSourceCurrency()+" ... Generating...");
            sourceTrust = new TrustAccount.Builder(x)
              .setOwner(101)
              .setDenomination(txn.getSourceCurrency())
              .setName(txn.getSourceCurrency() +" Trust Account")
              .build();
          sourceBank = new BankAccount.Builder(x)
            .setOwner(8005)
            .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
            .setDenomination(txn.getSourceCurrency())
            .setName(txn.getSourceCurrency() +" Bank Account")
            .setAccountNumber("000000")
            .build();
          accountDAO.put(sourceTrust);
          accountDAO.put(sourceBank);
          }

          if (SafetyUtil.equals(txn.getSourceCurrency(),txn.getDestinationCurrency()))
            return;
          TrustAccount destinationTrust = (TrustAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getDestinationCurrency() +" Trust Account"));
          BankAccount destBank = (BankAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getDestinationCurrency() +" Bank Account"));
          if( destinationTrust == null ){
          System.out.println("Trustie not found for "+txn.getDestinationCurrency()+" ... Generating...");
            destinationTrust = new TrustAccount.Builder(x)
              .setOwner(101)
              .setDenomination(txn.getDestinationCurrency())
              .setName(txn.getDestinationCurrency() +" Trust Account")
              .build();
          accountDAO.put(destinationTrust);
          destBank = new BankAccount.Builder(x)
                    .setOwner(8005)
                    .setAccountNumber("000000")
                    .setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED)
                    .setDenomination(txn.getDestinationCurrency())
                    .setName(txn.getDestinationCurrency() +" Bank Account")
                    .build();
                  accountDAO.put(destBank);
          }
      `

    },
    {
      name: 'createInfoLineItem',
      args: [
        { name: 'title', type: 'String'},
        { name: 'data', type: 'String'}
      ],
      type: 'net.nanopay.tx.InfoLineItem',
      javaCode: `
      if (SafetyUtil.isEmpty(data)) return null;
        InfoLineItem ifl = new InfoLineItem();
        ifl.setName(title);
        ifl.setNote(data);
        ifl.setGroup("Transaction Data");
        return ifl;
      `
    },
    {
      name: 'cleanTimeStamp',
      args: [
        { name: 'ts', type: 'String'},
      ],
      type: 'Long',
      javaCode: `
        try {
          java.text.DateFormat dateFormat = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
          dateFormat.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
          String t = ts.replace(":","");
          String t1 = t.replace(".","");
          String t2 = t1.replace(" ","");
          Long time = Long.parseLong(t2);
          time = time/1000;
          String time2 = time+"";
          return dateFormat.parse(time2).getTime();
        } catch (Exception E) {
          System.out.println("cant parse: "+ts);
        }
        return 0;
      `
    }
  ]
});
