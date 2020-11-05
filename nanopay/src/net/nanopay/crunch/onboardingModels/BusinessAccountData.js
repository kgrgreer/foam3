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
      title: 'Ownership and tax information'
    },
    {
      name: 'customerSection',
      title: 'Customers'
    },
    {
      name: 'supplierSection',
      title: 'Suppliers'
    }
  ],

  messages: [
    { name: 'NO_CUSTOMERS_INFO', message: 'Customer information required' },
    { name: 'NO_SUPPLIERS_INFO', message: 'Supplier information required' },
    { name: 'CUSTOMER_OBJ_ERROR', message: 'One or more of the customers entered is invalid' },
    { name: 'SUPPLIER_OBJ_ERROR', message: 'One or more of the suppliers entered is invalid' },
    { name: 'INVALID_DATE', message: 'Cannot be a future date' },
    { name: 'YES', message: 'Yes' },
    { name: 'NO', message: 'No' },
    { name: 'CUSTOMERS_MSG', message: 'customer' },
    { name: 'SUPPLIERS_MSG', message: 'supplier' }
  ],

  properties: [
    {
      section: 'accountingSection',
      name: 'OwnerOrOutsourced',
      label: 'Do you outsource the accounting for your business?',
      class: 'Boolean',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      section: 'accountingSection',
      name: 'ownerManagment',
      label: 'Does the owner manage the business?',
      class: 'Boolean',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      section: 'accountingSection',
      name: 'simpleTax',
      label: 'Does your business opt for Simple Tax?',
      class: 'Boolean',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RadioView',
          choices: [
            [true, X.data.YES],
            [false, X.data.NO]
          ],
          isHorizontal: true
        };
      }
    },
    {
      section: 'accountingSection',
      class: 'Date',
      name: 'dateOfFilingTaxes',
      label: 'When did the business last file taxes?',
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
          name: x.data.CUSTOMERS_MSG,
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
          name: x.data.SUPPLIERS_MSG,
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
