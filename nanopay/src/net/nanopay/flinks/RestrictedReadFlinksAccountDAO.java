package net.nanopay.flinks;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.dao.ArraySink;
import foam.dao.Sink;
import foam.nanos.auth.AuthService;
import net.nanopay.flinks.model.AccountWithDetailModel;
import net.nanopay.flinks.model.FlinksAccountsDetailResponse;

import java.util.Iterator;

public class RestrictedReadFlinksAccountDAO extends foam.dao.ProxyDAO {
  protected static final String[] RESTRICTED_FIELDS = {
    "AccountNumber", "Balance", "Holder", "Title", "Transactions"
  };

  public RestrictedReadFlinksAccountDAO(foam.core.X x, foam.dao.DAO delegate) {
    super(x, delegate);
  }

  public foam.dao.Sink select_(foam.core.X x, foam.dao.Sink sink, long skip, long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {
    Sink result = super.select_(x, sink, skip, limit, order, predicate);

    if (result instanceof ArraySink) {
      ArraySink arraySink = new ArraySink();

      Iterator i = ((ArraySink) result).getArray().iterator();
      while (i.hasNext()) {
        FlinksAccountsDetailResponse obj = restrict(x, (FObject) i.next());
        arraySink.put(obj, null);
      }
      return arraySink;
    }
    return result;
  }

  public foam.core.FObject find_(foam.core.X x, Object id) {
    FObject result = super.find_(x, id);

    if (result != null) {
      return restrict(x, result);
    }
    return result;
  }

  public FlinksAccountsDetailResponse restrict(foam.core.X x, FObject obj) {
    FlinksAccountsDetailResponse result = (FlinksAccountsDetailResponse) obj.fclone();
    AccountWithDetailModel[] accounts = result.getAccounts();
    AuthService auth = (AuthService) x.get("auth");

    for (AccountWithDetailModel account : accounts) {
      for (String field : RESTRICTED_FIELDS) {
        if (!auth.check(x, "AccountWithDetailModel.read." + field)) {
          reset(account, field);
        }
      }
    }
    return result;
  }

  public void reset(FObject obj, String field) {
    PropertyInfo prop = (PropertyInfo) AccountWithDetailModel.getOwnClassInfo()
      .getAxiomByName(field);
    prop.set(obj, null);
  }
}
