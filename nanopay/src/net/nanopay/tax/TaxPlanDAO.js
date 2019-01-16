/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tax',
  name: 'TaxPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',

    'net.nanopay.tx.model.TransactionFee',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.LineItemType',
    'net.nanopay.tx.TaxLineItem',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.account.Account',

    'java.util.List',
    'java.util.ArrayList'
  ],

  properties: [
  ],

  constants: [
    {
      type: 'long',
      name: 'NANOPAY_TAX_ACCOUNT_ID',
      value: 6
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);

      for ( int i = 0; i < quote.getPlans().length; i++ ) {
        quote.getPlans()[i] = applyTax(x, quote.getPlans()[i], quote.getPlans()[i]);
      }
      return quote;
`
    },
    {
      name: 'applyTax',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'transaction',
          of: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'applyTo',
          of: 'net.nanopay.tx.model.Transaction'
        }
     ],
      javaReturns: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      if ( transaction == null ) {
        return transaction;
      }

      Account sourceAccount = transaction.findSourceAccount(x);
      Account destinationAccount = transaction.findDestinationAccount(x);

      List<TaxItem> taxItems = new ArrayList<TaxItem>();
      TaxQuoteRequest taxRequest = new TaxQuoteRequest();
      for ( TransactionLineItem lineItem : transaction.getLineItems() ) {
        if ( null != lineItem.getType() ) {
          TaxItem taxItem = new TaxItem();
          taxItem.setAmount(lineItem.getAmount());
          taxItem.setQuantity(1);
          // TODO: description is on LineItemType
          //taxItem.setDescription(lineItem.getDescription());
          LineItemType lineItemType = (LineItemType) ((DAO) x.get("lineItemTypeDAO")).find_(x, lineItem.getType());
          if ( null == lineItemType ) continue;
          taxItem.setTaxCode(lineItemType.getTaxCode());
          taxItems.add(taxItem);
        }
      }
      TaxItem[] items = new TaxItem[taxItems.size()];
      taxRequest.setTaxItems(taxItems.toArray(items));
      taxRequest.setFromUser(sourceAccount.getOwner());
      taxRequest.setToUser(destinationAccount.getOwner());

      TaxService taxService = (TaxService) x.get("taxService");
      TaxQuote taxQuote = taxService.getTaxQuote(taxRequest);
      if ( null != taxQuote ) {
        List<TransactionLineItem> forward = new ArrayList<TransactionLineItem>();
        List<TransactionLineItem> reverse = new ArrayList<TransactionLineItem>();
        for ( TaxItem quotedTaxItem : taxQuote.getTaxItems() ) {
          forward.add(new TaxLineItem.Builder(x).setNote(quotedTaxItem.getDescription()).setTaxAccount(NANOPAY_TAX_ACCOUNT_ID).setAmount(quotedTaxItem.getTax()).build());
          reverse.add(new InfoLineItem.Builder(x).setNote(quotedTaxItem.getDescription()+" - Non-refundable").setAmount(quotedTaxItem.getTax()).build());
        }
        TaxLineItem[] forwardLineItems = new TaxLineItem[forward.size()];
        TaxLineItem[] reverseLineItems = new TaxLineItem[reverse.size()];
        applyTo.addLineItems(forward.toArray(forwardLineItems), reverse.toArray(reverseLineItems));
      }

      return applyTo;

    `
    },
  ]
});
