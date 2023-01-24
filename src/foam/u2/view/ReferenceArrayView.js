/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReferenceArrayView',
  extends: 'foam.u2.view.ArrayView',

  properties: [
    {
      class: 'String',
      name: 'daoKey'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      expression: function(daoKey) {
        return this.__context__[daoKey];
      }
    },
    {
      name: 'valueView',
      expression: function(dao) {
        return {
          class: 'foam.u2.view.ReferenceView',
          dao: dao,
          defaultValue: '',
          disabledData$: this.disabledData_$
        };
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( ! this.allowDuplicates) {
        // Get array size for limiting assignment of array items
        this.dao.select(this.Count.create()).then(c => this.arrayLength_ = c.value);
      }
    }
  ]
});
