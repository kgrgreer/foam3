/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuledDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Finds applicable ruled (i.e, rule-like) object by FindRuledCommand.',

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'delegate',
      javaPostSet: 'setOf(val.getOf());'
    },
    {
      name: 'of',
      javaPreSet: `
        if ( ! Ruled.class.isAssignableFrom(val.getObjClass()) ) {
          throw new RuntimeException("RuledDAO error: " + val.getId() + " must extend " + Ruled.class.getName());
        }
      `
    }
  ],

  methods: [
    {
      name: 'cmd_',
      javaCode: `
        if ( obj instanceof FindRuledCommand ) {
          var isSelectCmd = obj instanceof SelectRuledCommand;

          // Setup target context for ruled matching
          var target  = ((FindRuledCommand) obj).getTarget();
          var targetX = target != null ? x.put("OBJ", target) : x;

          var sink = new ArraySink();
          getDelegate()
            .where(EQ(Ruled.RULE_GROUP, ((FindRuledCommand) obj).getRuleGroup()))
            .orderBy(DESC(Ruled.PRIORITY))
            .select(new AbstractSink() {
              @Override
              public void put(Object o, Detachable s) {
                if ( ((Ruled) o).f(targetX) ) {
                  sink.put(o, s);
                  if ( ! isSelectCmd ) s.detach();
                }
              }
            });

          return isSelectCmd ? sink
                  : sink.getArray().isEmpty() ? null
                  : sink.getArray().get(0);
        }

        return getDelegate().cmd_(x, obj);
      `
    }
  ]
})
