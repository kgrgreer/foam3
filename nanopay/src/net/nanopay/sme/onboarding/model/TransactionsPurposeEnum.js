/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'net.nanopay.sme.onboarding.model',
  name: 'TransactionsPurposeEnum',

  values: [
    { 
      name: 'PLACE_HOLDER',
      label: 'Please select...'
    },
    {
      name: 'PAYABLES_PRODUCTS_SERVICES',
      label: 'Payables for products and/or services'
    },
    {
      name: 'WORKING_CAPITAL',
      label: 'Working capital'
    },
    {
      name: 'BILL_PAYMENTS',
      label: 'Bill payments'
    },
    {
      name: 'INTRACOMPANY_BANK_TRANSFERS',
      label: 'Intracompany bank transfers'
    },
    {
      name: 'GOVERNMENT_FEE_TAXES',
      label: 'Government fee and taxes'
    },
    {
      name: 'OTHER'
    }
  ]
});
