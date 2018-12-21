package net.nanopay.retail;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.sink.Count;
import net.nanopay.retail.model.Device;

import static foam.mlang.MLang.*;

public class PreventDuplicateDeviceDAO
    extends ProxyDAO
{
  public PreventDuplicateDeviceDAO(DAO delegate) {
    this(null, delegate);
  }

  public PreventDuplicateDeviceDAO(X x, DAO delegate) {
    super(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Device device = (Device) obj;
    boolean newDevice = ( getDelegate().find(device.getId()) == null );

    if ( newDevice ) {
      Count count = new Count();
      DAO deviceDAO = getDelegate();

      // prevent registration of device with same device name
      count = (Count) deviceDAO.where(AND(
          EQ(Device.OWNER, device.getOwner()),
          EQ(Device.NAME, device.getName())
      )).limit(1).select(count);
      if ( count.getValue() == 1 ) {
        throw new RuntimeException("Device with same name already provisioned");
      }

      // prevent registration of device with same serial number
      count = new Count();
      count = (Count) deviceDAO.where(AND(
          EQ(Device.OWNER, device.getOwner()),
          EQ(Device.SERIAL_NUMBER, device.getSerialNumber())
      )).limit(1).select(count);
      if ( count.getValue() == 1 ) {
        throw new RuntimeException("Device with same serial number already provisioned");
      }
    }

    return super.put_(x, obj);
  }
}
