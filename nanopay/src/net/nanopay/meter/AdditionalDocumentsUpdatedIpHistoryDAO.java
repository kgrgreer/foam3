package net.nanopay.meter;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.fs.File;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

public class AdditionalDocumentsUpdatedIpHistoryDAO extends ProxyDAO {
  public AdditionalDocumentsUpdatedIpHistoryDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User newUser = (User) obj;
    User oldUser = (User) getDelegate().find(newUser.getId());

    PropertyInfo prop = (PropertyInfo) User.getOwnClassInfo().getAxiomByName("additionalDocuments");
    Object[] newFiles = (Object[]) prop.get(newUser);
    if ( (oldUser == null && newFiles.length > 0)
      || (oldUser != null && !Arrays.deepEquals((Object[]) prop.get(oldUser), newFiles))
    ) {
      HttpServletRequest request = x.get(HttpServletRequest.class);
      String ipAddress = request.getRemoteAddr();

      IpHistory record = new IpHistory.Builder(x)
        .setUser(newUser.getId())
        .setIpAddress(ipAddress)
        .setDescription("Update additional documents").build();
      ((DAO) x.get("ipHistoryDAO")).put(record);
    }

    return super.put_(x, obj);
  }
}
