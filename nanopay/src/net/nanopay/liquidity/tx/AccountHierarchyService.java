package net.nanopay.liquidity.tx;

import foam.core.Detachable;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.Sink;
import java.util.concurrent.ConcurrentHashMap;
import java.util.*;
import net.nanopay.account.Account;
import net.nanopay.liquidity.crunch.*;

import static foam.mlang.MLang.TRUE;

public class AccountHierarchyService
  implements AccountHierarchy
{
  protected Map<String, Set<String>> map_;
  public Map<Long, List<String>> userToViewableRootAccountsMap_;

  public AccountHierarchyService() { }

  @Override
  public List<Account> getViewableRootAccounts(X x, long userId) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    List<Account> ret = new ArrayList<Account>();

    Set<String> roots = new HashSet<String>(getViewableRootAccountIds(x, userId));

    for ( String root : roots ) {
      ret.add((Account) accountDAO.find(root));
    }
    return ret;
  }

  public List<String> getViewableRootAccountIds(X x, long userId) {
    if ( ! getUserToViewableRootAccountsMap().containsKey(userId) ) {
      // if not in map, get from dao and put in map
      DAO dao = (DAO) x.get("rootAccountsDAO");
      RootAccounts userRootAccounts = (RootAccounts) dao.find(userId);
      if ( userRootAccounts == null ) {
        return new ArrayList<String>();
      }
      
      userRootAccounts = (RootAccounts) userRootAccounts.fclone();
      userToViewableRootAccountsMap_.put(userId, (ArrayList<String>) userRootAccounts.getRootAccounts());
    }
    return getUserToViewableRootAccountsMap().get(userId);
  }

  @Override
  public void addViewableRootAccounts(X x, List<Long> userIds, List<String> rootAccountIds) {
    DAO rootAccountsDAO = (DAO) x.get("rootAccountsDAO");

    for (  Long userId : userIds ){
      RootAccounts userRootAccounts = (RootAccounts) rootAccountsDAO.find(userId);

      List<String> userRootAccountIds;

      if ( userRootAccounts == null ){
        userRootAccountIds = new ArrayList<String>();
      } else {
        userRootAccountIds = userRootAccounts.getRootAccounts();
      }

      // need to ensure each element is unique
      Set<String> userRootAccountIdsSet = new HashSet<String>(userRootAccountIds);
      userRootAccountIdsSet.addAll(rootAccountIds);
      userRootAccountIds = new ArrayList<String>(userRootAccountIdsSet);

      userRootAccounts = new RootAccounts.Builder(x).setUserId(userId).setRootAccounts(userRootAccountIds).build();

      rootAccountsDAO.put(userRootAccounts);
      getUserToViewableRootAccountsMap().put(userId, userRootAccountIds);
    }
  }

  protected Map<String, Set<String>> getChildMap(X x) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");

    if ( map_ != null ) {
      return map_;
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
    map_ = new ConcurrentHashMap<String, Set<String>>();
    return map_;
  }

  protected Map<Long, List<String>> getUserToViewableRootAccountsMap() {
    if ( userToViewableRootAccountsMap_ == null ) {
      userToViewableRootAccountsMap_ = new ConcurrentHashMap<Long, List<String>>();
    }
    return userToViewableRootAccountsMap_;
  }

  @Override
  public Set<String> getChildAccountIds(X x, String parentId) {
    Map <String, Set<String>> map = getChildMap(x);
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    String parentIdString = parentId;

    // Check if parentId exists in map, if it doesn't fetch children and add them to map
    if ( ! map.containsKey(parentIdString) ) {
      Account parentAccount = (Account) accountDAO.find(parentId);
      List<Account> children = new ArrayList<Account>();
      List<String> childIdList = new ArrayList<String>();

      children = getChildAccounts(x, parentAccount);

      if ( children.size() > 0 ) {
        for ( int i = 0; i < children.size(); i++ ) {
          String childId = children.get(i).getId();
          childIdList.add(childId);
        }
      }

      Set<String> childIdSet = new HashSet<>(childIdList);
      map.put(parentIdString, childIdSet);
    }

    return map.get(parentIdString);
  }

  @Override
  public List<Account> getChildAccounts(X x, Account account) {
     ArraySink allChildrenSink = (ArraySink) account.getChildren(x).select(new ArraySink());
     List<Account> allChildrenList = allChildrenSink.getArray();

    List<Account> allAccounts = new ArrayList<Account>();
    allAccounts.add(account);

    if ( allChildrenList.size() > 0 ) {
      for ( int i = 0; i < allChildrenList.size(); i++ ) {
        Account acc = (Account) allChildrenList.get(i);
        List<Account> childChildren = getChildAccounts(x, acc);
        allAccounts.addAll(childChildren);
      }
    }

    return allAccounts;
  }

  @Override
  public void removeRootFromUser(X x, long user, String account) {  
    List<String> userRoots = getViewableRootAccountIds(x, user);

    if ( userRoots.contains(account) ) {
      userToViewableRootAccountsMap_.remove(user);
      userRoots.removeIf( accountId -> accountId.equals(account) );

      DAO dao = (DAO) x.get("rootAccountsDAO");
      RootAccounts obj = new RootAccounts.Builder(x).setUserId(user).setRootAccounts((ArrayList<String>) userRoots).build();
      dao.put(obj);
    }
  }
}
