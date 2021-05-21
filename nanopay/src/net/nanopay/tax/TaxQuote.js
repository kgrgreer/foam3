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
    name: 'TaxQuote',

    documentation: 'Represents tax quotation for a group of taxable items in a transaction.',

    javaImports: [
      'foam.nanos.auth.User'
    ],
    properties: [
        {
          class: 'FObjectArray',
          of: 'net.nanopay.tax.TaxItem',
          name: 'taxItems',
          javaFactory: 'return new TaxItem[0];',
          documentation: 'Group of tax items that have been quoted.'
        },
        {
          class: 'String',
          name: 'type'
        },
        {
          name: 'totalAmount',
          class: 'UnitValue',
          unitPropValueToString: async function(x, val, unitPropName) {
            var formattedAmount = val / 100;
            return '$' + x.addCommas(formattedAmount.toFixed(2));
          },
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalExempt',
          class: 'UnitValue',
          unitPropValueToString: async function(x, val, unitPropName) {
            var formattedAmount = val / 100;
            return '$' + x.addCommas(formattedAmount.toFixed(2));
          },
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalDiscount',
          class: 'UnitValue',
          unitPropValueToString: async function(x, val, unitPropName) {
            var formattedAmount = val / 100;
            return '$' + x.addCommas(formattedAmount.toFixed(2));
          },
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalTax',
          class: 'UnitValue',
          unitPropValueToString: async function(x, val, unitPropName) {
            var formattedAmount = val / 100;
            return '$' + x.addCommas(formattedAmount.toFixed(2));
          },
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalTaxable',
          class: 'UnitValue',
          unitPropValueToString: async function(x, val, unitPropName) {
            var formattedAmount = val / 100;
            return '$' + x.addCommas(formattedAmount.toFixed(2));
          },
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          name: 'totalTaxCalculated',
          class: 'UnitValue',
          unitPropValueToString: async function(x, val, unitPropName) {
            var formattedAmount = val / 100;
            return '$' + x.addCommas(formattedAmount.toFixed(2));
          },
          tableCellFormatter: function(amount, X) {
            var formattedAmount = amount/100;
            this
            .add('$', X.addCommas(formattedAmount.toFixed(2)));
          }
        },
        {
          class: 'Double',
          name: 'exchangeRate'
        },
        {
          class: 'DateTime',
          name: 'taxDate'
        }
    ]
});
