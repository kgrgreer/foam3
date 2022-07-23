/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.http',
  name: 'QueryStringOutputter',

  methods: [
    function output (obj) {
      return obj.cls_.getOwnAxiomsByClass(foam.core.Property).
        map(prop => prop.name + '=' + encodeURIComponent(
          '' + obj[prop.name])).join('&');
    }
  ]
});
