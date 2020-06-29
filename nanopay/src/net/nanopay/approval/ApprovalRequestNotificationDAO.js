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
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestNotification',
    'foam.nanos.approval.ApprovalStatus',
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

  methods: [
    {
      name: 'put_',
      javaCode: `
        ApprovalRequest old = (ApprovalRequest) getDelegate().find(obj);
        ApprovalRequest ret = (ApprovalRequest) getDelegate().put_(x, obj);
        String notificationType = ret.getClass().getSimpleName()+"."+ret.getStatus().getLabel()+"."+ret.getOperation().getLabel();
        String notificationBody = "";
        DAO userDAO = (DAO) x.get("localUserDAO");
        User notifyUser = null;
  
        // REVIEW: none of the following text creation works with locale.
  
        String classification = ret.getClassification();
        if ( SafetyUtil.isEmpty(classification) ) {
          classification = "reference";
        }
  
        var emailArgs = new HashMap<String, Object>();
        var notificationEmail = "";
  
        if ( ret instanceof ComplianceApprovalRequest ) {
          ComplianceApprovalRequest complianceApprovalRequest = (ComplianceApprovalRequest) ret;
          notificationBody = new StringBuilder()
            .append("Approval request for new ")
            .append(classification)
            .append(" with id: ")
            .append(ret.getObjId())
            .append(", reason: ")
            .append(complianceApprovalRequest.getCauseDaoKey())
            .toString();
          notifyUser = (User) userDAO.find(ret.getApprover());
        } else if ( old != null &&
                    ret.getStatus() != old.getStatus() &&
                    ( ret.getStatus() == ApprovalStatus.APPROVED ||
                      ret.getStatus() == ApprovalStatus.REJECTED ) &&
                    ret.getLastModifiedBy() != ret.getApprover() ) {
          notifyUser = (User) userDAO.find(ret.getApprover());
          User approvedBy = (User) userDAO.find(ret.getLastModifiedBy());
  
          if ( ret.getStatus() == ApprovalStatus.REJECTED) {
            notificationBody = String.format("Your %s approval request has been rejected by %s.", classification, approvedBy.getLegalName());
            notificationEmail = "rejectApprovalRequestNotification";
  
            emailArgs.put("classification", classification);
            emailArgs.put("rejectedBy", approvedBy.toSummary());
            if ( ! SafetyUtil.isEmpty(ret.getMemo()) ) {
              emailArgs.put("memo", String.format("They have provided the following memo along with their rejection: %s.", ret.getMemo()));
            }
  
          } else {
            notificationBody = new StringBuilder()
              .append(approvedBy != null ? approvedBy.toSummary() : ret.getLastModifiedBy())
              .append(" has approved")
              .append(" request for ")
              .append(classification)
              .append(" with id:")
              .append(ret.getObjId())
              .toString();
          }
        } else if ( old == null ) {
          notificationBody = new StringBuilder()
            .append("Approval request for new ")
            .append(classification)
            .append(" with id: ")
            .append(ret.getObjId())
            .toString();
          notifyUser = (User) userDAO.find(ret.getApprover());
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

        String notificationType = fulfilled.getClass().getSimpleName()+"."+fulfilled.getStatus().getLabel()+"."+fulfilled.getOperation().getLabel();
        String classification = fulfilled.getClassification();
        if ( SafetyUtil.isEmpty(classification) ) {
          classification = "reference";
        }

        DAO userDAO = (DAO) x.get("localUserDAO");
        User requester = (User) userDAO.find(fulfilled.getCreatedBy());
        User approvedBy = (User) userDAO.find(fulfilled.getLastModifiedBy());
        User approver = (User) userDAO.find(ret.getApprover());

        String notificationBody = new StringBuilder()
          .append(approvedBy != null ? approvedBy.toSummary() : ret.getLastModifiedBy())
          .append(" has approved")
          .append(" request for ")
          .append(classification)
          .append(" with id:")
          .append(ret.getObjId())
          .append(" from ")
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

