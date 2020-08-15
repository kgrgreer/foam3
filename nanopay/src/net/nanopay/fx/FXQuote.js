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
    name: 'FXQuote',

    javaImports: [
      'foam.core.X',
      'foam.dao.DAO',
      'foam.mlang.MLang',
      'foam.dao.AbstractSink',
      'foam.core.Detachable'
    ],

    tableColumns: [
      'id',
      'user',
      'sourceCurrency.name',
      'targetCurrency.name',
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
          of: 'foam.core.Currency',
          name: 'sourceCurrency'
        },
        {
          class: 'Reference',
          of: 'foam.core.Currency',
          name: 'targetCurrency'
        },
        {
            class: 'UnitValue',
            name: 'sourceAmount'
        },
        {
            class: 'UnitValue',
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
          class: 'UnitValue',
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
