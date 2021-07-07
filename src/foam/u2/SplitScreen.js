/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

 foam.CLASS({
  package: 'foam.u2',
  name: 'SplitScreen',
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

    ^ .foam-u2-layout-Grid {
      grid-gap: 2vmax 2vmin;
    }
    
    /* vertically center the 2 sides of splitscreen */
    ^split-screen {
      display: flex;
      align-content: center;
      justify-content: center;
      align-items: center;
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
        columns: 8,
        mdColumns: 6,
        lgColumns: 6,
        xlColumns: 6
      }
    },
  ],

  methods: [
    function init() {
      this.SUPER();

      var right = this.GUnit.create({ columns: this.columnsConfig })
        .add(foam.u2.Element.create({}, this)
        .start()
          .addClass(this.myClass('split-screen'))
          .start('div', null, this.rightPanel$).end()
        .end());
      var left = this.GUnit.create({ columns: this.columnsConfig })
        .add(foam.u2.Element.create({}, this)
        .start()
          .addClass(this.myClass('split-screen'))
          .start('div', null, this.leftPanel$).end()
        .end());

      var grid = this.Grid.create();
      grid.add(left, right);

      this.start()
        .addClass(this.myClass())
        .add(grid)
      .end();
    }
  ]
});

