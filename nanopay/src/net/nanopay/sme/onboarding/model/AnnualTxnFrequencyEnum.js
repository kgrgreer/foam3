/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
  package: 'net.nanopay.sme.onboarding.model',
  name: 'AnnualTxnFrequencyEnum',

  values: [
    { 
      name: 'PLACE_HOLDER',
      label: 'Please select...'
    },
    {
      name: 'LESS_THAN_100',
      label: '1 to 99'
    },
    {
      name: 'LESS_THAN_200',
      label: '100 to 199'
    },
    {
      name: 'LESS_THAN_500',
      label: '200 to 499'
    },
    {
      name: 'LESS_THAN_1000',
      label: '500 to 999'
    },
    {
      name: 'OVER_THAN_1000',
      label: 'Over 1000'
    }
  ]
});
