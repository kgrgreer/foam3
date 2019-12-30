/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'net.nanopay.liquidity.crunch',
    name: 'ApproverLevel',
    implements: [ 'foam.core.Validatable' ],
  
    properties: [
      {
        name: 'approverLevel',
        class: 'Int',
        javaType: 'java.lang.Integer',
      }
    ],
  
    methods: [
      {
        name: 'validate',
        javaCode: `
          if ( getApproverLevel() <= 0 ) 
            throw new RuntimeException("Approver level must be greater than 0");
        `,
      }
    ]
  });