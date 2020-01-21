foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'ApproverLevel',
  implements: [ 'foam.core.Validatable' ],

  messages: [
    { name: 'approverLevelRangeError', message: 'Approver level must be a value between 0 and 2.' },
  ],

  properties: [
    {
      name: 'approverLevel',
      class: 'Int',
      javaType: 'java.lang.Integer',
      min: 0, 
      max: 2,
      validateObj: function(approverLevel) {
        if ( approverLevel < this.APPROVER_LEVEL.min || approverLevel > this.APPROVER_LEVEL.max ) {
          return this.approverLevelRangeError;
        }
      }
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( getApproverLevel() < 0 || getApproverLevel() > 2 ) 
          throw new RuntimeException(approverLevelRangeError);
      `,
    }
  ]
});
