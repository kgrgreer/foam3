/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.edit',
  name: 'PermissiveEditBehaviour',
  extends: 'foam.nanos.crunch.edit.AbstractEditBehaviour',

  methods: [
    {
      name: 'maybeApplyEdit',
      javaCode: `
        ucj.setData(newData);
        return true;
      `
    }
  ]
});
