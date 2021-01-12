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
  name: 'KotakSplitTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Split CA bank to IN bank transactions`,

  javaImports: [
    'foam.core.Unit',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.fx.CurrencyFXService',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.kotak.KotakCredentials',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.bmo.cico.BmoCITransaction',
    'net.nanopay.tx.KotakAccountRelationshipLineItem',
    'net.nanopay.tx.KotakCOTransaction',
    'net.nanopay.tx.KotakPaymentPurposeLineItem',
    'net.nanopay.tx.rbc.RbcCITransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.util.Date',
    'java.util.List',
    'org.apache.commons.lang.ArrayUtils'
  ],

  constants: [
    {
      type: 'String',
      name: 'LOCAL_FX_SERVICE_NSPEC_ID',
      value: 'localFXService'
    },
    {
      name: 'ALTERNA_INSTITUTION_NUMBER',
      type: 'String',
      value: '842'
    },
    {
      name: 'BMO_INSTITUTION_NUMBER',
      type: 'String',
      value: '001'
    },
    {
      name: 'RBC_INSTITUTION_NUMBER',
      type: 'String',
      value: '003'
    },
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();

      // get fx rate
      FXService fxService = CurrencyFXService.getFXServiceByNSpecId(x, requestTxn.getSourceCurrency(), requestTxn.getDestinationCurrency(), LOCAL_FX_SERVICE_NSPEC_ID);
      FXQuote fxQuote = fxService.getFXRate(sourceAccount.getDenomination(), destinationAccount.getDenomination(), quote.getRequestTransaction().getAmount(), quote.getRequestTransaction().getDestinationAmount(),"","",sourceAccount.getOwner(),"nanopay");
      requestTxn = (Transaction) requestTxn.fclone();

      // calculate source amount
      Unit denomination = sourceAccount.findDenomination(x);
      Double currencyPrecision = Math.pow(10, denomination.getPrecision());
      Double amount =  Math.ceil(requestTxn.getDestinationAmount()/currencyPrecision/fxQuote.getRate()*currencyPrecision);
      requestTxn.setAmount(amount.longValue());

      FXSummaryTransaction txn = new FXSummaryTransaction.Builder(x).build();
      txn.copyFrom(requestTxn);
      txn.addNext(createComplianceTransaction(requestTxn));
      FXLineItem fxLineItem = new FXLineItem();
      fxLineItem.setRate(fxQuote.getRate());
      fxLineItem.setSourceCurrency(fxQuote.getSourceCurrency());
      fxLineItem.setDestinationCurrency(fxQuote.getTargetCurrency());
      txn.addLineItems( new TransactionLineItem[] { fxLineItem } );

      DigitalAccount destinationDigitalaccount = DigitalAccount.findDefault(x, destinationAccount.findOwner(x), sourceAccount.getDenomination());
      // split 1: CA bank -> CA digital

      Transaction t1 = (Transaction) requestTxn.fclone();
      t1.setDestinationAccount(destinationDigitalaccount.getId());
      t1.setDestinationCurrency(t1.getSourceCurrency());
      t1.setDestinationAmount(t1.getAmount());
      Transaction cashinPlan = quoteTxn(x, t1, quote);
      cashinPlan = removeSummaryTransaction(cashinPlan);
      if ( cashinPlan != null ) {
        txn.addNext(cashinPlan);
      } else {
        return null;
      }

      // split 2: CA digital -> IN bank
      Transaction t2 = (Transaction) requestTxn.fclone();
      t2.setSourceAccount(destinationDigitalaccount.getId());
      Transaction kotakPlan = quoteTxn(x, t2, quote);
      if ( kotakPlan != null ) {

        // add transfer to update CI trust account
        TrustAccount trustAccount =  ((DigitalAccount) cashinPlan.findDestinationAccount(x)).findTrustAccount(x);
        Transfer t = new Transfer();
        t.setAccount(trustAccount.getId());
        t.setAmount(requestTxn.getAmount());
        Transfer[] transfers = new Transfer[1];
        transfers[0] = t;
        KotakCOTransaction kotakCO = (KotakCOTransaction) kotakPlan.getNext()[0];
        kotakCO.setTransfers((Transfer[]) ArrayUtils.addAll(transfers, kotakCO.getTransfers()));

        txn.addNext(kotakPlan);
      } else {
        return null;
      }

      txn.setStatus(TransactionStatus.COMPLETED);
      ((FXSummaryTransaction) txn).setFxRate(fxQuote.getRate());
      return txn;
    `
    }
  ]
});
