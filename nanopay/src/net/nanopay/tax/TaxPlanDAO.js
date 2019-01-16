/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
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
    'net.nanopay.tx.FeeTransfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.LineItemType',
    'net.nanopay.tx.TaxLineItem',

    'java.util.List'
  ],

  properties: [
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

      Account sourceAccount = request.findSourceAccount(x);
      Account destinationAccount = request.findDestinationAccount(x);

      User fromUser = (User) ((DAO) x.get("localUserDAO")).find_(x, sourceAccount.getOwner());
      User toUser = (User) ((DAO) x.get("localUserDAO")).find_(x, destinationAccount.getOwner());
      List<TaxItem> taxItems = new ArrayList<TaxItem>();
      TaxQuoteRequest taxRequest = new TaxQuoteRequest();
      for ( TransactionLineItem lineItem : transaction.getLineItems() ) {
        if ( null != lineItem.getType() ) {
          TaxItem taxItem = new TaxItem();
          taxItem.setAmount(lineItem.getAmount());
          taxItem.setQuantity(1);
          taxItem.setDescription(lineItem.getDescription());
          LineItemType lineItemType = (LineItemType) ((DAO) x.get("lineItemTypeDAO")).find_(x, lineItem.getType());
          if ( null == lineItemType ) continue;
          taxItem.setTaxCode(lineItemType.getTaxCode());
          taxItems.add(taxItem);
        }
      }
      TaxItem[] items = new TaxItem[taxItems.size()];
      taxRequest.setTaxItems(taxItems.toArray(items));
      taxRequest.setFromUser(fromUser);
      taxRequest.setToUser(toUser);

      TaxService taxService = (TaxService) x.get("taxService");
      TaxQuote taxQuote = taxService.getTaxQuote(taxRequest);
      if ( null != taxQuote ) {
        List<TaxLineItem> taxLineItems = new ArrayList<TaxLineItem>();
        for ( TaxItem quotedTaxItem : taxQuote.getTaxItems() ) {
          taxLineItems.add(new TaxLineItem.Builder(x).setNote(quotedTaxItem.getDescription()).setTaxAccount(fee.getFeeAccount()).setAmount(quotedTaxItem.getTax()).build());
        }
        TaxLineItem[] lineItems = new TaxLineItem[taxLineItems.size()];
        applyTo.addLineItems(taxLineItems.toArray(lineItems));
      }

      return applyTo;

    `
    },
  ]
});
