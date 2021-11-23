/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.ProxyDAO;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.util.concurrent.FoldReducer;

import java.util.*;

public class FoldReducePMLogger
  extends    FoldReducer
  implements PMLogger
{
  private final Set<String> captureEnabledList_ = new HashSet<>();

  public FoldReducePMLogger() {
  }


  /** Template method to Create initial state. **/
  public Object initialState() {
    return new HashMap();
  }


  /** Template method to Fold a new update into a state. **/
  public void fold(Object state, Object op) {
    Map map = (Map) state;
    PM  pm  = (PM) op;

    // Regular PMInfo
    Object key = pm.getKey() + ":" + pm.getName();
    PMInfo pi  = (PMInfo) map.get(key);

    if ( pi == null ) {
      pi = new PMInfo();
      pi.setKey(pm.getKey());
      pi.setName(pm.getName());
      pi.setCapture(captureEnabledList_.contains(key));
      map.put(key, pi);
    }

    pi.fold(pm);
    if ( pi.getCapture() ) {
      capture(pi);
    }
  }


  public void capture(PMInfo pi) {
    StringBuilder trace = new StringBuilder("// Captured at: ");
    trace.append(new Date().toString());
    trace.append(System.lineSeparator());

    for ( StackTraceElement j : Thread.currentThread().getStackTrace() ) {
      trace.append(j.toString());
      trace.append(System.lineSeparator());
    }

    pi.setCapture(false);
    pi.setCaptureTrace(trace.toString());
    putCaptureEnabledPM(pi);
  }


  /** Template method to Merge two states. **/
  public Object reduce(Object state1, Object state2) {
    Map<String,PMInfo> m1 = (Map<String,PMInfo>) state1;
    Map<String,PMInfo> m2 = (Map<String,PMInfo>) state2;

    for ( PMInfo pi2 : m2.values() ) {
      String key = pi2.getKey() + ":" + pi2.getName();
      pi2.setCapture(captureEnabledList_.contains(key));
      PMInfo pi1 = m1.get(key);

      if ( pi1 == null ) {
        m1.put(key, pi2);
      } else {
        pi1.reduce(pi2);
      }
    }

    return state1;
  }

  /** Manage keys for maintaining capture flag between state and LocalState **/
  public void putCaptureEnabledPM(PMInfo pmi) {
    if ( pmi == null ) return;

    String key = pmi.getKey() + ":" + pmi.getName();

    // Get local state copy if it exists
    Map map = (Map) getLocalStateState();
    PMInfo pmiLocal  = (PMInfo) map.get(key);

    if ( pmi.getCapture() ) {
      captureEnabledList_.add(key);

      // Create local state only for capture set
      if ( pmiLocal == null ) {
        pmiLocal = new PMInfo();
        pmiLocal.setKey(pmi.getKey());
        pmiLocal.setName(pmi.getName());
        map.put(key, pmiLocal);
      }
    } else {
      captureEnabledList_.remove(key);
    }

    if ( pmiLocal != null ) {
      // Update local state
      pmiLocal.setCapture(pmi.getCapture());
    }
  }

  @Override
  public void log(PM pm) {
    if (
      ! pm.getKey().equals("foam.dao.PMDAO") &&
      ! pm.getKey().equals("foam.dao.PipelinePMDAO") &&
      ! pm.getKey().equals("foam.nanos.auth.PMAuthService")
    ) {
      if ( pm.getKey().indexOf("PM")  != -1 ) return;
      if ( pm.getName().indexOf("PM") != -1 ) return;
      if ( pm.getKey().indexOf("pm")  != -1 ) return;
      if ( pm.getName().indexOf("pm") != -1 ) return;
      if ( pm.getName().indexOf("LogMessage") != -1 ) return;
    }

    this.fold(pm);
  }


  public synchronized DAO asDAO() {
    return new ProxyDAO() {
      public DAO getDelegate() {
        synchronized ( FoldReducePMLogger.this ) {
          Map  m   = (Map) getState();
          MDAO dao = new PMInfoMDAO(FoldReducePMLogger.this);

          for ( Object pi : m.values() ) dao.put((PMInfo) pi);

          return dao;
        }
      }

      public foam.core.FObject remove_(X x, foam.core.FObject obj) {
        try {
          PMInfo pmi = (PMInfo) obj;
          String key = pmi.getKey() + ":" + pmi.getName();
          getDelegate();
          Map<String,PMInfo> map = (Map<String,PMInfo>) getState();
          map.remove(key);
        } catch (Throwable t) {
        }
        return obj;
      }

      public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
        resetState();
      }
    };
  }

}
