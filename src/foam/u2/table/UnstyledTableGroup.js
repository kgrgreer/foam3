/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.table',
  name: 'UnstyledTableGroup',
  extends: 'foam.u2.View',
  mixins: ['foam.u2.table.TableHelperMixin'],

  requires: [
    'foam.u2.CheckBox',
    'foam.u2.view.OverlayActionListView'
  ],

  imports: [
    'props',
    'propertyNamesToQuery',
    'canBuildObjfromProj',
    'nestedPropertyNamesAndItsIndexes'
  ],

  properties: [
    'obj',
    'projection',
  ],

  methods: [
    function render() {
      var objForCurrentProperty = this.obj;
      var nestedPropertyValues = this.columnHandler.filterOutValuesForNotNestedProperties(this.projection, this.nestedPropertyNamesAndItsIndexes[1]);
      var nestedPropertiesObjsMap = this.columnHandler.groupObjectsThatAreRelatedToNestedProperties(this.data.of, this.nestedPropertyNamesAndItsIndexes[0], nestedPropertyValues);
      this.addClass(this.data.myClass('tr')).
      addClasses([this.data.myClass('row-group'), this.data.myClass('row')]).
      // TODO: add functionality to support group multiselect
      style({ 'min-width': this.data.tableWidth_$ });
      prop = this.getCellData(objForCurrentProperty, this.data.groupBy, nestedPropertiesObjsMap);
      var elmt = this.E().addClasses(['h500', this.data.myClass('td')])
        .call(function() {
          prop.tableCellFormatter.format(
            this,
            prop.f ? prop.f(objForCurrentProperty) : null,
            objForCurrentProperty,
            prop
          );
        });
      this.add(elmt);
    }
  ]
});
