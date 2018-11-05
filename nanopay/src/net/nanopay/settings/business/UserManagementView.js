foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'UserManagementView',
  extends: 'foam.u2.View',
  documentation: 'View displaying users associated to other users or business.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.MDAO',
    'foam.nanos.auth.UserUserJunction',
    'net.nanopay.model.ClientUserJunction'
  ],

  imports: [
    'agentJunctionDAO',
    'user'
  ],

  css: `
    ^ {
      width: 992px;
      margin: auto;
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
      message: `You don't have any users apart of your business. Click the Add
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
        .startContext({ data: this.data })
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
        alert('Adding users to your business is not supported.');
        // Add add user flow
      }
    }
  ]
});
