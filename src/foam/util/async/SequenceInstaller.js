/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.async',
  name: 'SequenceInstaller',
  extends: 'foam.util.async.Sequence',
  documentation: `
    SequenceInstaller is a sequence that allows specifying groups of context
    agents that will be installed in specific locations of a sequence.

    Any context agent that extends MetaContextAgent will be executed during
    the install() method rather than during the execute() method.
  `,

  requires: [
    'foam.util.async.MetaContextAgent'
  ],

  methods: [
    async function install (targetSequence, targetPosition) {
      console.log('SequenceInstaller', this);
      if ( ! window.sequenceAlready ) {
        window.sequenceAlready = true;
      } else debugger;
      let x = this.__subContext__;

      const targetPosition$ = foam.core.SimpleSlot.create({
        value: targetPosition ?? 0
      });

      x = x.createSubContext({
        targetPosition: targetPosition$,
        targetSequence
      });

      for ( let i = 0 ; i < this.contextAgentSpecs.length; i++ ) {
        if ( this.MetaContextAgent.isSubClass(this.contextAgentSpecs[i].spec) ) {
          console.log('metacontextagentspec is running', i, this)
          const spec = this.contextAgentSpecs[i].spec;
          const args = this.contextAgentSpecs[i].args;

          // Note: logic copied from ViewSpec; maybe this should be in stdlib
          let contextAgent = spec.create(args, x);

          await contextAgent.execute(x);
          continue;
        }
        targetSequence.contextAgentSpecs$splice(
          targetPosition$.get(),
          0,
          this.contextAgentSpecs[i]
        )
        targetPosition$.set(targetPosition$.get() + 1);
      }
    },
    async function execute (x) {
      x = x || this.__context__;
      await this.install(x.sequence, x.sequence.insertPosition_);
      return x;
    }
  ]
});
