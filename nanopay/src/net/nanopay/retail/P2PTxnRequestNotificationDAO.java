package net.nanopay.retail;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.push.PushService;
import foam.util.SafetyUtil;
import java.util.HashMap;
import java.util.Map;
import net.nanopay.retail.model.P2PTxnRequest;
import net.nanopay.retail.model.P2PTxnRequestStatus;

import static foam.mlang.MLang.EQ;
import static net.nanopay.retail.utils.P2PTxnRequestUtils.getUserByEmail;

public class P2PTxnRequestNotificationDAO
extends ProxyDAO {

  private Logger logger_;

  public P2PTxnRequestNotificationDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    logger_ = (Logger) x.get("logger");
  }

  @Override
  public FObject put_(X x, FObject obj) {

    P2PTxnRequest request = (P2PTxnRequest) getDelegate().put_(x, obj);

    if ( request.getStatus().equals(P2PTxnRequestStatus.PENDING) ) {

      User user = getUserByEmail(x, request.getRequesteeEmail());

      if ( user != null && ! SafetyUtil.isEmpty(user.getDeviceToken()) ) {
        PushService push = (PushService) x.get("push");
        Map data = createNotificationData(request);
        push.sendPush(user, "Money request!", data);
      } else {
        logger_.error("Can't send push no device Id found");
      }
    }

    return (FObject) request;
  }

  private Map createNotificationData(P2PTxnRequest request) {
    Map<String, String> data = new HashMap<String, String>();
    data.put("requestId", Long.toString(request.getId()));
    data.put("requestorEmail", request.getRequestorEmail());
    data.put("amount", Long.toString(request.getAmount()));
    data.put("status", String.valueOf(request.getStatus().getOrdinal()));
    return data;
  }

  private boolean isNewRequest(P2PTxnRequest request) {
    return this.find_(getX(), request) == null;
  }
}
