/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'SideViewBorder',
  extends: 'foam.u2.Element',

  css: `
    ^ {
      position: relative;
    }

    ^side {
      position: absolute;
      overflow: hidden;
      visibility: hidden;
      width: 0;
      height: 100%;
      top: 0;
      right: 0;
      padding: 10px;
      border-left: 4px solid rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    ^side^open {
      width: 50%;
      background-color: rgba(255,255,255,0.7);
      visibility: visible;
    }

    ^side ^container {
      flex-grow: 1;
      overflow-x: hidden;
      overflow-y: auto;
    }
  `,
  
  properties: [
    {
      class: 'Boolean',
      name: 'sideVisible'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'sideView',
      factory: function () {
        return { class: 'foam.u2.borders.NullBorder' }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'sideData'
    }
  ],

  methods: [
    function init() {
      const self = this;
      this
        .start('div', null, this.content$)
        .end()
        .start()
          .addClass(this.myClass('side'))
          .enableClass(this.myClass('open'), this.sideVisible$)
          .startContext({ data: this })
            .tag(this.HIDE, { buttonStyle: 'PRIMARY' })
          .endContext()
          .add(this.slot(function (sideView) {
            return this.E()
              .addClass(self.myClass('container'))
              .startContext({ data$: self.sideData$ })
                .tag(self.sideView)
              .endContext()
          }))
        .end()
        ;
    }
  ],

  actions: [
    {
      name: 'hide',
      label: 'close',
      code: function () {
        this.sideVisible = false;
      }
    }
  ]
});
