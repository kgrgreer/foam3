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
        formatter.setOutputDefaultClassNames(false);
        formatter.setPropertyPredicate(
          new foam.lib.AndPropertyPredicate(new foam.lib.PropertyPredicate[] {
            new foam.lib.StoragePropertyPredicate(),
            new foam.lib.ClusterPropertyPredicate()
          }));
        formatter.setCalculateDeltaForNestedFObjects(true);
        return formatter;
      }

      @Override
      public FObjectFormatter get() {
        FObjectFormatter formatter = super.get();
        formatter.reset();
        return formatter;
      }
    };

    protected static final ThreadLocal<FObjectFormatter> transientFormatter_ = new ThreadLocal<FObjectFormatter>() {
      @Override
      protected MedusaTransientJSONFObjectFormatter initialValue() {
        MedusaTransientJSONFObjectFormatter formatter = new MedusaTransientJSONFObjectFormatter();
        formatter.setOutputShortNames(true);
        formatter.setOutputDefaultClassNames(false);
        formatter.setCalculateDeltaForNestedFObjects(true);
        return formatter;
      }

      @Override
      public FObjectFormatter get() {
        FObjectFormatter formatter = super.get();
        formatter.reset();
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
          formatter.maybeOutputDelta(old, obj);
        } else {
          formatter.output(obj);
        }
        data = formatter.builder().toString();
      } finally {
        pm.log(x);
      }
      return data;
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
      try {
        FObjectFormatter transientFormatter = transientFormatter_.get();
        if ( old != null ) {
          if ( ! transientFormatter.maybeOutputDelta(old, obj) ) {
            return null;
          }
          return transientFormatter.builder().toString();
        } else {
          transientFormatter.output(obj);
          String data = transientFormatter.builder().toString();
          if ( ! SafetyUtil.isEmpty(data) ) {
            return data;
          }
          return null;
        }
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
