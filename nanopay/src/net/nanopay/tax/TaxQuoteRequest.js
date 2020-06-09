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
    package: 'net.nanopay.tax',
    name: 'TaxQuoteRequest',

    javaImports: [
      'foam.nanos.auth.User',
      'net.nanopay.tx.TransactionLineItem'
    ],

    documentation: 'Represents tax quote request for a set of taxable items in a transaction.',

    properties: [
        {
          class: 'FObjectArray',
          of: 'net.nanopay.tax.TaxItem',
          name: 'taxItems',
          javaFactory: 'return new TaxItem[0];',
          documentation: 'Group of items that we want to get tax quote for.'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'fromUser'
        },
        {
          class: 'Reference',
          of: 'foam.nanos.auth.User',
          name: 'toUser'
        },
    ]
});
