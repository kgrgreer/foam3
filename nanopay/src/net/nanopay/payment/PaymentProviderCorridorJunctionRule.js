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
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.fx.Corridor',
    'net.nanopay.payment.PaymentProvider',
    'net.nanopay.payment.PaymentProviderCorridorJunction'
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
        DAO paymentProviderDAO = (DAO) x.get("paymentProviderDAO");
        DAO corridorDAO = (DAO) x.get("capabilityDAO");
        Logger logger = (Logger) x.get("logger");

        PaymentProviderCorridorJunction ppcj = (PaymentProviderCorridorJunction) obj;
        PaymentProvider provider = (PaymentProvider) paymentProviderDAO.find(ppcj.getSourceId());
        Corridor corridor = (Corridor) corridorDAO.find(ppcj.getTargetId());

        if ( provider == null ) {
          logger.error(MISSING_PROVIDER, ppcj.getSourceId());
          throw new RuntimeException(MISSING_PROVIDER + ppcj.getSourceId());
        }
        if ( corridor == null ) {
          logger.error(MISSING_CORRIDOR, ppcj.getTargetId());
          throw new RuntimeException(MISSING_CORRIDOR + ppcj.getTargetId());
        }
      `
    }
  ]
});
