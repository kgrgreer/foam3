/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'RecursionSafePropertyView',
  extends: 'foam.u2.Element',

  imports: [
    'referencePath'
  ],

  properties: [
    'prop',
    {
      class: 'Boolean',
      name: 'safe'
    }
  ],

  methods: [
    function init() {
      this.safe$ = this.__context__.data$.dot(this.prop.name).map(data => ! this.referencePath.conflicts(data));
    },
    function render() {
      const self = this;
      this
        .add(this.slot(function (prop, safe) {
          return safe
            ? this.E().tag(prop)
            : this.E().add('< RECURSION DETECTED >')
            ;
        }))
    }
  ]
});
