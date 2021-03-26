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
  package: 'net.nanopay.country.br',
  name: 'NatureBusinessRelationship',

  documentation: `Nature of Business Relationship with a Brazilian Brokerage Exchange`,

  sections: [
    {
      name: 'businessRelationship',
      title: 'Purpose of brokerage relationship'
    }
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' },
    { name: 'BUSINESS_TYPE_ERROR', message: 'Purpose of brokerage relationship required' },
    { name: 'BROKERAGE_INTERMEDIATION', message: 'Brokerage intermediation' },
    { name: 'BUY_SELL_FOREIGN_CURRENCY', message: 'Buy / Sell Foreign Currency' },
    { name: 'PREPAID_CARD', message: 'Prepaid Card' },
    { name: 'INTERNATIONAL_REMITTANCES', message: 'International Remittances' },
    { name: 'WESTERN_UNION', message: 'Western Union' }
  ],

  properties: [
    {
      section: 'businessRelationship',
      class: 'String',
      name: 'NatureOfBusinessRelationship',
      label:'Enter the purpose of your relationship with an exchange broker',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.PLACE_HOLDER,
          choices: [
            X.data.BROKERAGE_INTERMEDIATION,
            X.data.BUY_SELL_FOREIGN_CURRENCY,
            X.data.PREPAID_CARD,
            X.data.INTERNATIONAL_REMITTANCES,
            X.data.WESTERN_UNION
          ]
        };
      },
      validationPredicates: [
        {
          args: ['NatureOfBusinessRelationship'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: net.nanopay.country.br.NatureBusinessRelationship.NATURE_OF_BUSINESS_RELATIONSHIP
              }), 0);
          },
          errorMessage: 'BUSINESS_TYPE_ERROR'
        }
      ]
    },
  ],
});

