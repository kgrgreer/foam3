/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow.laminar',
  name: 'DocumentView',
  extends: 'foam.u2.View',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.flow.laminar.Document',
      name: 'data',
    }
  ],

  css: `
    ^doclet-wrapper {
      padding: 15px;
      border: 1px solid grey;
    }
    ^doclet-wrapper:not(:first-of-type) {
      border-top: none;
    }

    ^ code {
      font-family: "Courier New", monospace;
      background-color: #DDDDDD;
      border-radius: 4px;
      margin-left: 1ch;
    }
  `,

  methods: [
    function render () {
      const self = this;
      this.addClass();
      this.add(this.slot(function (data$doclets) {
        const e = this.E();
        for ( const doclet of data$doclets ) {
          e
            .start()
              .addClass(self.myClass('doclet-wrapper'))
              .add(doclet)
            .end();
        }
        return e;
      }));
      this.tag(this.RUN_ALL);
    }
  ],

  actions: [
    {
      name: 'runAll',
      code: async function () {
        await this.runFrom(0);
      }
    }
  ]
});
