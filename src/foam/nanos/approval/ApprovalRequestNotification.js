/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovalRequestNotification',
  extends: 'foam.nanos.notification.Notification',

  imports: [
    'foam.dao.DAO approvalRequestDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',

    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'MSG_BODY1', message: 'You received ' },
    { name: 'MSG_BODY2', message: ' approval request with id : ' }
  ],

  properties: [
    {
      name: 'approvalRequest',
      class: 'Reference',
      of: 'foam.nanos.approval.ApprovalRequest',
      view: function(_, X) {
        let slot = foam.core.SimpleSlot.create();
        let data = X.data;
        let approvalRequest = data.approvalRequest;

        X.approvalRequestDAO.find(approvalRequest).then(function(approval) {
          slot.set(approval.toSummary());
        });
        return {
          class: 'foam.u2.view.ValueView',
          data$: slot
        };
      }
    },
    {
      name: 'body',
      transient: true,
      javaCloneProperty: '//noop',
    //   javaGetter: `
    //     Subject subject = (Subject) foam.core.XLocator.get().get("subject");
    //     String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
    //     TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

    //     DAO approvalRequestDAO = (DAO) foam.core.XLocator.get().get("approvalRequestDAO");
    //     ApprovalRequest approvalReq = (ApprovalRequest) approvalRequestDAO.find(
    //       EQ(ApprovalRequest.ID, getApprovalRequest())
    //       );

    //     var body1 = ts.getTranslation(locale, getClassInfo().getId() + ".MSG_BODY1", this.MSG_BODY1);
    //     var body2 = ts.getTranslation(locale, getClassInfo().getId() + ".MSG_BODY2", this.MSG_BODY2);

    //     return body1 + approvalReq.getStatus().getLabel() + body2 + approvalReq.getObjId();
    //   `,
      getter: async function() {
        let approvalReq = await this.approvalRequestDAO.find(this.approvalRequest);

        return this.MSG_BODY1 + approvalReq.status.label + this.MSG_BODY2 + approvalReq.objId;
      }
    }
  ]
});
