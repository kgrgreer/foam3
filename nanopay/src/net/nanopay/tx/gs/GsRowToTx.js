foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GsRowToTx',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
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
  ],
  properties: [

  ],

  methods: [
    {
      documentation: 'Process a file blob and make some transactions',
      name: 'process',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'blob', type: 'foam.blob.Blob'}
      ],
      type: 'foam.dao.DAO',
      javaCode: `
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");/*new EasyDAO.Builder(x)
          //.setSeqNo(true)
          //.setSeqPropertyName("id")
          .setAuthorize(false)
          .setAuthenticate(false)
          .setOf(Transaction.getOwnClassInfo())
          .build();*/
        java.io.ByteArrayOutputStream os = new java.io.ByteArrayOutputStream((int)blob.getSize());
        blob.read(os, 0, blob.getSize());
        foam.lib.parse.StringPStream ps = new foam.lib.parse.StringPStream(os.toString());
System.out.println("blob read");
        foam.lib.parse.ParserContextImpl px = new foam.lib.parse.ParserContextImpl();
        px.set("X", x);

        DAO gsTxCsvRowDAO = new foam.dao.SequenceNumberDAO.Builder(x)
        .setDelegate(new foam.dao.MDAO(GsTxCsvRow.getOwnClassInfo()))
        .build();
        ((MDAO) ((foam.dao.ProxyDAO)gsTxCsvRowDAO).getDelegate()).addIndex(new foam.core.PropertyInfo[] {
            net.nanopay.tx.gs.GsTxCsvRow.CASH_USD
        });

        CSVParser csvParser = new CSVParser(
          net.nanopay.tx.gs.GsTxCsvRow.getOwnClassInfo(),
          new foam.dao.DAOSink.Builder(x)
            .setDao(gsTxCsvRowDAO)
            .build());
        csvParser.parse(ps, px);
long ci = 0;
long am = ((Count) gsTxCsvRowDAO.select(MLang.COUNT())).getValue();
        System.out.println("Lines read: "+am);
        while (true){
          Transaction t = null;
          long count = ((Count) gsTxCsvRowDAO.select(MLang.COUNT())).getValue();
          if ( count == 0 )
            break;

          if ( count % 10000 == 0 )
           System.out.println(count);


          Object [] rows = ( (ArraySink) gsTxCsvRowDAO
              .limit(1)
             .select(new ArraySink())).getArray().toArray();
          GsTxCsvRow row1 = (GsTxCsvRow) rows[0];

           gsTxCsvRowDAO.remove(row1);

           if ( SafetyUtil.equals(row1.getIsInternal(),"0") ) {
             t = parseExternal(x,row1);

           }
           else{
              Object [] arr = ( (ArraySink) gsTxCsvRowDAO
                 .where(MLang.EQ(net.nanopay.tx.gs.GsTxCsvRow.CASH_USD, -row1.getCashUSD()))
                 .limit(1)
                 .select(new ArraySink())).getArray().toArray();

              if ( arr.length == 0 ) {
                 System.out.println("error unmatched internal transaction, no tx made");
                 continue;
              }
              t = parseInternal(x,row1,(GsTxCsvRow)arr[0]);
              gsTxCsvRowDAO.remove((GsTxCsvRow)arr[0]);
           }
           //t.setId(c+"");
           checkTrusty(x,t);
           if (! verifyBalance(x,t))
              ci++;
           transactionDAO.put(t);
           //c++;
        }
        System.out.println("Made: " + ci + " Cash in transactions" );
        return transactionDAO;
      `
    },

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
          if (row1.getCashUSD() < row2.getCashUSD()) {
            //row1 ->row2
            t.setSourceAccount(findAcc(x,row1));
            t.setDestinationAccount(findAcc(x,row2));
            t.setSourceCurrency(row1.getCurrency());
            t.setDestinationCurrency(row2.getCurrency());
            if(isCash(row1)){
              t.setAmount((long) Math.abs(row1.getCashQty()));
              t.setDestinationAmount((long) Math.abs(row2.getCashQty()));
            }
            else {
              t.setAmount((long) Math.abs(row1.getMarketValueLocal()));
              t.setDestinationAmount((long) Math.abs(row2.getMarketValueLocal()));
            }
              t.addLineItems(new InfoLineItem[] {
                 createInfoLineItem("Memo",row1.getDescriptionTag()),
                 createInfoLineItem("Ref#",row1.getTransactionId()),
                 createInfoLineItem("Product Type",row1.getProductType()),
                 createInfoLineItem("Transaction Type",row1.getSettleType()),
                 createInfoLineItem("LiquidityBucket 4",row1.getProto_Liquidity_Hierarchy4()),
                 createInfoLineItem("LiquidityBucket 2",row1.getProto_Liquidity_Hierarchy2()),
                 createInfoLineItem("LiquidityBucket 3",row1.getProto_Liquidity_Hierarchy3())
              },null);
          }
          else {
            //row2 -> row1
            t.setSourceAccount(findAcc(x,row2));
            t.setDestinationAccount(findAcc(x,row1));
            t.setSourceCurrency(row2.getCurrency());
            t.setDestinationCurrency(row1.getCurrency());
            if(isCash(row1)){
              t.setAmount((long) Math.abs(row2.getCashQty()));
              t.setDestinationAmount((long) Math.abs(row1.getCashQty()));
            }
            else {
              t.setAmount((long) Math.abs(row2.getMarketValueLocal()));
              t.setDestinationAmount((long) Math.abs(row1.getMarketValueLocal()));
            }
              t.addLineItems(new InfoLineItem[] {
                 createInfoLineItem("Memo",row2.getDescriptionTag()),
                 createInfoLineItem("Ref#",row2.getTransactionId()),
                 createInfoLineItem("Product Type",row2.getProductType()),
                 createInfoLineItem("Transaction Type",row2.getSettleType()),
                 createInfoLineItem("LiquidityBucket 4",row2.getProto_Liquidity_Hierarchy4()),
                 createInfoLineItem("LiquidityBucket 2",row2.getProto_Liquidity_Hierarchy2()),
                 createInfoLineItem("LiquidityBucket 3",row2.getProto_Liquidity_Hierarchy3())
              },null);
          }
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
        if ( row1.getCashUSD() < 0 ){
          //sending
          t.setSourceAccount(findAcc(x,row1));
          t.setDestinationAccount(((Account) accountDAO.find(MLang.EQ(Account.NAME,"GS02 CASH (USD)"))).getId());
          t.setSourceCurrency(row1.getCurrency());
          t.setDestinationCurrency("USD");
          if(isCash(row1)) {
            t.setAmount((long) Math.abs(row1.getCashQty()));
            t.setDestinationAmount((long) Math.abs(row1.getCashQty()));
          }
          else {
            t.setAmount((long) Math.abs(row1.getMarketValueLocal()));
            t.setDestinationAmount((long) Math.abs(row1.getMarketValueLocal()));
          }
        }
        else{
          //receiving
          t.setSourceAccount(((Account)accountDAO.find( MLang.EQ(Account.NAME,"GS02 CASH (USD)"))).getId());
          t.setDestinationAccount(findAcc(x,row1));
          t.setSourceCurrency("USD");
          t.setDestinationCurrency(row1.getCurrency());
          if(isCash(row1)) {
            t.setAmount((long) Math.abs(row1.getCashQty()));
            t.setDestinationAmount((long) Math.abs(row1.getCashQty()));
          }
          else {
            t.setAmount((long) Math.abs(row1.getMarketValueLocal()));
            t.setDestinationAmount((long) Math.abs(row1.getMarketValueLocal()));
          }
          t.setDestinationAmount(t.getAmount());
        }
          t.addLineItems(new InfoLineItem[] {
             createInfoLineItem("Memo",row1.getDescriptionTag()),
             createInfoLineItem("Ref#",row1.getTransactionId()),
             createInfoLineItem("Product Type",row1.getProductType()),
             createInfoLineItem("Transaction Type",row1.getSettleType()),
             createInfoLineItem("LiquidityBucket 4",row1.getProto_Liquidity_Hierarchy4()),
             createInfoLineItem("LiquidityBucket 2",row1.getProto_Liquidity_Hierarchy2()),
             createInfoLineItem("LiquidityBucket 3",row1.getProto_Liquidity_Hierarchy3())
          },null);
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
      if (SafetyUtil.equals("Cash",row.getSettleType()))
        type = "CASH";
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
         DAO accountDAO = ((DAO) x.get("localAccountDAO"));
               DAO transactionDAO = ((DAO) x.get("transactionDAO"));

               Account source = txn.findSourceAccount(x);
               BankAccount b = (BankAccount) (accountDAO.find(MLang.EQ(Account.NAME,source.getDenomination()+" Bank Account")));
               if( b == null){
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
         if((long)source.findBalance(x) < txn.getAmount()){
           Transaction ci = new Transaction.Builder(x)
             .setDestinationAccount(source.getId())
             .setSourceAccount(b.getId())
             .setDestinationCurrency(txn.getSourceCurrency())
             .setAmount(txn.getAmount())
             .setDestinationAmount(txn.getAmount())
             .build();
           Transaction tx = (Transaction) transactionDAO.put(ci).fclone();
           tx.setStatus(net.nanopay.tx.model.TransactionStatus.COMPLETED);
           transactionDAO.put(tx);
           return false;
         }
         return true;
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
        InfoLineItem ifl = new InfoLineItem();
        ifl.setName(title);
        ifl.setNote(data);
        ifl.setGroup("Transaction Data");
        return ifl;
      `
    }
  ]
});
