package foam.dao.crypto;

import foam.core.ClassInfo;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.Security;

public class EncryptingDAO
    extends ProxyDAO
{
  // TODO: allow support for additional crypto providers
  static {
    BouncyCastleProvider provider = new BouncyCastleProvider();
    if (Security.getProvider(provider.getName()) == null ) {
      Security.addProvider(provider);
    }
  }

  public EncryptingDAO(ClassInfo classInfo, DAO delegate) {
    setOf(classInfo);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    return super.put_(x, obj);
  }

  @Override
  public FObject find_(X x, Object id) {
    return super.find_(x, id);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    return super.select_(x, sink, skip, limit, order, predicate);
  }
}