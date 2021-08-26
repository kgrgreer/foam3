/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.auth;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.predicate.Predicate;
import foam.util.LRULinkedHashMap;

import java.security.Permission;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import javax.security.auth.AuthPermission;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.TRUE;

/**
 * Decorator to add Caching to AuthService.
 * Stores cache in user Session so that memory is freed when user logs out.
 **/
public class CachingAuthService extends ProxyAuthService {
  /**
   * A list of DAOs that will be listened to. When any of these DAOs update, the
   * cache will be invalidated. Use this to listen to DAOs that are specific to
   * your application.
   * FUTURE: Support supplying predicates to pass to the listeners as well.
   */
  protected String[] extraDAOsToListenTo_;

  private static final String CACHE_NAME = "UserPermissionCache";
  private static final int CACHE_SIZE = 10000;

  protected LRULinkedHashMap<Long, Map<String, Boolean>> userPermissionCache_ = new LRULinkedHashMap<>(CACHE_NAME, CACHE_SIZE);

  public CachingAuthService(AuthService delegate) {
    this(delegate, new String[0]);
  }

  public CachingAuthService(AuthService delegate, String[] extraDAOsToListenTo) {
    setDelegate(delegate);
    extraDAOsToListenTo_ = extraDAOsToListenTo;
  }

//  public static void purgeCache(X x, CachingAuthService service) {
//    if ( service != null ) {
//      service.purgeCache(x);
//    }
//  }

  public void purgeCache(X x) {
    User user = getUserFromContext(x);
    if ( user != null ) {
      userPermissionCache_.remove(user.getId());
    }
  }

  protected Map<String, Boolean> getPermissionMap(final X x, User user) {
    // TODO: Context is set on user permission cache for OM support, this can be removed when OM is removed from LRULinkListHashMap
    if (userPermissionCache_.getX() == null) {
      userPermissionCache_.setX(x);
    }

    long userId = user == null ? -1 : user.getId();
    Map<String, Boolean> map = userPermissionCache_.get(userId);
    if ( map == null ) {
      Sink purgeSink = new Sink() {
        public void put(Object obj, Detachable sub) {
          purgeCache(x);
          sub.detach();
        }

        public void remove(Object obj, Detachable sub) {
          purgeCache(x);
          sub.detach();
        }

        public void eof() {}

        public void reset(Detachable sub) {
          purgeCache(x);
          sub.detach();
        }
      };

      DAO userDAO = (DAO) x.get("localUserDAO");
      DAO userCapabilityJunction = (DAO) x.get("userCapabilityJunctionDAO");
      DAO groupPermissionJunctionDAO = (DAO) x.get("groupPermissionJunctionDAO");
      Predicate predicate = EQ(User.ID, userId);

      userDAO.listen(purgeSink, predicate);
      userCapabilityJunction.listen(purgeSink, predicate);
      groupPermissionJunctionDAO.listen(purgeSink, TRUE);

      String[] extraDAOsToListenTo = (String[]) x.get("extraDAOsToListenTo");

      if ( extraDAOsToListenTo != null ) {
        for ( String daoName : extraDAOsToListenTo ) {
          DAO dao = (DAO) x.get(daoName);
          if ( dao != null ) dao.listen(purgeSink, TRUE);
        }
      }

      map = new ConcurrentHashMap<>();
      userPermissionCache_.put(userId, map);
    }

    return map;
  }

  private User getUserFromContext(X x) {
    if ( x != null ) {
      Subject subject = (Subject) x.get("subject");
      return subject.getUser();
    }

    return null;
  }

  @Override
  public boolean check(foam.core.X x, String permission) {
    if ( x == null || permission == null ) return false;

    User user = getUserFromContext(x);
    return checkUser(x, user, permission);
  }

  @Override
  public boolean checkUser(foam.core.X x, foam.nanos.auth.User user, String permission) {
    if ( x == null || permission == null ) return false;

    Permission p = new AuthPermission(permission);

    Map<String, Boolean> map = getPermissionMap(x.put("extraDAOsToListenTo", extraDAOsToListenTo_), user);

    if ( map.containsKey(p.getName()) ) return map.get(p.getName());

    boolean permissionCheck = getDelegate().check(x, permission);

    map.put(p.getName(), permissionCheck);

    return permissionCheck;
  }
}
