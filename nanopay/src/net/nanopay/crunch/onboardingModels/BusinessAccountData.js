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

  javaImports: [
    'net.nanopay.crunch.onboardingModels.CustomerBasicInformation'
  ],

  sections: [
    {
      name: 'accountingSection',
      title: 'Ownership and Taxation information'
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
    { name: 'CUSTOMER_OBJ_ERROR', message: 'One or more of the customers entered is invalid.' },
    { name: 'SUPPLIER_OBJ_ERROR', message: 'One or more of the suppliers entered is invalid.' },
    { name: 'INVALID_DATE', message: 'Last date cannot be future dated.' }
  ],

  properties: [
    {
      section: 'accountingSection',
      name: 'OwnerOrOutsourced',
      label: 'Is the company accounting outsourced?',
      class: 'Boolean',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          [true, 'Yes'],
          [false, 'No']
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
      of: 'net.nanopay.crunch.onboardingModels.CustomerBasicInformation',
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
      of: 'net.nanopay.crunch.onboardingModels.CustomerBasicInformation',
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

  methods: [
    {
      name: 'validate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }

        // validate the fobjects in the fobjectarray props
        for ( CustomerBasicInformation customer : getCustomers() ) {
          try {
            customer.validate(x);
          } catch ( IllegalStateException e ) {
            throw new IllegalStateException(this.CUSTOMER_OBJ_ERROR);
          }
        }
        for ( CustomerBasicInformation supplier : getSuppliers() ) {
          try {
            supplier.validate(x);
          } catch ( IllegalStateException e ) {
            throw new IllegalStateException(this.SUPPLIER_OBJ_ERROR);
          }
        }
      `,
    }
  ]
});
