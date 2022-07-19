/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.doc',
  name: 'AxiomLink',
  extends: 'foam.u2.View',

  properties: [
    [ 'nodeName', 'a' ],
    {
      class: 'Class',
      name: 'cls'
    },
    {
      name: 'axiomName'
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      this.
        attr('href', `#${this.cls.id}-${this.axiomName}`).
        add(this.axiomName);
    }
  ]
});
