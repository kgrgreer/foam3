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
  package: 'net.nanopay.fx.mock',
  name: 'MockFXService',

  documentation: 'An impelementation of FXService that spoofs FX rates',

  implements: [
    'net.nanopay.fx.FXService'
  ],

  methods: [
    {
      name: 'getFXRate',
      code: (sourceCurrency, targetCurrency, sourceAmount, destinationAmount, fxDirection, valueDate, user, fxProvider) => {
        let constantRate = 1;
        return Promise.resolve({ rate: constantRate });
      }
    }
  ]
});
