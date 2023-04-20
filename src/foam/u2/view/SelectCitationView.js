/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SelectCitationView',
//  extends: 'foam.u2.detail.SectionedDetailView',
  extends: 'foam.u2.View',
  properties: [
    {
      name: 'of',
      value: 'foam.u2.view.SelectCitationData',
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.view.SelectCitationData',
      name: 'testarray'
    },
    {
      name: 'data',
      adapt: function(old, nu) {
        return nu;
      },
      setter: function(f) {
        console.log('sfdsdf')
      }
    }
  ],

  methods: [
    function init() {
      this.data = this.testarray.find(d=> d==this.data);
    }
//    function render() {
//      this
//      .addClass(this.myClass())
//      .start()
//        .add(this.title)
//        .add(this.description)
//      .end();
//    }
  ],
});

foam.CLASS({
  package: 'foam.u2.view',
  name: 'SelectCitationData',
  properties: [ 'capaId', 'title', 'description']
});



