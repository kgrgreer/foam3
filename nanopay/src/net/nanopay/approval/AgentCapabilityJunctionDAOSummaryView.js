/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.approval',
  name: 'AgentCapabilityJunctionDAOSummaryView',
  extends: 'foam.nanos.crunch.AgentCapabilityJunctionDAOSummaryView',

  imports: [
    'approvalRequestDAO',
    'notify',
    'pushMenu',
    'stack'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalStatus'
  ],

  messages: [
    { name: 'SUCCESS_REMOVED', message: 'Successfuly removed onboarding information. Please wait for resubmission.'}
  ],

  css: `
    ^ .foam-u2-detail-SectionView-backOfficeSuggestedUserTransactionInfo {
      display: none;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      factory: function() {
        let onSave = async (isValid, ucj) => {
          if ( isValid && ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED ) {
            this.notify(this.SUCCESS_UPDATED, '', this.LogLevel.INFO, true);
            this.stack.back();
          }
          else {
            //TODO: need a better way to specify desired classification
            let approvals = await this.approvalRequestDAO.where(this.AND(
                this.EQ(this.ApprovalRequest.OBJ_ID, ucj.id),
                this.EQ(this.ApprovalRequest.DAO_KEY, "userCapabilityJunctionDAO"),
                this.OR(
                  this.EQ(this.ApprovalRequest.CLASSIFICATION_ENUM, ApprovalRequestClassificationEnum.GENERIC_BUSINESS_VALIDATOR)
                ),
                this.EQ(this.ApprovalRequest.STATUS, this.ApprovalStatus.REQUESTED)
              )).limit(1).select();
            let approval = approvals.array[0];
            if ( approval ) {
              let rejectedApproval = approval.clone();
              rejectedApproval.status = this.ApprovalStatus.REJECTED;
              rejectedApproval.memo = 'Outdated Approval.';
              this.approvalRequestDAO.put(rejectedApproval).then(o => {
                this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
                this.notify(this.SUCCESS_REMOVED, '', this.LogLevel.INFO, true);
                this.pushMenu('approvals', true);
              }, e => {
                this.notify(e.message, '', this.LogLevel.ERROR, true);
              });
            }
          }
        }
        return this.ScrollingWizardStackView.create({ ucj: this.data, onSave: onSave });
      }
    }
  ]
});
