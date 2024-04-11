/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaEntrySupport',

  documentation: `Support operations such as calculating delta`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DOP',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.List'
  ],

  javaCode: `
    protected static final ThreadLocal<FObjectFormatter> formatter_ = new ThreadLocal<FObjectFormatter>() {
      @Override
      protected JSONFObjectFormatter initialValue() {
        JSONFObjectFormatter formatter = new JSONFObjectFormatter();
        formatter.setOutputShortNames(true);
        formatter.setPropertyPredicate(
          new foam.lib.AndPropertyPredicate(new foam.lib.PropertyPredicate[] {
            new foam.lib.StoragePropertyPredicate(),
            new foam.lib.ClusterPropertyPredicate()
          }));
        return formatter;
      }

      @Override
      public FObjectFormatter get() {
        FObjectFormatter formatter = super.get();
        formatter.reset();
        return formatter;
      }
    };

    protected static final ThreadLocal<MedusaTransientJSONFObjectFormatter> transientFormatter_ = new ThreadLocal<MedusaTransientJSONFObjectFormatter>() {
      @Override
      protected MedusaTransientJSONFObjectFormatter initialValue() {
        MedusaTransientJSONFObjectFormatter formatter = new MedusaTransientJSONFObjectFormatter();
        formatter.setOutputShortNames(true);
        return formatter;
      }

      @Override
      public MedusaTransientJSONFObjectFormatter get() {
        MedusaTransientJSONFObjectFormatter formatter = super.get();
        formatter.reset();
        formatter.storageTransientDetectionEnabled_ = false;
        formatter.storageTransientDetected_ = false;
        formatter.storageTransientDetectedAt_ = null;
        return formatter;
      }
    };
  `,

  methods: [
    {
      name: 'data',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'old',
          type: 'FObject'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      type: 'String',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "data");
      String data = null;
      try {
        FObjectFormatter formatter = formatter_.get();
        if ( old != null ) {
          if ( formatter.maybeOutputDelta(old, obj) )
            data = formatter.builder().toString();
        } else {
          formatter.output(obj);
          data = formatter.builder().toString();
        }
      } finally {
        pm.log(x);
      }
      if ( ! SafetyUtil.isEmpty(data) ) {
        // Loggers.logger(x, this).debug("data", obj.getClassInfo().getId(), obj.getProperty("id"), "data", data);
        return data;
      }
      return null;
      `
    },
    {
      name: 'transientData',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'old',
          type: 'FObject'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        }
      ],
      type: 'String',
      javaCode: `
      PM pm = PM.create(x, this.getClass().getSimpleName(), "transientData");
      String data = null;
      try {
        MedusaTransientJSONFObjectFormatter transientFormatter = transientFormatter_.get();
        if ( old != null ) {
          if ( transientFormatter.maybeOutputDelta(old, obj) &&
               transientFormatter.isStorageTransientDetected() )
            data = transientFormatter.builder().toString();
        } else {
          transientFormatter.output(obj);
          if ( transientFormatter.isStorageTransientDetected() )
            data = transientFormatter.builder().toString();
        }
      } finally {
        pm.log(x);
      }
      if ( ! SafetyUtil.isEmpty(data) ) {
        // Loggers.logger(x, this).debug("transientData", obj.getClassInfo().getId(), obj.getProperty("id"), "data", data);
        return data;
      }
      return null;
      `
    },
    {
      name: 'overlay',
      type: 'FObject',
      args: 'FObject nu, FObject old',
      javaCode: `
        return overlay_(nu, old, new java.util.HashSet());
      `
    },
    {
      name: 'overlay_',
      type: 'FObject',
      args: 'FObject nu, FObject old, java.util.HashSet visited',
      javaCode: `
        int code = old.hashCode();
        if ( visited.contains(code) ) return nu;
        visited.add(code);
        if ( nu.hashCode() == old.hashCode() ) return nu;
    
        List<PropertyInfo> props = old.getClassInfo().getAxiomsByClass(PropertyInfo.class);
        for ( PropertyInfo p : props ) {
          if ( ! p.getStorageTransient() ) continue;
          Object remote = null;
          try {
            if ( p.isSet(old) ) {
              remote = p.get(old);
            }
          } catch ( ClassCastException e ) {
            // foam.nanos.logger.StdoutLogger.instance().warning("FObject.overlay remote", old.getClass().getSimpleName(), "isSet/get", p.getName(), "from", old.getClass().getSimpleName(), e.getMessage());
            PropertyInfo p2 = (PropertyInfo) getClassInfo().getAxiomByName(p.getName());
            if ( p2 != null ) {
              p = p2;
              try {
                if ( p.isSet(old) ) {
                  remote = p.get(old);
                }
              } catch ( ClassCastException ee ) {
                foam.nanos.logger.StdoutLogger.instance().error("FObject.overlay remote", nu.getClass().getSimpleName(), "isSet/get", p.getName(), "from", old.getClass().getSimpleName(), ee.getMessage(), ee);
              }
            }
          }
          Object local = null;
          if ( p.isSet(old) ) {
            try {
              local = p.get(nu);
            } catch ( ClassCastException e ) {
              // foam.nanos.logger.StdoutLogger.instance().warning("FObject.overlay local", nu.getClass().getSimpleName(), "get", p.getName(), "from", nu.getClass().getSimpleName(), e.getMessage());
            }
            if ( remote instanceof FObject &&
                local != null &&
                ! local.equals(remote) &&
                local.getClass().getCanonicalName().equals(remote.getClass().getCanonicalName()) ) {
              try {
                p.set(nu, ((FObject)local).overlay_((FObject)remote, visited));
              } catch ( ClassCastException e ) {
                // foam.nanos.logger.StdoutLogger.instance().warning("FObject.overlay local", nu.getClass().getSimpleName(), "set", p.getName(), "overlay", remote.getClass().getSimpleName(), e.getMessage());
                p.set(nu, remote);
              }
            } else {
              p.set(nu, remote);
            }
          }
        }
        return nu;
      `
    }
  ]
});
