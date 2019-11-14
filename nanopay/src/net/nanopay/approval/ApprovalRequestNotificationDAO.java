package net.nanopay.approval;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.notification.Notification;
import net.nanopay.meter.compliance.ComplianceApprovalRequest;

public class ApprovalRequestNotificationDAO
extends ProxyDAO {
  public ApprovalRequestNotificationDAO(X x,DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    
    FObject old = ((DAO)x.get("approvalRequestDAO")).find_(x, obj);
    ApprovalRequest ret = (ApprovalRequest) getDelegate().put_(x, obj);
    String causeDAO = "";
    String notificationType = "";
    String notificationBody = "";
    if ( old != null
      || ApprovalStatus.REQUESTED != ret.getStatus()
    ) { 
      return ret;
    }

    if ( ret instanceof ComplianceApprovalRequest ) {
      ComplianceApprovalRequest complianceApprovalRequest = (ComplianceApprovalRequest) ret;
      causeDAO = complianceApprovalRequest.getCauseDaoKey();
      notificationType = "approval request for reference id: " + ret.getRefObj() + " cause: " + causeDAO;
      notificationBody = "New approval was requested for reference id: " + ret.getRefObj() + " cause: " + causeDAO;
    } else {
      notificationType = "approval request for reference id: " + ret.getRefObj();
      notificationBody = "New approval was requested for reference id: " + ret.getRefObj();
    }

    Notification notification = new Notification();
    notification.setUserId(ret.getApprover());
    notification.setNotificationType(notificationType);
    notification.setEmailIsEnabled(true);
    notification.setBody(notificationBody);
    //notification.setEmailName("future email template name"); !!! PROPER WAY TO SET EMAIL TEMPLATE (when it is done) !!!
    //notification.setEmailArgs(MAP_GOES_HERE); !!! PROPER WAY TO SET EMAIL ARGS FOR TEMPLATE !!!
    ((DAO)x.get("localNotificationDAO")).put(notification);
    return ret;
  }
}
