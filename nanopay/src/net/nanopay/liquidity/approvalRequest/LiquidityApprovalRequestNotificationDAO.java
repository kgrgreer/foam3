package net.nanopay.liquidity.approvalRequest;

import foam.core.FObject;
import foam.core.X;
import foam.core.XFactory;
import foam.dao.DAO;
import foam.nanos.approval.ApprovalRequestNotification;
import net.nanopay.approval.ApprovalRequestNotificationDAO;

public class LiquidityApprovalRequestNotificationDAO
  extends ApprovalRequestNotificationDAO {
  
  public LiquidityApprovalRequestNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    X y = x.putFactory(ApprovalRequestNotification.class.getSimpleName(), new XFactory() {
      public Object create(X x) {
        return new net.nanopay.liquidity.approvalRequest.LiquidityApprovalRequestNotification.Builder(x).build();
      }
    });
    return super.put_(y, obj);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    X y = x.putFactory(ApprovalRequestNotification.class, new XFactory() {
      public Object create(X x) {
        return new net.nanopay.liquidity.approvalRequest.LiquidityApprovalRequestNotification.Builder(x).build();
      }
    });
    return super.remove_(y, obj);
  }
}
