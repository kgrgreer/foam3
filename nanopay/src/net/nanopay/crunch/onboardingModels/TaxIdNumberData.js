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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'TaxIdNumberData',

  implements: [ 'foam.mlang.Expressions' ],

  sections: [
    {
      name: 'taxIdNumberSection',
      title: 'Enter tax number',
      help: 'Enter tax number'
    },
  ],

  messages: [
    { name: 'TAX_ID_NUMBER_ERROR', message: 'Please enter valid Federal Tax ID Number (EIN)' }
  ],

  properties: [
    {
      section: 'taxIdNumberSection',
      class: 'String',
      name: 'taxIdentificationNumber',
      label: 'Federal Tax ID Number (EIN)',
      documentation: 'Federal Tax ID Number (EIN)',
      validationPredicates: [
        {
          args: ['taxIdentificationNumber'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.crunch.onboardingModels.TaxIdNumberData.TAX_IDENTIFICATION_NUMBER, /^[0-9]{9}$/);
          },
          errorMessage: 'TAX_ID_NUMBER_ERROR'
        }
      ]
    }
  ]
});