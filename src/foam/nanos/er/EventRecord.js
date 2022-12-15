/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecord',

  documentation: `A modelled log message for reoccuring system events`,

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  mixins: [
    'foam.nanos.medusa.ClusterableMixin'
  ],

  javaImports: [
    'foam.core.X',
    'foam.log.LogLevel',
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
    'createdFrom',
    'event',
    'partner',
    'code',
    'severity',
    'message',
    'hostname'
  ],

  searchColumns: [
    'createdFrom',
    'event',
    'partner',
    'code',
    'severity'
  ],

  javaCode: `
  public EventRecord(X x, Object caller, String event) {
    setX(x);
    setEvent(event);
    setCreatedFrom(caller);
  }

  public EventRecord(X x, Object caller, String event, String message) {
    setX(x);
    setCreatedFrom(caller);
    setEvent(event);
    setMessage(message);
  }

  public EventRecord(X x, Object caller, String event, String message, LogLevel severity, Throwable t) {
    setX(x);
    setCreatedFrom(caller);
    setEvent(event);
    setMessage(message);
    setSeverity(severity);
    setException(t);
  }

  public EventRecord(X x, Object caller, String event, String partner, String code, String message, LogLevel severity, Throwable t) {
    setX(x);
    setCreatedFrom(caller);
    setEvent(event);
    setPartner(partner);
    setCode(code);
    setMessage(message);
    setSeverity(severity);
    setException(t);
  }
  `,

  properties: [
    {
      name: 'id',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'event',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'partner',
      class: 'String',
      updateVisibility: 'RO'
    },
    {
      // optional
      name: 'code',
      class: 'String',
      updateVisibility: 'RO'
    },
    {
      name: 'message',
      class: 'String',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 5,
        cols: 80
      },
      required: true
    },
    {
      name: 'severity',
      class: 'Enum',
      of: 'foam.log.LogLevel',
      value: 'INFO',
      javaFormatJSON: 'formatter.output(get_(obj).getName());',
      updateVisibility: 'RO',
      tableCellFormatter: function(severity, obj, axiom) {
         this
          .start()
            .setAttribute('title', severity.label)
            .add(severity.label)
            .style({ color: severity.color })
          .end();
      },
      tableWidth: 90
    },
    {
      class: 'String',
      name: 'hostname',
      visibility: 'RO',
      javaFactory: `
      return System.getProperty("hostname", "localhost");
      `
    },
    {
      // these next two could be a subclass RequestResponseER
      name: 'requestMessage',
      class: 'String',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 5,
        cols: 80
      },
      storageTransient: true
    },
    {
      name: 'responseMessage',
      class: 'String',
      updateVisibility: 'RO',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 5,
        cols: 80
      },
      storageTransient: true
    },
    {
      name: 'foid',
      class: 'Object',
      visibility: 'RO'
      // TODO: parse with FUID to get DAO for link
    },
    {
      name: 'fObject',
      class: 'FObjectProperty',
      visibility: 'HIDDEN',
      transient: true,
      javaPostSet: `
      setFoid(val.getProperty("id"));
      `
    },
    {
      // TODO: class and method?
      name: 'createdFrom',
      class: 'Object',
      updateVisibility: 'RO',
      javaSetter: `
      if ( val == null ) {
        createdFrom_ = val;
        createdFromIsSet_ = false;
        return;
      }
      if ( val instanceof String ) {
        createdFrom_ = val;
      } else {
        createdFrom_ = val.getClass().getSimpleName();
      }
      createdFromIsSet_ = true;
      `
    },
    // {
    //  ?? first byte of session? if not otherwise specified? Only helpful on user generated events. system and medusa will always be the same.
    //   name: 'traceId',
    //   class: 'String',
    //   updateVisibility: 'RO'
    // },
    {
      name: 'eventRecordResponse',
      class: 'FObjectProperty',
      of: 'foam.nanos.er.EventRecordResponse',
      visibility: 'RO',
      storageTransient: true
    },
    {
      name: 'exception',
      class: 'Object',
      updateVisibility : 'RO',
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: 5,
        cols: 80
      },
      javaFormatJSON: 'formatter.output(get_(obj).toString());',
    },
    {
      name: 'clusterable',
      class: 'Boolean',
      value: true,
      storageTransient: true
    },
    {
      name: 'alarm',
      class: 'Reference',
      of: 'foam.nanos.alarming.Alarm',
      storageTransient: true,
      createVisibility: 'HIDDEN',
      visibility: 'RO',
      menuKeys: [
        'alarm',
        'admin.alarm'
      ]
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.event;
      },
      javaCode: `
      StringBuilder sb = new StringBuilder();
      if ( getCreatedFrom() != null ) {
        if ( sb.length() > 0 ) {
          sb.append("-");
        }
        sb.append(getCreatedFrom().toString());
      }
      if ( ! SafetyUtil.isEmpty(getEvent()) ) {
        if ( sb.length() > 0 ) {
          sb.append("-");
        }
        sb.append(getEvent());
      }
      if ( ! SafetyUtil.isEmpty(getPartner()) ) {
        if ( sb.length() > 0 ) {
          sb.append("-");
        }
        sb.append(getPartner());
      }
      if ( ! SafetyUtil.isEmpty(getCode()) ) {
        if ( sb.length() > 0 ) {
          sb.append("-");
        }
        sb.append(getCode());
      }
      // if ( ! SafetyUtil.isEmpty(getMessage()) ) {
      //   if ( sb.length() > 0 ) {
      //     sb.append("-");
      //   }
      //   sb.append(getMessage());
      // }
      return sb.toString();
      `
    }
  ]
})
