foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'MenuToolBar',
  extends: 'foam.u2.View',

  documentation: `
    Allows the user to select by which means to add a contact.

    #OPTIONS
    1) Search by Business Name
    2) Add by Payment Code
    3) Create from Scratch
    4) Send Invitation (doesn't add the contact)
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'menuDAO',
    'pushMenu'
  ],

  requires: [
    'foam.nanos.menu.Menu'
  ],

  css: `
    ^{
      width: 504px;
      height: 230px;
    }
    ^title {
      margin: 24px;
      font-size: 24px;
      font-weight: 900;
    }
    ^options {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0 36px 32px 36px;
    }
    ^option {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 96px;
      height: 118px;
      padding-bottom: 5px;
      padding-top: 15px;
      border-radius: 3px;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #edf0f5;
    }
    ^option:hover {
      border: solid 1px #604aff;
      cursor: pointer;
    }
    ^option-title {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }
    ^option-icon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 62px;
      width: 62px;
      margin-bottom: 8px;
    }
  `,

  messages: [
    { name: 'MENU_TITLE', message: 'Add a contact' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      expression: function() {
        return this.menuDAO
          .where(
            this.AND(
              this.STARTS_WITH(this.Menu.ID, 'sme.menu'),
              this.EQ(this.Menu.PARENT, 'sme')
            )
          )
          .orderBy(this.Menu.ORDER);
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('title'))
          .add(this.MENU_TITLE)
        .end()
        .start()
          .addClass(this.myClass('options'))
          .select(this.dao$proxy, function(menu) {
            return this.E()
              .call(function() {
                this.start()
                  .addClass(self.myClass('option'))
                  .on('click', function() {
                    self.pushMenu(menu.id);
                  })
                  .start()
                    .addClass(self.myClass('option-icon-container'))
                    .start('img')
                      .addClass(self.myClass('option-icon'))
                      .style({
                        'width': menu.order == 4 ? '45px' : '50px',
                        'height': menu.order == 4 ? '35px' : '50px'
                      })
                      .attr('src', menu.icon)
                    .end()
                  .end()
                  .start()
                    .addClass(self.myClass('option-title'))
                    .add(menu.label)
                  .end()
                .end()
              });
          })
        .end(); 
    }
  ]
});