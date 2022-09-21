/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.boot;

import foam.core.*;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.*;
import foam.nanos.auth.ProxyAuthService;
import foam.nanos.logger.Logger;
import foam.nanos.logger.StdoutLogger;
import foam.nanos.pm.PM;
import foam.util.SafetyUtil;

public class NSpecFactory
  implements XFactory
{
  NSpec       spec_;
  ProxyX      x_;
  Thread      creatingThread_ = null;
  Object      ns_             = null;
  ThreadLocal tlService_      = new ThreadLocal() {
      long since = 0L;
      protected Object initialValue() {
        since = System.currentTimeMillis();
        return maybeBuildService();
      }

      public Object get() {
        if ( System.currentTimeMillis() - since > 1000 ) {
          // invalidate - force initialValue to be called on next get()
          super.remove();
        }
        return super.get();
      }
    };

  public NSpecFactory(ProxyX x, NSpec spec) {
    x_    = x;
    spec_ = spec;
  }

  void buildService(X x) {
    Logger logger = null;
    if ( ! "logger".equals(spec_.getName()) && ! "PM".equals(spec_.getName()) ) {
      logger = (Logger) x.get("logger");
    }
    if ( logger == null ) {
      logger = StdoutLogger.instance();
    }

    // Avoid infinite recursions when creating services
    if ( creatingThread_ == Thread.currentThread() ) {
      logger.warning("Recursive Service Factory", spec_.getName());
      return;
    }
    creatingThread_ = Thread.currentThread();

    PM pm = new PM(this.getClass(), spec_.getName());
    X  nx = x_ instanceof SubX ? x_ : x_.getX();

    // TODO: remove - troubleshooting/debugging only
    if ( ns_ != null ) {
      logger.info("NSpecFactory", spec_.getName(), "ns_ not null", ns_.getClass().getName());
    }

    try {
      logger.info("Creating Service", spec_.getName());
      var service = spec_.createService(nx.put(NSpec.class, spec_).put("logger", logger), null);
      setNS(service);
      logger.info("Created Service", spec_.getName());
    } catch (Throwable t) {
      logger.error("Error Creating Service", spec_.getName(), t);
    } finally {
      pm.log(nx);
      creatingThread_ = null;
    }
  }

  void initService(X x) {
    Logger logger = null;
    if ( ! "logger".equals(spec_.getName()) && ! "PM".equals(spec_.getName()) ) {
      logger = (Logger) x.get("logger");
    }
    if ( logger == null ) {
      logger = StdoutLogger.instance();
    }

    X  nx = x_ instanceof SubX ? x_ : x_.getX();
    Object ns = ns_;
    try {
      while ( ns != null ) {
        if ( ns instanceof ContextAware && ! ( ns instanceof ProxyX ) ) {
          ((ContextAware) ns).setX(nx);
        }
        if ( ns instanceof NSpecAware ) {
          if ( ((NSpecAware) ns).getNSpec() == null ) {
            ((NSpecAware) ns).setNSpec(spec_);
          }
        }
        if ( ns instanceof NanoService )  {
          logger.info("Starting Service", spec_.getName());
          ((NanoService) ns).start();
        }
        if ( ns instanceof ProxyDAO ) {
          ns = ((ProxyDAO) ns).getDelegate();
        } else if ( ns instanceof ProxyAuthService ) {
          ns = ((ProxyAuthService) ns).getDelegate();
        } else {
          ns = null;
        }
      }
      logger.info("Initialized Service", spec_.getName(), ns_ != null ? ns_.getClass().getSimpleName() : "null");
    } catch (Throwable t) {
      logger.error("Error Initializing Service", spec_.getName(), t);
    }
  }

  public Object create(X x) {
    Object ns = null;
    if ( spec_.getThreadLocalEnabled() ) {
      ns = tlService_.get();
    } else {
      ns = maybeBuildService();
    }

    if ( ns instanceof XFactory ) return ((XFactory) ns).create(x);

    return ns;
  }

  public synchronized Object maybeBuildService() {
    if ( ns_ == null || ns_ instanceof ProxyDAO && ((ProxyDAO) ns_).getDelegate() == null ) {
      buildService(x_);
      initService(x_);
    }
    return ns_;
  }

  public synchronized void invalidate(NSpec spec) {
    Logger logger = (Logger) x_.get("logger");
    if ( logger == null ) {
      logger = StdoutLogger.instance();
    }
    logger.warning("Invalidating Service", spec.getName());
    if ( ! SafetyUtil.equals(spec.getService(), spec_.getService())
      || ! SafetyUtil.equals(spec.getServiceClass(), spec_.getServiceClass())
      || ! SafetyUtil.equals(spec.getServiceScript(), spec_.getServiceScript())
    ) {
      if ( ns_ instanceof NanoService ) {
        spec_ = spec;
        logger.warning("Reloading Service", spec_.getName());
        try {
          ((NanoService) ns_).reload();
          logger.info("Reloaded Service", spec_.getName());
        } catch (Throwable t) {
          logger.error("Reloading Service", spec_.getName(), t.getMessage(), t);
        }
      } else if ( ns_ instanceof DAO ) {
        boolean cluster = "true".equals(System.getProperty("CLUSTER", "false"));
        if ( ! cluster ||
             cluster && ((DAO) ns_).cmd(foam.dao.DAO.LAST_CMD) == null ) {
          spec_ = spec;
          // Next access of dao will initiate replay
          ((ProxyDAO) ns_).setDelegate(null);
        } else {
          // Clustered MDAOs are not reloadable as replay is handled by medusa.
          logger.info("Invalidation of Clustered MDAOs not supported", spec_.getName());
        }
      } else {
        ns_ = null;
        spec_ = spec;
        if ( ! spec_.getLazy() ) {
          create(x_);
        }
      }
    }
  }

  void setNS(Object ns) {
    if ( ns instanceof DAO ) {
      if ( ns_ == null ) {
        ns_ = new ProxyDAO();
      }
      if ( ns_ instanceof ProxyDAO ) {
        ((ProxyDAO) ns_).setDelegate((DAO) ns);
      }
    } else {
      if ( ns_ == null ) {
        ns_ = ns;
      } else if ( ns_ instanceof NanoService && ns instanceof FObject ) {
        // Many services may have cached the old service in instance variables,
        // so we can't actually switch to a new object in the context because
        // all of the cached versions will still be out there un-updated
        ((FObject) ns_).copyFrom((FObject) ns);
      }
    }
  }
}
