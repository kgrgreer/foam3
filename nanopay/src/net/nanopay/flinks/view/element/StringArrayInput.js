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
  name: 'StringArrayInput',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.tag.Input',
    'foam.Array'
  ],

  css: `
    ^ .inputField {
      min-width: 240px;
      width:calc(100% - 40px);  
      width:-moz-calc(100% - 40px);  
      width:-webkit-calc(100% - 40px); 
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      outline: none;
      padding: 10px;
    }
    ^ .row {
      margin-top: 5px;
    }
    ^ .row:first-child {
      margin-top: 0px;
    }
    ^ .firstField {
      display: inline-block;
    }
    ^ .inputArray {
      width: 100%;
      min-width: 240px;
    }
    ^ .imageRow {
    }
    ^ .Image {
      margin-left: 10px;
      margin-right: 10px;
      height: 20px;
      width: 20px;
      vertical-align: middle;
      display: inline-block;
      cursor: pointer;
    }
  `,


  properties: [
    {
      class: 'Int',
      name: 'count',
      factory: function() {
        return 1;
      },
      preSet: function(oldValue, newValue) {
        if ( newValue <= 1 ) return 1;
        if ( newValue > this.max) return this.max;
        return newValue;
      },
    },
    {
      class: 'Int',
      name: 'max',
      require: true
    },
    {
      class: 'Boolean',
      name: 'isPassword',
      factory: function() {
        return false;
      }
    },
    {
      class: 'Array',
      name: 'data'
    },
    {
      class: 'Array',
      name: 'inputFields'
    },
    'insertPoint'
  ],
  methods: [
    function init() {
      this.data = new Array(1).fill('');
      this.inputFields = []
    },
    function initE() {
      this.SUPER();
      var self = this;
      var input = this.isPassword === true ? this.Input.create({type: 'password', onKey: true}) : this.Input.create({type: 'text', onKey: true});
      input.data$.sub(function() {
        self.data[0] = input.data;
        self.data = foam.Array.clone(self.data);
      });
      this.insertPoint = this.addClass(this.myClass())
        .start('div').addClass('inputArray')
          .start('div').addClass('row')
            .start(input).addClass('inputField').addClass('firstField').end()
            .start({class: 'foam.u2.tag.Image', data: 'images/plus.svg'}).addClass('Image').on('click', function() {
              if ( self.count == 1 && self.count < self.max ) {
                self.count++;
                var index = self.count-1;
                self.data = self.extendArray(self.data);
                var text = (self.isPassword === true ? self.Input.create({type: 'password', onKey: true}) : self.Input.create({type: 'text', onKey: true}));
                text.addClass('inputField').addClass('firstField');
                text.data$.sub(function() {
                  self.data[index] = text.data;
                  self.data = foam.Array.clone(self.data);
                });
                var element = self.insertPoint
                  .start('div').addClass('row')
                    .start(text).end()
                    .start({class: 'foam.u2.tag.Image', data: 'images/minus.svg'}).addClass('Image').on('click', function() {
                      if ( self.count >= 1) {
                        self.count--;
                        var element = self.inputFields.pop();
                        element.remove();
                        self.data = self.reduceArray(self.data);
                        return;
                      }
                    }).end();
                element.end();
                self.inputFields.push(element);
                return;
              }
              if ( self.count < self.max ) {
                self.count++;
                var index = self.count-1;
                self.data = self.extendArray(self.data);
                var input1 = (self.isPassword === true ? self.Input.create({type: 'password', onKey: true}) : self.Input.create({type: 'text', onKey: true}));
                input1.addClass('inputField');
                input1.data$.sub(function() {
                  self.data[index] = input1.data;
                  self.data = foam.Array.clone(self.data);
                });
                var element = self.insertPoint.start('div').addClass('row')
                  .start(input1).end();
                self.inputFields.push(element);
                element.end();
                return;
              }
            }).end()
          .end();
      this.insertPoint.end();
    },
    function extendArray (a) {
      var b = new Array(a.length + 1);
      for ( var i = 0 ; i < a.length ; i++ ) {
        b[i] = a[i];
      }
      b[b.length-1] = '';
      return b;
    },
    function reduceArray(a) {
      var b = new Array(a.length - 1);
      for ( var i = 0 ; i < b.length ; i++ ) {
        b[i] = a[i];
      }
      return b;
    }
  ]
})