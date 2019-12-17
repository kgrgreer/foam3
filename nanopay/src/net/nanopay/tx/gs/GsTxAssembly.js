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
    'net.nanopay.tx.DVPTransaction',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.account.BrokerAccount',
    'foam.dao.MDAO',
    'foam.dao.DAO',
    'foam.dao.EasyDAO',
    'foam.util.SafetyUtil',
    'foam.lib.parse.CSVParser',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.dao.ArraySink',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.fx.ExchangeRate',
    'net.nanopay.tx.gs.ProgressBarData',
    'net.nanopay.exchangeable.Security'
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
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.ProgressBarData',
      name: 'pbd',
      documentation: 'bar to put to bar DAO'
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
        checkTrusty(getX(), getTransaction());
      `
    },
    {
      name: 'endJob',
      javaCode: `
        checkTrusty(getX(), getTransaction());
        verifyBalance(getX(),getTransaction());
        getOutputDAO().put(getTransaction());
        if ( getPbd() != null )
          ((DAO) getX().get("ProgressBarDAO")).put(getPbd());
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
        // find the send/receiver.
        GsTxCsvRow sourceRow = row2;
        GsTxCsvRow destRow = row1;

        if (isCash(sourceRow)){
          if ( row1.getCashUSD() < row2.getCashUSD() ) {
            sourceRow = row1;
            destRow = row2;
          }
        }
        else {
          if ( row1.getSecQty() < row2.getSecQty() ) {
            sourceRow = row1;
            destRow = row2;
          }
        }

        if (isCash(sourceRow) ) {
          t.setSourceAccount(findAcc(x,sourceRow,isCash(sourceRow)));
          t.setDestinationAccount(findAcc(x,destRow,isCash(destRow)));
          t.setSourceCurrency(sourceRow.getCurrency());
          t.setDestinationCurrency(destRow.getCurrency());

          t.setAmount(toLong(x,sourceRow.getCurrency(),sourceRow.getCashQty()));
          t.setDestinationAmount(toLong(x,destRow.getCurrency(),destRow.getCashQty()));
        }

        else { // securities
        verifySecurity(x,sourceRow.getProductId());
        if ( ! SafetyUtil.equals(sourceRow.getProductId(),destRow.getProductId()) )
          if(isDVP(sourceRow)){
            DVPTransaction tx = new DVPTransaction();
            tx.setSourcePaymentAccount(findAcc(x,destRow,true));
            tx.setDestinationPaymentAccount(findAcc(x,sourceRow,true));
            tx.setPaymentAmount(toLong(x,sourceRow.getCurrency(),sourceRow.getCashQty()));
            tx.setDestinationPaymentAmount(toLong(x,sourceRow.getCurrency(),sourceRow.getCashQty()));
            t = tx;
          }
          t.setSourceAccount(findAcc(x,sourceRow,isCash(sourceRow)));
          t.setDestinationAccount(findAcc(x,destRow,isCash(destRow)));
          t.setSourceCurrency(sourceRow.getProductId());
          t.setDestinationCurrency(destRow.getProductId());
          t.setAmount(toLong(x,sourceRow.getProductId(),sourceRow.getSecQty()));
          t.setDestinationAmount(toLong(x,destRow.getProductId(),destRow.getSecQty()));
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
       // if {
          //sending
          if(isCash(row1) && ( row1.getCashUSD() < 0 )) {
            t.setSourceAccount(findAcc(x,row1,isCash(row1)));
            t.setDestinationAccount(((Account) accountDAO.find(MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId());
            t.setSourceCurrency(row1.getCurrency());
            t.setDestinationCurrency("USD");
            t.setAmount(toLong(x,row1.getCurrency(),row1.getCashQty()));
            t.setDestinationAmount(toLong(x,"USD", row1.getCashUSD()));
          }
          if (! isCash(row1) && ( row1.getSecQty() < 0 )){ //sending some securities
            verifySecurity(x,row1.getProductId());
            if( isDVP(row1) ) {

              DVPTransaction tx = new DVPTransaction();
              tx.setPaymentAmount(toLong(x,row1.getCurrency(),row1.getCashQty()));
              tx.setDestinationPaymentAmount(toLong(x,"USD",row1.getCashUSD()));
              tx.setDestinationPaymentAccount(findAcc(x,row1,true)); // get the cash version of this account
              tx.setSourcePaymentAccount(((Account) accountDAO.find(MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId());
              t = tx;
              // add cash peice
              }

            t.setSourceAccount(findAcc(x,row1,isCash(row1)));
            t.setDestinationAccount(((Account) accountDAO.find(MLang.INSTANCE_OF(BrokerAccount.class))).getId());
            t.setSourceCurrency(row1.getProductId());
            t.setDestinationCurrency(row1.getProductId());
            t.setAmount(toLong(x,row1.getProductId(),row1.getSecQty()));
            t.setDestinationAmount(toLong(x,row1.getProductId(),row1.getSecQty()));
          }
        //}
        //else {
          //receiving
          if(isCash(row1) && ( row1.getCashUSD() > 0 )) {
            t.setSourceAccount(((Account)accountDAO.find( MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId());
            t.setDestinationAccount(findAcc(x,row1,isCash(row1)));
            t.setSourceCurrency("USD");
            t.setDestinationCurrency(row1.getCurrency());
            t.setAmount(toLong(x,"USD",row1.getCashUSD()));
            t.setDestinationAmount(toLong(x,row1.getCurrency(),row1.getCashQty()));
          }
          if ( ! isCash(row1) && ( row1.getSecQty() > 0 )) {
          verifySecurity(x,row1.getProductId());
            if( isDVP(row1) ) {
              DVPTransaction tx = new DVPTransaction();
              tx.setSourcePaymentAccount(findAcc(x,row1,true)); //se me
              tx.setDestinationPaymentAccount(((Account)accountDAO.find( MLang.EQ(Account.NAME,row1.getCompany()+" Shadow Account"))).getId()); //yep
              tx.setPaymentAmount(toLong(x,"USD",row1.getCashUSD()));
              tx.setDestinationPaymentAmount(toLong(x,row1.getCurrency(),row1.getCashQty()));
              t = tx;
              // add cash peice
            }

            t.setSourceAccount(((Account) accountDAO.find(MLang.INSTANCE_OF(BrokerAccount.class))).getId());
            t.setDestinationAccount(findAcc(x,row1,isCash(row1)));
            t.setDestinationCurrency(row1.getProductId());
            t.setSourceCurrency(row1.getProductId());
            t.setAmount(toLong(x,row1.getProductId(),row1.getSecQty()));
            t.setDestinationAmount(toLong(x,row1.getProductId(),row1.getSecQty()));
          }

          t = assembleIFLs(t,row1,row1);
          t.setProperty("lastStatusChange",cleanTimeStamp(row1.getTimeStamp()));

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
      name: 'isDVP',
      args: [
        { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow'}
      ],
      type: 'Boolean',
      javaCode: `
        if ( SafetyUtil.equals(row.getSettleType(),"DVP") )
          return true;
        return false;
      `
    },
    {
      name: 'findAcc',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'row', type: 'net.nanopay.tx.gs.GsTxCsvRow'},
        { name: 'cash', type: 'Boolean'}
      ],
      type: 'long',
      javaCode: `
      DAO accountDAO = ((DAO) x.get("localAccountDAO"));
      String type = "SECURITIES";
      String name;
      if (cash){
        type = "CASH";
        name = row.getCompany()+" "+type+" ("+row.getCurrency()+")";
      }
      else
        name = row.getCompany()+" ("+type+")";

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
        if ( txn instanceof DVPTransaction ) {
          Transaction txn2 = new Transaction();
          txn2.setDestinationAccount(((DVPTransaction) txn).getDestinationPaymentAccount());
          txn2.setSourceAccount(((DVPTransaction) txn).getSourcePaymentAccount());
          txn2.setAmount(((DVPTransaction) txn).getPaymentAmount());
          txn2.setDestinationAmount(((DVPTransaction) txn).getDestinationPaymentAmount());
          txn2.setDestinationCurrency(txn2.findDestinationAccount(x).getDenomination());
          txn2.setSourceCurrency(txn2.findSourceAccount(x).getDenomination());
          verifyBalance(x,txn2);
        }

        if ( ((DAO) x.get("currencyDAO")).find(txn.getSourceCurrency()) == null ) {

          if ( txn.findSourceAccount(x) instanceof BrokerAccount ) return true; //for a security txn CI we dont need topups.

          long remainder = (long) source.findBalance(x) - txn.getAmount(); // is this the correct account ?
          if ( remainder < 0 ) {
            Transaction secCI = new Transaction();
            secCI.setAmount(Math.abs(remainder));
            secCI.setDestinationAccount(source.getId());
            secCI.setSourceAccount(((Account) accountDAO.find(MLang.INSTANCE_OF(BrokerAccount.class))).getId());
            secCI.setSourceCurrency(txn.getSourceCurrency());
            secCI.setDestinationCurrency(txn.getSourceCurrency());
            transactionDAO.put(secCI); // top up the sending security account
          }
          return true;
        }

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
             .setDestinationCurrency(source.getDenomination())
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
              if ((ex.getArray().toArray()).length == 0) w = 0;
              else w = (double) ((1/(((ExchangeRate)(ex.getArray().toArray())[0]).getRate())));
            } else {
              w = (double) ((((ExchangeRate)(ex.getArray().toArray())[0]).getRate()));
            }
            if ( w == 0) System.out.println("uuuuhhhohhh");
            ci.setAmount(toLong(x,ci.getSourceCurrency(), (double) ci.getDestinationAmount()*w));
            //System.out.println(" calculated w of "+ci.getAmount()+ " in curr "+ ci.getSourceCurrency() + " "+b.getDenomination());
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
          if( txn instanceof DVPTransaction ){
            Transaction txn2 = new Transaction ();
            txn2.setSourceCurrency(((DVPTransaction) txn ).findSourcePaymentAccount(getX()).getDenomination());
            txn2.setDestinationCurrency(((DVPTransaction) txn ).findDestinationPaymentAccount(getX()).getDenomination());
            checkTrusty(x,txn2);
            return;
          }
         if( ((DAO) x.get("currencyDAO")).find(txn.getSourceCurrency()) == null ) return;
          TrustAccount sourceTrust = (TrustAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getSourceCurrency() +" Trust Account"));
          //BankAccount sourceBank = (BankAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getSourceCurrency() +" Bank Account"));
          if(sourceTrust == null){
          System.out.println("Trustie not found for "+txn.getSourceCurrency()+" ... Generating...");
            sourceTrust = new TrustAccount.Builder(x)
              .setOwner(101)
              .setDenomination(txn.getSourceCurrency())
              .setName(txn.getSourceCurrency() +" Trust Account")
              .build();
          BankAccount sourceBank = new BankAccount.Builder(x)
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
          //BankAccount destBank = (BankAccount) accountDAO.find(MLang.EQ(Account.NAME,txn.getDestinationCurrency() +" Bank Account"));
          if( destinationTrust == null ){
          System.out.println("Trustie not found for "+txn.getDestinationCurrency()+" ... Generating...");
            destinationTrust = new TrustAccount.Builder(x)
              .setOwner(101)
              .setDenomination(txn.getDestinationCurrency())
              .setName(txn.getDestinationCurrency() +" Trust Account")
              .build();
          accountDAO.put(destinationTrust);
          BankAccount destBank = new BankAccount.Builder(x)
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
      name: 'verifySecurity',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'security', type: 'String'},
      ],
      javaCode: `
        DAO secDAO = (DAO) x.get("securitiesDAO");
        if (secDAO.find(security) != null ) return;
        Security newSec = new Security();
        newSec.setName("Security: "+ security); // concurrency issue maybe
        newSec.setId(security);
        secDAO.put(newSec);
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
    },
    {
      name: 'toLong',
      args: [
        { name: 'x', type: 'foam.core.X'},
        { name: 'curr', type: 'String'},
        { name: 'amount', type: 'Double'}
      ],
      type: 'Long',
      javaCode: `
        foam.core.Currency cur = (foam.core.Currency) ((DAO) x.get("currencyDAO")).find(curr);
        if ( cur != null ) {
          long precision = cur.getPrecision();
          return (long) Math.floor((Math.abs(amount * (10^precision))));
        }
        return (long) Math.floor((Math.abs(amount)));
      `
    }
  ]
});
