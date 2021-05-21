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
  package: 'net.nanopay.approval',
  name: 'ApprovalRequestNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalRequestNotification',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'foam.util.StringUtil',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',

    'java.util.HashMap',

    'static foam.mlang.MLang.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ApprovalRequestNotificationDAO(X x,DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }
        `
        );
      }
    }
  ],

  messages: [
    { name: 'APPROVAL_REQUEST', message: 'Approval request for new ' },
    { name: 'WITH_ID', message: ' with id: ' },
    { name: 'REASON', message: ', reason: ' },
    { name: 'APPROVED', message: ' has approved' },
    { name: 'REQUEST_FOR', message: ' request for ' },
    { name: 'FROM', message: ' from ' },
    { name: 'MEMO', message: 'They have provided the following memo along with their rejection: ' },
    { name: 'YOUR', message: 'Your ' },
    { name: 'REJECTED', message: ' approval request has been rejected by ' }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        ApprovalRequest old = (ApprovalRequest) getDelegate().find(obj);
        ApprovalRequest ret = (ApprovalRequest) getDelegate().put_(x, obj);
        String notificationType = ret.getClass().getSimpleName()+"."+ret.getStatus().getLabel()+"."+ret.getOperation().getLabel();
        String notificationBody = "";
        DAO userDAO = (DAO) x.get("localUserDAO");
        User notifyUser = (User) userDAO.find(ret.getApprover());

        TranslationService ts = (TranslationService) x.get("translationService");
        Subject subject = (Subject) x.get("subject");
        String locale = notifyUser != null ? notifyUser.getLanguage().getCode() :
                          ((User) subject.getRealUser()).getLanguage().getCode().toString();

        String classification = ts.getTranslation(locale, "foam.nanos.approval.ApprovalRequestClassificationEnum." + ret.getClassificationEnum().toString() + ".label", ret.getClassificationEnum().getLabel());

        if ( SafetyUtil.isEmpty(classification) ) {
          classification = "reference";
        }

        var emailArgs = new HashMap<String, Object>();
        var notificationEmail = "approvalRequestNotification";

        String msgBody1 = ts.getTranslation(locale, getClassInfo().getId() + ".APPROVAL_REQUEST", APPROVAL_REQUEST);
        String msgBody2 = ts.getTranslation(locale, getClassInfo().getId() + ".WITH_ID", WITH_ID);
        String msgBody3 = ts.getTranslation(locale, getClassInfo().getId() + ".REASON", REASON);

        if ( ret instanceof ComplianceApprovalRequest ) {
          ComplianceApprovalRequest complianceApprovalRequest = (ComplianceApprovalRequest) ret;
          notificationBody = new StringBuilder()
            .append(msgBody1)
            .append(classification)
            .append(msgBody2)
            .append(ret.getObjId())
            .append(! SafetyUtil.isEmpty(complianceApprovalRequest.getCauseDaoKey()) ? msgBody3 : "")
            .append(! SafetyUtil.isEmpty(complianceApprovalRequest.getCauseDaoKey()) ? complianceApprovalRequest.getCauseDaoKey() : "")
            .toString();
        } else if ( old != null &&
                    ret.getStatus() != old.getStatus() &&
                    ( ret.getStatus() == ApprovalStatus.APPROVED ||
                      ret.getStatus() == ApprovalStatus.REJECTED ) &&
                    ret.getLastModifiedBy() != ret.getApprover() ) {
          User approvedBy = (User) userDAO.find(ret.getLastModifiedBy());

          if ( ret.getStatus() == ApprovalStatus.REJECTED) {
            String body1 = ts.getTranslation(locale, getClassInfo().getId() + ".YOUR", YOUR);
            String body2 = ts.getTranslation(locale, getClassInfo().getId() + ".REJECTED", REJECTED);
            notificationBody = body1 + classification + body2 + approvedBy.getLegalName();

            notificationEmail = "rejectApprovalRequestNotification";

            emailArgs.put("classification", classification);
            emailArgs.put("rejectedBy", approvedBy.toSummary());
            if ( ! SafetyUtil.isEmpty(ret.getMemo()) ) {
              String memo_ = ts.getTranslation(locale, getClassInfo().getId() + ".MEMO", MEMO);
              emailArgs.put("memo", memo_ + ret.getMemo());
            }

          } else {
            String msgBody4 = ts.getTranslation(locale, getClassInfo().getId() + ".APPROVED", APPROVED);
            String msgBody5 = ts.getTranslation(locale, getClassInfo().getId() + ".REQUEST_FOR", REQUEST_FOR);

            notificationBody = new StringBuilder()
              .append(approvedBy != null ? approvedBy.toSummary() : ret.getLastModifiedBy())
              .append(msgBody4)
              .append(msgBody5)
              .append(classification)
              .append(msgBody2)
              .append(ret.getObjId())
              .toString();
          }
        } else if ( old == null ) {
          notificationBody = new StringBuilder()
            .append(msgBody1)
            .append(classification)
            .append(msgBody2)
            .append(ret.getObjId())
            .toString();
        } else {
          return ret;
        }

        if ( notifyUser != null ) {
          ApprovalRequestNotification notification = (ApprovalRequestNotification) x.get(ApprovalRequestNotification.class.getSimpleName());

          if ( ! SafetyUtil.isEmpty(notificationEmail) ) {
            notification.setEmailName(notificationEmail);
            notification.setEmailArgs(emailArgs);
          }

          notification.setApprovalRequest(ret.getId());
          notification.setNotificationType(notificationType);
          notification.setBody(notificationBody);

          notifyUser.doNotify(x, notification);
        }

        return ret;

      `
    },
    {
      name: 'remove_',
      javaCode: `
        ApprovalRequest ret = (ApprovalRequest) getDelegate().remove_(x, obj);
        ApprovalRequest fulfilled = (ApprovalRequest) getDelegate()
          .find(AND(
                    OR(
                      EQ(ApprovalRequest.STATUS, ApprovalStatus.REJECTED),
                      EQ(ApprovalRequest.STATUS, ApprovalStatus.APPROVED)
                      ),
                    EQ(ApprovalRequest.CREATED_BY, ret.getCreatedBy()),
                    EQ(ApprovalRequest.OBJ_ID, ret.getObjId())
                    ));
        if ( fulfilled == null ) return ret;

        DAO userDAO = (DAO) x.get("localUserDAO");
        User requester = (User) userDAO.find(fulfilled.getCreatedBy());
        User approvedBy = (User) userDAO.find(fulfilled.getLastModifiedBy());
        User approver = (User) userDAO.find(ret.getApprover());

        TranslationService ts = (TranslationService) x.get("translationService");
        Subject subject = (Subject) x.get("subject");
        String locale = approver != null ? approver.getLanguage().getCode() :
                          ((User) subject.getRealUser()).getLanguage().getCode().toString();

        String notificationType = fulfilled.getClass().getSimpleName()+"."+fulfilled.getStatus().getLabel()+"."+fulfilled.getOperation().getLabel();
        String classification = ts.getTranslation(locale, "foam.nanos.approval.ApprovalRequestClassificationEnum." + fulfilled.getClassificationEnum().toString() + ".label", fulfilled.getClassificationEnum().getLabel());

        if ( SafetyUtil.isEmpty(classification) ) {
          classification = "reference";
        }

        String msgBody1 = ts.getTranslation(locale, getClassInfo().getId() + ".APPROVED", APPROVED);
        String msgBody2 = ts.getTranslation(locale, getClassInfo().getId() + ".REQUEST_FOR", REQUEST_FOR);
        String msgBody3 = ts.getTranslation(locale, getClassInfo().getId() + ".WITH_ID", WITH_ID);
        String msgBody4 = ts.getTranslation(locale, getClassInfo().getId() + ".FROM", FROM);

        String notificationBody = new StringBuilder()
          .append(approvedBy != null ? approvedBy.toSummary() : ret.getLastModifiedBy())
          .append(msgBody1)
          .append(msgBody2)
          .append(classification)
          .append(msgBody3)
          .append(ret.getObjId())
          .append(msgBody4)
          .append(requester != null ? requester.toSummary() : fulfilled.getCreatedBy())
          .toString();

        if ( approver != null ) {
          ApprovalRequestNotification notification = (ApprovalRequestNotification) x.get(ApprovalRequestNotification.class.getSimpleName());
          notification.setApprovalRequest(fulfilled.getId());
          notification.setNotificationType(notificationType);
          notification.setBody(notificationBody);

          approver.doNotify(x, notification);
        }

        return ret;
      `
    }
  ]
});

