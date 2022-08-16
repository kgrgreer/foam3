/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.http',
  name: 'QueryStringOutputter',

  requires: [
    'foam.core.Map'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'combineMaps'
    }
  ],

  methods: [
    function output (obj) {
      const parts = [];
      const properties = obj.cls_.getOwnAxiomsByClass(foam.core.Property);
      for ( const prop of properties ) {
        if ( this.Map.isInstance(prop) && this.combineMaps ) {
          const map = obj[prop.name];
          for ( const k in map ) {
            parts.push(k + '=' + encodeURIComponent('' + map[k]));
          }
          continue;
        }
        parts.push(prop.name + '=' + encodeURIComponent(
          '' + obj[prop.name]));
      }
      return parts.join('&');
    }
  ]
});
