/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'TabChoiceView',
  extends: 'foam.u2.view.ChoiceView',
  mixins: ['foam.u2.memento.Memorable'],

  documentation: `
    A choice view that outputs user-specified tabs
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

    ^ [type=radio]:checked ~ label {
      border-bottom: solid 3px $primary400;
      font-weight: bold;
      color: $primary400;
    }

    ^ label {
      cursor: pointer;
      padding: 16px 32px;
    }
  `,

  properties: [
    {
      name: 'choice',
      factory: function() { return this.choices[0]; },
    },
    {
      name: 'cannedQuery',
      shortName: 'query',
      memorable: true,
      factory: function() { return this.choice[1]; }
    }
  ],

  methods: [
    function render() {
      this.addClass();

      // If no item is selected, and data has not been provided, select the 0th
      // entry.
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
        if ( this.cannedQuery == c[1] )
          this.data = c[0];
        return this.E('div').
          addClass(this.myClass('item')).
          start('input').
            attrs({
              type: 'radio',
              name: this.id,
              checked: self.slot(function (data) { return data === c[0]; })
            }).
            call(function() {
              id = this.id || ( this.id = this.$UID );
            }).
            on('change', function() {
              self.data = c[0];
              self.cannedQuery = c[1];
            }).
          end().
          start('label').
            addClass('p').
            attrs({ for: id }).
            start('span').
              translate(c[1], c[1]).
            end().
          end();
      }.bind(this)));
    }
  ]
});
