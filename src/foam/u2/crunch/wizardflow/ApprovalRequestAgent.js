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
    'crunchService',
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

      await this.crunchService.createApprovalRequest(
        null,
        this.rootCapability.id
      );
    }
  ]
});
