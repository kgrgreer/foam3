/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'NanopayLineItemTaxDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',

    'net.nanopay.tx.model.TransactionFee',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tax.TaxItem',
    'net.nanopay.tax.TaxService',
    'net.nanopay.tax.TaxQuoteRequest',
    'net.nanopay.tax.TaxQuote',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',

    'java.util.List',
    'java.util.ArrayList'
  ],

  properties: [
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);

      for ( int i = 0; i < quote.getPlans().length; i++ ) {
        quote.getPlans()[i] = applyTax(getX(), quote.getPlans()[i], quote.getPlans()[i]);
      }
      return quote;
`
    },
    {
      name: 'applyTax',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'transaction',
          type: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'applyTo',
          type: 'net.nanopay.tx.model.Transaction'
        }
     ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      if ( transaction == null ) {
        return transaction;
      }
      
      DAO typeAccountDAO = (DAO) x.get("lineItemTypeAccountDAO");
      User payee = applyTo.findDestinationAccount(x).findOwner(x);

      Account sourceAccount = transaction.findSourceAccount(x);
      Account destinationAccount = transaction.findDestinationAccount(x);

      List<TaxItem> taxItems = new ArrayList<TaxItem>();
      TaxQuoteRequest taxRequest = new TaxQuoteRequest.Builder(x).build();
      for ( TransactionLineItem lineItem : transaction.getLineItems() ) {
        if ( null != lineItem.getType() ) {
          LineItemType lineItemType = lineItem.findType(x);
          if ( null == lineItemType ) continue;

          TaxItem taxItem = new TaxItem.Builder(x).build();
          taxItem.setTaxCode(lineItemType.getTaxCode());
          taxItem.setDescription(lineItemType.getName()); // TODO: test if null/empty - lineItemType.getDescription());
          taxItem.setAmount(lineItem.getAmount());
          taxItem.setQuantity(1);
          taxItem.setType(lineItemType.getId());
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

        List<TaxLineItem> forward = new ArrayList<TaxLineItem>();
        List<InfoLineItem> reverse = new ArrayList<InfoLineItem>();
        for ( TaxItem quotedTaxItem : taxQuote.getTaxItems() ) {
          Long taxAccount = 0L;
          LineItemTypeAccount lineItemTypeAccount = (LineItemTypeAccount) typeAccountDAO.find(
            MLang.AND(
              MLang.EQ(LineItemTypeAccount.ENABLED, true),
              MLang.EQ(LineItemTypeAccount.USER, payee.getId()),
              MLang.EQ(LineItemTypeAccount.TYPE, quotedTaxItem.getType())
            )
          );

          if ( null != lineItemTypeAccount ) {
            taxAccount = lineItemTypeAccount.getAccount();
          }

          if ( taxAccount <= 0 ) {
            Account account = DigitalAccount.findDefault(x, payee, "CAD");
            taxAccount = account.getId();
          }

          Long amount = quotedTaxItem.getTax();
          if ( taxAccount > 0 &&
               amount > 0L ) {
            forward.add(new TaxLineItem.Builder(x).setNote(quotedTaxItem.getDescription()).setSourceAccount(transaction.getSourceAccount()).setDestinationAccount(taxAccount).setAmount(amount).setType(quotedTaxItem.getType()).build());
            reverse.add(new InfoLineItem.Builder(x).setNote(quotedTaxItem.getDescription()+" - Non-refundable").setAmount(amount).build());
          }

        }
        TaxLineItem[] forwardLineItems = new TaxLineItem[forward.size()];
        InfoLineItem[] reverseLineItems = new InfoLineItem[reverse.size()];
        applyTo.addLineItems(forward.toArray(forwardLineItems), reverse.toArray(reverseLineItems));
      }

      return applyTo;

    `
    },
  ]
});
