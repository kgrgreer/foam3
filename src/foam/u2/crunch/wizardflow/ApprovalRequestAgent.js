/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'ApprovalRequestAgent',
  implements: [
    'foam.core.ContextAgent'
  ],

  imports: [
    'approvableDAO',
    'approvalRequestDAO',
    'capabilities',
    'rootCapability',
    'subject',
    'submitted',
    'wizardSubject'
  ],

  requires: [
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.CompositeApprovable',
    'foam.nanos.crunch.UCJUpdateApprovable',
    'foam.nanos.dao.Operation'
  ],

  properties: [
    {
      class: 'String',
      name: 'group'
    }
  ],

  methods: [
    async function execute() {
      var id = foam.uuid.randomGUID();

      var subject = this.wizardSubject ? this.wizardSubject : this.subject;

      var topApprovable = this.UCJUpdateApprovable.create({
        id: id,
        associatedTopLevelUCJ: {
          sourceId:  subject.realUser.id,
          targetId: this.rootCapability.id,
          ...(subject.user.id != subject.realUser.id
            ? { effectiveUser: subject.user.id } : {})
        }
      });
      await this.approvableDAO.put(topApprovable);

      var approvalRequest = this.ApprovalRequest.create({
        daoKey: 'approvableDAO',
        objId: id,
        operation: this.Operation.UPDATE,
        createdFor: this.wizardSubject ?
          this.wizardSubject.user.id : this.subject.user.id,
        ...(this.group ? { group: this.group } : {}),
        classificationEnum: this.ApprovalRequestClassificationEnum.UPDATE_ON_ACTIVE_UCJ
      });

      await this.approvalRequestDAO.put(approvalRequest);
    }
  ]
});
