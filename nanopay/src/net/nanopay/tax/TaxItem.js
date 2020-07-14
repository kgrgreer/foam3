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
    name: 'TaxItem',

    documentation: 'Represents individual item that needs to be taxed.',

    javaImports: [
      'foam.nanos.auth.User'
    ],
    properties: [
        {
          class: 'Int',
          name: 'quantity'
        },
        {
          name: 'amount',
          class: 'UnitValue',
          unitPropValueToString: async function(x, val, unitPropName) {
            var formattedAmount = val / 100;
            return '$' + x.addCommas(formattedAmount.toFixed(2));
          },
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
              .start()
                .add('$', X.addCommas(formattedAmount.toFixed(2)))
              .end();
          }
        },
        {
          class: 'String',
          name: 'taxCode'
        },
        {
          class: 'String',
          name: 'description'
        },
        {
          class: 'String',
          name: 'type'
        },
        {
          name: 'tax',
          class: 'UnitValue',
          unitPropValueToString: async function(x, val, unitPropName) {
            var formattedAmount = val / 100;
            return '$' + x.addCommas(formattedAmount.toFixed(2));
          },
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
              .start()
                .add('$', X.addCommas(formattedAmount.toFixed(2)))
              .end();
          }
        },
        {
          class: 'FObjectArray',
          of: 'net.nanopay.tax.TaxSummary',
          name: 'summary',
          javaFactory: 'return new TaxSummary[0];',
          documentation: 'Summary of applied taxes with their jurisdiction.'
        },
    ]
});
