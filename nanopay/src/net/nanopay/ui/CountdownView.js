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
  name: 'CountdownView',
  extends: 'foam.u2.View',

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^ {
          width: 78px;
          height: 20px;
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #2cab70;
        }

        ^.hidden {
          display: none;
        }
      `
    })
  ],

  properties: [
    {
      class: 'Long',
      name: 'duration',
      value: 30 * 60 * 1000
    },
    {
      class: 'DateTime',
      name: 'time',
      factory: function () {
        var date = new Date(null);
        date.setMilliseconds(this.duration);
        return date;
      }
    },
    {
      class: 'Boolean',
      name: 'isStopped',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isHidden',
      value: false
    },
    {
      class: 'Function',
      name: 'onExpiry'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass()).enableClass('hidden', this.isHidden$)
        .add(this.time$.map(function (value) {
          return value.toISOString().substr(11, 8);
        }));
    },

    function start() {
      this.isStopped = false;
      this.tick();
    },

    function stop() {
      this.isStopped = true;
    },

    function reset() {
      this.stop();
      this.duration = 30 * 60 * 1000;
      this.time = new Date(null).setMilliseconds(this.duration);
    },

    function hide() {
      this.isHidden = true;
    },

    function show() {
      this.isHidden = false;
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 1000,
      code: function () {
        if ( this.isStopped ) return;
        if ( this.duration <= 1000 ) {
          this.duration = 0;
          this.time = 0;
          this.onExpiry();
          return;
        }
        this.duration -= 1000;
        this.time -= 1000;
        this.tick();
      }
    }
  ]
});
