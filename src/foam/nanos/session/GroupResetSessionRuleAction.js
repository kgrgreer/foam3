/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.session',
  name: 'GroupResetSessionRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Reset cache applyContext on group changes.
Generally it is the group url which changes.
It is necessary to traverse both up and down the group chain to capture
all users/sessions of interest.  Since most users of a system will have a
common group root, for simplicity sake, it potentially just as efficient
to reset all sessions.  Should this not be the case then individual group
chains can be acted on explicitly.
`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          ((Logger) x.get("logger")).info("GroupResetSessionRuleAction,resetting sessions");
          List<Session> sessions = (List) ((ArraySink) ((DAO) x.get("sessionDAO")).select(new ArraySink())).getArray();
          for ( Session session : sessions ) {
            Session.APPLY_CONTEXT.clear(session);
          }
        }
      }, this.getClass().getSimpleName());
      `
    }
  ]
});
