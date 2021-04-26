/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.partner.treviso.fx',
  name: 'TrevisoFXServiceMock',
  extends: 'net.nanopay.partner.treviso.fx.TrevisoFXService',

  javaImports: [
    'foam.nanos.dig.exception.UnsupportException',
    'foam.util.SafetyUtil',
    'java.util.Arrays'
  ],

  methods: [
    {
      name: 'getFXSpotRate',
      javaCode: `
      if ( ! SafetyUtil.equals("BRL", sourceCurrency) ) {
        throw new UnsupportException("Unsupported source currency: BRL");
      }
      if ( ! Arrays.asList(getCurrencies()).contains(targetCurrency) ) {
        throw new UnsupportException("Unsupported target currency: "+targetCurrency);
      }

      switch (targetCurrency) {
        case "USD" : return 0.18;
        case "CAD" : return 0.22;
        case "CNY" : return 1.17;
        case "EUR" : return 0.15;
        case "GBP" : return 0.13;
        default: return 1;
      }

      `
    }
  ]
});
