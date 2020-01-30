/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ServiceProviderURL',

  documentation: 'Configure ServiceProvider to apply on User Create based on AppConfig URL',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'spid',
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      required: true
    },
    {
      name: 'urls',
      class: 'StringArray',
      documentation: 'Array of urls to enforce this spid on',
      factory: function(){
        return  [];
      },
      javaFactory: 'return new String[0];',
      required: true
    },
  ]
});
