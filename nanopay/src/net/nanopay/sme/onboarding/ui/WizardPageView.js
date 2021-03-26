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
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'WizardPageView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.detail.SectionView',
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows',
  ],
  imports: [
    'theme'
  ],
  css: `
    ^ {
      height: 92%;
    }

    ^sections-container {
      height: 100%;
      align-items: center !important;
    }

    ^joanne {
      width: 128px;
      height: 128px;
      border-radius: 64px;
    }

    ^help {
      width: 331px;
      margin-top: 36px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 24px;
      font-weight: normal;
      line-height: 1.5;
      text-align: center;
      color: #525455;
    }

    ^right-section {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      overflow: auto;
      height: 100%;
      flex: 1;
      basis:0;
      padding-right: 128px;
      padding-bottom: 50px;
    }

    ^left-section {
      flex: 1;
      flex-basis: 0;
      justify-content: center;
      display: flex;
      align-items: center;
    }

    ^left-section * {
      display: flex;
      justify-content: center;
    }

    ^ .property-signingOfficer .foam-u2-view-RadioView:last-child {
      margin: 0;
    }
  `,
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.layout.Section',
      name: 'section'
    },
  ],
  methods: [
    function initE() {
      var help = this.section.help.replace('Ablii', this.theme.appName)
      this.SUPER();
      this.addClass(this.myClass())
        .start(this.Cols)
          .addClass(this.myClass('sections-container'))
          .start(this.Rows)
            .addClass(this.myClass('left-section'))
            .start({ class: 'foam.u2.tag.Image', data: 'images/ablii/joanne@2x.jpg' })
              .addClass(this.myClass('joanne'))
            .end()
            .start('h1').addClass(this.myClass('help'))
              .add(help)
            .end()
          .end()

          .start()
            .addClass(this.myClass('right-section'))
            .start(this.SectionView, {
              section$: this.section$,
              data$: this.data$
            }).style({ 'flex': 1 }).end()
          .end()
        .end();
    }
  ]
});
