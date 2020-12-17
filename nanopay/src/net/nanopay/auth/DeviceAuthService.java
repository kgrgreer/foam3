package net.nanopay.auth;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.MLang;
import foam.nanos.NanoService;
import foam.nanos.auth.*;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import net.nanopay.retail.model.Device;
import net.nanopay.retail.model.DeviceStatus;

import java.util.List;

public class DeviceAuthService
  extends ProxyAuthService
  implements NanoService
{
  protected DAO userDAO_;
  protected DAO deviceDAO_;
  protected DAO sessionDAO_;

  public DeviceAuthService(X x, AuthService delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public void start() {
    userDAO_ = (DAO) getX().get("localUserDAO");
    deviceDAO_ = (DAO) getX().get("deviceDAO");
    sessionDAO_ = (DAO) getX().get("localSessionDAO");
  }

  @Override
  public User login(X x, String identifier, String password) throws AuthenticationException {
    if ( ! identifier.startsWith("device-") ) {
      return super.login(x, identifier, password);
    }

    String serialNumber = identifier.split("device-")[1];
    if (  SafetyUtil.isEmpty(serialNumber) ) {
      throw new RuntimeException("Invalid serial number");
    }

    Sink sink = new ArraySink();
    sink = deviceDAO_.where(MLang.AND(
        MLang.EQ(Device.SERIAL_NUMBER, serialNumber),
        MLang.EQ(Device.PASSWORD, password)
    )).limit(1).select(sink);

    List data = ((ArraySink) sink).getArray();
    if ( data == null || data.size() != 1 ) {
      throw new AuthenticationException("Device not found");
    }

    Device device = (Device) data.get(0);
    device = (Device) device.fclone();
    if ( device == null ) {
      throw new AuthenticationException("Device not found");
    }

    User user = (User) userDAO_.find(device.getOwner());
    if ( user == null ) {
      throw new AuthenticationException("Owner not found");
    }

    device.setStatus(DeviceStatus.ACTIVE);
    deviceDAO_.put(device);

    Subject subject = new Subject.Builder(x).setUser(user).build();
    Session session = x.get(Session.class);
    session.setUserId(user.getId());
    session.setContext(session.getContext().put("subject", subject));
    sessionDAO_.put(session);
    return user;
  }
}
