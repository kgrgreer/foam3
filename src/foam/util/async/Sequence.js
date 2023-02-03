/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.async',
  name: 'Sequence',
  extends: 'foam.core.Fluent',

  documentation: `
    Sequence creates and executes ContextAgents in the order specified, passing
    each ContextAgent's export context to the subsequent ContextAgent.
    If method execute() of the ContextAgent returns a context explicitly, then
    this will be used instead of the export context.
  `,

  implements: [
    'foam.core.ContextAgent',
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.ContextAgent',
    'foam.core.NullAgent'
  ],

  exports: [
    'as sequence'
  ],

  properties: [
    {
      name: 'contextAgentSpecs',
      class: 'FObjectArray',
      of: 'FObject'
    },
    {
      class: 'FObjectProperty',
      name: 'errorAgent'
    },
    {
      name: 'halted_',
      class: 'Boolean'
    },
    {
      name: 'paused_',
      class: 'Boolean'
    },
    {
      class: 'Duration',
      name: 'timeout',
      documentation: `amount of time before a warning is displayed for an unresolved promise`,
      value: 1000
    }
  ],

  methods: [
    // Sequence DSL

    function tag(spec, args) {
      let name = typeof spec.getImpliedId === 'function'
        ? spec.getImpliedId(args) : foam.uuid.randomGUID();
      return this.addAs(name, spec, args);
    },

    function add(spec, args) {
      return this.addAs(spec.name, spec, args);
    },
    function addAs(name, spec, args) {
      this.contextAgentSpecs$push(this.Step.create({
        name: name || spec.class?.split('.').slice(-1)[0],
        spec: spec,
        args: args
      }));
      return this;
    },
    function addBefore(name, spec, args) {
      for ( var i = 0; i < this.contextAgentSpecs.length; i++ ){
        let ca = this.contextAgentSpecs[i];
        if ( name == ca.name ) {
          break;
        }
      }

      var firstHalf = this.contextAgentSpecs.slice(0, i);
      var secondHalf = this.contextAgentSpecs.slice(i);

      this.contextAgentSpecs = [
        ...firstHalf,
        this.Step.create({
          name: spec.name || spec.class?.split('.').slice(-1)[0],
          spec: spec,
          args: args
        }),
        ...secondHalf
      ]

      return this;
    },

    function addAfter(name, spec, args) {
      for ( var i = 0; i < this.contextAgentSpecs.length; i++ ){
        let ca = this.contextAgentSpecs[i];
        if ( name == ca.name ) {
          break;
        }
      }

      var firstHalf = this.contextAgentSpecs.slice(0, i + 1);
      var secondHalf = this.contextAgentSpecs.slice(i + 1);

      this.contextAgentSpecs = [
        ...firstHalf,
        this.Step.create({
          name: spec.name,
          spec: spec,
          args: args
        }),
        ...secondHalf
      ]

      return this;
    },

    function reconfigure(name, args) {
      for ( let ca of this.contextAgentSpecs ) {
        if ( name == ca.name ) {
          ca.args = { ...ca.args, ...args };
          break;
        }
      }
      return this;
    },
    function contains(name) {
      for ( let ca of this.contextAgentSpecs ) {
        if ( name == ca.name && ca.spec !== this.NullAgent ) {
          return true;
        }
      }
      return false;
    },
    function get(name) {
      for ( let ca of this.contextAgentSpecs ) {
        if ( name == ca.name ) {
          return ca;
        }
      }
    },
    function remove(name) {
      this.contextAgentSpecs$replace(this.EQ(
        this.Step.NAME, name
      ), this.Step.create({
        name: name,
        spec: this.NullAgent
      }));
      return this;
    },

    // Launching a sequence

    async function execute() {
      let i = 0;
      let nextStep = async x => {
        if ( i >= this.contextAgentSpecs.length ) return await Promise.resolve(x);
        await this.waitForUnpause();
        if ( this.halted_ ) return await Promise.resolve(x);
        let seqspec = this.contextAgentSpecs[i++];
        let contextAgent;
        var spec = seqspec.spec;
        var args = seqspec.args;
        // Note: logic copied from ViewSpec; maybe this should be in stdlib
        if ( this.ContextAgent.isInstance(spec) ) {
          contextAgent = spec.copyFrom(args);
        } else if ( spec.create ) {
          contextAgent = spec.create(args, x);
        } else {
          var cls = foam.core.FObject.isSubClass(spec.class)
            ? spec.class : this.__subContext__.lookup(spec.class);
          if ( ! cls ) foam.assert(false,
            'Argument to Sequence.add specifies unknown class: ', spec.class);
          contextAgent = cls.create(spec, x).copyFrom(args || {});
        }

        // Flatten a child Sequence
        if ( this.cls_.isInstance(contextAgent) ) {
          debugger;
          this.contextAgentSpecs$splice(i, contextAgent.contextAgentSpecs.length,
            ...contextAgent.contextAgentSpecs);
          return await nextStep(x);
        }
        
        // Setup a timeout to warn about unresolved promises
        const stepResolvedTimeout = setTimeout(() => {
          console.warn(
            `context agent still pending after ${this.timeout}ms; ` +
            `open the object for helpful details.`,
            seqspec
          );
        }, this.timeout)

        // Call the context agent and pass its exports to the next one
        let newX;
        try {
          newX = await contextAgent.execute();
        } catch (e) {
          console.error(`sequence:`, seqspec, e);
          this.paused_ = true;
          if ( this.errorAgent ) {
            newX = await this.errorAgent.execute(x.createSubContext({
              exception: e
            }));
          }
        }
        clearTimeout(stepResolvedTimeout);
        return await nextStep(newX || contextAgent.__subContext__);
      };
      return await nextStep(this.__subContext__)
    },

    // Sequence runtime commands

    function endSequence() {
      this.halted_ = true;
      this.paused_ = false;
    },

    function waitForUnpause() {
      if ( ! this.paused_ ) return Promise.resolve();
      return new Promise((resolve, reject) => {
        const detachable = foam.core.FObject.create();
        detachable.onDetach(this.paused_$.sub(() => {
          if ( ! this.paused_ ) {
            detachable.detach();
            resolve();
          }
        }));
      });
    }
  ],

  classes: [
    {
      name: 'Step',
      properties: [
        { name: 'name', class: 'String' },
        { name: 'spec', class: 'Class' },
        { name: 'args', class: 'Object' }
      ],
    }
  ]
});
