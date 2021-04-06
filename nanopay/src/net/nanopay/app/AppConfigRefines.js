/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.app',
  name: 'AppConfigRefines',
  refines: 'foam.nanos.app.AppConfig',

  properties: [
    {
      documentation: 'Set at startup in bootscript.',
      class: 'String',
      name: 'version',
      visibility: 'RO',
      storageTransient: true
    },
    {
      class: 'String',
      name: 'appLink',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'playLink',
      visibility: 'HIDDEN'
    },
    {
      class: 'Boolean',
      name: 'forceHttps',
      value: false,
      visibility: 'HIDDEN'
    }
  ]
});
