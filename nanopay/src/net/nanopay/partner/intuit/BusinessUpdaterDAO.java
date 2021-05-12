package net.nanopay.partner.intuit;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.crunch.UserCapabilityJunction;
import net.nanopay.model.Business;

import static foam.mlang.MLang.EQ;

public class BusinessUpdaterDAO extends ProxyDAO {

  @Override
  public FObject put_(X x, FObject obj) {
    var business = (Business) obj;
    if ( business.getId() != 0 ) return null;
    var oldBusiness = super.find_(x, business.getId());
    var ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

    var sink = (ArraySink) ucjDAO.where(EQ(UserCapabilityJunction.SOURCE_ID, business.getId())).select(new ArraySink());

    return super.put_(x, obj);
  }

}
