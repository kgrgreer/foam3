/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm',
  name: 'CM',
  plural: 'Computed Measures',

  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [ 'foam.dao.DAO' ],

  documentation: 'A computed measure.',

  tableColumns: [ 'id', 'description', 'keywords', 'result', 'lastComputed', 'update' ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'description',
      tableWidth: 450
    },
    {
      class: 'StringArray',
      name: 'keywords',
      shortName: 'k'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'String',
      name: 'result',
      storageTransient: true,
      factory: function() {
        if ( !rawResults || rawResults.length == 0 ) return "";
        let ret = "";
        for (let i = 0 ; i < rawResults.length ; i++ ) {
          ret += r.key + ": " + r.value;
          if ( i < rawResults.length - 1) ret += ", ";
        }
        return ret;
      },
      javaFactory: `
        if ( getRawResults() == null || getRawResults().size() == 0 ) return "";
        return "TODO";
      `
    },
    {
      class: 'List',
      name: 'rawResults',
      storageTransient: true,
      javaType: 'ArrayList<foam.nanos.cm.CMResult>',
      javaFactory: `
        return new java.util.ArrayList();
      `
    },
    {
      class: 'DateTime',
      name: 'lastComputed',
      storageTransient: true
    },
    {
      class: 'DateTime',
      name: 'expiry',
      storageTransient: true
    },
    {
      class: 'Int',
      name: 'validity',
      value: 1
    },
    {
      class: 'Enum',
      of: 'foam.time.TimeUnit',
      name: 'timeUnit',
      value: 'HOUR'
    },
    {
      class: 'Code',
      name: 'code',
      documentation: 'Beanshell code that should call x.get("this").setResult(result).',
      writePermissionRequired: true
    }
  ],

  methods: [
    {
      name: 'execute',
      type: 'Void',
      args: 'Context x',
      javaCode: `
        try {
          new foam.nanos.script.BeanShellExecutor(null).execute(
            x.put("this", this),
            new java.io.PrintStream(new java.io.ByteArrayOutputStream()),
            getCode());
        } catch(java.io.IOException e) {
          setResult(e.toString());
        }
      `
    },
    {
      name: 'reschedule',
      type: 'Void',
      javaCode: `
        try {
          setLastComputed(new java.util.Date());
          setExpiry(new java.util.Date(System.currentTimeMillis() + getValidity() * getTimeUnit().getConversionFactorMs()));
        } catch (Throwable t) {
          t.printStackTrace();
        }
      `
    },
    {
      name: 'executeAndReschedule',
      type: 'CM',
      args: 'Context x',
      javaCode: `
        CM  cm  = (CM) this.fclone();
        DAO dao = (DAO) x.get("cmDAO");

        cm.execute(x);
        cm.reschedule();

        return (CM) dao.put_(x, cm);
      `
    }
  ],

  actions: [
    {
      name: 'update',
      code: async function(x) {
        var cm = await x.cmDAO.cmd(['update', this.id]);
        this.copyFrom(cm);
      }
    }
  ]
});
