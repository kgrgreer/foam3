/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'IconChoiceView',
  extends: 'foam.u2.view.ChoiceView',

  documentation: `
    A choice view that outputs user-specified icons
  `,

  css: `
    ^ {
      display: flex;
    }

    ^item {
      display: flex;
    }

    ^ input[type="radio"] {
      display: none;
    }

    ^ label {
      cursor: pointer;
      line-height: 48px;
    }



    ^ {
      background-color: $primary50;
      border-radius: 4px;
      display: flex;
      gap: 12px 24px;
      padding: 8px 12px;
      overflow-x: auto;
      white-space: nowrap;
    }
    ^label {
      align-items: center;
      background: none;
      border-radius: 4px;
      color: $primary400;
      
      display: flex;
      justify-content: center;
      padding: 7px 12px;
    }
    ^label svg path{
      fill: $primary400;
    }
    ^label:hover {
      background: $primary700;
      color: $white;
      cursor: pointer;
    }
    ^label:hover svg path{
      fill: $white;
    }
    ^label^disabled-icon {
      background: $primary400;
      color: $white;
      fill: $white;
      font-weight: 600;
    }
    ^label^disabled-icon svg path {
      fill: $white;
    }
  `,

  methods: [
    function render() {
      // If no item is selected, and data has not been provided, select the 0th
      // entry.
      this
        .addClass(this.myClass())

      if ( ! this.data && ! this.index ) {
        this.index = 0;
      }

      if ( this.dao ) this.onDAOUpdate();
      this.choices$.sub(this.onChoicesUpdate);
      this.onChoicesUpdate();
    }
  ],

  listeners: [
    function onChoicesUpdate() {
      var self = this;
      var id;

      this.removeAllChildren();

      this.add(this.choices.map(function(c) {
        return this.E().
          addClass(this.myClass('item')).
          start('input').
            attrs({
              type: 'radio',
              name: this.id,
              checked: self.slot(function(data) { return data === c[0]; })
            }).
            setID(id = self.NEXT_ID()).
            on('change', function(evt) {
              self.data = c[0];
            }).
          end().
          start('label', { tooltip: c[2] }).
            addClass(this.myClass('label')).
            // this should be called selected
            enableClass(this.myClass('disabled-icon'), self.slot(function(data) { return data === c[0] })).
            attrs({ for: id }).
            start({
                class: 'foam.u2.tag.Image',
                data: c[1],
                embedSVG: true
              }).
            end().
          end();
      }.bind(this)));
    }
  ]
});
