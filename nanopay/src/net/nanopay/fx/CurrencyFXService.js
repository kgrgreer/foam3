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
      of: 'foam.core.Currency',
      name: 'sourceCurrency',
      value: 'CA'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'destCurrency',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'nSpecId',
      documentation: 'name/id of FXService to use.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spId'
    },
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public FXService getFXService(X x, String sourceCurrency, String destCurrency, String spId) {
            FXService fxService = null;
            final CurrencyFXService currencyFXService = new CurrencyFXService();
            DAO currencyFXServiceDAO = (DAO) x.get("currencyFXServiceDAO");

            currencyFXServiceDAO.where(MLang.AND(
                MLang.EQ(CurrencyFXService.SOURCE_CURRENCY, sourceCurrency),
                MLang.EQ(CurrencyFXService.DEST_CURRENCY, destCurrency),
                MLang.EQ(CurrencyFXService.SP_ID, spId)
            )).limit(1).select(new AbstractSink() {
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

          static public FXService getFXServiceByNSpecId(X x, String sourceCurrency, String destCurrency, String nSpecId) {
            FXService fxService = null;
            final CurrencyFXService currencyFXService = new CurrencyFXService();
            DAO currencyFXServiceDAO = (DAO) x.get("currencyFXServiceDAO");

            currencyFXServiceDAO.where(MLang.AND(
                MLang.EQ(CurrencyFXService.SOURCE_CURRENCY, sourceCurrency),
                MLang.EQ(CurrencyFXService.DEST_CURRENCY, destCurrency),
                MLang.EQ(CurrencyFXService.N_SPEC_ID, nSpecId)
            )).limit(1).select(new AbstractSink() {
              @Override
              public void put(Object obj, Detachable sub) {
                currencyFXService.setNSpecId(((CurrencyFXService) obj).getNSpecId());
              }
            });

            if ( ! SafetyUtil.isEmpty(currencyFXService.getNSpecId()) ) {
              fxService = (FXService) x.get(currencyFXService.getNSpecId());
            }

            return fxService;
          }

        `);
      }
    }
  ]
});
