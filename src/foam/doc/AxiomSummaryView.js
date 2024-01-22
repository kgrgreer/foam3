/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomSummaryView',
  extends: 'foam.u2.View',

  requires: [
    'foam.doc.Axiom',
    'foam.doc.AxiomTableView',
    'foam.doc.dao.AxiomDAO',
    'foam.mlang.sink.Count'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'String',
      name: 'modelId'
    },
    {
      class: 'Class',
      name: 'of',
      value: 'foam.doc.Axiom'
    },
    {
      name: 'axiomDAO',
      expression: function(modelId) {
        return this.AxiomDAO.create({ modelIds: [modelId] })
      }
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'Boolean',
      name: 'sort'
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var of             = this.of;
      var title          = this.title;
      var modelId        = this.modelId;
      var AxiomTableView = this.AxiomTableView;

      var dao = this.axiomDAO.where(
        this.AND(
          this.INSTANCE_OF(of),
          this.EQ(this.Axiom.HAS_PERMISSION, true),
          this.EQ(this.Axiom.PARENT_ID, modelId)));

      if ( this.sort ) dao = dao.orderBy(this.Axiom.NAME);

      dao.select(this.COUNT()).then(c => {
        if ( ! c.value ) return;
        if ( title ) this.start('h4').add(title).end();
        this.tag(AxiomTableView, { data: dao, of: of });
      });
    }
  ]
});
