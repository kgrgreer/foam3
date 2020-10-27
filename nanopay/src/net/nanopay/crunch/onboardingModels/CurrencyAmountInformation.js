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
  name: 'CurrencyAmountInformation',

  documentation: `Collect equity and capital information for business`,

  sections: [
    {
      name: 'businessCapital',
      title: 'Business Capital and Business Equity'
    }
  ],

  messages: [
    { name: 'INVALID_CAPITAL', message: 'Invalid Capital' },
    { name: 'INVALID_EQUITY', message: 'Invalid Equity' }
  ],

  properties: [
    {
      section: 'businessCapital',
      class: 'FObjectProperty',
      of: 'net.nanopay.model.CurrencyAmount',
      name: 'capital',
      label:'Business Capital',
      help: 'What are the businesses\' current assets, i.e. sum of all assets.',
      documentation: 'Amount currency that Business Capital has been defined',
      factory: function () {
        return net.nanopay.model.CurrencyAmount.create({}, this);
      },
      validationPredicates: [
        {
          args: ['capital', 'capital$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.CurrencyAmountInformation.CAPITAL
              }), true);
          },
          errorMessage: 'INVALID_CAPITAL'
        }
      ]
    },
    {
      section: 'businessCapital',
      class: 'FObjectProperty',
      of: 'net.nanopay.model.CurrencyAmount',
      name: 'equity',
      label:'Business Equity',
      help: 'What is the businesses\' net worth, i.e. sum of all assets minus sum of all liabilities.',
      documentation: 'Amount currency that Business Equity has been defined',
      factory: function () {
        return net.nanopay.model.CurrencyAmount.create({}, this);
      },
      validationPredicates: [
        {
          args: ['equity', 'equity$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.CurrencyAmountInformation.EQUITY
              }), true);
          },
          errorMessage: 'INVALID_EQUITY'
        }
      ]
    },
  ],
});

