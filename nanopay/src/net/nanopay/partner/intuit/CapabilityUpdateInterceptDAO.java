/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

package net.nanopay.partner.intuit;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.crunch.UserCapabilityJunction;

import java.util.Map;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/**
 * Intercepts a DAO put and forwards configurable properties to a capability
 */
public class CapabilityUpdateInterceptDAO extends ProxyDAO {

  protected String capability;
  protected Map<PropertyInfo, PropertyInfo> propMap;

  /**
   * @param prop The property on the source model that will be applied to the dst capability
   * @param src The source model to get the property from
   * @param dst The capability to be modified
   * @param <T> The type of the capability
   * @return The capability with the applied change
   */
  protected <T extends FObject> T apply(PropertyInfo prop, FObject src, T dst) {
    var dstProp = propMap.get(prop);

    if ( dstProp != null )
      dstProp.set(dst, prop.get(src));

    return dst;
  }

  /**
   * @param src The source model for this dao, used to ge the capability
   * @return The capability that will be modified in the put
   */
  protected UserCapabilityJunction getCapability(FObject src) {
    final var ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");

    var sink = (ArraySink) ucjDAO.where(
      AND(
        EQ(UserCapabilityJunction.TARGET_ID, capability),
        EQ(UserCapabilityJunction.SOURCE_ID, src.getProperty("id"))
      )
    ).select(new ArraySink());

    if ( sink.getArray().size() > 0 )
      return (UserCapabilityJunction) sink.getArray().get(0);
    return null;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    final var ucj = getCapability(obj);

    if ( ucj == null )
      throw new RuntimeException("Couldn't find UCJ to update");

    final var oldObj = super.find_(x, obj.getProperty("id"));
    final var ucjDAO = (DAO) getX().get("userCapabilityJunctionDAO");
    final var data = (FObject) ucj.getData();

    if ( data == null )
      throw new RuntimeException("UCJ doesn't contain data element");

    getOf().getAxiomsByClass(PropertyInfo.class).stream()
      .filter((prop) -> propMap.containsKey(prop))
      .filter((prop) -> prop.get(obj) != null && ! prop.get(obj).equals(prop.get(oldObj)))
      .forEach((prop) -> apply(prop, obj, data));

    ucjDAO.put_(x, ucj);

    return super.put_(x, obj);
  }

  /**
   * @param propMap Properties on the source model that will be used to update the capability
   * @param capability ID of Capability that will be updated
   */
  CapabilityUpdateInterceptDAO(Map<PropertyInfo, PropertyInfo> propMap, String capability) {
    this.propMap = propMap;
    this.capability = capability;
  }

}
