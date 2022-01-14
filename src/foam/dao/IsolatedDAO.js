/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'IsolatedDAO',
  extends: 'foam.dao.ProxyDAO',

  todo: [
    'put/remove should affect local select/find before commit',
    'commit() could be safer with a lock',
    'java implementation'
  ],

  documentation: `
    Stores a DAO operation but does not call the delegate until
    commit() is called.
  `,

  constants: [
    {
      name: 'COMMIT',
      type: 'String',
      value: 'foam.dao.IsolatedDAO.COMMIT'
    }
  ],

  classes: [
    {
      name: 'DAOOperation',

      properties: [
        {
          class: 'Enum',
          of: 'foam.dao.DOP',
          name: 'dop',
          documentation: 'DAO method associated with operation.'
        },
        {
          name: 'args',
          documentation: 'Arguments object associated with operation.'
        }
      ]
    }
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'FObject',
      name: 'q_',
      documentation: 'Queue for pending DAO operations.'
    }
  ],

  methods: [
    // This is similar to StoreAndForwardDAO, but we only want to override put and remove.
    function put_() { return this.store_(foam.dao.DOP.PUT_, arguments); },
    function remove_() { return this.store_(foam.dao.DOP.REMOVE_, arguments); },

    async function store_(methodName, args) {
      // Store DAO operations in order.
      var op = this.DAOOperation.create({
        methodName: methodName,
        args: args
      });
      this.q_.push(op);

      // Always succeed
      return args[0];
    },
    async function commit() {
      for ( let op of this.q_ ) {
        await this.delegate[op.dop.label].apply(this.delegate, op.args);
      }
      this.q_ = [];
    },
    {
      name: 'cmd_',
      code: function (x, obj) {
        if ( obj == this.COMMIT ) {
          return this.commit();
        }
        return this.delegate.cmd_(x, obj)
      }
    }
  ]
});