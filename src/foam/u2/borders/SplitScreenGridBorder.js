/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.borders',
  name: 'SplitScreenGridBorder',
  extends: 'foam.u2.Element',

  imports: [
    'displayWidth'
  ],

  requires: [
    'foam.u2.layout.Grid',
    'foam.u2.layout.GUnit'
  ],

  css: `
    ^{
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0 4vw;
      background-color: /*%WHITE%*/ white;

      /* minus footer */
      height: calc(100% - 65px);
      height: -moz-calc(100% - 65px);
      height: -webkit-calc(100% - 65px);
    }

    ^grid {
      grid-gap: clamp(1rem, 1.5vmax, 5rem);
    }
    
    /* vertically center the 2 sides of splitscreen */
    ^split-screen {
      display: flex;
      align-content: center;
      justify-content: center;
      align-items: center;
    }

    /* TODO: Remove this when U3 allows non-E() adds */
    ^split-screen > *{
      width: 100%;
    }
  `,

  properties: [
    'leftPanel',
    'rightPanel',
    {
      name: 'columnsConfig',
      documentation: 'Can be provided to customize how the columns respond to resize',
      flags: ['web'],
      value: {
        class: 'foam.u2.layout.GridColumns',
        columns: 12,
        lgColumns: 6,
        xlColumns: 6
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      var right = this.GUnit.create({ columns: this.columnsConfig })
        .addClass(this.myClass('split-screen'))
        .tag('', null, this.rightPanel$);
        var left = this.GUnit.create({ columns: this.columnsConfig })
        .addClass(this.myClass('split-screen'))
        .tag('', null, this.leftPanel$);

      var grid = this.Grid.create();
      grid
        .addClass(this.myClass('grid'))
        .add(left, right);

      this.start()
        .addClass(this.myClass())
        .add(grid)
      .end();
    }
  ]
});

