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
  package: 'net.nanopay.cico.model',
  name: 'PaymentAccountInfo',
  documentation: 'PaymentAccountInfo is used to store payment information that is required to process a transaction by using a specified payment platform',
  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.CICOPaymentType',
      name: 'type'
    },
    {
      class: 'String',
      name: 'token'
    },
    {
      class: 'UnitValue',
      name: 'fee'
    },
    {
      class: 'Long',
      name: 'paymentCardId'
    },
    {
      class: 'String',
      name: 'cvn',
      required: true,
      storageTransient: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.cico.model.MobileWallet',
      name: 'mobileWallet'
    },
    {
      class: 'Reference',
      // targetDAOKey: 'currencyDAO',
      name: 'currencyId',
      of: 'foam.core.Currency'
    }
  ]
});
