/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.ENUM({
  package: 'net.nanopay.tx',
  name: 'LineItemAmountType',

  documentation: 'Amount/Value quantifier.',

  values: [
    {
      name: 'TOTAL',
      label: 'Total'
    },
    {
      name: 'PERCENTAGE',
      label: 'Percentage'
    }
  ]
});
