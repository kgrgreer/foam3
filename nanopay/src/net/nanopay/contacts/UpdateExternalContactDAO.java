package net.nanopay.contacts;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.model.Business;

import static foam.mlang.MLang.*;


public class UpdateExternalContactDAO extends ProxyDAO {
  public  UpdateExternalContactDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }


  @Override
  public FObject put_(X x, FObject obj) {
    Business business = (Business) super.put_(x, obj);

    DAO tokenDAO = ((DAO) x.get("tokenDAO")).inX(x);
    ExternalContactToken externalToken = (ExternalContactToken) tokenDAO
      .find(EQ(ExternalContactToken.BUSINESS_EMAIL, business.getEmail()));

    if ( externalToken != null ) {
      ExternalContactToken temp = (ExternalContactToken) externalToken.fclone();
      temp.setBusinessId(business.getId());

      tokenDAO.put(temp);
    }

    return business;
  }
}
