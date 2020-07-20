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
  name: 'PaymentProviderCorridor',
  extends: 'foam.nanos.crunch.Capability',

  documentation: `References payment provider and corridor along with currencies available
      in the relationship through the source and target country capabilities.
      Defines what corridors payment provider provide and the currencies available to the 
      source and target country capabilities. Acts as a junction model with it's own junctionDAO
      (PaymentProviderCorridorDAO)`,

  properties: [
    {
      class: 'Reference',
      name: 'provider',
      of: 'net.nanopay.payment.PaymentProvider',
      targetDAOKey: 'paymentProviderDAO'
    },
    {
      class: 'Reference',
      name: 'corridor',
      of: 'net.nanopay.fx.Corridor',
      targetDAOKey: 'corridorDAO',
      documentation: 'Looking to deprecate - not required.'
    },
    {
      class: 'StringArray',
      name: 'currencies',
      documentation: 'Agreed upon currencies in country.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'sourceCountry',
      documentation: '1st party involved in agreement.',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'targetCountry',
      documentation: '2nd party involved in agreement.',
      required: true
    },
  ]
});
