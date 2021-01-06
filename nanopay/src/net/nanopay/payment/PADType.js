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
  name: 'PADType',

  documentation: `
  This model defines the transaction codes for use in CICO payment transaction such as BmoCITransaction/BmoCOTransaction.
  Please see https://www.payments.ca/sites/default/files/standard_007.pdf for the full list
  `,

  properties: [
    {
      class: 'Long',
      name: 'id',
      documentation: 'Transaction codes are defined three digit codes used by a Payment Originator to identify a payment.',
    },
    {
      class: 'String',
      name: 'description'
    }
  ]
});
