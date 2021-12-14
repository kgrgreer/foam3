/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'EmbeddedTableView',
  extends: 'foam.u2.View',
  mixins: ['foam.nanos.controller.MementoMixin'],

  requires: [
    'foam.comics.v2.DAOBrowseControllerView',
    'foam.comics.v2.DAOControllerConfig',
    'foam.u2.borders.CardBorder',
    'foam.u2.stack.StackBlock',
    'foam.u2.view.ScrollTableView',
    'foam.u2.table.TableView'
  ],

  imports: ['stack'],

  exports: [
    'click',
    'config'
  ],

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
  `,

  messages: [
    { name: 'VIEW_MORE', message: 'View More' }
  ],

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
    },
    {
      name: 'click',
      expression: function(config$click) {
        if ( config$click && typeof config$click === 'function' )
          return config$click;
        return function(obj, id) {
          if ( ! this.stack ) return;
          this.stack.push(foam.u2.stack.StackBlock.create({
          view: {
            class: 'foam.comics.v2.DAOSummaryView',
            data: obj,
            config: this.__context__.config,
            idOfRecord: id
          }, parent: this.__subContext__ }, this));
        };
      }
    }
  ],
  methods: [
    async function render() {
      this.currentMemento_ = this.memento;

      // Default controller config that would be used for nested tables if no menu config can be found.
      // Update this  to be a fallback for menuKeys when we have menuKeys for references, DAOproperties and relationships
      this.config.editPredicate =   foam.mlang.predicate.False.create();
      this.config.createPredicate = foam.mlang.predicate.False.create();
      this.config.deletePredicate = foam.mlang.predicate.False.create();

      if ( this.memento && this.memento.head == `&${this.data.of.name}` ) {
        this.openFullTable();
      } else {
        var daoCount = await this.data.select(this.Count.create()).then(s => { return s.value; });
        this.start(this.CardBorder).addClass(this.myClass('wrapper'))
          .start(this.TableView, {
            data: this.data.limit(this.rowsToDisplay),
            editColumnsEnabled: false,
            multiSelectEnabled: false,
            showPagination: false
          })
            .addClass(this.myClass())
          .end()
          .startContext({ data: this })
            .start(this.OPEN_TABLE, { label: `${this.VIEW_MORE} (${daoCount})`, buttonStyle: 'TERTIARY', themeIcon: 'plus' })
              .addClass(this.myClass('button'))
            .end()
          .endContext()
        .end();
      }
    },
    function openFullTable() {
      this.memento.head = `&${this.data.of.name}`;
      this.stack.push(this.StackBlock.create({
        view: {
          class: this.DAOBrowseControllerView,
          data$: this.data$,
          config$: this.config$
        }, parent: this.__subContext__.createSubContext({ controllerMode: 'CREATE' }) }));
    }
  ],
  actions: [
    {
      name: 'openTable',
      code: function() {
        this.openFullTable();
      }
    }
  ]
});
