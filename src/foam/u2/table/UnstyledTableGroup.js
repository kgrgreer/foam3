/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.table',
  name: 'UnstyledTableGroup',
  extends: 'foam.u2.table.TableComponentView',

  requires: [
    'foam.core.SimpleSlot',
    'foam.u2.CheckBox',
    'foam.u2.view.OverlayActionListView'
  ],

  imports: [
    'canBuildObjfromProj',
    'nestedPropsAndIndexes',
    'propertyNamesToQuery',
    'props'
  ],

  messages: [
    { name: 'EMPTY_MSG',  message: 'No' }
  ],

  properties: [
    'obj',
    'projection',
  ],

  methods: [
    function render() {
      var self = this;
      var objForCurrentProperty = this.obj;
      var expr = foam.mlang.Expressions.create();
      var nestedPropertyValues = this.columnHandler.filterNestedPropertyValues(this.projection, this.nestedPropsAndIndexes[1]);
      var nestedPropertiesObjsMap = this.columnHandler.groupRelatedObjects(this.data.of, this.nestedPropsAndIndexes[0], nestedPropertyValues);
      this.addClass(this.data.myClass('tr')).
      addClass(this.data.myClass('row-group'), this.data.myClass('row')).
      // If multi-select is enabled, then we show a checkbox in the
      // header that allows you to select all or select none.
      callIf(this.data.multiSelectEnabled, function() {
        var slot = self.SimpleSlot.create();
        this.start().
          addClass(self.data.myClass('th')).
          tag(self.CheckBox, {}, slot).
          style({ width: '42px' }).
        end();

        // Set up a listener so we can update the existing CheckBox
        // views when a user wants to select all or select none.
        self.onDetach(slot.value.dot('data').sub(function(_, __, ___, newValueSlot) {
          var checked = newValueSlot.get();

          if ( checked ) {
            self.data.selectedObjects = {};
            self.data.data.where(expr.EQ(self.data.groupBy, self.data.groupBy.f(objForCurrentProperty))).select(function(obj) {
              self.data.selectedObjects[obj.id] = obj;
              self.data.idsOfObjectsTheUserHasInteractedWith_[obj.id] = true;
              if ( self.data.checkboxes_[obj.id] )
                self.data.checkboxes_[obj.id].data = checked;
            });
          } else {
            Object.keys(self.data.checkboxes_).forEach(function(key) {
              if ( self.data.selectedObjects[key] && self.data.groupBy.f(self.data.selectedObjects[key]) == self.data.groupBy.f(objForCurrentProperty) )
                self.data.checkboxes_[key].data = checked;
            });
            self.data.selectedObjects = {};
          }
        }));
      }).

      style({ 'min-width': this.data.tableWidth_$ });
      [prop, objReturned] = this.getCellData(objForCurrentProperty, this.data.groupBy, nestedPropertiesObjsMap);
      var elmt = this.E().style({ flex: '3 0 0' })
        .addClass('h500', this.data.myClass('td'))
        .call(function() {
          prop.tableCellFormatter.format(
            this,
            prop.f ? prop.f(objReturned) : null,
            objReturned,
            prop
          );
          if ( ! prop.f(objReturned) ) {
            this.add(self.EMPTY_MSG + ' ' + prop.label);
          }
        });
      this.add(elmt);
    }
  ]
});
