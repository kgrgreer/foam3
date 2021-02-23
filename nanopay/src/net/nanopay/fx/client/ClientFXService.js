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
  package: 'net.nanopay.fx.client',
  name: 'ClientFXService',

  implements: [
    'net.nanopay.fx.FXService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.fx.FXService',
      name: 'delegate'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.fx.client',
  name: 'CachedFXService',
  extends: 'net.nanopay.fx.ProxyFXService',
  imports: [
    'setTimeout'
  ],
  properties: [
    {
      class: 'Map',
      name: 'cache'
    },
    {
      class: 'Int',
      name: 'ttl',
      value: 5000
    }
  ],
  methods: [
    function getFXRate(sourceCurrency,
                       targetCurrency,
                       sourceAmount,
                       destinationAmount,
                       fxDirection,
                       valueDate,
                       user,
                       fxProvider) {
      var key = JSON.stringify({
        sourceCurrency: sourceCurrency,
        targetCurrency: targetCurrency,
        sourceAmount: sourceAmount,
        destinationAmount: destinationAmount,
        fxDirection: fxDirection,
        valueDate: valueDate,
        user: user,
        fxProvider: fxProvider
      });
      if ( ! this.cache[key] ) {
        this.cache[key] = {
          data: this.delegate.getFXRate(
            sourceCurrency,
            targetCurrency,
            sourceAmount,
            destinationAmount,
            fxDirection,
            valueDate,
            user,
            fxProvider),
          date: new Date()
        }
        this.setTimeout(this.purge, this.ttl);
      }
      return this.cache[key].data;
    }
  ],
  listeners: [
    {
      name: 'purge',
      code: function() {
        for (let [key, value] of Object.entries(this.cache)) {
          if ( value.date.getTime() >= Date.now() - this.ttl ) continue;
          delete this.cache[key];
        }
      }
    }
  ]
});
