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
  name: 'ExpectedBoardingDate',

  documentation: `The expected date of boarding`,

  implements: [
    'foam.core.Validatable'
  ],

  javaImports: [
    'java.util.Date'
  ],

  sections: [
    {
      name: 'dateOfBoardingSection',
      title: 'Expected shipment date'
    }
  ],

  messages: [
    { name: 'MIN_DATE_ERROR', message: 'Expected boarding date must be a future date' },
    { name: 'INVALID_DATE_ERROR', message: 'Valid expected date of boarding required' }
  ],

  properties: [
    {
      section: 'dateOfBoardingSection',
      name: 'boardingDate',
      label: 'Input expected boarding date',
      class: 'Date',
      documentation: 'Date of boarding date',
      validationPredicates: [
        {
          args: ['boardingDate'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.country.br.ExpectedBoardingDate.BOARDING_DATE, null);
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['boardingDate'],
          predicateFactory: function(e) {
            return e.GTE(net.nanopay.country.br.ExpectedBoardingDate.BOARDING_DATE, new Date());
          },
          errorMessage: 'MIN_DATE_ERROR'
        }
      ]
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
      if ( getBoardingDate() != null && getBoardingDate().getTime() < new Date().getTime() ) {
        throw new foam.core.ValidationException(MIN_DATE_ERROR);
      }
      `
    }
  ]
});
