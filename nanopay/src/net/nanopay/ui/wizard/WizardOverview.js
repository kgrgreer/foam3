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
  package: 'net.nanopay.ui.wizard',
  name: 'WizardOverview',
  extends: 'foam.u2.View',

  documentation: 'A view that displays the position of the user in the WizardView Stack.',

  imports: [
    'complete',
    'viewData'
  ],

  css: `
    ^ .guideColumn {
      display: inline-block;
      vertical-align: top;
      margin-right: 10px;
    }

    ^ .titleColumn {
      display: inline-block;
      width: 75%;
      vertical-align: top;
    }

    ^ .positionCircle {
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      -webkit-transition: all .15s ease-in-out;
      background-color: #a4b3b8;
      border-radius: 10.5px;
      box-sizing: border-box;
      height: 21px;
      margin: auto;
      overflow: hidden;
      padding-top: 1px;
      position: relative;
      transition: all .15s ease-in-out;
      width: 21px;
    }

    ^ .positionCircle img {
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      -webkit-transition: all .15s ease-in-out;
      height: 0;
      left: 0;
      opacity: 0;
      position: absolute;
      top: 0;
      transition: all .15s ease-in-out;
      width: 0;
      z-index: 11;
    }

    ^ .positionCircle.complete img {
      width: 21px;
      height: 21px;

      opacity: 1;
    }

    ^ .positionCircle:first-child {
      margin-top: 4px;
    }

    ^ .positionCircle.current {
      background-color: #1cc2b7;
    }

    ^ .positionCircle p {
      color: white;
      font-size: 12px;
      line-height: 21px;
      margin: 0;
      text-align: center;
      width: 21px;

      -webkit-transition: font-size .25s ease-in-out;
      -moz-transition: font-size .25s ease-in-out;
      -ms-transition: font-size .25s ease-in-out;
      -o-transition: font-size .25s ease-in-out;
      transition: font-size .25s ease-in-out;

      z-index: 10;
    }

    ^ .positionCircle p.hidden {
      opacity: 0;
    }

    ^ .positionCircle.complete {
      background-color: #1cc2b7;
    }

    ^ .positionCircle.complete p {
      font-size: 0;
    }

    ^ .positionLine {
      width: 1px;
      height: 20px;
      background-color: #a4b3b8;
      margin: 5px auto;
    }

    ^ .progressLine {
      width: 100%;
      height: 0;
      background-color: #1cc2b7;

      -webkit-transition: all .25s ease-in-out;
      -moz-transition: all .25s ease-in-out;
      -ms-transition: all .25s ease-in-out;
      -o-transition: all .25s ease-in-out;
      transition: all .25s ease-in-out;
    }

    ^ .progressLine.progressed {
      height: 100%;
    }

    ^ .progressLine.complete {
      background-color: #2cab70;
      height: 100%;
    }

    ^ .positionTitleContainer {
      position: relative;
    }

    ^ .WizardOverview-subtitle {
      position: absolute;
      top: 21px;
      left: 0;
      margin: 0;

      height: 15px;
      line-height: 15px;
      font-size: 10px;
      color: #8e9090;
    }

    ^ .positionTitle {
      margin: 0;
      height: 21px;
      line-height: 30px;
      margin-bottom: 30px;

      font-size: 12px;
      letter-spacing: 0.3px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: /*%BLACK%*/ #1e1f21;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^ .positionTitle.inactive {
      color: #a4b3b8;
    }
  `,

  properties: [
    /*
      titles is a key/value property
      The key/values should be as follows:
        title: String
        subtitle: String
    */
    'titles',
    'position',
    {
      class: 'Boolean',
      name: 'hideNumbers',
      value: false
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
        .start('div').addClass('guideColumn')
          .start().forEach(this.titles, function(title, index) {
            if ( title.isHiddenInOverview ) return;
            this.start('div')
              .addClass('positionCircle')
              .addClass(self.complete$.map(function(flag) { return flag ? 'complete' : ''; }))
              .addClass(self.position$.map(function(p) { return index == p ? 'current' : index < p ? 'complete' : ''; }))
              .start('p').enableClass('hidden', self.hideNumbers$).add(index + 1).end()
              .start({ class: 'foam.u2.tag.Image', data: 'images/ic-approve.svg' }).end()
            .end();
            if ( index < self.titles.length - 1 ) {
              this.start('div').addClass('positionLine')
                .start('div')
                .addClass('progressLine')
                .addClass(self.position$.map(function(p) { return index == p - 1 ? 'progressed' : index < p - 1 ? 'complete' : ''; }))
                .end()
              .end();
            }
          }).end()
        .end()
        .start('div').addClass('titleColumn')
          .start().forEach(this.titles, function(title, index) {
            if ( title.isHiddenInOverview ) return;
            this.start('div').addClass('positionTitleContainer')
              .start('p')
              .addClass('positionTitle')
              .addClass(self.position$.map(function(p) { return index > p && ! self.complete ? 'inactive' : ''; }))
                .add(title.title)
              .end()
              .start('p')
              .addClass('WizardOverview-subtitle')
                .add(title.subtitle)
              .end()
            .end();
          }).end()
        .end();
    }
  ]
});
