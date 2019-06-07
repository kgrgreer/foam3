foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXServiceProvider',
  implements: [ 'net.nanopay.fx.FXService' ],

  documentation: ``,

  javaImports: [
    'net.nanopay.fx.FXQuote',
    'java.util.Calendar',
    'foam.core.X',
    'foam.dao.DAO'
  ],


  methods: [
    {
      name: 'getFXRate',
      javaCode: `
        return getFXRateWithPaymentMethod(sourceCurrency, targetCurrency, sourceAmount, destinationAmount,
          fxDirection, valueDate, user, fxProvider);
      `
    },
    {
      name: 'acceptFXRate',
      javaCode: `
      boolean result = false;
      FXQuote quote = (FXQuote) fxQuoteDAO_.find(Long.parseLong(quoteId));
      if  ( null == quote ) throw new RuntimeException("FXQuote not found with Quote ID:  " + quoteId);
  
      // Check FXDeal has not expired
      validateDealExpiryDate(quote.getExpiryTime());
  
      //Build AFEX Request
      //AcceptQuoteRequest request = new AcceptQuoteRequest();
      
  
     // AcceptQuoteResult acceptQuoteResult = this.ascendantFX.acceptQuote(request);
      // if ( null != acceptQuoteResult && acceptQuoteResult.getErrorCode() == 0 ) {
      //   quote.setStatus(ExchangeRateStatus.ACCEPTED.getName());
      //   fxQuoteDAO_.put_(x, quote);
      //   result = true;
      // }

      return result;
      `
    },
    {
      name: 'getFXRateWithPaymentMethod',
      type: 'net.nanopay.fx.FXQuote',
      javaThrows: [ 'java.lang.RuntimeException ' ],
      args: [
        {
          type: 'String',
          name: 'sourceCurrency'
        },
        {
          type: 'String',
          name: 'targetCurrency'
        },
        {
          type: 'Long',
          name: 'sourceAmount'
        },
        {
          type: 'Long',
          name: 'destinationAmount'
        },
        {
          type: 'String',
          name: 'fxDirection'
        },
        {
          type: 'String',
          name: 'valueDate'
        },
        {
          type: 'Long',
          name: 'user'
        },
        {
          type: 'String',
          name: 'fxProvider'
        }
      ],
      javaCode: `
      FXQuote fxQuote = new FXQuote();
  
      return fxQuote;
      `
    },
    {
      name: 'validateDealExpiryDate',
      args: [
        {
          type: 'java.util.Date',
          name: 'expiryDate'
        }
      ],
      javaCode: `
      boolean dealHasExpired = false;
      int bufferMinutes = 5;
      Calendar now = Calendar.getInstance();
      now.add(Calendar.MINUTE, bufferMinutes);
      Calendar expiry = Calendar.getInstance();
      expiry.setTime(expiryDate);
      dealHasExpired = (now.after(expiry));
      if ( dealHasExpired )
        throw new RuntimeException("The quoted exchange rate expired. Please submit again.");
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
        protected DAO fxQuoteDAO_;
        private  X x;

        public void start() {
          this.x = getX();
          this.fxQuoteDAO_ = (DAO) x.get("fxQuoteDAO");
        }

        `);
      },
    },
  ]
 });
