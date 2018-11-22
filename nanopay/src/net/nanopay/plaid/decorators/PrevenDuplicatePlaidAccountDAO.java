package net.nanopay.plaid.decorators;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.MLang;
import net.nanopay.plaid.model.PlaidAccountDetail;

public class PrevenDuplicatePlaidAccountDAO extends ProxyDAO {

  public PrevenDuplicatePlaidAccountDAO(X x, DAO delegate) {
    super(x, delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PlaidAccountDetail accountDetail = (PlaidAccountDetail) obj;

    ArraySink sink = (ArraySink) super.where(
      MLang.AND(
        MLang.EQ(PlaidAccountDetail.MASK, accountDetail.getMask()),
        MLang.EQ(PlaidAccountDetail.NAME, accountDetail.getName())
      )
    ).select(new ArraySink());

    if ( sink.getArray().size() == 1 ) {
      long id = ( (PlaidAccountDetail) sink.getArray().get(0) ).getId();
      accountDetail.setId(id);
    }


    return super.put_(x, accountDetail);
  }
}
