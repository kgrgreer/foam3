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
  package: 'net.nanopay.tx.rbc.iso20022file',
  name: 'RbcRecord',

  documentation: `RBC Transactions and ISO20022 Messages`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
  ],

  properties: [
    {
      name: 'transactions',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      transient: true,
      javaFactory: 'return new Transaction[0];'
    },
    {
      name: 'transmissionHeader',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcTransmissionHeader',
      transient: true
    },
  ],
});
