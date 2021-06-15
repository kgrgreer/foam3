/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.crunch;

import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;

import java.util.Map;
import java.util.stream.Collectors;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

/**
 * Intercepts a DAO put and forwards updates to a capability
 */
public class CapabilityUpdateInterceptDAO extends ProxyDAO {

  protected String capability;
  protected Map<PropertyInfo, PropertyInfo> propMap;

  protected Logger getLogger() {
    return new PrefixLogger(new Object[] {
      this.getClass().getSimpleName()
    }, (Logger) getX().get("logger"));
  }

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

    if ( ucj != null ) {
      try {
        final var oldObj = super.find_(x, obj.getProperty("id"));

        final var props = getOf().getAxiomsByClass(PropertyInfo.class).stream()
          .filter((prop) -> propMap.containsKey(prop))
          .filter((prop) -> prop.get(obj) != null && ! prop.get(obj).equals(prop.get(oldObj)))
          .collect(Collectors.toList());

        if ( props.size() > 0 ) {
          final var data = (FObject) ucj.getData();
          if ( data == null )
            throw new RuntimeException("UCJ " + capability + " for " + obj.getProperty("id") + " doesn't contain data element");

          final var newData = data.fclone();

          for ( final var prop : props ) {
            apply(prop, obj, newData);
            prop.set(obj, prop.get(oldObj));
          }

          final var user = (User) ((DAO)x.get("bareUserDAO")).find(obj.getProperty("id"));
          final var crunchService = (CrunchService) x.get("crunchService");
          crunchService.updateJunctionFor(x, capability, newData, ucj.getStatus(), user, user);
        }
      } catch(Exception e) {
        getLogger().log(e);
      }
    }

    return super.put_(x, obj);
  }

  /**
   * @param propMap Properties on the source model that will be used to update the capability
   * @param capability ID of Capability that will be updated
   */
  public CapabilityUpdateInterceptDAO(DAO dao, Map<PropertyInfo, PropertyInfo> propMap, String capability) {
    setDelegate(dao);
    this.propMap = propMap;
    this.capability = capability;
  }

}
