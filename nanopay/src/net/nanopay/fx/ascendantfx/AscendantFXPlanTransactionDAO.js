/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXPlanTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

  javaImports: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.ErrorTransaction',
    'net.nanopay.tx.alterna.AlternaCOTransaction',
    'net.nanopay.tx.TransactionPlan',
    'net.nanopay.tx.QuoteTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionType',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FXDirection',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.fx.ascendantfx.model.Deal',
    'net.nanopay.fx.ascendantfx.model.Direction',
    'net.nanopay.fx.ascendantfx.model.GetQuoteRequest',
    'net.nanopay.fx.ascendantfx.model.GetQuoteResult',
    'net.nanopay.fx.ascendantfx.model.Quote'

  ],

  constants: [
    {
          type: 'String',
          name: 'AFX_ORG_ID',
          value: 'AFX_ORG_ID' // TODO: Set proper Organization ID
      },
      {
          type: 'String',
          name: 'AFX_METHOD_ID',
          value: 'AFX_METHOD_ID' // TODO: Set proper METHOD ID
      }
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
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
    if ( ! ( obj instanceof QuoteTransaction ) ) {
      return super.put_(x, obj);
    }

    Logger logger = (Logger) x.get("logger");

    QuoteTransaction quote = (QuoteTransaction) obj;
    Transaction request = quote.getRequestTransaction();
    TransactionPlan plan = new TransactionPlan.Builder(x).build();
    FeesFields fxFees = new FeesFields.Builder(x).build();

    Account sourceAccount = request.findSourceAccount(x);
    Account destinationAccount = request.findDestinationAccount(x);

    // TODO:
    // This type of configuration should be associated with Corridoors (I think).
    // handle
    // CAD -> USD
    // USD -> USD
    // USD -> INR

    // Create and execute AscendantFXTransaction to get Rate
    // store in plan

    if ( sourceAccount instanceof CABankAccount &&
         destinationAccount instanceof USBankAccount ||
         sourceAccount instanceof USBankAccount &&
         destinationAccount instanceof USBankAccount ||
         sourceAccount instanceof USBankAccount &&
         destinationAccount instanceof INBankAccount ) {


    //Get ascendant service
    AscendantFX ascendantFX = (AscendantFX) x.get("ascendantFX");

    //Convert to AscendantFx Request
    GetQuoteRequest getQuoteRequest = new GetQuoteRequest();
    getQuoteRequest.setMethodID(AFX_METHOD_ID);
    getQuoteRequest.setOrgID(AFX_ORG_ID);

    Deal deal = new Deal();
    Direction direction = Direction.valueOf(FXDirection.Buy.getName());
    deal.setDirection(direction);
    deal.setFxAmount(request.getAmount());
    deal.setFxCurrencyID(request.getSourceCurrency());
    deal.setSettlementCurrencyID(destinationAccount.getDenomination());
    Deal[] deals = new Deal[1];
    deals[0] = deal;
    getQuoteRequest.setPayment(deals);

    // message to ascendant to get FX Quote
    // TODO: test if fx already done
    try {
        GetQuoteResult getQuoteResult = ascendantFX.getQuote(getQuoteRequest);
        if ( null != getQuoteResult ) {
            AscendantFXTransaction ascFXTransaction = new AscendantFXTransaction.Builder(x).build();
            ascFXTransaction.copyFrom(request);

            Quote ascendantQuote = getQuoteResult.getQuote();
            quote.setId(String.valueOf(ascendantQuote.getID()));
            ascFXTransaction.setFxQuoteId(String.valueOf(ascendantQuote.getID()));
            ascFXTransaction.setFxExpiry(ascendantQuote.getExpiryTime());
            ascFXTransaction.setFxStatus(ExchangeRateStatus.QUOTED);
            Deal[] dealResult = getQuoteResult.getPayment();
            if ( dealResult.length > 0 ) {
                Deal aDeal = dealResult[0];
                ascFXTransaction.setFxRate(aDeal.getRate());
                fxFees.setTotalFees(aDeal.getFee());
            }

            //Add to plan
            plan.add(x, ascFXTransaction);
        }
    } catch (Throwable t) {
        ((Logger) x.get("logger")).error("Error sending GetQuote to AscendantFX.", t);
        plan.add(x, new ErrorTransaction.Builder(x).setErrorMessage("AscendantFX failed to acquire quote: "+t.getMessage()).setException(t).build());
    }

    // Create AscendantFX CICO Transactions
    if( null != sourceAccount ){

      // Debit Source Account of Transaction amount
      AscendantFXCOTransaction coTransaction = new AscendantFXCOTransaction.Builder(x).build();
      coTransaction.copyFrom(request);
      plan.add(x, coTransaction);

      // Debit Source Account of Broker Fee.


    }


    // Add nanopay Fee?

    if ( plan.getQueued().length > 0 ) {
      quote.add(x, plan);
    }

    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});
