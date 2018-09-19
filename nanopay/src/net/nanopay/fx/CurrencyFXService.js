foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'CurrencyFXService',

  documentation: 'Lookop of FXService based on Source and Destination Currency',

  javaImports: [
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.util.SafetyUtil',
    'foam.core.Detachable'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'sourceCurrency',
      value: 'CA'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'destCurrency',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'nSpecId',
      documentation: 'name/id of FXService to use.'
    }
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public FXService getFXService(X x, String sourceCurrency, String destCurrency) {
            FXService fxService = null;
            final CurrencyFXService currencyFXService = new CurrencyFXService();
            DAO currencyFXServiceDAO = (DAO) x.get("currencyFXServiceDAO");

            currencyFXServiceDAO.where(MLang.AND(
                MLang.EQ(CurrencyFXService.SOURCE_CURRENCY, sourceCurrency),
                MLang.EQ(CurrencyFXService.DEST_CURRENCY, destCurrency)
            )).select(new AbstractSink() {
              @Override
              public void put(Object obj, Detachable sub) {
                currencyFXService.setNSpecId(((CurrencyFXService) obj).getNSpecId());
              }
            });

            if ( ! SafetyUtil.isEmpty(currencyFXService.getNSpecId()) ) {
              fxService = (FXService) x.get(currencyFXService.getNSpecId());
            }

            if ( null == fxService ) {
              fxService = (FXService) x.get("localFXService");
            }

            return fxService;
          }

          static public String getFXServiceNSpecId(X x, String sourceCurrency, String destCurrency) {
            String fxServiceNSpecId = "localFXService";
            final CurrencyFXService currencyFXService = new CurrencyFXService();
            DAO currencyFXServiceDAO = (DAO) x.get("currencyFXServiceDAO");

            currencyFXServiceDAO.where(MLang.AND(
                MLang.EQ(CurrencyFXService.SOURCE_CURRENCY, sourceCurrency),
                MLang.EQ(CurrencyFXService.DEST_CURRENCY, destCurrency)
            )).select(new AbstractSink() {
              @Override
              public void put(Object obj, Detachable sub) {
                currencyFXService.setNSpecId(((CurrencyFXService) obj).getNSpecId());
              }
            });

            if ( ! SafetyUtil.isEmpty(currencyFXService.getNSpecId()) ) {
              fxServiceNSpecId = currencyFXService.getNSpecId();
            }

            return fxServiceNSpecId;
          }
        `);
      }
    }
  ]
});
