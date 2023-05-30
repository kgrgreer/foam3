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
      }
    },
    {
      documentation: 'Entry is eligible for compaction',
      name: 'compactible',
      class: 'Boolean',
      value: false
    },
    {
      documentation: 'An entry eligible for compaction is normally output only once, but if not reducible, then all copies are output',
      name: 'reducible',
      class: 'Boolean',
      value: true
    },
    {
      documentation: 'LifecycleAware objects which are deleted/removed are set to state DELETED, an r() journal entry is not created.  This option allows to compact DELETED entries.',
      name: 'compactLifecycleDeleted',
      class: 'Boolean',
      value: false
    },
    {
      documentation: 'Entry data can be clear after compaction',
      name: 'clearable',
      class: 'Boolean',
      value: true
    },
    {
      documentation: 'DAO specific Sink to control compaction. When null/undefined, a test for a facetted sink will occur',
      name: 'sink',
      class: 'FObjectProperty',
      of: 'foam.dao.Sink',
      view: { class: 'foam.u2.view.JSONTextView' }
    }
  ]
});
