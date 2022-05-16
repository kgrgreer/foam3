/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'FUIDAutocompleter',
  extends: 'foam.u2.Autocompleter',

  imports: [
    'globalSearchService'
  ],

  properties: [
    'filtered'
  ],

  listeners: [
    {
      name: 'onUpdate',
      isFramed: true,
      code: async function onUpdate() {
        var res = this.partial ? await this.globalSearchService.searchById(this, this.partial) : [];
        var temp = [];
        for ( var [daoKey, obj1] of Object.entries(res) ) {
          temp.push({ daoKey: daoKey, obj1: obj1 });
        }
        this.filtered = temp;
      }
    }
  ]
});
