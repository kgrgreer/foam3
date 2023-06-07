/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.lab',
  name: 'SequenceReference',
  documentation: `
    A SequenceReference provides a method to get a complete sequence.
    A Sequence can come from a service like CrunchController and can also
    be modified using a FluentSpec, so SequenceReference provides one interface
    to represent all situations.
  `,
  properties: [
    {
      class: 'String',
      name: 'id',
      factory: function () {
        return foam.uuid.randomGUID();
      }
    },
    { class: 'String', name: 'label' }
  ],

  methods: [
    function toSummary() {
      return this.label;
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.crunch.lab',
  name: 'ServiceMethodSequenceReference',
  extends: 'foam.u2.crunch.lab.SequenceReference',

  properties: [
    { class: 'String', name: 'service' },
    { class: 'String', name: 'method' }
  ],

  methods: [
    async function getSequence() {
      return this.__subContext__[this.service][this.method]();
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.crunch.lab',
  name: 'ModifiedSequenceReference',
  extends: 'foam.u2.crunch.lab.SequenceReference',

  imports: [
    'sequenceReferenceDAO?'
  ],

  properties: [
    {
      class: 'String',
      name: 'delegateId'
    },
    {
      class: 'FObjectArray',
      // of: 'foam.util.FluentSpec',
      of: 'foam.core.FObject',
      name: 'changes'
    }
  ],

  methods: [
    async function getSequence() {
      const seq = await this.sequenceReferenceDAO.find(this.delegateId);
      this.changes.apply(seq);
      return seq;
    }
  ]
});
