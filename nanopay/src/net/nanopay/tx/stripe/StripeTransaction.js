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
  package: 'net.nanopay.tx.stripe',
  name: 'StripeTransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  properties: [
    {
      class: 'String',
      name: 'stripeTokenId',
      documentation: 'For most Stripe users, the source of every charge is a' +
        ' credit or debit card. Stripe Token ID is the hash of the card' +
        ' object describing that card. Token IDs cannot be stored or used' +
        ' more than once.'
    },
    {
      class: 'String',
      name: 'stripeChargeId',
      documentation: 'Stripe charge id is a unique identifier for every' +
        ' Charge object.'
    },
    {
      class: 'String',
      name: 'notes',
      visibility: 'RO',
      documentation: 'Transaction notes'
    },
    {
      class: 'Long',
      name: 'fee'
    },
    {
      class: 'String',
      name: 'mobileToken'
    },
    {
      class: 'Long',
      name: 'paymentCardId'
    },
    {
      class: 'Boolean',
      name: 'isRequestingFee'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.CICOPaymentType',
      name: 'paymentType'
    },
    {
      class: 'Reference',
      name: 'currencyId',
      of: 'foam.core.Currency'
    }
  ]
});
