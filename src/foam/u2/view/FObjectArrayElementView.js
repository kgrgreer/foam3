/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.view',
  name: 'FObjectArrayElementView',
  extends: 'foam.u2.View',
  documentation: `View that finds an array element based on a fetch function and matches it against a result.
  Useful for rendering selective elements of FObjectArrays such as capableObjects`,
  properties: [
    {
      class: 'Function',
      name: 'idFetch',
      value: o => { return o.id; },
      documentation: 'function used to fetch id from array element'
    },
    {
      class: 'String',
      name: 'idResult',
      documentation: 'id of the element to rendered'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
    }
  ],
  methods: [
    function render() {
      let obj = this.data.find(v => {
        return this.idFetch(v) == this.idResult;
      });
      let idx = this.data.indexOf(obj);
      this.tag({ ...this.view, data$: this.data$.at(idx) });
    },
    function fromProperty(prop) {
      this.idFetch = prop.indexFunction;
    }
  ],
});