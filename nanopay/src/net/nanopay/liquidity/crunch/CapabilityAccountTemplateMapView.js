  
foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAccountTemplateMapView',
  extends: 'foam.u2.view.MapView',
  classes: [
    {
      name: 'KeyValueRow',
      imports: [
        'data',
        'mode',
        'updateData'
      ],
      properties: [
        {
          name: 'key',
          class: 'Reference',
          of: 'net.nanopay.account.Account',
          postSet: function(o, n) {
            delete this.data[o];
            this.data[n] = this.value;
          }
          // view: function(_, x) {
          //   return {  
          //     class: 'foam.u2.view.RichChoiceView',
          //     sections: [
          //       {
          //         heading: 'Account for which this capability should be revoked from',
          //         dao: x.accountDAO
          //       }
          //     ]
          //   };
          // }
        },
        {
          name: 'value',
          view: { class: 'foam.u2.view.FObjectView' },
          class: 'FObjectProperty',
          of: 'net.nanopay.liquidity.crunch.CapabilityAccountData',
          postSet: function(o, n) {
            this.data[this.key] = n;
          }
        }
      ],
      listeners: [
        {
          name: 'updateData',
          isFramed: true,
          code: function() {
            var d = this.data;
            this.data = null;
            this.data = d;
          }
        }
      ],
      actions: [
        {
          name: 'remove',
          isAvailable: function(mode) {
            return mode === foam.u2.DisplayMode.RW;
          },
          code: function() {
            delete this.data[this.key];
            this.updateData();
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
              var row = self.KeyValueRow.create({ key: e[0], value: e[1] });
              this
                .startContext({ data: row })
                  .start(self.Cols)
                    .start()
                      .style({'flex-grow': 1 })
                      .add(self.KeyValueRow.KEY)
                    .end()
                    .start()
                      .style({ 'flex-grow': 1 })
                      .add(self.KeyValueRow.VALUE)
                    .end()
                    .tag(self.KeyValueRow.REMOVE, {
                      isDestructive: true
                    })
                  .end()
                .endContext();
              row.onDetach(row.sub(self.updateData));
            });
        }))
        .startContext({ data: this }).add(this.ADD_ROW).endContext();
    }
  ]
});
