/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'TopicWAO',
  implements: [ 'foam.u2.wizard.wao.WAO' ],
  flags: ['web'],
  extends: 'foam.u2.wizard.wao.ProxyWAO',

  topics: ['loaded', 'saved','saving'],

  methods: [
    async function load(wizardlet) {
      const result = await this.delegate.load(wizardlet);
      this.loaded.pub();
      return result;
    },
    async function save(wizardlet) {
      this.saving.pub();
      const result =  await this.delegate.save(wizardlet);
      this.saved.pub();
      return result;
    }
  ]
});
