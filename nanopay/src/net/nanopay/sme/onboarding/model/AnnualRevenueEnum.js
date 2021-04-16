/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'net.nanopay.sme.onboarding.model',
  name: 'AnnualRevenueEnum',

  values: [
    { 
      name: 'PLACE_HOLDER',
      label: 'Please select...'
    },
    {
      name: 'LESS_THAN_10000',
      label: '$0 to $10,000'
    },
    {
      name: 'LESS_THAN_50000',
      label: '$10,001 to $50,000'
    },
    {
      name: 'LESS_THAN_100000',
      label: '$50,001 to $100,000'
    },
    {
      name: 'LESS_THAN_500000',
      label: '$100,001 to $500,000'
    },
    {
      name: 'LESS_THAN_1000000',
      label: '$500,001 to $1,000,000'
    },
    { 
      name: 'OVER_THAN_1000000',
      label: 'Over $1,000,000'
    }
  ]
});
