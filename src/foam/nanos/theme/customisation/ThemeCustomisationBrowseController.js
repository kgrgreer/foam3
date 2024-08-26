/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

/**
 * TODO:
 * previewViews
 * rollbacks
 */

foam.CLASS({
  package: 'foam.nanos.theme.customisation',
  name: 'ThemeCustomisationBrowseController',
  extends: 'foam.comics.v2.DAOBrowseControllerView',

  properties: [
    {
      name: 'click',
      expression: function() {
        return function(obj, id) {
          if ( ! this.stack ) return;
          this.stack.push(foam.u2.stack.StackBlock.create({
          view: {
            class: 'foam.nanos.theme.customisation.ThemeCustomisationView',
            themeName: id,
          }, parent: this.__subContext__ }, this));
        };
      }
    }
  ]
});
