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
  package: 'net.nanopay.flinks.view.element',
  name: 'CheckBoxes',
  extends: 'foam.u2.view.ChoiceView',

  documentation: 'view for account and balance',

  css: `
    ^ .label {
      height: 13px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
  `,

  methods: [
    function initE() {
      //console.log('CheckBox: ', this.data);
      this.addClass(this.myClass());
      if ( ! this.data && ! this.index ) {
        this.index = 0;
      }
      this.data = [];
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
       // console.log('this.id: ', this.id);
        return this.E('div').
          addClass(this.myClass()).
          start('input').
            attrs({
              type: 'checkbox',
              name: this.id,
              value: c[0]
            }).
            setID(id = self.NEXT_ID()).
            on('change', function(evt) {
              var na = [];
              if ( evt.srcElement.checked === true ) {
                for ( var i = 0 ; i < self.data.length ; i ++ ) {
                  if ( self.data[i] === evt.srcElement.value ) continue;
                  na.push(self.data[i]);
                }
                na.push(evt.srcElement.value);
              } else {
                for ( var i = 0 ; i < self.data.length ; i ++ ) {
                  if ( self.data[i] === evt.srcElement.value ) continue;
                  na.push(self.data[i]);
                }
              }
              self.data = na;
              // console.log('evt check: ', evt.srcElement.checked);
              // console.log('evt: ', evt);
              // console.log('evt.srcElement.value: ', evt.srcElement.value);
            }).
          end().
          start('label').addClass('label').style({'margin-left':'3px'}).
            attrs({
              for: id
            }).
            start('span').
              add(c[0]).
            end()
          .end();
      }.bind(this)));
    }
  ]
})