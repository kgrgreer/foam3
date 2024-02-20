/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cm',
  name: 'CMUpdateDAO',
  extends: 'foam.dao.ProxyDAO',

  requires: [
    'foam.nanos.cm.CM'
  ],

  javaCode: `
    public CMUpdateDAO(foam.core.X x, foam.dao.DAO delegate) {
      super(x, delegate);
    }
  `,

  methods: [
    {
      name: 'cmd_',
      javaCode: `
      try {
        String[] s = (String[]) obj;

        if ( s[0].equals("update") ) {
          CM cm = (CM) getDelegate().find(s[1]);

          return cm.executeAndReschedule(x);
        }
      } catch (Throwable t) {
        System.err.println("Error Updating CM: " + t);
        // t.printStackTrace();
      }

      return super.cmd_(x, obj);
     `
    }
  ]
});
