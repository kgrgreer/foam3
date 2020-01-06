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
          if ( getApproverLevel() < 0 ) 
            throw new RuntimeException("Approver level must be greater than or equal to 0");
        `,
      }
    ]
  });