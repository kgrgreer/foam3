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
    'foam.core.X',
    'foam.dao.DOP',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil'
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
    }
  ]
});
