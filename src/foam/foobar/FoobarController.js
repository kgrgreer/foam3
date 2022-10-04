/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.foobar',
  name: 'FoobarController',
  documentation: `
    Controller which manages the state of build tasks and generates
    valid Sequence objects with respect to CRUNCH constraints.
  `,

  nodeRequires: [
    'path as path_',
    'fs as fs_'
  ],

  exports: [
    'capabilityDAO',
    'prerequisiteCapabilityJunctionDAO'
  ],

  imports: [
    'config',
    'toolsDir',
    'srcDirs'
  ],

  requires: [
    'foam.dao.MDAO',
    'foam.foobar.FoobarTemplateUtil',
    'foam.graph.GraphBuilder',
    'foam.graph.GraphTraverser',
    'foam.graph.TraversalOrder',
    'foam.graph.WeightPriorityStrategy',
    'foam.util.async.Sequence'
  ],

  properties: [
    ...[
      {
        name: 'capabilityDAO',
        of: 'foam.nanos.crunch.Capability'
      },
      {
        name: 'prerequisiteCapabilityJunctionDAO',
        of: 'foam.nanos.crunch.CapabilityCapabilityJunction'
      }
    ].map(spec => ({
      class: 'foam.dao.DAOProperty',
      name: spec.name,
      factory: function () {
        return this.MDAO.create({ of: foam.lookup(spec.of) });
      }
    })),
    {
      class: 'foam.dao.DAOProperty',
      name: 'payloadDAO',
      factory: function () {
        return this.CapableAdapterDAO.create({ capable: this });
      }
    },
    {
      class: 'FObjectArray',
      name: 'capablePayloads',
      of: 'foam.nanos.crunch.CapabilityJunctionPayload'
    }
  ],

  methods: [
    function init() {
      const jrlsToLoad = [
        {
          dao: 'capabilityDAO',
          jrl: this.path_.join(__dirname, 'capabilities.jrl')
        },
        {
          dao: 'prerequisiteCapabilityJunctionDAO',
          jrl: this.path_.join(__dirname, 'prerequisiteCapabilityJunctions.jrl')
        }
      ];

      // Since the builtin journals are trusted, we can parse them
      // really really fast.
      for ( const jrlDirective of jrlsToLoad ) {
        const jrlCtx = {
          p: o => this[jrlDirective.dao].put(
            foam.json.parse(
              this.preprocessSpec(o),
              this[jrlDirective.dao].of,
              this.__subContext__
            )),
          r: o => this[jrlDirective.dao].remove(foam.json.parse(o)),
          foam: {}
        };
        const jrlText = this.fs_.readFileSync(jrlDirective.jrl);
        with ( jrlCtx ) eval(`(function(){${jrlText}}).call({})`);
      }
    },
    async function runTask(id) {
      // STEP 1: Generate sequence
      if ( ! id.includes('.') ) id = 'foam.foobar.tasks.' + id;

      const sequence = this.Sequence.create();

      // populate sequence
      await (async () => {
        // populate graph
        const graph = await (async () => {
          const rootCapability = await this.capabilityDAO.find(id);
          const graphBuilder = this.GraphBuilder.create();
          await graphBuilder.fromJunction(
            rootCapability,
            'capabilityDAO',
            'prerequisiteCapabilityJunctionDAO',
            'priority'
          );
          return graphBuilder.build();
        })();

        const traverser = this.GraphTraverser.create({
          graph,
          order: this.TraversalOrder.PRE_ORDER,
          weightPriorityStrategy: this.WeightPriorityStrategy.MIN
        });
        traverser.sub('process', (_1, _2, { parent, current }) => {
          if ( ! current.data.of ) return;
          sequence.add(current.data.of, current.data.args || {});
        });
        traverser.traverse();
      })();

      // STEP 2: Execute sequence
      await sequence.execute();
    },
    // Resolves build variables found in a string
    function resolveString (str) {
      const templateCompiler = this.FoobarTemplateUtil.create();
      return templateCompiler.lazyCompile(str, 'toString', []).call(this.config.toObject())
    },
    // Preprocesses an entire object deeply to resolve build variables
    {
      name: 'preprocessSpec',
      code: foam.mmethod({
        String: function ( str ) {
          return this.resolveString(str);
        },
        Object: function ( o ) {
          for ( const k in o ) {
            o[k] = this.preprocessSpec(o[k]);
          }
          return o;
        },
        Array: function ( a ) {
          for ( let i = 0 ; i < a.length ; i++ ) {
            a[i] = this.preprocessSpec(a[i]);
          }
          return a;
        }
      }, function (v) { return v; })
    }
  ]
});
