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
  package: 'net.nanopay.ui.topNavigation',
  name: 'SubMenuBar',
  extends: 'foam.u2.Element',

  documentation: 'Childrens menu dropdown',

  css: `
    ^ {
      width: 100px;
      vertical-align: top;
    }
    ^ ul{
      margin-top: 20px;
      font-size: 13px;
      list-style-type: none;
    }
    ^ li{
      margin-top: 25px;
    }
    .highlight{
      background: blue;
    }
  `,

  properties: [
    'data',
    'parent'
  ],

  methods: [
    function initE(){
      var self   = this;
      var menus  = self.data;
      var parent = self.parent;

      this
          .addClass(this.myClass())
            .start()
              .start('ul')
                .forEach(this.filterSubMenus(menus, parent), function(i){
                  this.start('li')
                    .add(i.label)
                    .on('click', function() {
                      if ( ! i.selected ) {
                        self.selected = true;
                        self.tag({class: 'net.nanopay.ui.topNavigation.SubMenuBar', data: menus, parent: i })
                      }
                    })
                  .end()
                })
              .end()
            .end()
          .end();
    },

    function filterSubMenus(menus, parent){
      var subMenus = menus.filter(function(obj){
        return obj.parent == parent.id
      })

      return subMenus;
    }
  ]
});
