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
  package: 'net.nanopay.tx.fee',
  name: 'PercentageFee',
  extends: 'net.nanopay.tx.fee.Fee',

  messages: [
    { name: 'FORMULA_PREFIX', message: 'Percentage fee' }
  ],

  properties: [
    'name',
    'label',
    {
      class: 'Double',
      name: 'percentage',
      section: 'basicInfo'
    },
    {
      class: 'String',
      name: 'amountPropName',
      label: 'Applies On',
      value: 'amount',
      section: 'basicInfo'
    },
    {
      name: 'formula',
      visibility: 'HIDDEN',
      tableCellFormatter: function(_, obj) {
        this.add(obj.FORMULA_PREFIX, ': ', obj.percentage, '%');
      }
    }
  ],

  methods: [
    {
      name: 'getFee',
      args: [
        {
          name: 'obj',
          type: 'FObject',
        }
      ],
      type: 'Long',
      javaCode: `
        return Math.round( this.getPercentage() / 100.0 * getAmount(obj) );
      `,
      // swiftCode: ' return Int(floorf(percentage / 100.0 * Float(transactionAmount)))',
      code: function(obj) {
        return this.percentage/100 * obj[this.propName];
      }
    },
    {
      name: 'getRate',
      javaCode: 'return getPercentage() / 100.0;'
    },
    {
      name: 'getAmount',
      type: 'Long',
      args: [
        { name: 'obj', type: 'FObject' }
      ],
      javaCode: `
        var prop = obj.getProperty(getAmountPropName());
        if ( prop instanceof Number ) {
          return Math.round( ((Number) prop).doubleValue() );
        }
        return 0l;
      `
    }
  ]
});
