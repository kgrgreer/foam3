/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'GroupedDAOTableWidget',
  extends: 'foam.dashboard.view.DAOTable',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      name: 'daoKey',
      documentation: 'Using daoKey as we want dao to be set to the result of the groupby'
    },
    {
      class: 'foam.mlang.ExprProperty',
      name: 'arg1'
    },
    {
      class: 'foam.mlang.SinkProperty',
      name: 'arg2'
    }
  ],

  methods: [
    async function init() {
      this.SUPER();
      var self = this;

      var coTxnPredicate = self.AND(
        self.INSTANCE_OF(self.COTransaction),
        self.EQ(self.Transaction.STATUS, self.TransactionStatus.COMPLETED)
      );

      result = await self.__subContext__[self.daoKey].where(coTxnPredicate)
        .select(self.GROUP_BY(
          self.arg1,
          self.arg2
        )
      );
      var a = [];
      for ( var i = 0; i < result.groupKeys.length; i ++ ) {
        var value = await self.format(result.groupKeys[i], result.groups[result.groupKeys[i]].value);
        a.push(value);
      };
      self.dao = foam.dao.ArrayDAO.create({ array: a  }, self);
    },
    function format(key, value) {
      return { id: key, value: value };
    }
  ]
});
