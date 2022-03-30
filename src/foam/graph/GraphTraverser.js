/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.graph',
  name: 'GraphTraverser',

  topics: ['process'],

  requires: [
    'foam.graph.TraversalOrder'
  ],

  properties: [
    {
      class: 'Enum',
      of: 'foam.graph.TraversalOrder',
      name: 'order',
      value: 'PRE_ORDER'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.graph.Graph',
      name: 'graph'
    },
    {
      class: 'Boolean',
      name: 'allowDuplicatePairs',
      documentation: `
        If true, "process" may be published for relationships already visited.
      `
    },
    'memo_'
  ],

  methods: [
    function step(x) {
      for ( const fn of x.sequence ) fn({ ...x });
    }
  ],

  actions: [
    function traverse() {
      this.memo_ = {};
      const RECUR = x => {
        const childNodes = x.current.forwardLinks.map(id => this.graph.data[id]);
        for ( const current of childNodes ) {
          this.step({ ...x, parent: x.current, current });
        }
      };
      const VISIT = x => {
        const memoKey = JSON.stringify([x.parent?.id, x.current?.id]);
        if ( this.memo_[memoKey] && ! this.allowDuplicatePairs ) return;
        this.memo_[memoKey] = true;
        this.process.pub(x)
      };
      const sequence = this.order === this.TraversalOrder.PRE_ORDER ?
        [RECUR, VISIT] : [VISIT, RECUR];
      for ( const current of this.graph.roots ) {
        this.step({ current, sequence });
      }
    }
  ]
});
