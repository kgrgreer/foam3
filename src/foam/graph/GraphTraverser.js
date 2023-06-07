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
      class: 'Enum',
      of: 'foam.graph.WeightPriorityStrategy',
      name: 'weightPriorityStrategy',
      value: 'NONE'
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
    'memo_',
    {
      class: 'Map',
      documentation: `
        Essentially stores a set.
        Key is 'node:descendant'.
        Value is 'true'
      `,
      name: 'nodeToDescendants'
    },
    {
      class: 'StringArray',
      name: 'currentPath'
    }
  ],

  methods: [
    function step(x) {
      for ( const fn of x.sequence ) fn({ ...x });
    },
    function updateNodeToDescendants(currentNodeId) {
      this.currentPath.forEach(ancestorId => {
        this.nodeToDescendants[`${ancestorId}:${currentNodeId}`] = true
      });
    },

    function addToCurrentPath(currentNodeId){
      this.currentPath.push(currentNodeId);
    },

    function removeFromCurrentPath(currentNodeId){
      this.currentPath.filter(nodeId => nodeId !== currentNodeId);
    }
  ],

  actions: [
    function traverse() {
      this.memo_ = {};
      const RECUR = x => {
        const forwardLinks = x.current.forwardLinks;

        if ( this.weightPriorityStrategy == this.weightPriorityStrategy.MIN ){
          forwardLinks.sort((l1,l2) => l1.weight - l2.weight);
        }

        if ( this.weightPriorityStrategy == this.weightPriorityStrategy.MAX ){
          forwardLinks.sort((l1,l2) => l2.weight - l1.weight)
        }

        const childNodes = forwardLinks.map(link => this.graph.data[link.id]);

        for ( const current of childNodes ) {
          this.updateNodeToDescendants(current.id);

          this.addToCurrentPath(current.id);

          this.step({ ...x, parent: x.current, current });

          this.removeFromCurrentPath(current.id);
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
        this.addToCurrentPath(current.id);

        this.step({ current, sequence });

        this.removeFromCurrentPath(current.id);
      }
    }
  ]
});
