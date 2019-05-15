package net.nanopay.approval;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;

public class ReputObjectApprovalDAO
  extends ProxyDAO {

  public ReputObjectApprovalDAO(X x,DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    DAO requestDAO = ((DAO)x.get("approvalRequestDAO"));
    ApprovalRequest old = (ApprovalRequest) requestDAO.find(obj);
    ApprovalRequest request = (ApprovalRequest) getDelegate().put_(x, obj);
    if ( old != null && old.getStatus() != request.getStatus() ) {
      DAO dao = (DAO) x.get(request.getDaoKey());
      FObject found = dao.find_(x, request.getObjId());
      dao.put_(x, found);
    }
    return request;
  }
}
