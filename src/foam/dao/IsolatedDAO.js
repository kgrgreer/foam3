/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'IsolatedDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Stores a DAO operation but does not call the delegate until
    commit() is called.
  `,

  classes: [
    {
      name: 'DAOOperation',

      properties: [
        {
          class: 'String',
          documentation: 'DAO method name associated with operation.',
          name: 'methodName',
        },
        {
          documentation: 'Arguments object associated with operation.',
          name: 'args',
        },
      ]
    }
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'FObject',
      // of: 'DAOOperation',
      documentation: 'Queue for pending DAO operations.',
      name: 'q_',
    },
  ],

  methods: [
    // This is similar to StoreAndForwardDAO, but we only want to override put and remove.
    function put_() { return this.store_(foam.dao.DOP.PUT_.label, arguments); },
    function remove_() { return this.store_(foam.dao.DOP.REMOVE_.label, arguments); },

    async function store_(methodName, args) {
      // Store DAO operations in order.
      var op = this.DAOOperation.create({
        methodName: methodName,
        args: args,
      });
      this.q_.push(op);

      // Always succeed
      return args[0];
    },
    async function commit() {
      for ( let op of this.q_ ) {
        await this.delegate[op.methodName].apply(this.delegate, op.args);
      }
    }
  ]
});