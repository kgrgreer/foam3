/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TableSummaryView',
  extends: 'foam.u2.View',
  mixins: ['foam.nanos.controller.MementoMixin'],

  requires: [
    'foam.comics.v2.DAOBrowseControllerView',
    'foam.u2.borders.CardBorder',
    'foam.u2.view.ScrollTableView'
  ],

  imports: ['stack'],

  documentation: `A summary view for tables that shows the first n rows 
  in a table with an action to expand the table to DAOBrowseControllerView`,

  css: `
    ^button{
      max-height: 56px;
      width: 100%;
    }
    ^wrapper{
      box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.1);
      padding: 0px;
    }
    ^ > .foam-u2-view-TableView-thead > .foam-u2-view-TableView-tr {
      border-radius: 4px 4px 0 0;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'rowsToDisplay',
      value: 2
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return this.DAOControllerConfig.create({ dao: this.data });
      }
    }
  ],
  methods: [
    async function initE() {
      this.initMemento();
      var daoCount = await this.data.select(this.Count.create()).then(s => { return s.value; });
      this.start(this.CardBorder).addClass(this.myClass('wrapper'))
        .start(this.ScrollTableView, { data: this.data.limit(this.rowsToDisplay), editColumnsEnabled: false, multiSelectEnabled: false })
          .on('click', this.tableClick)
          .addClass(this.myClass())
        .end()
        .startContext({ data: this })
          .start(this.OPEN_TABLE, { label: `View More (${daoCount})`, buttonStyle: 'TERTIARY', themeIcon: 'plus' })
            .addClass(this.myClass('button'))
          .end()
        .endContext()
      .end();
    }
  ],
  actions: [
    {
      name: 'openTable',
      code: function() {
        //Add Memento support
        console.log(this.memento.head);
        this.memento.head = `&${this.data.delegate.id}`;
        this.stack.push({
          class: this.DAOBrowseControllerView,
          data: this.data
        }, this);
      }
    }
  ]
});
