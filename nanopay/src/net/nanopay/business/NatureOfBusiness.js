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
  package: 'net.nanopay.business',
  name: 'NatureOfBusiness',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.view.RichChoiceView',
    'net.nanopay.model.BusinessSector'
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'businessSectorDAO'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'parentChoice'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      expression: function(parentChoice) {
        return parentChoice ?
          this.EQ(this.BusinessSector.PARENT, parentChoice) :
          this.FALSE;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function(businessSectorDAO, predicate) {
        return businessSectorDAO.where(predicate);
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.BusinessSector',
      name: 'data',
      postSet: function(_, n) {
        if ( ! n ) return;
        this.data$find.then((o) => this.parentChoice = o.parent);
      }
    }
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start(this.Cols)
          .start()
            .style({ 'flex': 1, 'margin-right': '16px' })
            .tag(this.RichChoiceView, {
              data$: this.parentChoice$,
              sections: [
                {
                  heading: 'Industries',
                  dao: this.businessSectorDAO.where(this.EQ(this.BusinessSector.PARENT, 0))
                }
              ],
              search: true,
              searchPlaceholder: 'Search...',
              choosePlaceholder: this.PLACE_HOLDER
            })

          .end()

          .start()
            .style({ flex: 1 })
            .add(this.parentChoice$.map((id) => {
              return this.E()
                .tag(this.RichChoiceView, {
                  visibility: id != 0 ? 'RW' : 'DISABLED',
                  data$: this.data$,
                  sections: [
                    {
                      heading: 'Specific Industries',
                      dao: this.filteredDAO$proxy
                    }
                  ],
                  search: true,
                  searchPlaceholder: 'Search...',
                  choosePlaceholder: this.PLACE_HOLDER
                });
            }))
          .end()
        .end();
    }
  ]
})
