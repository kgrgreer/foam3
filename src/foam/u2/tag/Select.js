/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.tag',
  name: 'Select',
  extends: 'foam.u2.View',

  axioms: [
    { class: 'foam.u2.TextInputCSS' }
  ],

  css: `
    ^:disabled {
      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      border: none;
      background: rgba(0,0,0,0);
      color: initial;
    }
    ^ {
      appearance: none;
      -moz-appearance: none;
      -webkit-appearance: none;
      background: #ffffff url('/images/dropdown-icon.svg') no-repeat;
      background-position: right 0.25em top 50%, 0 0;
      box-shadow: none;
      cursor: pointer;
      max-width: 100%;
      overflow: hidden;
      padding-right: 2.1em;
      text-overflow: ellipsis;
      width: 100%;
    }
    ^ option {
      padding: 4px;
      width: 100%;
    }
    ^.expanded{
      background: none;
      padding: 0;
    }
  `,

  properties: [
    ['nodeName', 'select'],
    {
      name: 'choices',
      factory: function() {
        return [];
      }
    },
    {
      name: 'placeholder',
      factory: function() {
        return undefined;
      }
    },
    'size',
    {
      name: 'header',
      documentation: 'The heading text for the choices'
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .attrs({size: this.size$})
        .enableClass('expanded', this.size != 0 )
        .attrSlot().linkFrom(this.data$);

      if ( this.size ) this.style({height: 'auto'});

      this.setChildren(this.slot(function(choices, placeholder, header) {
        var cs = [];

        if ( header ) {
          cs.push(self.E('optgroup').attrs({ label: header }))
        }

        if ( placeholder ) {
          cs.push(self.E('option').attrs({
            value: -1,
            selected: self.data === -1
          }).addClass('truncate-ellipsis').add(placeholder));
        }

        for ( var i = 0 ; i < choices.length ; i++ ) {
          var c = choices[i];
          let value = c[1];
          let e = self.E('option').attrs({
            value: i,
            selected: self.data === i
          }).translate(c[1] + '.name', value)
          if ( value.toString().indexOf('  ') !== -1 ) {
            // Hack to display spaces as nbsp's
            e.el().then(el => el.innerHTML = value.replace(/ /g, '&nbsp;'));
          }

          cs.push(e);
        }

        return cs;
      }));
    },

    function updateMode_(mode) {
      var disabled =
        mode === foam.u2.DisplayMode.DISABLED ||
        mode === foam.u2.DisplayMode.RO;
      this.setAttribute('disabled', disabled);
    }
  ]
});
