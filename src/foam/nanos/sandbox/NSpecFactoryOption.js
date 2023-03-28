/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.sandbox',
  name: 'NSpecFactoryOption',

  javaImports: [
    'foam.core.XFactory',
    'foam.nanos.logger.Logger',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'nSpecPredicate'
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'instancePredicate'
    },
    {
      class: 'Class',
      name: 'nSpecFactory'
    },
    {
      class: 'Map',
      javaType: 'Map<String, Object>',
      name: 'args',
      javaFactory: `
        return new HashMap<String, Object>();
      `
    }
  ],

  methods: [
    {
      name: 'maybeGetFactory',
      type: 'foam.core.XFactory',
      args: [
        { name: 'hostX', type: 'Context' },
        { name: 'nSpec', type: 'foam.nanos.boot.NSpec' }
      ],
      javaCode: `
        var predSpec = getNSpecPredicate();
        var predInst = getInstancePredicate();
        if ( predSpec != null && ! predSpec.f(nSpec) ) return null;
        if ( predInst != null ) {
          var obj = hostX.get(nSpec.getName());
          if ( ! predInst.f(obj) ) return null;
        }
        try {
          var fact = (AbstractNSpecFactory) getNSpecFactory().newInstance();
          fact.setHostX(hostX);
          fact.setNSpec(nSpec);
          for ( String key : getArgs().keySet() ) {
            fact.setProperty(key, getArgs().get(key));
          }
          return fact;
        } catch (Exception e) {
          ((Logger) hostX.get("logger")).error(e);
        }
        return null;
      `
    }
  ]
});
