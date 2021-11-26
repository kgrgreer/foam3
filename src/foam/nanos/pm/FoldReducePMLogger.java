/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.pm;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.util.concurrent.FoldReducer;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class FoldReducePMLogger
  extends    FoldReducer
  implements PMLogger
{
  private final Map<String, PMInfoId> captureEnabledList_ = new HashMap<>();

  public FoldReducePMLogger() {
  }

  /** Template method to Create initial state. **/
  public Object initialState() {
    HashMap<String, PMInfo> initState = new HashMap<>();

    // Load capture enabled PMInfos into initial state
    if ( captureEnabledList_ != null && captureEnabledList_.size() > 0 ) {
      for ( String key : captureEnabledList_.keySet() ) {
        PMInfoId pmid = captureEnabledList_.get(key);

        PMInfo pmi = new PMInfo();
        pmi.setKey(pmid.getKey());
        pmi.setName(pmid.getName());
        pmi.setCapture(true);

        initState.put(key, pmi);
      }
    }

    return initState;
  }

  /** Template method to Fold a new update into a state. **/
  public void fold(Object state, Object op) {
    Map<String, PMInfo> map = (Map<String, PMInfo>) state;
    PM  pm  = (PM) op;

    // Regular PMInfo
    String key = pm.getKey() + ":" + pm.getName();
    PMInfo pmi  = map.get(key);

    if ( pmi == null ) {
      pmi = new PMInfo();
      pmi.setKey(pm.getKey());
      pmi.setName(pm.getName());
      map.put(key, pmi);
    }

    pmi.fold(pm);
    if ( pmi.getCapture() ) {
      capture(pmi);
    }
  }

  public void capture(PMInfo pmi) {
    StringBuilder trace = new StringBuilder("// Captured at: ");
    trace.append(new Date());
    trace.append(System.lineSeparator());

    for ( StackTraceElement j : Thread.currentThread().getStackTrace() ) {
      trace.append(j.toString());
      trace.append(System.lineSeparator());
    }

    pmi.setCapture(false);
    pmi.setCaptureTrace(trace.toString());
    put(pmi);
  }

  /** Template method to Merge two states. **/
  public Object reduce(Object state1, Object state2) {
    Map<String,PMInfo> m1 = (Map<String,PMInfo>) state1;
    Map<String,PMInfo> m2 = (Map<String,PMInfo>) state2;

    for ( PMInfo pmi2 : m2.values() ) {
      String key = pmi2.getKey() + ":" + pmi2.getName();
      PMInfo pmi1 = m1.get(key);

      if ( pmi1 == null ) {
        m1.put(key, pmi2);
      } else {
        pmi1.reduce(pmi2);
      }
    }

    return state1;
  }

  /** Manage keys for maintaining capture flag between state and LocalState **/
  public void put(PMInfo pmi) {
    if ( pmi == null ) return;

    String key = pmi.getKey() + ":" + pmi.getName();

    if ( pmi.getCapture() ) {
      PMInfoId pmid = new PMInfoId();
      pmid.setKey(pmi.getKey());
      pmid.setName(pmi.getName());
      captureEnabledList_.put(key, pmid);
    } else {
      captureEnabledList_.remove(key);
    }
  }

  @Override
  public void log(PM pm) {
    if (
      ! pm.getKey().equals("foam.dao.PMDAO") &&
      ! pm.getKey().equals("foam.dao.PipelinePMDAO") &&
      ! pm.getKey().equals("foam.nanos.auth.PMAuthService")
    ) {
      if ( pm.getKey().contains("PM") ) return;
      if ( pm.getName().contains("PM") ) return;
      if ( pm.getKey().contains("pm") ) return;
      if ( pm.getName().contains("pm") ) return;
      if ( pm.getName().contains("LogMessage") ) return;
    }

    this.fold(pm);
  }

  public synchronized DAO asDAO() {
    return new ProxyDAO() {
      public DAO getDelegate() {
        synchronized ( FoldReducePMLogger.this ) {
          DAO dao = new PMInfoMDAO(FoldReducePMLogger.this);
          Map<String, PMInfo>  m   = (Map<String, PMInfo>) getState();

          for ( PMInfo pi : m.values() ) {
            String key = pi.getKey() + ":" + pi.getName();
            pi.setCapture(captureEnabledList_.containsKey(key));
            dao.put(pi);
          }

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
