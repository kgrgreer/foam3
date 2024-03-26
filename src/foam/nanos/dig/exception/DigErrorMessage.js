/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DigErrorMessage',
  implements: ['foam.core.Exception'],
  extends: 'foam.core.FOAMException',
  javaGenerateConvenienceConstructor: false,

  javaCode: `
    public DigErrorMessage(String message) {
      super(message);
    }

    public DigErrorMessage(String message, Throwable cause) {
      super(message, cause);
      if ( cause instanceof foam.core.Exception ) {
        setInner((foam.core.Exception) cause);
      }
    }

    public DigErrorMessage(Throwable cause) {
      super(cause);
      if ( cause instanceof foam.core.Exception ) {
        setInner((foam.core.Exception) cause);
      }
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'status'
    },
    {
      name: 'message',
      javaGetter: `
        return renderMessage(getExceptionMessage());
      `
    },
    {
      class: 'String',
      name: 'type',
      javaFactory: `
      String name = this.getClass().getSimpleName();
      int i = name.indexOf("Exception");
      if ( i > 0 ) {
        name = name.substring(0, i);
      }
      return name;
      `
    },
    {
      class: 'String',
      name: 'developerMessage'
    },
    {
      class: 'String',
      name: 'moreInfo'
    },
    {
      class: 'FObjectProperty',
      name: 'inner',
      of: 'foam.core.Exception'
    }
  ],

  methods: [
    {
        name: 'getClientRethrowException',
        type: 'RuntimeException',
        visibility: 'public',
        javaCode: `return this;`
    }
  ]
});
