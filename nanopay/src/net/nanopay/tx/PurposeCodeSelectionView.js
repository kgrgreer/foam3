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
  package: 'net.nanopay.tx',
  name: 'PurposeCodeSelectionView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.view.RichChoiceView',
    'net.nanopay.tx.PurposeCode'
  ],
  implements: [
    'foam.mlang.Expressions'
  ],
  imports: [
    'purposeCodeDAO',
    'purposeGroupDAO'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeGroup',
      name: 'group'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      expression: function(group) {
        return group ?
          this.EQ(this.PurposeCode.GROUP, group) :
          this.FALSE;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function(purposeCodeDAO, predicate) {
        return purposeCodeDAO.where(predicate);
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeCode',
      name: 'data',
      postSet: function(_, n) {
        if ( ! n ) return;
        this.data$find.then((o) => this.group = o.group);
      }
    }
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
              data$: this.group$,
              sections: [
                {
                  heading: 'Purpose groups',
                  dao: this.purposeGroupDAO
                }
              ],
              search: true,
              searchPlaceholder: 'Search...',
              choosePlaceholder: 'Select...'
            })

          .end()

          .start()
            .style({ flex: 1 })
            .add(this.group$.map((id) => {
              return this.E()
                .tag(this.RichChoiceView, {
                  visibility: id != 0 ? 'RW' : 'DISABLED',
                  data$: this.data$,
                  sections: [
                    {
                      heading: 'Purpose Codes',
                      dao: this.filteredDAO$proxy
                    }
                  ],
                  search: true,
                  searchPlaceholder: 'Search...',
                  choosePlaceholder: 'Select...'
                });
            }))
          .end()
        .end();
    }
  ]
});
