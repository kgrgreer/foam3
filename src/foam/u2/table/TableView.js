/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.table',
  name: 'TableView',
  extends: 'foam.u2.table.UnstyledTableView',

  cssTokens: [
    {
      name: 'borderSize',
      value: '2px solid $grey300'
    }
  ],

  css: `
    ^ {
      border-spacing: 0px;
      overflow-x: unset;
      width: 100%;
    }

    ^tbody {
      display: flow-root;
    }

    ^full-height{
      height: 100%;
    }

    ^table-wrapper{
      /*Scroll*/
      flex: 1;
      max-height: 100%;
      position: relative;
      overflow: auto;
      overscroll-behavior: contain;
      scroll-behavior: smooth;
    }

    ^tr {
      background: $white;
      display: flex;
      height: 48px;
      justify-content: space-between;
    }

    ^tbody ^tr:hover {
      background: $grey50;
      border-radius: 4px;
      cursor: pointer;
    }

    ^thead {
      position: sticky;
      top: 0;
      z-index: 1;
    }

    ^thead > ^tr {
      border-bottom: $borderSize;
      box-sizing: border-box;
      border-radius: 4px 4px 0 0;
      width: 100%;
      position: relative;
    }

    ^td,
    ^th {
      align-self: center;
      box-sizing: border-box;
      color: $black;
      display: block;
      font-size: 1.4rem;
      line-height: 1.5;
      overflow: hidden;
      padding-left: 16px;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 40px; /* So when the table's width decreases, columns aren't hidden completely */
    }

    ^th:not(:last-child) > img {
      margin-left: 8px;
    }

    ^th:hover {
      cursor: pointer;
    }

    /**
     * OTHER
     */
    ^selected {
      background: $primary50;
    }

    ^noselect {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    ^ .disabled {
      color: #aaa;
    }

    ^td .foam-u2-ActionView {
      padding: 4px 12px;
    }

    ^row-group{
      background: $grey50;
    }

    ^resizeButton {
      padding: 4px;
      position: sticky;
      right: 4px;
    }

    ^resizeButton:hover:not(:disabled), ^resizeCursor {
      cursor: col-resize;
    }

    ^resizeButton svg{
      width: 0.8em;
      height: 0.8em;
    }

    /* PAGINATION */
    ^nav{
      align-items: center;
      background: $white;
      border-radius: 0 0 4px 4px;
      border-top: 1px solid $grey300;
      box-sizing: border-box;
      gap: 8px;
      justify-content: flex-end;
      max-height: 56px;
      padding: 16px 24px;
      width: 100%;
    }
    ^buttons svg{
      width: 1em;
      height: 1em;
    }
    ^counters > *:focus {
      border: 0px;
      border-radius: 0px;
      padding: 0px;
      height: auto;
      border-bottom: 2px solid $primary400;
    }
  `,

  messages: [
    { name: 'MESSAGE_OF', message: 'of'}
  ]
});
