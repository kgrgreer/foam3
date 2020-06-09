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
  package: 'net.nanopay.ui',
  name: 'ToggleSwitch',
  extends: 'foam.u2.View',

  documentation: 'Toggle Switch View.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^toggleswitch {
          display: inline-block;
          position: relative;
          width: 40px;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          -khtml-user-select: none;
          user-select: none;
        }
        ^toggleswitch input[type="checkbox"] {
          display: none;
        }
        ^checkbox {
          display: none;
        }
        ^label {
          display: block;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid #FFFFFF;
          border-radius: 50px;
        }
        ^inner {
          display: block;
          width: 200%;
          margin-left: -100%;
          transition: margin 0.2s ease-in 0s;
        }
        ^inner:before, ^inner:after {
          display: block;
          float: left;
          width: 50%;
          height: 20px;
          padding: 0;
          line-height: 20px;
          font-size: 25px;
          color: white;
          box-sizing: border-box;
        }
        ^inner:before {
          content: "";
          padding-left: 14px;
          background-color: #59A5D5;
          color: #59A5D5;
        }
        ^inner:after {
          content: "";
          padding-right: 14px;
          background-color: rgba(164, 179, 184, 0.5);
          text-align: right;
        }
        ^switch {
          display: block;
          width: 12px;
          margin: 4px;
          background: #FFFFFF;
          position: absolute;
          top: 0;
          bottom: 0;
          right: 16px;
          border: 2px solid #FFFFFF;
          border-radius: 50px;
          transition: all 0.2s ease-in-out;
        }

        ^checkbox:checked + ^label ^inner,
        ^label ^inner.checked {
          margin-left: 0;
        }

        ^checkbox:checked + ^label ^switch,
        ^label ^switch.checked {
          right: 0px;
        }

        ^title {
          color: #444;
          flex-grow: 1;
          margin-left: 12px;
          overflow: hidden;
          display: inline-block;
          vertical-align: top;
          cursor: pointer;
          width: 80%
        }

        ^noselect {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'data'
    },
    {
      class: 'Boolean',
      name: 'showLabel',
      factory: function() { return !!this.label },
    },
    {
      class: 'String',
      name: 'label'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      var id;

      this.addClass(this.myClass())
        .start('div').addClass(this.myClass('toggleswitch'))
          .start({class: 'foam.u2.CheckBox', data$: this.data$})
            .addClass(this.myClass('checkbox'))
            .setID(id = self.NEXT_ID())
          .end()
          .start('label').addClass(this.myClass('label'))
            .attrs({ for: id })
            .start('span').addClass(this.myClass('inner')).enableClass('checked', this.data$).end()
            .start('span').addClass(this.myClass('switch')).enableClass('checked', this.data$).end()
          .end()
        .end();

      if ( this.showLabel ) {
        this.start('label')
          .addClass(this.myClass('title'))
          .addClass(this.myClass('noselect'))
          .add(this.label$)
          .on('click', function() {
            this.data = !this.data;
          }.bind(this))
        .end();
      }
    }
  ]
});
