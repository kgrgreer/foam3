/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'LiquidityApprovalRequestNotificationNotificationCitationView',
  extends: 'foam.nanos.approval.ApprovalRequestNotificationNotificationCitationView',

  properties: [
    {
      name: 'status',
      class: 'Enum',
      of: 'net.nanopay.liquidity.approvalRequest.LiquidityApprovalStatus',
      adapt: function(_, newValue) {
        return net.nanopay.liquidity.approvalRequest.LiquidityApprovalStatus.forOrdinal(newValue.ordinal);
      },
      postSet: function(oldValue, newValue) {
        this.hideStatus = ! (newValue && newValue.ordinal == net.nanopay.liquidity.approvalRequest.LiquidityApprovalStatus.REQUESTED.ordinal);
      }
    },
    {
      name: 'hideStatus',
      class: 'Boolean',
      value: 'true'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
    }
  ]
});
