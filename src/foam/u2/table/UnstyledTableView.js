/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.table',
  name: 'UnstyledTableView',
  extends: 'foam.u2.table.TableComponentView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.SimpleSlot',
    'foam.comics.v2.DAOControllerConfig',
    'foam.dao.ProxyDAO',
    'foam.nanos.column.TableColumnOutputter',
    'foam.u2.CheckBox',
    'foam.u2.layout.Rows',
    'foam.u2.layout.Cols',
    'foam.u2.stack.StackBlock',
    'foam.u2.table.TableHeaderComponent',
    'foam.u2.tag.Image',
    'foam.u2.view.EditColumnsView',
    'foam.u2.view.LazyScrollManager',
    'foam.u2.view.OverlayActionListView'
  ],

  exports: [
    'columns',
    'colWidthUpdated',
    'config',
    'currentMemento_ as memento',
    'nestedPropsAndIndexes',
    'props',
    'propertyNamesToQuery',
    'selectedColumnsWidth',
    'selectedObjects',
    'selection'
  ],

  imports: [
    'auth?',
    'config? as importedConfig',
    'filteredTableColumns?',
    'memento',
    'stack?',
    'selection? as importSelection'
  ],

  constants: [
    {
      type: 'Int',
      name: 'MIN_COLUMN_WIDTH_FALLBACK',
      value: 100
    },
    {
      type: 'Int',
      name: 'EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH',
      value: 60
    },
    {
      type: 'Int',
      name: 'CHECKBOX_CONTAINER_WIDTH',
      value: 42
    },
    {
      type: 'Char',
      name: 'DESCENDING_ORDER_CHAR',
      value: '-'
    },
    {
      type: 'Char',
      name: 'ASCENDING_ORDER_CHAR',
      value: '+'
    }
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'data',
      postSet: function(_, data) {
        if ( ! this.of && data ) this.of = data.of;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        if ( this.importedConfig )
          return this.importedConfig;
        return this.DAOControllerConfig.create({ dao: this.data });
      }
    },
    {
      name: 'selection',
      expression: function(importSelection) { return importSelection || null; },
    },
    {
      name: 'order'
    },
    //TODO: CLEAN UP ALL THESE COLUMN PROPS...
    {
      name: 'columns_',
      factory: function() { return []; }
    },
    {
      name: 'allColumns',
    },
    {
      name: 'selectedColumnNames',
      expression: function(columns, of, memento) {
        var ls = memento && memento.head.length != 0 ?
          memento.head.split(',').map(c => this.returnMementoColumnNameDisregardSorting(c)) :
          JSON.parse(localStorage.getItem(of.id))?.map(c => foam.Array.isInstance(c) ? c[0] : c)
        return ls || columns;
      }
    },
    {
      name: 'selectedColumnsWidth',
      factory: function() {
        var local = {};
        JSON.parse(localStorage.getItem(this.of.id))?.map(c => {
          foam.Array.isInstance(c) ?
          local[c[0]] = c[1] :
          local[c] = undefined;
        });
        return local;
      }
    },
    {
      class: 'Boolean',
      name: 'colWidthUpdated',
      documentation: `used to trigger/listen to columnWidth changes as they are stored
        in an object where value cahnges do not trigger slots`
    },
    {
      name: 'columns',
      expression: function(of, allColumns, isColumnChanged) {
        if ( ! of ) return [];
        var tc = of.getAxiomByName('tableColumns');
        return tc ? tc.columns : allColumns;
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'contextMenuActions',
      documentation: `
        Each table row has a context menu that contains actions you can perform
        on the object in that row. The actions used to populate that menu come
        from two different sources. The first source is this property. If you
        want a context menu action to do something in the view, then you should
        write the code for that action in the view model and pass it to the
        table view via this property. The second source of actions is from the
        model of the object being shown in the table.
      `
    },
    {
      class: 'Boolean',
      name: 'editColumnsEnabled',
      value: true,
      documentation: 'Set this to true to let the user select columns.'
    },
    {
      class: 'Boolean',
      name: 'disableUserSelection',
      value: false,
      documentation: 'Ignores selection by user.'
    },
    {
      name: 'restingIcon',
      documentation: 'Image for grayed out double arrow when table header is not sorting',
      value: '/images/resting-arrow.svg'
    },
    {
      name: 'ascIcon',
      documentation: 'Image for table header ascending sorting arrow',
      value: '/images/up-arrow.svg'
    },
    {
      name: 'descIcon',
      documentation: 'Image for table header descending sorting arrow',
      value: '/images/down-arrow.svg'
    },
    {
      type: 'Boolean',
      name: 'showHeader',
      value: true,
      documentation: 'Set to false to not render the header.'
    },
    {
      class: 'Boolean',
      name: 'multiSelectEnabled',
      documentation: 'Set to true to support selecting multiple table rows.'
    },
    {
      class: 'Map',
      name: 'selectedObjects',
      documentation: `
        The objects selected by the user when multi-select support is enabled.
        It's a map where the key is the object id and the value is the object.
      `
    },
    {
      name: 'idsOfObjectsTheUserHasInteractedWith_',
      factory: function() {
        return {};
      }
    },
    {
      name: 'checkboxes_',
      documentation: 'The checkbox elements when multi-select support is enabled. Used internally to implement the select all feature.',
      factory: function() {
        return {};
      }
    },
    {
      class: 'Boolean',
      name: 'togglingCheckBoxes_',
      documentation: 'Used internally to improve performance when toggling all checkboxes on or off.'
    },
    {
      class: 'Boolean',
      name: 'allCheckBoxesEnabled_',
      documentation: 'Used internally to denote when the user has pressed the checkbox in the header to enable all checkboxes.'
    },
    {
      class: 'Int',
      name: 'tableWidth_',
      documentation: 'Width of the whole table. Used to get proper scrolling on narrow screens.',
      expression: function(props, colWidthUpdated, multiSelectEnabled, editColumnsEnabled) {
        var self = this;
        var base = 0;
        if ( this.multiSelectEnabled ) base += this.CHECKBOX_CONTAINER_WIDTH;
        if ( this.editColumnsEnabled ) base += this.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH;
        return this.columns_.reduce((acc, col) => {
          var width = this.selectedColumnsWidth[self.columnHandler.propertyNamesForColumnArray(col)];
          return acc + (width || this.columnHandler.returnPropertyForColumn(this.props, this.of, col, 'tableWidth') || this.MIN_COLUMN_WIDTH_FALLBACK);
        }, base) + 'px';
      }
    },
    {
      name: 'isColumnChanged',
      class: 'Boolean',
      value: false,
      documentation: 'If isColumnChanged is changed, columns_ will be updated'
    },
    {
      name: 'outputter',
      factory: function() {
        return this.TableColumnOutputter.create();
      }
    },
    {
      name: 'props',
      expression: function(of, columns_) {
        return this.returnPropertiesForColumns(this, columns_);
      }
    },
    {
      name: 'updateValues',
      class: 'Boolean',
      value: false,
      documentation: 'If isColumnChanged is changed, columns_ will be updated'
    },
    'currentMemento_',
    {
      name: 'propertyNamesToQuery',
      expression: function(props) {
        return this.columnHandler.returnPropNamesToQuery(props);
      }
    },
    {
      class: 'Boolean',
      name: 'canObjBeBuildFromProjection',
      value: undefined,
      expression: function(props) {
        for ( var p of props ) {
          if ( p.property.tableCellFormatter && ! p.property.cls_.hasOwnProperty('tableCellFormatter') ) {
            return false;
          }
          if ( ! foam.lookup(p.property.cls_.id) ) {
            return false;
          }
        }
        return true;
      }
    },
    {
      name: 'nestedPropsAndIndexes',
      expression: function(propertyNamesToQuery) {
        return this.columnHandler.buildPropNameAndIndexArray(propertyNamesToQuery);
      }
    },
    {
      name: 'groupBy',
      description: 'Property that stores the current column that the table is being grouped by'
    },
    {
      class: 'Boolean',
      name: 'showPagination',
      value: true
    },
    'tableEl_',
    'scrollEl_',
    ['tableHeadHeight', 52]
  ],

  methods: [
    function sortBy(column) {
      var isNewOrderDesc = this.order === column;
      this.order = isNewOrderDesc ?
        this.DESC(column) :
        column;

      if ( ! this.memento || this.memento.head.length == 0 )
        return;

      var columns = this.memento.head.split(',');
      var mementoColumn = columns.find(c => this.returnMementoColumnNameDisregardSorting(c) === column.name)
      var orderChar = isNewOrderDesc ? this.DESCENDING_ORDER_CHAR : this.ASCENDING_ORDER_CHAR;
      if ( ! mementoColumn ) {
        columns.push(column.name + orderChar);
      } else {
        var index = columns.indexOf(mementoColumn);
        columns[index] = column.name + orderChar;
      }
      this.memento.head = columns.join(',');
    },
    function groupByCol(column) {
      this.groupBy = column;
    },
    function updateColumns() {
      this.updateLocalStorage();
      if ( ! this.memento )
        return;

      var newMementoColumns = [];
      for ( var s of this.selectedColumnNames ) {
        var columns = [];
        if ( this.memento.head.length != 0 )
          columns = this.memento.head.split(',');
        var col = columns.find(c => this.returnMementoColumnNameDisregardSorting(c) === s);
        if ( ! col ) {
          newMementoColumns.push(s);
        } else {
          newMementoColumns.push(col);
        }
      }
      this.memento.head = newMementoColumns.join(',');

      this.isColumnChanged = ! this.isColumnChanged;
    },

    async function render() {
      var view = this;
      var nextViewMemento;
      const asyncRes = await this.filterUnpermitted(view.of.getAxiomsByClass(foam.core.Property));
      this.allColumns = ! view.of ? [] : [].concat(
        asyncRes.map(a => a.name),
        view.of.getAxiomsByClass(foam.core.Action)
        .map(a => a.name).filter( a => view.of.getAxiomByName('tableColumns') ? view.of.getAxiomByName('tableColumns').columns.includes(a) : false)
      );

      this.columns$.sub(this.updateColumns_);
      this.of$.sub(this.updateColumns_);
      this.editColumnsEnabled$.sub(this.updateColumns_);
      this.selectedColumnNames$.sub(this.updateColumns_);
      this.allColumns$.sub(this.updateColumns_);
      this.updateColumns_();

      this.onDetach(this.colWidthUpdated$.sub(this.updateLocalStorage));
      //set memento's selected columns
      if ( this.memento ) {
        if ( this.memento.head.length != 0 ) {
          var columns = this.memento.head.split(',');
          for ( var c of columns ) {
            if ( this.shouldColumnBeSorted(c) && ! c.includes('.')) {
              var prop = view.props.find(p => p.fullPropertyName === c.substr(0, c.length - 1) );
              if ( prop ) {
                if ( c[c.length - 1] === this.DESCENDING_ORDER_CHAR )
                  this.order = this.DESC(prop.property);
                else
                  this.order = prop.property;
              }
            }
          }
        } else {
          this.memento.head = this.columns_.map(c => {
            return this.columnHandler.propertyNamesForColumnArray(c);
          }).join(',');
        }
        if ( ! this.memento.tail ) {
          this.memento.tail = foam.nanos.controller.Memento.create({value: '', parent: this.memento}, this);
        }
        this.currentMemento_= this.memento.tail
        var nextViewMemento = this.currentMemento_.tail;
      }

      if ( nextViewMemento && nextViewMemento.head.length != 0 ) {
        if ( nextViewMemento.head == 'create' ) {
          this.stack.push(this.StackBlock.create({
            view: {
              class: 'foam.comics.v2.DAOCreateView',
              data: ((this.config.factory && this.config.factory$cls) ||  this.data.of).create({ mode: 'create'}, this),
              config$: this.config$,
              of: this.data.of
            }, parent: this.__subContext__.createSubContext({ memento: this.currentMemento_ })
          }));
        } else if ( nextViewMemento.tail && nextViewMemento.tail.head ) {
          var id = nextViewMemento.tail.head;
          if ( ! foam.core.MultiPartID.isInstance(this.data.of.ID) ) {
            id = this.data.of.ID.fromString(id);
          } else {
            id = this.data.of.ID.of.create();
            mementoHead = '{' + nextViewMemento.tail.head.replaceAll('=', ':') + '}';
            var idFromJSON = foam.json.parseString(mementoHead);
            for ( var key in idFromJSON ) {
              var axiom = this.data.of.getAxiomByName(key);

              if ( axiom )
                axiom.set(id, idFromJSON[key]);
            }
          }
          this.config.dao.inX(ctrl.__subContext__).find(id).then(v => {
            if ( ! v ) return;
            if ( self.state != self.LOADED ) return;
            this.stack.push(this.StackBlock.create({
              view: {
                class: 'foam.comics.v2.DAOSummaryView',
                data: null,
                config: this.config,
                idOfRecord: id
              }, parent: this.__subContext__.createSubContext({ memento: nextViewMemento })
            }));
          });
        }
      }
      if ( view.editColumnsEnabled )
        var editColumnView = foam.u2.view.EditColumnsView.create({data:view}, this);

      if ( this.filteredTableColumns$ ) {
        this.onDetach(this.filteredTableColumns$.follow(
          //to not export "custom" table columns
          this.columns_$.map((cols) => this.columnHandler.mapArrayColumnsToArrayOfColumnNames(this.filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(this, cols)))
        ));
      }
      this.start(this.Rows)
        .enableClass(this.myClass('full-height'), this.showPagination$)
        .start('', {}, this.tableEl_$).addClass(this.myClass('table-wrapper'))
        .start().
          addClass(this.myClass()).
          addClass(this.myClass(this.of.id.replace(/\./g, '-'))).
          start().
            addClass(this.myClass('thead')).
            style({ 'min-width': this.tableWidth_$ }).
            show(this.showHeader$).
            add(this.slot(function(columns_) {
              view.props = this.returnPropertiesForColumns(view, columns_);
              view.updateValues = ! view.updateValues;

              return this.E().
                addClass(view.myClass('tr')).

                // If multi-select is enabled, then we show a checkbox in the
                // header that allows you to select all or select none.
                callIf(view.multiSelectEnabled, function() {
                  var slot = view.SimpleSlot.create();
                  this.start().
                    addClass(view.myClass('th')).
                    tag(view.CheckBox, {}, slot).
                    style({ width: `${this.CHECKBOX_CONTAINER_WIDTH}px`, 'min-width': `${this.CHECKBOX_CONTAINER_WIDTH}px` }).
                  end();

                  // Set up a listener so we can update the existing CheckBox
                  // views when a user wants to select all or select none.
                  view.onDetach(slot.value.dot('data').sub(function(_, __, ___, newValueSlot) {
                    var checked = newValueSlot.get();
                    view.allCheckBoxesEnabled_ = checked;

                    if ( checked ) {
                      view.selectedObjects = {};
                      view.data.select(function(obj) {
                        view.selectedObjects[obj.id] = obj;
                      });
                    } else {
                      view.selectedObjects = {};
                    }

                    // Update the existing CheckBox views.
                    view.togglingCheckBoxes_ = true;
                    Object.keys(view.checkboxes_).forEach(function(key) {
                      view.checkboxes_[key].data = checked;
                    });
                    view.togglingCheckBoxes_ = false;
                  }));
                }).

                // Render the table headers for the property columns.
                forEach(columns_, function([col, overrides]) {
                  this.tag(view.TableHeaderComponent, { data: view, col: col, overrides: overrides });
                }).

                // Render a th at the end for the column that contains the context
                // menu. If the column-editing feature is enabled, add that to the
                // th we create here.
                call(function() {
                  this.start().
                    addClass(view.myClass('th')).
                    style({
                      flex: `0 0 ${view.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH}px`,
                      'min-width': view.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH,
                      'text-align': 'unset!important;'
                    }).
                    callIf(view.editColumnsEnabled, function() {
                      this.addClass(view.myClass('th-editColumns'))
                      .on('click', function(e) {
                        editColumnView.parentId = this.id;
                        if ( ! editColumnView.selectColumnsExpanded )
                          editColumnView.selectColumnsExpanded = ! editColumnView.selectColumnsExpanded;
                      }).
                      tag(view.Image, { data: '/images/Icon_More_Resting.svg' }).
                      addClass(view.myClass('vertDots')).
                      addClass(view.myClass('noselect'))
                      ;
                    }).
                  end();
                });
              })).
          end().
          callIf(view.editColumnsEnabled, function() {this.add(editColumnView);})
          .start().addClass(view.myClass('tbody'))
            .tag(view.LazyScrollManager, {
                data$: view.data$,
                order$: view.order$,
                rowView: { class: 'foam.u2.table.UnstyledTableRow', data: view },
                groupHeaderView: { class: 'foam.u2.table.UnstyledTableGroup', data: view },
                rootElement: this.tableEl_,
                ctx: view,
                prepDAO: view.prepDAO,
                groupBy$: view.groupBy$,
                offsetTop: view.tableHeadHeight
            }, view.scrollEl_$)
          .end()
        .end().end()
        .add(this.slot(showPagination => {
          var buttonStyle = { label: '', buttonStyle: 'TERTIARY', size: 'SMALL' };
          return showPagination ?
          this.E().start(view.Cols).addClass(view.myClass('nav')).style({ 'justify-content': 'flex-end'}). // Have to do this here because Cols CSS is installed after nav. Investigate later
            startContext({ data: view.scrollEl_ }).
              start(view.Cols).
                style({ gap: '4px', 'box-sizing': 'border-box' }).
                start('').add(view.scrollEl_$.dot('topRow')).addClass(this.myClass('counters')).end().
                add('-').
                start('').add(view.scrollEl_$.dot('bottomRow')).addClass(this.myClass('counters')).end().
                start().addClass(view.myClass('separator')).translate(this.cls_.id + '.MESSAGE_OF', this.MESSAGE_OF).end().add(view.scrollEl_.daoCount$).
              end().
              start(view.scrollEl_.FIRST_PAGE, { ...buttonStyle, themeIcon: 'first' }).
              addClass(view.myClass('buttons')).end().
              start(view.scrollEl_.PREV_PAGE, { ...buttonStyle, themeIcon: 'back' }).
              addClass(view.myClass('buttons')).end().
              start(view.scrollEl_.NEXT_PAGE, { ...buttonStyle, themeIcon: 'next' }).
              addClass(view.myClass('buttons')).end().
              start(view.scrollEl_.LAST_PAGE, {  ...buttonStyle, themeIcon: 'last' }).
              addClass(view.myClass('buttons')).end().
            endContext().end() : this.E();
        }))
        .end().end();
        this.onDetach(this.updateValues$.sub(this.scrollEl_.refresh));
    },
    {
      name: 'prepDAO',
      code: function(dao, ctx) {
        return ctx.returnRecords(ctx.of, dao, ctx.propertyNamesToQuery, ctx.canObjBeBuildFromProjection);
      }
    },
    {
      name: 'getActionsForRow',
      code: function(obj) {
        var actions = {};
        var actionsMerger = action => { actions[action.name] = action; };

        // Model actions
        obj.cls_.getAxiomsByClass(foam.core.Action).forEach(actionsMerger);
        // Context menu actions
        this.contextMenuActions.forEach(actionsMerger);

        return actions;
      }
    }
  ],

  listeners: [
    function resetColWidths() {
      this.selectedColumnsWidth = {};
      for ( var s of this.selectedColumnNames ) {
        this.selectedColumnsWidth[s] = this.columnHandler.returnPropertyForColumn(this.props, this.of, s, 'tableWidth') || null;
      }
    },
    {
      name: 'updateLocalStorage',
      isMerged: true,
      mergeDelay: 5000,
      code: function() {
        localStorage.removeItem(this.of.id);
        localStorage.setItem(this.of.id, JSON.stringify(this.selectedColumnNames.map(c => {
          var name = foam.String.isInstance(c) ? c : c.name;
          var size = this.selectedColumnsWidth[name] == undefined ? undefined : this.selectedColumnsWidth[name];
          return [name, size];
        })));
      }
    },
    {
      name: 'updateColumns_',
      isFramed: true,
      code: function() {
        if ( ! this.of ) return [];
        var auth = this.auth;
        var self = this;
        var cols = this.editColumnsEnabled ? this.selectedColumnNames : this.columns || this.allColumns;
        Promise.all(this.filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(this, cols).map(
          c => foam.Array.isInstance(c) ?
            c :
            [c, null]
        ).map(c =>{
          return c;
        }))
        .then(columns => this.columns_ = columns.filter(c => c));
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.table',
  name: 'TableViewPropertyRefinement',
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'Boolean',
      name: 'columnHidden'
    },
    {
      class: 'Boolean',
      documentation: `
        When set to true, the '<model>.column.<property>' permission is required for a
        user to be able to read this property. If false, any user can see the
        value of this property in a table column.
      `,
      name: 'columnPermissionRequired'
    }
  ]
});


foam.CLASS({
  package: 'foam.u2.table',
  name: 'PropertyColumnMapping',
  properties: [
    {
      name: 'fullPropertyName',
      class: 'String'
    },
    {
      name: 'property',
      class: 'FObjectProperty',
      of: 'Property'
    }
  ]
});
