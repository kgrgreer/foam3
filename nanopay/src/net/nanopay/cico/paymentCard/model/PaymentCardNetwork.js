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

foam.ENUM({
  package: 'net.nanopay.cico.paymentCard.model',
  name: 'PaymentCardNetwork',
  documentation: 'Networks of payment cards.',

  values: [
    {
      name: 'OTHER',
      label: 'Other'
    },
    {
      name: 'VISA',
      label: 'Visa'
    },
    {
      name: 'MASTERCARD',
      label: 'Master Card'
    },
    {
      name: 'AMERICANEXPRESS',
      label: 'American Express'
    },
    {
      name: 'DISCOVER',
      label: 'Discover'
    },
    {
      name: 'DINERSCLUB',
      label: 'Diners Club'
    },
    {
      name: 'JCB',
      label: 'JCB'
    }
  ]
});
