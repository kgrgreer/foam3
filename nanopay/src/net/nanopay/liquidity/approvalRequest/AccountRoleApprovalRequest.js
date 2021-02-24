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
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'AccountRoleApprovalRequest',
  extends: 'foam.nanos.approval.ApprovalRequest',

  tableColumns: [
    'classification',
    'operation',
    'outgoingAccount.name',
    'approver',//change to approver.id
    'status'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'outgoingAccount',
      section: 'approvalRequestInformation',
      order: 140,
      gridColumns: 6,
      tableCellFormatter: function(outgoingAccount) {
        let self = this;
        this.__subSubContext__.accountDAO.find(outgoingAccount).then((account)=> {
          self.add(account.toSummary())
        });
      }
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return `(${this.classification}:${this.outgoingAccount}) ${this.operation}`;
      },
      javaCode: `
        return foam.util.SafetyUtil.isEmpty(getClassification()) || getOperation() == null ? "" : "(" + getClassification() + ":" + String.valueOf(getOutgoingAccount()) + ") " + getOperation().toString();
      `
    }
  ]
});
