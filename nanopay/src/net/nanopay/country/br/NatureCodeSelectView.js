/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  package: 'net.nanopay.country.br',
  name: 'NatureCodeSelectView',
  extends: 'foam.u2.View',

  imports: [
    'window'
  ],

  css: `
  ^ {
    outline: none;
    border-width: 1px 0px 1px;
    border-radius: 6px;
    border-color: #e7eaec;
  }
  ^card {
    margin: 0px;
    height: 1.5vh;
    border: solid 1px #e7eaec;
    border-radius: 5px;
    position: relative;
    padding: 16px;
    transition: all 0.2s linear;
  }
  `,

  properties: [
    ['nodeName', 'select'],
    'size',
    {
      name: 'choices',
      factory: () => { return []; }
    },
    {
      name: 'maxHeight',
      expression: function(choices, size, window) {
        // calculate the height based on actual number of childnodes, if less than size
        let vh = window.innerHeight || 0;
        return choices.length < size ? 
          choices.length * (vh * 0.015 + 34) :
          size * (vh * 0.015 + 34);
      }
    },
    {
      name: 'overflowY',
      expression: function(choices, size) {
        return choices.length < size ? 'hidden' : 'scroll';
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .style({
          'max-height': self.maxHeight$,
          'overflow-y': self.overflowY$
        })
        .attrs({ size: this.size$ })
        .attrSlot().linkFrom(this.data$);

      this.setChildren(this.slot(function(choices) {
        var cs = [];

        for ( var i = 0 ; i < choices.length ; i++ ) {
          var c = choices[i];
          let value = c[1];
          let e = self.E('option').addClass(self.myClass('card')).attrs({
            value: i,
            selected: choices.length === 1 // preselect option if there is only one
          }).translate(c[1]+'.name', value)

          cs.push(e);
        }
        return cs;
      }));
    }
  ]
});
