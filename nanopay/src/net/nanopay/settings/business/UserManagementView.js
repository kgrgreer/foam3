foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'UserManagementView',
  extends: 'foam.u2.View',
  documentation: 'View that users can use to manage its staff or users that have access to them.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.MDAO',
    'foam.nanos.auth.UserUserJunction',
    'foam.u2.dialog.Popup',
    'net.nanopay.model.ClientUserJunction'
  ],

  imports: [
    'agentJunctionDAO',
    'user'
  ],

  css: `
    ^ {
      margin: auto;
    }
    ^ td {
      width: 100%;
    }
    ^ .foam-u2-view-TableView-net-nanopay-model-ClientUserJunction {
      width: 100% !important;
    }
    ^ table {
      width: 100% !important;
    }
    ^ .net-nanopay-ui-ActionView-addUser {
      float: right;
      margin-bottom: 10px;
      margin-right: 23px;
    }
  `,

  properties: [
    {
      name: 'clientJunctionDAO',
      documentation: `Agent Junction DAO storing presentable junction objects.`,
      factory: function() {
        return this.MDAO.create({ of: 'net.nanopay.model.ClientUserJunction' });
      }
    }
  ],

  messages: [
    {
      name: 'PLACEHOLDER_TEXT',
      message: `You don't have any users part of your business. Click the Add
        a user button to add a new user to your business.`
    }
  ],

  methods: [
    function init() {
      var self = this;
      // Populate the clientJunctionDAO with presentable junction information.
      var agentJunctionDAO = this.agentJunctionDAO.where(this.EQ(this.UserUserJunction.TARGET_ID, this.user.id));

      agentJunctionDAO.select({
        put: function(junction) {
          junction = self.ClientUserJunction.create({
            name: junction.yourInfo.label(),
            title: junction.jobTitle,
            email: junction.yourInfo.email,
            group: junction.group
          });
          self.clientJunctionDAO.put(junction);
        }
      });
    },
    function initE() {
      this.addClass(this.myClass())
        .startContext({ data: this })
          .start(this.ADD_USER).end()
        .endContext()
        .tag({
          class: 'foam.u2.view.ScrollTableView',
          data$: this.clientJunctionDAO$,
          contextMenuActions: [
            foam.core.Action.create({
              name: 'disableUser',
              code: function(X) {
                // Replace with disable user logic
                alert('Disable user not supported.');
              }
            })
          ]
        })
        .tag({
          class: 'net.nanopay.ui.Placeholder',
          dao: this.clientJunctionDAO,
          message: this.PLACEHOLDER_TEXT,
          image: 'images/member-plus.png'
        });
    }
  ],

  actions: [
    {
      name: 'addUser',
      code: function() {
        // Add add user flow
        ctrl.add(this.Popup.create().tag({ class: 'net.nanopay.sme.ui.AddUserModal' }));
      }
    }
  ]
});
