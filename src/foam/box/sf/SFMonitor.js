/**
* @license
* Copyright 2022 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.box.sf',
  name: 'SFMonitor',
  extends: 'foam.box.sf.SF',

  javaImports: [
    'foam.core.X'
  ],

  tableColumns: [
    'id',
    'ready',
    'inFlightCount',
    'inFlightLimit'
  ],

  properties: [
    {
      class: 'Int',
      name: 'inFlightCount'
    },
    {
      class: 'Boolean',
      name: 'ready'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public SFMonitor(X x, SF sf) {
              this.setX(sf.getX());
              this.setId(sf.getId());
              this.setReady(sf.getReady());
              this.setInFlightLimit(sf.getInFlightLimit());
              this.setInFlightCount(sf.onHoldList_.size());
            }
          `
        }));
      }
    }
  ]
})