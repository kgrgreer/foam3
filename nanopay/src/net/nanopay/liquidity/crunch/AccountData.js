/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
    package: 'net.nanopay.liquidity.crunch',
    name: 'AccountData', 
    
    documentation: `
    A model for the data stored in the value of the map of AccountTemplate. 
    `,
  
  properties: [  
      {
        name: 'isCascading',
        class: 'Boolean'
      },
      {
        name: 'approverLevel',
        class: 'Int',
        value: 1
      },
      {
        name: 'inherited',
        class: 'Boolean',
        documentation: `
        Describes whether this account was added explicitly to the map or 
        as a result of cascading / only cascading for a segment of the tree
        `
      }
    ],
  });
  
    