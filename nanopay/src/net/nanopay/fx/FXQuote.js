foam.CLASS({
    package: 'net.nanopay.fx',
    name: 'FXQuote',

    javaImports: [
      'foam.core.X',
      'foam.nanos.auth.EnabledAware',
      'foam.nanos.auth.User',
      'foam.nanos.logger.Logger',
      'foam.dao.DAO',
      'foam.mlang.MLang',
      'foam.dao.AbstractSink',
      'foam.core.Detachable',
      'foam.util.SafetyUtil'
    ],

    tableColumns: [
      'id',
      'user',
      'sourceCurrency',
      'targetCurrency',
      'rate',
      'fee'
    ],

    properties: [{
            class: 'foam.core.Date',
            name: 'expiryTime'
        },
        {
            class: 'Long',
            name: 'id',
            documentation: 'Refers to the'
        },
        {
          class: 'String',
          name: 'endToEndId'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'user'
        },
        {
            class: 'String',
            name: 'externalId',
            documentation: 'Refers to the FX Provider Quote Identifier'
        },
        {
            class: 'foam.core.Date',
            name: 'quoteDateTime'
        },
        {
            class: 'String',
            name: 'status'
        },
        {
          class: 'Reference',
          of: 'net.nanopay.model.Currency',
          name: 'sourceCurrency'
        },
        {
          class: 'Reference',
          of: 'net.nanopay.model.Currency',
          name: 'targetCurrency'
        },
        {
            class: 'Currency',
            name: 'sourceAmount'
        },
        {
            class: 'Currency',
            name: 'targetAmount'
        },
        {
          class: 'Double',
          name: 'rate'
        },
        {
          class: 'Double',
          name: 'invertedRate'
        },
        {
          class: 'Boolean',
          name: 'hasSourceAmount'
        },
        {
          class: 'Currency',
          name: 'fee'
        },
        {
          class: 'String',
          name: 'feeCurrency'
        },
        {
          class: 'String',
          name: 'paymentMethod'
        },
        {
          class: 'String',
          name: 'valueDate'
        }
    ],
    axioms: [
      {
        buildJavaClass: function(cls) {
          cls.extras.push(`
            static public FXQuote lookUpFXQuote(X x, String endToEndId, Long userId) {
              final FXQuote fxQuote = new FXQuote.Builder(x).build();
              DAO fxQuoteDAO = (DAO) x.get("fxQuoteDAO");
              fxQuoteDAO.where(
                  MLang.AND(
                      MLang.EQ(FXQuote.END_TO_END_ID, endToEndId),
                      MLang.EQ(FXQuote.USER, userId)
                  )
              ).select(new AbstractSink() {
                @Override
                public void put(Object obj, Detachable sub) {
                  fxQuote.setEndToEndId(((FXQuote) obj).getEndToEndId());
                  fxQuote.setExpiryTime(((FXQuote) obj).getExpiryTime());
                  fxQuote.setExternalId(((FXQuote) obj).getExternalId());
                  fxQuote.setSourceCurrency(((FXQuote) obj).getSourceCurrency());
                  fxQuote.setTargetCurrency(((FXQuote) obj).getTargetCurrency());
                }
              });

              return fxQuote;
            }

          `);
        }
      }
    ]
});
