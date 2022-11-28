/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'UnstyledTableView',
  extends: 'foam.u2.Element',

  documentation: `
  WARNING:This table view is not recieving functionality updates
              Use foam/u2/table/UnstyledTableView.js instead
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.core.SimpleSlot',
    'foam.dao.ProxyDAO',
    'foam.nanos.column.ColumnConfigToPropertyConverter',
    'foam.nanos.column.CommonColumnHandler',
    'foam.nanos.column.TableColumnOutputter',
    'foam.u2.CheckBox',
    'foam.u2.md.OverlayDropdown',
    'foam.u2.tag.Image',
    'foam.u2.table.TableHeaderComponent',
    'foam.u2.table.UnstyledTableRow',
    'foam.u2.view.EditColumnsView',
    'foam.u2.view.OverlayActionListView'
  ],

  exports: [
    'columns',
    'currentMemento_ as memento',
    'hoverSelection',
    'props',
    'selection',
    'subStack as stack'
  ],

  imports: [
    'auth?',
    'click?',
    'dblclick?',
    'editRecord?',
    'filteredTableColumns?',
    'memento',
    'selection? as importSelection',
    'stack?'
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
      class: 'foam.dao.DAOProperty',
      name: 'refDAO',
      factory: function() {
        return this.data;
      }
    },
    {
      name: 'order'
    },
    {
      name: 'columns_',
      factory: function() { return []; }
    },
    {
      name: 'allColumns',
    },
    {
      name: 'selectedColumnNames',
      expression: function(columns, of, memento, memento$head) {
        try {
          var ls = memento && memento.head.length != 0 ? memento.head.split(',').map(c => this.returnMementoColumnNameDisregardSorting(c)) : JSON.parse(localStorage.getItem(of.id));
          return ls || columns;
        } catch (x) {
          return columns;
        }
      }
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
      name: 'selection',
      expression: function(importSelection) { return importSelection || null; },
    },
    'hoverSelection',
    'dropdownOrigin',
    'overlayOrigin',
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
      expression: function(props) {
        return this.columns_.reduce((acc, col) => {
          return acc + (this.columnHandler.returnPropertyForColumn(this.props, this.of, col, 'tableWidth') || this.MIN_COLUMN_WIDTH_FALLBACK);
        }, this.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH) + 'px';
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
    {
      name: 'columnHandler',
      class: 'FObjectProperty',
      of: 'foam.nanos.column.CommonColumnHandler',
      factory: function() {
        return foam.nanos.column.CommonColumnHandler.create();
      }
    },
    {
      name: 'columnConfigToPropertyConverter',
      factory: function() {
        if ( ! this.__context__.columnConfigToPropertyConverter )
          return foam.nanos.column.ColumnConfigToPropertyConverter.create();
        return this.__context__.columnConfigToPropertyConverter;
      }
    },
    {
      name: 'subStack',
      factory: function() {
        // we export NoBackStack from table view,
        // so that actions which have stack.back worked just fine from DAOSummaryView
        // but had no effect on stack if the acction is called from context menu.
        // so if such an action is called from DAOSummaryView we go back to TableView
        // but if such an action is called from TableView we stay on the TableView screen
        return foam.nanos.approval.NoBackStack.create({delegate: this.stack});
      }
    },
    'currentMemento_',
    {
      class: 'Boolean',
      name: 'selectColumnsExpanded'
    }
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

    function updateColumns() {
      localStorage.removeItem(this.of.id);
      localStorage.setItem(this.of.id, JSON.stringify(this.selectedColumnNames.map(c => foam.String.isInstance(c) ? c : c.name )));

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

      const asyncRes = await this.filterUnpermitted(view.of.getAxiomsByClass(foam.core.Property).filter(p => ! p.hidden));
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
          this.memento.tail = foam.nanos.controller.Memento.create({value: '', parent: this.memento});
          this.currentMemento_ = this.memento.tail;
        }
      }

      //otherwise on adding new column creating new EditColumnsView, which is closed by default
      if ( view.editColumnsEnabled )
        var editColumnView = foam.u2.view.EditColumnsView.create({data:view}, this);

      if ( this.filteredTableColumns$ ) {
        this.onDetach(this.filteredTableColumns$.follow(
          //to not export "custom" table columns
          this.columns_$.map((cols) => this.columnHandler.mapArrayColumnsToArrayOfColumnNames(this.filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(this, cols)))
        ));
      }

      this.
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
                  style({ width: '42px' }).
                end();

                // Set up a listener so we can update the existing CheckBox
                // views when a user wants to select all or select none.
                view.onDetach(slot.value.dot('data').sub(function(_, __, ___, newValueSlot) {
                  var checked = newValueSlot.get();
                  view.allCheckBoxesEnabled_ = checked;

                  if ( checked ) {
                    view.selectedObjects = {};
                    view.refDAO.select(function(obj) {
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
                this.tag(view.TableHeaderComponent, { data: view, col: col, overrides: overrides, resizeable: false });
              }).

              // Render a th at the end for the column that contains the context
              // menu. If the column-editing feature is enabled, add that to the
              // th we create here.
              call(function() {
                this.start().
                  addClass(view.myClass('th')).
                  style({ flex: `0 0 ${view.EDIT_COLUMNS_BUTTON_CONTAINER_WIDTH}px`, 'text-align': 'unset!important;' }).
                  callIf(view.editColumnsEnabled, function() {
                    this.addClass(view.myClass('th-editColumns'))
                    .on('click', function(e) {
                      if ( ! view.selectColumnsExpanded )
                        view.selectColumnsExpanded = ! view.selectColumnsExpanded;
                    }).
                    tag(view.Image, { data: '/images/Icon_More_Resting.svg' }).
                    addClass(view.myClass('vertDots')).
                    addClass(view.myClass('noselect'))
                    ;
                  }).
                  tag('div', null, view.dropdownOrigin$).
                end();
              });
            })).
        end().
        callIf(view.editColumnsEnabled, function() {
          this.start(this.EditColumnsView, {
            data: view,
            selectColumnsExpanded$: this.selectColumnsExpanded$,
            parentId: this.id
            })
          .end();
        })
        .add(this.rowsFrom(this.data$proxy));
    },
    {
      name: 'rowsFrom',
      code: function(dao, top) {
        /**
         * Given a DAO, add a tbody containing the data from the DAO to the
         * table and return a reference to the tbody.
         *
         * NOTE: This exists so that ScrollTableView can create and manage
         * several different tbody elements inside the TableView it uses. It
         * needs to manage several tbody elements so it can provide performant
         * infinite scroll on tables of any size. So this method exists solely
         * as an implementation detail of ScrollTableView at the time of
         * writing.
         */
          var view = this;
          view.props = this.returnPropertiesForColumns(view, view.columns_);

          // with this code error created slot.get cause promise return
          // FIX ME
          var slot = this.slot(function(data, data$delegate, order, updateValues) {
            // Make sure the DAO set here responds to ordering when a user clicks
            // on a table column header to sort by that column.
            var proxy = view.ProxyDAO.create({ delegate: dao });
            if ( this.order ) proxy = proxy.orderBy(this.order);


            var canObjBeBuildFromProjection = true;

            for ( var p of view.props ) {
              if ( p.property.tableCellFormatter && ! p.property.cls_.hasOwnProperty('tableCellFormatter') ) {
                canObjBeBuildFromProjection = false;
                break;
              }
              if ( ! foam.lookup(p.property.cls_.id) ) {
                canObjBeBuildFromProjection = false;
                break;
              }
            }

            var propertyNamesToQuery             = view.columnHandler.returnPropNamesToQuery(view.props);
            var valPromises                      = view.returnRecords(view.of, proxy, propertyNamesToQuery, canObjBeBuildFromProjection);
            var nestedPropertyNamesAndItsIndexes = view.columnHandler.buildPropNameAndIndexArray(propertyNamesToQuery);

            var tbodyElement = this.E();
            tbodyElement.style({
                position: top ? 'absolute' : '',
                width: '100%',
                top: top ? top + 'px' : ''
              }).
              addClass(view.myClass('tbody'));
              valPromises.then(function(values) {
                for ( var i = 0 ; i < values.projection.length ; i++ ) {
                  tbodyElement
                    .startContext({
                      props: view.props,
                      propertyNamesToQuery:  propertyNamesToQuery,
                      nestedPropsAndIndexes: nestedPropertyNamesAndItsIndexes,
                      canBuildObjfromProj:   canObjBeBuildFromProjection
                    })
                      .tag(view.UnstyledTableRow, { data: view, obj: values.array[i], projection: values.projection[i], actionDAO: view.refDAO })
                    .endContext();
                }
              });

              return tbodyElement;
            });
          return slot;
        }
      },
      function returnRecords(of, dao, propertyNamesToQuery, useProjection) {
        var expr = foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder.create().buildProjectionForPropertyNamesArray(of, propertyNamesToQuery, useProjection);
        return dao.select(expr);
      },
      function doesAllColumnsContainsColumnName(obj, col) {
        return obj.allColumns.contains(obj.columnHandler.checkIfArrayAndReturnFirstLevelColumnName(col));
      },
      function filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(obj, columns) {
        return columns.filter( c => obj.allColumns.includes( obj.columnHandler.checkIfArrayAndReturnFirstLevelColumnName(c) ));
      },
      function returnPropertiesForColumns(obj, columns_) {
        var propertyNamesToQuery = columns_.length === 0 ? columns_ : [ 'id' ].concat(obj.filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(obj, columns_).filter(c => ! foam.core.Action.isInstance(obj.of.getAxiomByName(obj.columnHandler.propertyNamesForColumnArray(c)))).map(c => obj.columnHandler.propertyNamesForColumnArray(c)));
        return obj.columnConfigToPropertyConverter.returnPropertyColumnMappings(obj.of, propertyNamesToQuery);
      },
      function shouldColumnBeSorted(c) {
        return c[c.length - 1] === this.DESCENDING_ORDER_CHAR || c[c.length - 1] === this.ASCENDING_ORDER_CHAR;
      },
      function returnMementoColumnNameDisregardSorting(c) {
        return c && this.shouldColumnBeSorted(c) ? c.substr(0, c.length - 1) : c;
      },
      async function filterUnpermitted(arr) {
        if ( this.auth ) {
          var permissionedProperties = [];
          var unpermissionedProperties = [];
          for ( prop of arr ) {
            if ( prop.hidden ) continue;
            prop.readPermissionRequired ? permissionedProperties.push(prop) : unpermissionedProperties.push(prop);
          }
          var grantedProperties = await this.filterPropertiesByReadPermission(permissionedProperties, this.of.name.toLowerCase());
          var unorderedProperties = unpermissionedProperties.concat(grantedProperties);
          var orderedProperties = arr.filter(p => unorderedProperties.includes(p));
          const columnPermissionedProperties = await Promise.all(orderedProperties.map( async p =>
            ! p.columnPermissionRequired ||
            await this.auth.check(ctrl.__subContext__, `${this.of.name.toLowerCase()}.column.${p.name}`)));
          return orderedProperties.filter((_v, index) => columnPermissionedProperties[index]);
        }
        return arr;
      },
      async function filterPropertiesByReadPermission(properties, of) {
        if ( ! properties || ! of ) return [];
        var perms =  await Promise.all(properties.map( async p =>
          await this.auth.check(ctrl.__subContext__, of + '.rw.' + p) ||
          await this.auth.check(ctrl.__subContext__, of + '.ro.' + p)
        ));
        return properties.filter((_v, index) => perms[index]);
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
    {
      name: 'shouldEscapeEvts',
      documentation: `Use this function to skip clicks/doubleclicks on table
                      elements such as checkboxes/context menus`,
      code: function(evt) {
        // If we're clicking somewhere to close the context menu or other inputs,
        // don't do anything.
        if (
          evt.target.nodeName === 'DROPDOWN-OVERLAY' ||
          evt.target.classList.contains(this.myClass('vertDots')) || evt.target.nodeName === 'INPUT'
        ) {
          return true;
        }
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
