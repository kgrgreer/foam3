/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.script',
  name: 'Script',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.medusa.Clusterable'
  ],

  requires: [
    'foam.nanos.script.Language',
    'foam.nanos.script.ScriptStatus',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.ScriptRunNotification',
    'foam.nanos.notification.ToastState'
  ],

  imports: [
    'notificationDAO',
    'scriptDAO',
    'scriptEventDAO',
    'subject'
  ],

  exports: [
    'as script'
  ],

  javaImports: [
    'foam.core.*',
    'foam.dao.*',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.*',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',

    'java.io.BufferedReader',
    'java.io.ByteArrayOutputStream',
    'java.io.PrintStream',
    'java.io.StringReader',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',
    'java.util.Map',

    'bsh.EvalError',
    'bsh.Interpreter',
    'jdk.jshell.JShell'
  ],

  tableColumns: [
    'id',
    'description',
    'lastDuration',
    'lastRun',
    'status'
  ],

  searchColumns: [
    'id',
    'description'
  ],

  constants: [
    {
      name: 'MAX_OUTPUT_CHARS',
      type: 'Integer',
      value: 20000
    },
    {
      name: 'MAX_NOTIFICATION_OUTPUT_CHARS',
      type: 'Integer',
      value: 200
    },
    {
      javaType: 'X[]',
      name: 'X_HOLDER',
      javaValue: 'new X[1]'
    }
  ],

  sections: [
    {
      name: 'scriptEvents',
      title: 'Events',
      order: 2
    },
    {
      name: '_defaultSection',
      title: 'Info',
      order: 1
    }
  ],

  messages: [
    { name: 'EXECUTION_DISABLED', message: 'execution disabled' },
    { name: 'EXECUTION_INVOKED', message: 'execution invoked' },
    { name: 'EXECUTION_FAILED', message: 'execution failed' },
    { name: 'EXECUTION_COMPLETED', message: 'execution completed' },
    { name: 'ENABLED_YES', message: 'Y' },
    { name: 'ENABLED_NO', message: 'N' },
    { name: 'PRIORITY_LOW', message: 'Low' },
    { name: 'PRIORITY_MEDIUM', message: 'Medium' },
    { name: 'PRIORITY_HIGH', message: 'High' }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      includeInDigest: true,
      tableWidth: 300
    },
    {
      class: 'Boolean',
      name: 'enabled',
      includeInDigest: true,
      documentation: 'Enables script.',
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        this.start()
          .style({ color: value ? /*%APPROVAL3*/ 'green' : /*%GREY2%*/ 'grey' })
          .add(value ? obj.ENABLED_YES : obj && obj.ENABLED_NO || 'N')
        .end();
      },
      tableWidth: 90,
      value: true
    },
    {
      class: 'String',
      name: 'description',
      includeInDigest: false,
      documentation: 'Description of the script.',
      tableWidth: 300
    },
    {
      class: 'Int',
      name: 'priority',
      value: 5,
      javaValue: 5,
      includeInDigest: false,
      view: function(_, X ) {
        return {
          class: 'foam.u2.view.ChoiceView',
          choices: [
            [4, X.data.PRIORITY_LOW],
            [5, X.data.PRIORITY_MEDIUM],
            [6, X.data.PRIORITY_HIGH]
          ]
        };
      }
    },
    {
      documentation: 'A non-clusterable script can run on all instances, and any run info will be stored locally',
      name: 'clusterable',
      class: 'Boolean',
      value: true,
      includeInDigest: false,
    },
    {
      documentation: 'Generate notification on script completion',
      name: 'notify',
      class: 'Boolean',
      value: false
    },
    {
      class: 'DateTime',
      name: 'lastRun',
      documentation: 'Date and time the script ran last.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableWidth: 140,
      storageTransient: true,
      storageOptional: true
    },
    {
      class: 'Duration',
      name: 'lastDuration',
      documentation: 'Date and time the script took to complete.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableWidth: 125,
      storageTransient: true,
      storageOptional: true
    },
    {
      class: 'Enum',
      of: 'foam.nanos.script.Language',
      name: 'language',
      value: 'BEANSHELL'
    },
    {
      documentation: 'Legacy support for JS scripts created before JShell',
      class: 'Boolean',
      name: 'server',
      value: true,
      transient: true,
      visibility: 'HIDDEN',
      javaSetter: `
        if ( val ) {
          setLanguage(foam.nanos.script.Language.BEANSHELL);
        } else {
          setLanguage(foam.nanos.script.Language.JS);
        }
      `,
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.script.ScriptStatus',
      name: 'status',
      documentation: 'Status of script.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RW',
      value: 'UNSCHEDULED',
      tableWidth: 120,
      storageTransient: true,
      storageOptional: true
    },
    {
      class: 'Code',
      name: 'code',
      includeInDigest: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'output',
      includeInDigest: false,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.view.ModeAltView',
        readView: { class: 'foam.u2.view.PreView' }
      },
      preSet: function(_, newVal) {
        // for client side scripts
        if ( newVal.length > this.MAX_OUTPUT_CHARS ) {
          newVal = newVal.substring(0, this.MAX_OUTPUT_CHARS) + '...';
        }
        return newVal;
      },
      javaSetter: `
      // for server side scripts
      if (val.length() > MAX_OUTPUT_CHARS) {
        val = val.substring(0, MAX_OUTPUT_CHARS) + "...";
      }
      output_ = val;
      outputIsSet_ = true;
      `,
      storageTransient: true
    },
    {
      class: 'String',
      name: 'notes',
      includeInDigest: false,
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 144 }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      includeInDigest: true,
      documentation: 'User who last modified script'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      includeInDigest: true,
      documentation: 'Agent acting user who last modified script'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      includeInDigest: false,
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'scriptDAO',
      transient: true,
      visibility: 'HIDDEN',
      documentation: 'Name of dao to store script itself. To set from inheritor just change property value'
    },
    {
      class: 'String',
      name: 'eventDaoKey',
      value: 'scriptEventDAO',
      transient: true,
      visibility: 'HIDDEN',
      documentation: 'Name of dao to store script run/event report. To set from inheritor just change property value',
      tableWidth: 120
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.id;
      },
      javaCode: `
        return getId();
      `
    },
    {
      name: 'createInterpreter',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'ps', type: 'PrintStream' }
      ],
      javaType: 'Object',
      synchronized: true,
      javaCode: `
        Language l = getLanguage();
        ScriptParameter sp = null;
        try {
          sp = (ScriptParameter) ((DAO) x.get("scriptParameterDAO"))
            .find(AND(
              EQ(ScriptParameter.ENABLED, true),
              EQ(ScriptParameter.NAME, getId())
            ));
        } catch (Throwable t) {
          Loggers.logger(x, this).warning("Failed retrieving ScriptParameter", t);
        }
        if ( l == foam.nanos.script.Language.JSHELL ) {
          JShell jShell = new JShellExecutor().createJShell(ps);
          Script.X_HOLDER[0] = x.put("out",  ps)
            .put("currentScript", this)
            .put("scriptParameter", sp);
          jShell.eval("import foam.core.X;");
          jShell.eval("X x = foam.nanos.script.Script.X_HOLDER[0];");
          return jShell;
        } else if ( l == foam.nanos.script.Language.BEANSHELL ) {
          Interpreter shell = new Interpreter();
          try {
            shell.set("currentScript", this);
            shell.set("scriptParameter", sp);
            shell.set("x", x.put("out", ps));
            shell.eval("runScript(String name) { script = x.get("+getDaoKey()+").find(name); if ( script != null ) eval(script.code); }");
            shell.eval("foam.core.X sudo(String user) { foam.util.Auth.sudo(x, (String) user); }");
            shell.eval("foam.core.X sudo(Object id) { foam.util.Auth.sudo(x, id); }");
          } catch (EvalError e) {
            Logger logger = (Logger) x.get("logger");
            logger.error(this.getClass().getSimpleName(), "createInterpreter", getId(), e);
          }
          return shell;
        } else {
          throw new RuntimeException("Script language not supported");
        }
      `
    },
    {
      name: 'canRun',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return true;
      `
    },
    {
      name: 'runScript',
      code: function() {
        var log = () => {
          this.output += Array.from(arguments).join('') + '\n';
        };
        try {
          with ({ log: log, print: log, x: this.__subContext__ })
            return Promise.resolve(eval('(async () => {' + this.code + '})()'));
        } catch (err) {
          this.output += err;
          return Promise.reject(err);
        }
      },
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      javaCode: `
        RuntimeException thrown      = null;
        Language         l           = getLanguage();
        ByteArrayOutputStream baos   = new ByteArrayOutputStream();
        PrintStream            ps    = new PrintStream(baos);
        PM                     pm    = new PM(this.getClass(), getId());

        try {
          Thread.currentThread().setPriority(getPriority());
          setLastRun(new Date());
          if ( ! ( this instanceof foam.nanos.cron.Cron ) ) {
            er(x, null, LogLevel.INFO, null);
          }
          if ( l == foam.nanos.script.Language.BEANSHELL ) {
            Interpreter shell = (Interpreter) createInterpreter(x, ps);
            setOutput("");
            shell.setOut(ps);
            shell.eval(getCode());
          } else if ( l == foam.nanos.script.Language.JSHELL ) {
            JShell jShell = (JShell) createInterpreter(x,ps);
            new JShellExecutor().execute(x, jShell, getCode(), true);
          } else {
            throw new RuntimeException("Script language not supported");
          }
          pm.log(x);
       } catch (Throwable t) {
          thrown = new RuntimeException(t);
          pm.error(x, t);
          ps.println();
          t.printStackTrace(ps);
          er(x, t.getMessage(), LogLevel.ERROR, t);
          throw thrown;
        } finally {
          setLastDuration(pm.getTime());
          ps.flush();
          setOutput(baos.toString());

          Thread.currentThread().setPriority(Thread.NORM_PRIORITY);

          ScriptEvent event = new ScriptEvent(x);
          event.setLastRun(this.getLastRun());
          event.setLastDuration(this.getLastDuration());
          event.setOutput(this.getOutput());
          if ( thrown != null ) event.setLastStatus(ScriptStatus.ERROR);
          event.setScriptType(this.getClass().getSimpleName());
          event.setOwner(this.getId());
          event.setScriptId(this.getId());
          event.setHostname(System.getProperty("hostname", "localhost"));
          event.setClusterable(this.getClusterable());
          ((DAO) x.get(getEventDaoKey())).put(event);
        }
    `
    },
    {
      name: 'er',
      args: 'X x, String message, LogLevel severity, Throwable t',
      javaCode: `
      ((DAO) x.get("eventRecordDAO")).put(new EventRecord(x, this, getId(), null, null, message, severity, t));
      `
    },
    {
      name: 'poll',
      code: function() {
        var self = this;
        var interval = setInterval(function() {
          self.__context__[self.daoKey].find(self.id).then(function(script) {
            if ( script.status === self.ScriptStatus.UNSCHEDULED || script.status === self.ScriptStatus.ERROR ) {
              self.copyFrom(script);
              clearInterval(interval);

              if ( self.notify ) {
                // create notification
                var notification = self.ScriptRunNotification.create({
                  userId: self.subject && self.subject.realUser ?
                    self.subject.realUser.id : self.user.id,
                  scriptId: script.id,
                  notificationType: 'Script Execution',
                  body: `Status: ${script.status}
                    Script Output: ${script.length > self.MAX_NOTIFICATION_OUTPUT_CHARS ?
                      script.output.substring(0, self.MAX_NOTIFICATION_OUTPUT_CHARS) + '...' :
                      script.output }
                    LastDuration: ${script.lastDuration}`
                });
                self.notificationDAO.put(notification);
              }
              var notification = self.Notification.create();
              notification.userId = self.subject && self.subject.realUser ?
                self.subject.realUser.id : self.user.id;
              notification.severity = foam.log.LogLevel.INFO;
              if ( script.status === self.ScriptStatus.UNSCHEDULED ) {
                notification.toastMessage = self.cls_.name + ' ' + self.EXECUTION_COMPLETED;
              } else {
                notification.toastMessage = self.cls_.name + ' ' + self.EXECUTION_FAILED;
                notification.severity = foam.log.LogLevel.WARN;
              }
              notification.toastState = self.ToastState.REQUESTED;
              notification.transient = true;
              self.__subContext__.myNotificationDAO.put(notification);
            }
          }).catch(function() {
            clearInterval(interval);
          });
        }, 2000);
      }
    }
  ],

  actions: [
    {
      name: 'run',
      tableWidth: 90,
      confirmationRequired: function() {
        return true;
      },
      isAvailable: function(enabled, status) {
        return enabled &&
          ( status == this.ScriptStatus.UNSCHEDULED ||
            status == this.ScriptStatus.ERROR );
      },
      code: function() {
        var self = this;
        this.output = '';
        this.status = this.ScriptStatus.SCHEDULED;
        if ( this.language == this.Language.BEANSHELL ||
             this.language == this.Language.JSHELL ) {
          var notification = self.Notification.create();
          notification.userId = self.subject && self.subject.realUser ?
            self.subject.realUser.id : self.user.id;
          notification.toastMessage = self.cls_.name + ' ' + self.EXECUTION_INVOKED;
          notification.toastState = self.ToastState.REQUESTED;
          notification.severity = foam.log.LogLevel.INFO;
          notification.transient = true;
          self.__subContext__.myNotificationDAO.put(notification);
          this.__context__[this.daoKey].put(this).then(function(script) {
            self.copyFrom(script);
            if ( script.status === self.ScriptStatus.SCHEDULED || script.status === self.ScriptStatus.RUNNING ) {
              self.poll();
            }
          }).catch(function(e) {
            var notification = self.Notification.create();
            notification.userId = self.subject && self.subject.realUser ?
              self.subject.realUser.id : self.user.id;
            notification.toastMessage = self.cls_.name + ' ' + self.EXECUTION_FAILED;
            notification.toastSubMessage = e.message || e;
            notification.toastState = self.ToastState.REQUESTED;
            notification.severity = foam.log.LogLevel.WARN;
            notification.transient = true;
            self.__subContext__.myNotificationDAO.put(notification);
          });
        } else {
          var notification = this.Notification.create();
          notification.userId = this.subject && this.subject.realUser ?
            this.subject.realUser.id : this.subject.user.id;
          notification.toastMessage = this.cls_.name + ' ' + this.EXECUTION_INVOKED;
          notification.toastState = this.ToastState.REQUESTED;
          notification.severity = foam.log.LogLevel.INFO;
          notification.transient = true;
          this.__subContext__.myNotificationDAO.put(notification);

          this.status = this.ScriptStatus.RUNNING;
          this.runScript().then(
            () => {
              this.status = this.ScriptStatus.UNSCHEDULED;
              this.__context__[this.daoKey].put(this);
              var notification = this.Notification.create();
              notification.userId = this.subject && this.subject.realUser ?
                this.subject.realUser.id : this.subject.user.id;
              notification.toastMessage = this.cls_.name + ' ' + this.EXECUTION_COMPLETED;
              notification.toastState = this.ToastState.REQUESTED;
              notification.severity = foam.log.LogLevel.INFO;
              notification.transient = true;
              this.__subContext__.myNotificationDAO.put(notification);
           },
            (e) => {
              var notification = this.Notification.create();
              notification.userId = this.subject && this.subject.realUser ?
                this.subject.realUser.id : this.subject.user.id;
              notification.toastMessage = this.cls_.name + ' ' + this.EXECUTION_FAILED;
              notification.toastSubMessage = e.message || e;
              notification.toastState = this.ToastState.REQUESTED;
              notification.severity = foam.log.LogLevel.WARN;
              notification.transient = true;
              this.__subContext__.myNotificationDAO.put(notification);

              this.output += '\n' + e.stack;
              console.log(e);
              this.status = this.ScriptStatus.ERROR;
              this.__context__[this.daoKey].put(this);
            }
          );
        }
      }
    }
  ]
});
