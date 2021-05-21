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
  package: 'net.nanopay.account.ui.addAccountModal.components',
  name: 'ModalProgressBar',
  extends: 'foam.u2.View',

  documentation: 'Progress bar used in modals that depicts the progress of a user. Progress is custom set.',

  css: `
    ^ {
      position: relative;
      width: 100%;
      height: 2px;
      /* Might have to change this to be dynamic in the future */
      background: #e7eaec;
      overflow: hidden;
    }

    ^progress {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      /* Change this to be dynamic during refinements */
      background: #406dea;

      -webkit-transition: all .10s linear;
      -moz-transition: all .10s linear;
      -ms-transition: all .10s linear;
      -o-transition: all .10s linear;
      transition: all .10s linear;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'percentage',
      value: 0,
      documentation: 'The value should be between 0-100'
    },
    {
      class: 'Boolean',
      name: 'isIndefinite'
    },
    'interval'
  ],

  methods: [
    function init() {
      var self = this;
      this.onDetach(function() {
        if ( self.interval != null ) {
          self.stopAnimation();
        }
      });
    },

    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start()
          .addClass(this.myClass('progress'))
          .style({
            'width' : this.percentage$.map(function(v) { return v + '%'; }),
            'margin': this.isIndefinite$.map(function(v) { return self.isIndefinite ? '0 auto' : '0'; })
          })
        .end();
      if ( this.isIndefinite ) {
        this.startAnimation();
      }
    },

    function startAnimation() {
      var self = this;
      this.interval = setInterval(function() {
        if ( self.percentage < 100 ) {
          self.percentage = self.percentage + 10;
          if ( self.percentage == 100 ) {
            clearInterval(self.interval);
            setTimeout(function() {
              self.percentage = 0;
              setTimeout(function() {
                self.startAnimation();
              }, 100);
            }, 200);
          }
        }
      }, 100);
    },

    function stopAnimation() {
      if ( this.interval ) {
        clearInterval(this.interval);
        this.percentage = 100;
        this.interval = null;
      }
    }
  ]
});
