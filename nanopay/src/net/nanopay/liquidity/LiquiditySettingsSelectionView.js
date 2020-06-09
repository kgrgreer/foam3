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
    package: 'net.nanopay.liquidity',
    name: 'LiquiditySettingsSelectionView',
    extends: 'foam.u2.View',

    documentation: `The selection view for a RichChoiceView for user to display liquidity settings.`,

    messages: [
      {
        name: 'DEFAULT_LABEL',
        message: 'Choose LiquiditySetting'
      }
    ],

    properties: [
      {
        name: 'data'
      },
      {
        name: 'fullObject'
      }
    ],

    methods: [
      function initE() {
        return this
          .addClass(this.myClass())
            .callIfElse(
              this.data,
              function() {
                this.add(this.fullObject$.map((liquiditySetting) => {
                  if ( liquiditySetting ) {
                    return this.E()
                      .add(`${liquiditySetting.name}, ${liquiditySetting.id}`);
                  }
                }));
              },
              function() {
                this.add(this.DEFAULT_LABEL);
              }
            );
      }
    ]
});
