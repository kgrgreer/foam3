/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'ScriptRunnerDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.*',
    'foam.dao.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger'
  ],

  javaCode: `
    public ScriptRunnerDAO(DAO delegate) {
      setDelegate(delegate);
    }
  `,

  methods: [
    {
      name: 'put_',
      javaCode: `
        Script script = (Script) obj;
        if ( script.getStatus() == ScriptStatus.SCHEDULED ) {
          if ( script.canRun(x) ) {
            script.setStatus(ScriptStatus.RUNNING);
            script = (Script) getDelegate().put_(x, script);
            runScript(x, (Script) script.fclone());
          } else {
            script.setStatus(ScriptStatus.UNSCHEDULED);
            script = (Script) getDelegate().put_(x, script);
          }
        } else {
          script = (Script) getDelegate().put_(x, script);
        }
        return script;
      `
    },
    {
      name: 'runScript',
      type: 'foam.nanos.script.Script',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'foam.nanos.script.Script', name: 'script' }
      ],
      javaCode: `
          ((Agency) x.get("threadPool")).submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              x = x.put(Script.class, script);
              Logger logger = (Logger) x.get("logger");
              if ( logger == null ) {
                logger = StdoutLogger.instance();
              }
              logger = new PrefixLogger(new Object[] {
                this.getClass().getSimpleName()
              }, logger);

              try {
                script.runScript(x);
                script.setStatus(ScriptStatus.UNSCHEDULED);
              } catch(Throwable t) {
                script.setStatus(ScriptStatus.ERROR);
                logger.error("agency", script.getId(), t);
              } finally {
                ((DAO) x.get(script.getDaoKey())).put_(x, script);
              }
            }
          }, "Run script: " + script.getId());
        return script;
      `
    }
  ]
});
