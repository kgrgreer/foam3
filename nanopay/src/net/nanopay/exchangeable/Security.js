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
  package: 'net.nanopay.exchangeable',
  name: 'Security',
  extends: 'foam.core.Unit',

  documentation: `The base model for storing, using and managing securities information. (such as
  stocks bonds etc.`,

  tableColumns: [
    'name',
    'id'
  ],


  methods: [
    {
      name: 'toSummary',
      type: 'String',
      documentation: `When using a reference to the securitiesDAO, the labels associated
        to it will show a chosen property rather than the first alphabetical string
        property. In this case, we are using the id.
      `,
      code: function(x) {
        return this.id;
      },
      javaCode: `
        return getId();
      `
    },
    {
      name: 'format',
      code: function(amount) {
        /**
         * Given a number, display it as a currency using the appropriate
         * precision, decimal character, delimiter, symbol, and placement
         * thereof.
         *
         * With the new home denomination feature, we will append (if left) or
         * prepend (if right) the alphabetic code if the currency's alphabetic code
         * is not equal to the homeDenomination
         *
         */
        amount = Math.floor(amount);
        var isNegative = amount < 0;
        amount = amount.toString();
        if ( isNegative ) amount = amount.substring(1);
        var formatted = isNegative ? '-' : '';

        formatted+= amount;

        formatted += ' ';
        formatted += this.id;


        return formatted;
      },
      args: [
        {
          class: 'foam.core.UnitValue',
          name: 'amount'
        }
      ],
      type: 'String',
      javaCode: `
        Boolean isNegative = amount < 0;
        String amountStr = Long.toString(amount);
        if ( isNegative ) amountStr = amountStr.substring(1);
        String formatted = isNegative ? "-" : "";
        formatted += amountStr;
        formatted += " ";
        formatted += this.getId();
        return formatted;
      `
    }
  ]
});
