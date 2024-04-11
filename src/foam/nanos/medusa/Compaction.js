/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'Compaction',
  documentation: `Compaction dumps the current system out to new ledger files, in a effort to reduce replay time.  Each DAO operation on the same object generates a unique MedusaEntry containing just the change on the object.  In time there are multiple MedusaEntry's for the same object.  Compaction writes out each object in entirety once, thus reducing the multiple MedusaEntry's to just one.
`,

  ids: ['nSpec'],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      name: 'nSpec',
      label: 'NSpec',
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
      documentation: `DAO is eligible for compaction, meaning it's entries will be reduced. If compaction is disabled (false), then the DAO's entries will be discarded - they will not be compacted into a new ledger.`,
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
    },
    {
      documentation: 'An nspec is eligible for reading into a medusa system for bootstrapping.',
      name: 'loadable',
      class: 'Boolean',
      value: true
    },
    {
      documentation: 'Name for JDAO creation during loading. Default is best gues. Required when nspec has JDAO setup outside of EasyDAO.',
      name: 'journalName',
      class: 'String',
      javaFactory: `
      var name = getNSpec();
      name = name.replace("DAO", "");
      name = name.replace("local", "");
      name = name.toLowerCase();
      name = name + "s";
      return name;
      `
    }
  ]
});
