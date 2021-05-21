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
  name: 'CITransactionRefinement',
  refines: 'net.nanopay.tx.cico.CITransaction',

  implements: [
    'net.nanopay.payment.PaymentProviderAware'
  ],

  properties: [
    {
      name: 'paymentProvider',
      section: 'transactionInformation',
      order: 270,
      gridColumns: 6
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'COTransactionRefinement',
  refines: 'net.nanopay.tx.cico.COTransaction',

  implements: [
    'net.nanopay.payment.PaymentProviderAware'
  ],

  properties: [
    {
      name: 'paymentProvider',
      section: 'transactionInformation',
      order: 270,
      gridColumns: 6
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'FXTransactionRefinement',
  refines: 'net.nanopay.fx.FXTransaction',

  implements: [
    'net.nanopay.payment.PaymentProviderAware'
  ],

  properties: [
    {
      name: 'paymentProvider',
      section: 'transactionInformation',
      order: 270,
      gridColumns: 6
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'InterTrustTransactionRefinement',
  refines: 'net.nanopay.tx.cico.InterTrustTransaction',

  implements: [
    'net.nanopay.payment.PaymentProviderAware'
  ],

  properties: 
  [ 
    {
      name: 'paymentProvider',
      section: 'transactionInformation',
      order: 270,
      gridColumns: 6
    }
  ]
});
