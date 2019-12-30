package net.nanopay.liquidity.tx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import java.util.concurrent.ConcurrentHashMap;
import java.util.*;
import net.nanopay.account.Account;

import static foam.mlang.MLang.TRUE;

public class AccountHierarchyService
  implements AccountHierarchy
{
  protected Map<String, HashSet<Long>> map_;

  protected Map<String, HashSet<Long>> getChildMap(X x) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    if ( map_ == null ) {
      map_ = new ConcurrentHashMap<String, HashSet<Long>>();
    }

    Sink purgeSink = new Sink() {
      public void put(Object obj, Detachable sub) {
        map_.clear();
        sub.detach();
      }
      public void remove(Object obj, Detachable sub) {
        map_.clear();
        sub.detach();
      }
      public void eof() {
      }
      public void reset(Detachable sub) {
        map_.clear();
        sub.detach();
      }
    };

    accountDAO.listen(purgeSink, TRUE);

    return map_;
  }

  @Override
  public HashSet<Long> getChildAccounts(X x, long parentId) {
    Map <String, HashSet<Long>> map = getChildMap(x);
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    String parentIdString = Long.toString(parentId);

    // Check if parentId exists in map, if it doesn't fetch children and add them to map
    if ( ! map.containsKey(parentIdString) ) {
      Account parentAccount = (Account) accountDAO.find(parentId);
      List<Account> childrenList = new ArrayList<Account>();
      List<Long> childIdList = new ArrayList<Long>();
      ArraySink childrenSink = (ArraySink) parentAccount.getChildren(x).select(new ArraySink());

      childrenList = childrenSink.getArray();

      // Add parentId to childIdList as the rule still needs to include restricting the parent account
      childIdList.add(parentAccount.getId());

      for ( int i = 0; i < childrenList.size(); i++ ) {
        long childId = childrenList.get(i).getId();
        childIdList.add(childId);
      }

      HashSet<Long> childIdSet = new HashSet<>(childIdList);
      map.put(parentIdString, childIdSet);
    }

    return map.get(parentIdString);
  }
}