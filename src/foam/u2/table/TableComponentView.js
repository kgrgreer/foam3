/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.table',
  name: 'TableComponentView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.column.ColumnConfigToPropertyConverter',
    'foam.nanos.column.CommonColumnHandler',
    'foam.nanos.column.ExpressionForArrayOfNestedPropertiesBuilder'
  ],

  imports: ['columnConfigToPropertyConverter as importedColumnConfigConverter'],

  properties: [
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
        if ( ! this.importedColumnConfigConverter )
          return foam.nanos.column.ColumnConfigToPropertyConverter.create();
        return this.importedColumnConfigConverter;
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
      },
    }
  ],

  methods: [
    function returnRecords(of, dao, propertyNamesToQuery, useProjection) {
      var expr = this.ExpressionForArrayOfNestedPropertiesBuilder.create().buildProjectionForPropertyNamesArray(of, propertyNamesToQuery, useProjection);
      return dao.select(expr);
    },
    function doesAllColumnsContainsColumnName(obj, col) {
      return obj.allColumns.contains(obj.columnHandler.checkIfArrayAndReturnFirstLevelColumnName(col));
    },
    function filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(obj, columns) {
      return columns.filter( c => obj.allColumns.includes( obj.columnHandler.checkIfArrayAndReturnFirstLevelColumnName(c) ));
    },
    function returnPropertiesForColumns(obj, columns_) {
      var propertyNamesToQuery = columns_.length === 0 ? columns_ : [ 'id' ].concat(obj.filterColumnsThatAllColumnsDoesNotIncludeForArrayOfColumns(obj, columns_).filter(c => ! foam.core.Action.isInstance(obj.of.getAxiomByName(obj.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(c)))).map(c => obj.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(c)));
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
        const results = await Promise.all(arr.map( async p =>
          p.hidden ? false :
          ! p.columnPermissionRequired ||
          await this.auth.check(ctrl.__subContext__, `${this.of.name.toLowerCase()}.column.${p.name}`)));
        return arr.filter((_v, index) => results[index]);
      }
      return arr;
    },
    function getCellData(obj, prop, nestedPropertiesObjsMap) {
      var objForCurrentProperty = obj;
      var propName = this.columnHandler.checkIfArrayAndReturnPropertyNamesForColumn(prop);
      var prop = this.props.find(p => p.fullPropertyName === propName);
      //check if current column is a nested property
      //if so get object for it
      if ( prop && prop.fullPropertyName.includes('.') ) {
        objForCurrentProperty = nestedPropertiesObjsMap[this.columnHandler.getNestedPropertyNameExcludingLastProperty(prop.fullPropertyName)];
      }
      return [
        (objForCurrentProperty ?
        objForCurrentProperty.cls_.getAxiomByName(this.columnHandler.getNameOfLastPropertyForNestedProperty(propName)) :
        prop && prop.property ? prop.property : this.data.of.getAxiomByName(propName)),
        objForCurrentProperty
      ];
    }
  ]
});
