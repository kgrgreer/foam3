/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'Compaction',

  ids: ['nSpec'],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      name: 'nSpec',
      label: 'NSpec',
      visibility: 'RO',
      tableWidth: 225,
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'DAO',
              dao: X.nSpecDAO
                .where(E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO'))
                .orderBy(foam.nanos.boot.NSpec.ID)
            }
          ]
        };
      },
    },
    {
      name: 'compactible',
      class: 'Boolean',
      value: false
    },
    {
      name: 'clearable',
      class: 'Boolean',
      value: true
    }
  ]
});
