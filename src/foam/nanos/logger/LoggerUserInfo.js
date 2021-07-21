/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LoggerUserInfo',
  flags: [ 'java' ],

  documentation: 'Holder of per call user info.',

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
      name: 'spid'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Subject',
      name: 'subject'
    }
  ],

  methods: [
    {
      name: 'toString',
      type: 'String',
      javaCode: `
      if ( getSubject() != null ) {
        if ( SafetyUtil.isEmpty(getSpid()) ) {
          setSpid(getSubject().getUser().getSpid());
        }
      }
      StringBuilder sb = new StringBuilder();
      sb.append("{spid:");
      sb.append(getSpid());
      if ( getSubject() != null ) {
        sb.append(",user:");
        sb.append(getSubject().getRealUser().getId());
        if ( getSubject().isAgent() ) {
          sb.append(",agent:");
          sb.append(getSubject().getUser().getId());
        }
      }
      sb.append("}");
      return sb.toString();
      `
    }
  ]
});
