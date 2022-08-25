/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'ArrayWrapSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  documentation: `
    A proxy-saver that adapts a value into an array containing that value.
  `,

  methods: [
    async function save (data) {
      return await this.delegate.save([data]);
    }
  ]
});
