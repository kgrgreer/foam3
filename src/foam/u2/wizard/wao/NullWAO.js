/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wao',
  name: 'NullWAO',
  implements: [ 'foam.u2.wizard.wao.WAO' ],
  flags: ['web'],
  axioms: [ foam.pattern.Singleton.create() ],
  methods: [
    async function save() {},
    async function load() {},
    async function cancel() {}
  ]
});
