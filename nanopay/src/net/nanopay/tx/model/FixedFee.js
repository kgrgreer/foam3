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
  package: 'net.nanopay.tx.model',
  name: 'FixedFee',
  extends: 'net.nanopay.tx.model.Fee',

  properties: [
    {
      class: 'Long',
      name: 'fixedFee'
    }
  ],

  methods: [
    {
      name: 'getFee',
      args: [
        {
          name: 'transactionAmount',
          type: 'Long',
        }
      ],
      type: 'Long',
      javaCode: ' return this.getFixedFee(); ',
      swiftCode: ' return fixedFee ',
      code: function() {
        return this.fixedFee;
      }
    },
    {
      name: 'getTotalAmount',
      args: [
        {
          name: 'transactionAmount',
          type: 'Long',
        }
      ],
      type: 'Long',
      javaCode: ' return getFee(transactionAmount) + transactionAmount; ',
      swiftCode: ' return getFee(transactionAmount) + transactionAmount ',
      code: function() {
        return getFee(transactionAmount) + transactionAmount;
      }
    }
  ]
});
