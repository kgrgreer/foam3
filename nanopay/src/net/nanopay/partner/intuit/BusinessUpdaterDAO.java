package net.nanopay.partner.intuit;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.crunch.UserCapabilityJunction;
import net.nanopay.crunch.registration.BusinessDetailData;
import net.nanopay.model.Business;

import java.util.HashMap;
import java.util.Map;

import static foam.mlang.MLang.*;

public class BusinessUpdaterDAO extends ProxyDAO {

  protected static final Map<PropertyInfo, PropertyInfo> propMap = Map.of(
    Business.ADDRESS, BusinessDetailData.ADDRESS,
    Business.BUSINESS_NAME, BusinessDetailData.BUSINESS_NAME,
    Business.PHONE_NUMBER, BusinessDetailData.PHONE_NUMBER,
    Business.EMAIL, BusinessDetailData.EMAIL
  );

  protected <T extends FObject> T f(PropertyInfo prop, FObject src, T dst) {
    var dstProp = propMap.get(prop);

    if ( dstProp != null ) {
      dstProp.set(dst, prop.get(src));
      prop.clear(src);
    }

    return dst;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    var business = (Business) obj;
    if ( business.getId() != 0 ) return null;

    var oldBusiness = super.find_(x, business.getId());
    var ucjDAO = (DAO) x.get("userCapabilityJunctionDAO");

    // Need the business detail capability
    var sink = (ArraySink) ucjDAO.where(
      AND(
        EQ(UserCapabilityJunction.ID, "crunch.onboarding.api.business-details"),
        EQ(UserCapabilityJunction.SOURCE_ID, business.getId())
      )
    ).select(new ArraySink());

    BusinessDetailData bdd = null;
    if ( sink.getArray().size() > 0 )
      bdd = (BusinessDetailData) sink.getArray().get(0);
    else
      return null;

    for ( var o : Business.getOwnClassInfo().getAxioms() ) {
      var prop = (PropertyInfo) o;
      if ( propMap.containsKey(prop) )
        bdd = f(prop, business, bdd);
    }

    return super.put_(x, obj);
  }

}
