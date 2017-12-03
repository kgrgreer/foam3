/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.dig.model',
  name: 'DigModel',

  documentation: 'Dig Model',

  properties: [
    {
      class: 'String',
      name: 'dao'
    },
    {
      class: 'String',
      name: 'cmd'
    },
    {
      class: 'String',
      name: 'format'
    }
  ],

  methods: [
    {
      name: 'generateNanoService',
        javaReturns: 'foam.core.FObject',
        javaCode: `
          DAO dao = (DAO) getX().get(dao);

          FObject obj = new FObject();
          obj.setX(getX());

          return obj;
          `
      }
  ]

});
