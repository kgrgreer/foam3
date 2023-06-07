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

      result = await self.__subContext__[self.daoKey].where(self.predicate)
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
  ],

  listeners: [
    {
      name: 'fetchValues',
      code: function() {
        var self = this;
        if ( ! this.dao ) return;
        this.dao.limit(this.limit).select().then(objects => {
          var fetchedValues = objects.array;
          if ( JSON.stringify(self.currentValues.map(o => o.id)) != JSON.stringify(fetchedValues.map((o) => o.id)) ) {
            self.currentValues = fetchedValues;
          }
        });
      }
    }
  ]
});
