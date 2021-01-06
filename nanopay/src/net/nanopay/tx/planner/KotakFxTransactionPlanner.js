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
  name: 'KotakFxTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

   documentation: `Planner for transaction from CA Digital Account (CAD) to IN Bank Account (INR)`,

   javaImports: [
    'foam.dao.ArraySink',
    'foam.mlang.MLang',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.fx.KotakFxTransaction',
    'net.nanopay.kotak.KotakCredentials',
    'net.nanopay.tx.*',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.util.Date',
    'java.util.List',
    'java.util.UUID'
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
      type: 'String',
      name: 'KOTAK_CO_DESTINATION_ACCOUNT_ID',
      value: '9'
    },
    {
      name: 'PAYMENT_PROVIDER',
      type: 'String',
      value: 'Kotak'
    }
  ],

   methods: [
    {
      name: 'plan',
      javaCode: `
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();

      DAO userDAO = (DAO) x.get("localUserDAO");
      User kotakOwnerCA = (User) userDAO.find(KOTAK_OWNER_CA_ID);
      User KotakPartnerIN = (User) userDAO.find(KOTAK_PARTNER_IN_ID);
      BankAccount kotakCAbank = BankAccount.findDefault(x, kotakOwnerCA, "CAD");
      BankAccount kotakINbank = BankAccount.findDefault(x, kotakOwnerCA, "INR");
      BankAccount kotakINPartnerBank = BankAccount.findDefault(x, KotakPartnerIN, "INR");

      if (kotakCAbank == null || ! ( kotakCAbank instanceof CABankAccount ) ||
        kotakINbank == null || ! ( kotakINbank instanceof INBankAccount ) ) return null;

      // txn 1: Kotak CA bank -> Kotak IN bank (manual FX rate)
      // Will be pending untill ops teams completes the manual transfers
      KotakFxTransaction txn = new KotakFxTransaction.Builder(x).build();
      txn.copyFrom(requestTxn);
      txn.setStatus(TransactionStatus.PENDING);
      txn.setInitialStatus(TransactionStatus.PENDING);
      txn.setName("KotakFxTransaction");
      txn.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()} );
      txn.setSourceAccount(kotakCAbank.getId());
      txn.setDestinationAccount(kotakINbank.getId());
      txn.setAmount(requestTxn.getAmount());
      txn.setDestinationAmount(requestTxn.getDestinationAmount());
      txn.setDestinationCurrency(requestTxn.getDestinationCurrency());

      // txn 2: CO transaction to update our systems balances.
      // funds would have been moved by ops team already by this point.
      Transfer t = new Transfer();
      t.setAccount(requestTxn.getSourceAccount());
      t.setAmount(-requestTxn.getAmount());
      Transfer[] transfers = new Transfer[2];
      transfers[0] = t;

      TrustAccount trustAccount = ((DigitalAccount) requestTxn.findSourceAccount(x)).findTrustAccount(x);
      Transfer t2 = new Transfer();
      t2.setAccount(trustAccount.getId());
      t2.setAmount(requestTxn.getAmount());
      transfers[1] = t2;

      KotakCOTransaction kotakCO = new KotakCOTransaction.Builder(x).build();
      kotakCO.setAmount(requestTxn.getAmount());
      kotakCO.setSourceAccount(requestTxn.getSourceAccount());
      kotakCO.setDestinationAccount(this.KOTAK_CO_DESTINATION_ACCOUNT_ID);
      kotakCO.setPaymentProvider(PAYMENT_PROVIDER);
      kotakCO.setPlanner(this.getId());
      kotakCO.add(transfers);
      kotakCO.setId(UUID.randomUUID().toString());
      txn.addNext(kotakCO);

      // txn 3: Kotak IN bank -> destination IN bank
      KotakPaymentTransaction t3 = new KotakPaymentTransaction.Builder(x).build();
      t3.copyFrom(requestTxn);
      t3.setDestinationAccount(requestTxn.getDestinationAccount());
      t3.setStatus(TransactionStatus.PENDING);
      t3.setInitialStatus(TransactionStatus.PENDING);
      t3.setAmount(requestTxn.getDestinationAmount());
      t3.setName("KotakPaymentTransaction");
      t3.addLineItems(
        new TransactionLineItem[] {
          new ETALineItem.Builder(x).setEta(/* 12 hours */ 43200000L).build()
        }
      );

      t3.setPlanner(this.getId());
      t3.setSourceAccount(kotakINPartnerBank.getId());
      t3.setSourceCurrency(requestTxn.getDestinationCurrency());
      t3.setDestinationCurrency(requestTxn.getDestinationCurrency());
      t3.setAmount(requestTxn.getDestinationAmount());
      t3.setDestinationAmount(requestTxn.getDestinationAmount());
      t3.setId(UUID.randomUUID().toString());
      this.addLineItems(x, t3);
      txn.addNext(t3);
      return txn;
      `
    },
    {
      name: 'checkTransactionLimits',
      javaType: 'void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'requestTxn',
          type: 'Transaction',
        }
      ],
      javaCode: `
        KotakCredentials credentials = (KotakCredentials) x.get("kotakCredentials");

        if ( requestTxn.getDestinationAmount() > credentials.getTradePurposeCodeLimit() ) {
          throw new RuntimeException("Exceed INR Transaction limit");
        }
        
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
    
        User owner = requestTxn.findSourceAccount(x).findOwner(x);
        DAO accounts = owner.getAccounts(x);
        ArraySink sink = new ArraySink(x);
        accounts.where (MLang.AND(
          MLang.INSTANCE_OF(CABankAccount.class),
          MLang.EQ(CABankAccount.STATUS, BankAccountStatus.VERIFIED)
        )).select(sink);
        List<CABankAccount> caBankAccounts = sink.getArray();
    
        long limit = 0;
        Date now = Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());
        Date dayAgo = Date.from(LocalDateTime.now().minusHours(24).atZone(ZoneId.systemDefault()).toInstant());
    
        for ( CABankAccount bankAccount : caBankAccounts ) {
          ArraySink txnSink = new ArraySink(x);
          txnDAO.where(MLang.AND(
            MLang.EQ(Transaction.SOURCE_ACCOUNT, bankAccount.getId()),
            MLang.EQ(Transaction.STATUS, TransactionStatus.COMPLETED),
            MLang.GTE(Transaction.CREATED, dayAgo),
            MLang.LT(Transaction.CREATED, now)
          )).select(txnSink);
    
          List<Transaction> txnList = txnSink.getArray();
          for ( Transaction txn: txnList ) {
            Account account = txn.findDestinationAccount(x);
            // TODO remove after all kotak transaction use line items
            if ( account instanceof INBankAccount && ((INBankAccount) account).getPurposeCode().equals("TRADE_TRANSACTION") ) {
              limit += txn.getDestinationAmount();
            } else {
              for (TransactionLineItem lineItem: txn.getLineItems() ) {
                if ( lineItem instanceof KotakPaymentPurposeLineItem && ((KotakPaymentPurposeLineItem) lineItem).getPurposeCode().equals("TRADE_TRANSACTION") ) {
                  limit += txn.getDestinationAmount();
                  break;
                }
              }
            }
          }
        }
        
        if ( limit + requestTxn.getDestinationAmount() > credentials.getTradePurposeCodeLimit() ) {
          throw new RuntimeException("Exceed INR Transaction limit");
        }
      `
    },
    {
      name: 'validatePlan',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        if ( ! (txn instanceof KotakPaymentTransaction) ) {
          return true;
        }
        String paymentPurpose = null;
        String accountRelationship = null;
        KotakPaymentTransaction transaction = (KotakPaymentTransaction) txn;;

        paymentPurpose = transaction.getPurposeCode();
        accountRelationship = transaction.getAccountRelationship();

        if ( SafetyUtil.isEmpty(paymentPurpose) ) {
          throw new RuntimeException("[Transaction Validation error] Invalid purpose code");
        }

        if ( SafetyUtil.isEmpty(accountRelationship) ) {
          throw new RuntimeException("[Transaction Validation error] Invalid account relationship");
        }

        if ( paymentPurpose.equals("TRADE_TRANSACTION") ) {
          checkTransactionLimits(x, txn);
        }

        return true;
      `
    },
    {
      name: 'addLineItems',
      javaType: 'Transaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'Transaction',
        }
      ],
      javaCode: `
        KotakPaymentPurposeLineItem paymentPurpose = null;
        KotakAccountRelationshipLineItem accountRelationship = null;
        for (TransactionLineItem lineItem: txn.getLineItems() ) {
          if ( lineItem instanceof KotakPaymentPurposeLineItem ) {
            paymentPurpose = (KotakPaymentPurposeLineItem) lineItem;
          }
          if ( lineItem instanceof KotakAccountRelationshipLineItem ) {
            accountRelationship = (KotakAccountRelationshipLineItem) lineItem;
          }
        }

        if ( paymentPurpose == null ) {
          paymentPurpose = new KotakPaymentPurposeLineItem();
          txn.addLineItems( new TransactionLineItem[] { paymentPurpose } );
        }
        if ( accountRelationship == null ) {
          accountRelationship = new KotakAccountRelationshipLineItem();
          txn.addLineItems( new TransactionLineItem[] { accountRelationship } );
        }
        return txn;
      `
    },
  ]
});
