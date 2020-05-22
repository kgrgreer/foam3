/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.ENUM({
   package: 'net.nanopay.liquidity.approvalRequest',
   name: 'LiquidityApprovalStatus',
   extends: 'foam.nanos.approval.ApprovalStatus',

   values: [
    {
      name: 'REQUESTED',
      label: 'Needs Approval',
      ordinal: 0,
      documentation: 'Request pending.',
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    },
  ]
});
