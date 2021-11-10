/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ChipView',
  extends: 'foam.u2.View',

  documentation: 'View to display tags with labels',

  imports: [
    'removeChip'
  ],

  css: `
    ^ {
      height: fit-content;
      border-radius: 100px;
      background-color: #a4b3b8;
      margin: auto;
      position: relative;
      float: left;
      margin: 0.5rem;
    }

    ^label {
      text-align: left;
      color: /*%WHITE%*/ #ffffff;
      padding: 8px 10px 6px 10px;
      display: flex;
      align-items: center;
    }

    ^ .foam-u2-ActionView-removeSelf {
      width: 1rem;
      height: 1rem;
      object-fit: contain;
      margin: 0;
      float: right;
      cursor: pointer;
      display: inline-block;
      outline: 0;
      border: none;
      background: transparent;
      padding-left: 1em;
    }

    ^ .foam-u2-ActionView-removeSelf svg {
      width: 1rem;
      height: 1rem;
    }

    ^ .foam-u2-ActionView-removeSelf:hover {
      background: transparent;
      background-color: transparent;
    }
  `,

  methods: [
    function render(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('p')
          .addClass('p-label')
          .addClass(this.myClass('label'))
          .add(this.data)
          .startContext({ data: this })
            .add(this.REMOVE_SELF)
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'removeSelf',
      label: '',
      icon: 'images/ic-cancelwhite.svg',
      code: function() {
        this.removeChip(this.data);
      }
    }
  ]
});
