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
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAccountTemplateMapView',
  extends: 'foam.u2.view.MapView',

  documentation: `This class works like a container for the data(KeyValueRow).
  Extends MapView, but overrides most of MapView here.
  Specific use case is Account Group for Roles - create - liquid.`,

  properties: [
    {
      name: 'isCapabilityAccountData',
      class: 'Boolean'
    }
  ],

  css: `
   ^ .accountSelection {
     width: 40%;
     margin: 16px;
   }
   ^ .propertiesSelection {
    width: 40%;
    margin: 16px;
  }
  ^ .removeSelection {
    margin: 14.6vh 2vw 0 0vw;
  }
  ^  {
    border-radius: 6px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
    border: solid 1px #e7eaec;
    background-color: #ffffff;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
    margin-left: 1vw;
    margin-bottom: 1vh;
  }
  `,

  exports: [
    'isCapabilityAccountData'
  ],

  classes: [
    {
      name: 'KeyValueRow',
      documentation: 'This works as an entry in the data set(Map).',
      imports: [
        'mode',
        'view',
        'isCapabilityAccountData'
      ],
      properties: [
        {
          name: 'key',
          class: 'Reference',
          of: 'net.nanopay.account.Account',
          view: function(_, X) {
            const e = foam.mlang.Expressions.create();
            const Account = net.nanopay.account.Account;
            const LifecycleState = foam.nanos.auth.LifecycleState;
            return {
              class: 'foam.u2.view.RichChoiceView',
              search: true,
              sections: [
                {
                  heading: 'Accounts',
                  dao: X.accountDAO
                    .where(
                      e.AND(
                        e.EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                        e.OR(
                          e.INSTANCE_OF(net.nanopay.account.AggregateAccount),
                          foam.mlang.predicate.IsClassOf.create({ targetClass: 'net.nanopay.account.DigitalAccount' })
                        )
                      )
                    )
                    .orderBy(Account.NAME)
                }
              ]
            };
          },
          adapt: function(oldVal, newVal) {
            if ( typeof newVal === 'string' ) {
              return parseInt(newVal);
            }
            return newVal;
          }
        },
        {
          name: 'value',
          class: 'FObjectProperty',
          of: 'net.nanopay.liquidity.crunch.AccountData',
          factory: function() {
            return this.isCapabilityAccountData ?
              net.nanopay.liquidity.crunch.CapabilityAccountData.create() :
              net.nanopay.liquidity.crunch.AccountData.create();
          },
          view: 'foam.u2.view.FObjectView'
        }
      ],
      actions: [
        {
          name: 'remove',
          isAvailable: function(mode) {
            return mode === foam.u2.DisplayMode.RW;
          },
          code: function() {
            var d2 = foam.Object.shallowClone(this.view.data);
            delete d2[this.key];
            this.view.data = d2;
          }
        }
      ]
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this
        .add(this.slot(function(data) {
          return self.Rows.create()
            .forEach(Object.entries(data || {}), function(e) {
              let oldKey = e[0];
              let row    = self.KeyValueRow.create({ key: e[0], value: e[1] });
              row.onDetach(row.sub('propertyChange', function() {
                delete self.data[oldKey];
                self.data[row.key] = row.value;
                oldKey = row.key;
              }));
              this
                .startContext({ data: row })
                  .start(self.Cols).addClass(self.myClass())
                    .start()
                      .addClass('accountSelection')
                      .add(self.KeyValueRow.KEY)
                    .end()
                    .start()
                      .addClass('propertiesSelection')
                      .add(self.KeyValueRow.VALUE)
                    .end()
                    .start()
                      .addClass('removeSelection')
                      .tag(self.KeyValueRow.REMOVE, {
                        buttonStyle: 'SECONDARY',
                        isDestructive: true
                      })
                    .end()
                  .end()
                .endContext();
            });
        }))
        .startContext({ data: this }).add(this.ADD_ROW).endContext();
    }
  ]
});
