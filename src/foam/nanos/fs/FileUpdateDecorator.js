/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileUpdateDecorator',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.fs.File'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        var oldObj = getDelegate().find_(x, obj);
        if ( null == oldObj ) {
          return getDelegate().put_(x, obj);
        }

        // Restrict file update unless for lifecycleState change
        if ( File.LIFECYCLE_STATE.compare(obj, oldObj) == 0 ) return obj;

        // Only update file lifecycleState
        var file = (File) oldObj.fclone();
        file.setLifecycleState((LifecycleState) File.LIFECYCLE_STATE.get(obj));
        return getDelegate().put_(x, file);
      `
    }
  ]
})
