/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.data',
  name: 'WrapSaver',
  extends: 'foam.u2.wizard.data.ProxySaver',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'wrapper',
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'saveIntoPath'
    }
  ],

  methods: [
    async function save (data) {
      const outputData = this.wrapper.clone();
      this.saveIntoPath$set(outputData, data);
      return await this.delegate.save(outputData);
    }
  ]
});
