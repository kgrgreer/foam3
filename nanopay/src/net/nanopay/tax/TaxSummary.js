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
    name: 'TaxSummary',

    documentation: 'Represents tax individual break down. Usally a single taxable item can be taxed by multiple states depending on the seller and buyer location.',

    javaImports: [
      'foam.nanos.auth.User'
    ],
    properties: [
        {
          class: 'String',
          name: 'jurisType'
        },
        {
          class: 'String',
          name: 'jurisCode'
        },
        {
          class: 'String',
          name: 'jurisName'
        },
        {
          class: 'Int',
          name: 'taxAuthorityType'
        },
        {
          class: 'String',
          name: 'taxType'
        },
        {
          class: 'String',
          name: 'taxName'
        },
        {
          class: 'String',
          name: 'rateType'
        },
        {
          name: 'taxable',
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
          class: 'Double',
          name: 'rate'
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
          name: 'taxCalculated',
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
          name: 'nonTaxable',
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
          class: 'Boolean',
          name: 'exemption'
        },
        {
          class: 'FObjectProperty',
          of: 'foam.nanos.auth.Address',
          name: 'address',
          documentation: 'User\' Address.',
          factory: function() {
            return this.Address.create();
          }
        },
    ]
});
