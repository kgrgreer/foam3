/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'FOAMException',
  package: 'foam.core',
  implements: [ 'foam.core.Exception' ],
  javaExtends: 'RuntimeException',
  javaGenerateConvenienceConstructor: false,
  javaGenerateDefaultConstructor: false,

  imports: [
    'translationService'
  ],

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.core.XLocator',
    'foam.i18n.TranslationService',
    'foam.util.SafetyUtil',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map'
  ],
  
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public FOAMException() {
    getHostname();
  }

  public FOAMException(String message) {
    super(message);
    setMessage(message);
    getHostname();
  }

  public FOAMException(String message, String errorCode) {
    super(message);
    setMessage(message);
    setErrorCode(errorCode);
    getHostname();
  }

  public FOAMException(Throwable cause) {
    super(cause);
    setMessage(cause.getMessage());
    getHostname();
  }

  public FOAMException(String message, Throwable cause) {
    super(message, cause);
    setMessage(message);
    getHostname();
  }

  public FOAMException(String message, String errorCode, Throwable cause) {
    super(message, cause);
    setMessage(message);
    setErrorCode(errorCode);
    getHostname();
  }
  
  @Override
  public synchronized Throwable fillInStackTrace() {
    return null;
  }
        `);
      }
    }
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      factory: function() { return this.cls_.id; },
      javaFactory: 'return this.getClass().getName();',
      externalTransient: true,
      storageTransient: true
    },
    {
      name: 'exceptionMessage',
      class: 'String',
      value: '{{message}}',
      externalTransient: true,
      visibility: 'RO'
    },
    {
      name: 'message',
      class: 'String',
      storageTransient: true,
      visibility: 'RO'
    },
    {
      name: 'errorCode',
      class: 'String',
      visibility: 'RO'
    },
    {
      name: 'hostname',
      class: 'String',
      javaFactory: 'return System.getProperty("hostname", "localhost");',
      visibilty: 'RO'
    }
  ],

  methods: [
    {
      documentation: 'Translate the exception message before template parameter replacement.',
      name: 'getTranslation',
      type: 'String',
      code: function() {
        var msg = this.translationService.getTranslation(foam.locale, this.cls_.id+'.'+this.exceptionMessage, this.exceptionMessage);
        let m = this.getTemplateValues();
        for ( let [key, value] of m.entries() ) {
          msg = msg.replaceAll(key, value);
        }
        return msg;
      },
      javaCode: `
      try {
        TranslationService ts = (TranslationService) XLocator.get().get("translationService");
        if ( ts != null ) {
          String locale = (String) XLocator.get().get("locale.language");
          if ( SafetyUtil.isEmpty(locale) ) {
            locale = "en";
          }
          var msg = ts.getTranslation(locale, getClass().getName()+"."+getExceptionMessage(), getExceptionMessage());

          // REVIEW: temporary - default/simple java template support not yet split out from EmailTemplateEngine.
          foam.nanos.notification.email.EmailTemplateEngine template = new foam.nanos.notification.email.EmailTemplateEngine();
          msg = template.renderTemplate(foam.core.XLocator.get(), msg, getTemplateValues()).toString().trim();
          return msg;
        }
      } catch (NullPointerException e) {
        // noop - Expected when not yet logged in, as XLocator is not setup.
      }
      return getMessage();
      `
    },
    {
      documentation: 'Build map of template parameter replacements',
      name: 'getTemplateValues',
      type: 'Map',
      code: function() {
        var m = new Map();
        var ps = this.cls_.getAxiomsByClass(foam.core.Property);
        for ( var i = 0, property; property = ps[i]; i++ ) {
          if ( ! property.externalTransient ) {
            m.set('{{'+property.name+'}}', this[property.name] || '');
          }
        }
        return m;
      },
      javaCode: `
      Map map = new HashMap();
      List<PropertyInfo> props = getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo prop : props ) {
        if ( prop.isSet(this) ) {
          Object value = prop.get(this);
          if ( value != null ) {
            map.put(prop.getName(), String.valueOf(value));
          }
        }
      }
      return map;
      `
    },
    {
      name: 'toString',
      type: 'String',
      code: function() {
        var s = this.id+',';
        s += '['+this.hostname+'],';
        if ( this.errorCode ) {
          s += '('+this.errorCode+'),';
        }
        s += this.message;
        return s;
      },
      javaCode: `
      StringBuilder sb = new StringBuilder();
      sb.append(getId());
      sb.append(",");
      sb.append("["+getHostname()+"]");
      sb.append(",");
      if ( ! foam.util.SafetyUtil.isEmpty(getErrorCode()) ) {
        sb.append("("+getErrorCode()+")");
        sb.append(",");
      }
      sb.append(getMessage());
      return sb.toString();
      `
    }
  ]
});
