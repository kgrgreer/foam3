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
  package: 'net.nanopay.payment',
  name: 'PaymentProviderCorridorJunctionRule',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Prevents create of payment provider corridor junction 
      if payment provider or corridor does not exist`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'net.nanopay.fx.Corridor',
    'net.nanopay.payment.PaymentProvider',
    'net.nanopay.payment.PaymentProviderCorridor'
  ],

  messages: [
    {
      name: 'MISSING_PROVIDER',
      message: 'ERROR: Unable to find payment provider '
    },
    {
      name: 'MISSING_CORRIDOR',
      message: 'ERROR: Unable to find corridor '
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        PaymentProviderCorridor ppcj = (PaymentProviderCorridor) obj;
        if ( ((PaymentProvider) ppcj.findProvider(x)) == null ) {
          logger.error(MISSING_PROVIDER, ppcj.getProvider());
          throw new RuntimeException(MISSING_PROVIDER + ppcj.getCorridor());
        }
        if ( ((Corridor) ppcj.findCorridor(x)) == null ) {
          logger.error(MISSING_CORRIDOR, ppcj.getCorridor());
          throw new RuntimeException(MISSING_CORRIDOR + ppcj.getCorridor());
        }
      `
    }
  ]
});
