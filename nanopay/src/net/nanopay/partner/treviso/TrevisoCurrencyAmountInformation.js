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
  package: 'net.nanopay.partner.treviso',
  name: 'TrevisoCurrencyAmountInformation',

  documentation: `Collect equity and capital information for business`,

  sections: [
    {
      name: 'businessCapital',
      title: 'Enter business capital, equity and revenue'
    }
  ],

  messages: [
    { name: 'INVALID_CAPITAL', message: 'Capital required' },
    { name: 'INVALID_EQUITY', message: 'Equity required' },
    { name: 'INVALID_MONTHLY_REVENUE', message: 'Average monthly revenue required' }
  ],

  properties: [
    {
      section: 'businessCapital',
      class: 'FObjectProperty',
      of: 'net.nanopay.model.CurrencyAmount',
      name: 'capital',
      label:'Business Capital',
      help: 'What are the businesses\' current assets, i.e. sum of all current assets for your business ',
      documentation: 'Amount currency that Business Capital has been defined',
      factory: function () {
        var currency = 'BRL';
        return net.nanopay.model.CurrencyAmount.create({currency: currency}, this);
      },
      validationPredicates: [
        {
          args: ['capital', 'capital$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.partner.treviso.TrevisoCurrencyAmountInformation.CAPITAL
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
      help: 'What is the businesses\' net worth, i.e. sum of all assets minus the sum of all liabilities for your business.',
      documentation: 'Amount currency that Business Equity has been defined',
      factory: function () {
        var currency = 'BRL';
        return net.nanopay.model.CurrencyAmount.create({currency: currency}, this);
      },
      validationPredicates: [
        {
          args: ['equity', 'equity$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.partner.treviso.TrevisoCurrencyAmountInformation.EQUITY
              }), true);
          },
          errorMessage: 'INVALID_EQUITY'
        }
      ]
    },
    {
      section: 'businessCapital',
      class: 'FObjectProperty',
      of: 'net.nanopay.model.CurrencyAmount',
      name: 'monthlyRevenue',
      label:'Average monthly revenue for the previous twelve (12) months',
      help: 'What is the businesses\' average monthly revenue for the previous twelve (12) months',
      documentation: 'Amount currency that business average monthly revenue has been defined',
      factory: function () {
        var currency = 'BRL';
        return net.nanopay.model.CurrencyAmount.create({currency: currency}, this);
      },
      validationPredicates: [
        {
          args: ['monthlyRevenue', 'monthlyRevenue$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.partner.treviso.TrevisoCurrencyAmountInformation.MONTHLY_REVENUE
              }), true);
          },
          errorMessage: 'INVALID_MONTHLY_REVENUE'
        }
      ]
    }
  ],
});

