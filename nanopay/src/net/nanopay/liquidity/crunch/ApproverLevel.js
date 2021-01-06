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
  package: 'net.nanopay.liquidity.crunch',
  name: 'ApproverLevel',
  implements: [ 'foam.core.Validatable' ],

  messages: [
    { name: 'approverLevelRangeError', message: 'Approver level must be a value between 1 and 2' },
  ],

  properties: [
    {
      name: 'approverLevel',
      class: 'Int',
      min: 1, 
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
        if ( getApproverLevel() < 1 || getApproverLevel() > 2 ) 
          throw new RuntimeException(APPROVER_LEVEL_RANGE_ERROR);
      `,
    }
  ]
});
