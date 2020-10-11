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
  name: 'BusinessAccountData',

  documentation: `Business account information, such as customer or supplier detail and taxes date`,

  sections: [
    {
      name: 'accountingSection',
      title: 'Please answer business account questions'
    },
    {
      name: 'customerSection',
      title: 'Main Customer detail'
    },
    {
      name: 'supplierSection',
      title: 'Main Supplier detail'
    }
  ],

  messages: [
    { name: 'NO_CUSTOMERS_INFO', message: 'Please enter main customer\'s information.' },
    { name: 'NO_SUPPLIERS_INFO', message: 'Please enter main supplier\'s information.' },
    { name: 'INVALID_DATE', message: 'Last date cannot be future dated.' }
  ],

  properties: [
    {
      section: 'accountingSection',
      name: 'OwnerOrOutsourced',
      label: 'Are you the Owned or Outsourced?',
      class: 'Boolean',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes, I\'m the owner of the company'],
          [false, 'No, I\'m not the owner']
        ]
      },
    },
    {
      section: 'accountingSection',
      name: 'ownerManagment',
      label: 'Are you the owner managing the company?',
      class: 'Boolean',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No']
        ],
        isHorizontal: true
      },
    },
    {
      section: 'accountingSection',
      name: 'simpleTax',
      label: 'Do you opt into Simple Tax?',
      class: 'Boolean',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No']
        ],
        isHorizontal: true
      }
    },
    {
      section: 'accountingSection',
      class: 'Date',
      name: 'dateOfFilingTaxes',
      label: 'What is the most recent date the company filed taxes',
      help: 'The date the last time you filed taxes',
      documentation: 'The date the last time you filed taxes',
      required: true,
      validationPredicates: [
        {
          args: ['dateOfFilingTaxes'],
          predicateFactory: function(e) {
            return e.LTE(net.nanopay.crunch.onboardingModels.BusinessAccountData.DATE_OF_FILING_TAXES, new Date())
          },
          errorMessage: 'INVALID_DATE'
        }
      ]
    },
    {
      class: 'FObjectArray',
      name: 'customers',
      documentation: 'Array of business main customers.',
      label: '',
      of: 'net.nanopay.crunch.onboardingModels.CustomerBasicInfor',
      section: 'customerSection',
      required: true,
      view: function(_, x) {
        return {
          class: 'net.nanopay.sme.onboarding.BusinessDirectorArrayView',
          mode: 'RW',
          enableAdding: true,
          enableRemoving: true,
          name: 'Customers'
        }
      },
      autoValidate: true,
      validationTextVisible: true,
      validationPredicates: [
        {
          args: [ 'customers' ],
          predicateFactory: function(e) {
            return e.HAS(net.nanopay.crunch.onboardingModels.BusinessAccountData.CUSTOMERS)
          },
          errorMessage: 'NO_CUSTOMERS_INFO'
        }
      ]
    },
    {
      class: 'FObjectArray',
      name: 'suppliers',
      documentation: 'Array of business main suppliers.',
      label: '',
      of: 'net.nanopay.crunch.onboardingModels.CustomerBasicInfor',
      section: 'supplierSection',
      autoValidate: true,
      required: true,
      validationTextVisible: true,
      view: function(_, x) {
        return {
          class: 'net.nanopay.sme.onboarding.BusinessDirectorArrayView',
          mode: 'RW',
          enableAdding: true,
          enableRemoving: true,
          name: 'Suppliers'
        }
      },
      validationPredicates: [
        {
          args: [ 'suppliers' ],
          predicateFactory: function(e) {
            return e.HAS(net.nanopay.crunch.onboardingModels.BusinessAccountData.SUPPLIERS)
          },
          errorMessage: 'NO_SUPPLIERS_INFO'
        }
      ]
    }
  ],
});
