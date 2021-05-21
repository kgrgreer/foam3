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
  name: 'CorridorQuoteDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    add corridors to the quote.
  `,

  javaImports: [
    'net.nanopay.tx.TransactionQuote',
    'foam.dao.DAO',
    'net.nanopay.payment.CorridorService',
    'net.nanopay.payment.PaymentProviderCorridor',
    'java.util.List',
    'java.util.ArrayList',
  ],

  implements: [
    'foam.nanos.auth.EnabledAware',
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
      javaCode: `

        TransactionQuote quote = (TransactionQuote) obj;
        if ( ! getEnabled() ) {
          return getDelegate().put_(x, obj);
        }
        
        if ( ! quote.isPropertySet("corridorsEnabled") ) {
          quote.setCorridorsEnabled(true);
        }

        CorridorService cs = (CorridorService) x.get("corridorService");

        // get list of payment providers
        List junctions = cs.getQuoteCorridorPaymentProviders(getX(), quote);

        for ( Object j : junctions )
          quote.getEligibleProviders().put(((PaymentProviderCorridor) j).getProvider(), true);

        return getDelegate().put_(x, quote);

      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CorridorQuoteDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
