/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'AccountTemplate', 

  imports: [
    'accountDAO'
  ],

  properties: [  
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    { name: 'templateName',
      class: 'String'
    },
    {
      name: 'accounts',
      class: 'Map'
    }
  ],
});

  