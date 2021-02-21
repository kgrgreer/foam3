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
  name: 'WizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  imports: [
    'auth',
    'userDAO',
    'pushMenu',
    'theme'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      background-color: white;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 100vw;
      z-index: 950;
      margin: 0;
      padding: 0;
      overflow: auto;
    }

    ^logo {
      height: 22px;
    }

    ^header {
      height: 64px;
      border: solid 1px #edf0f5;
      justify-content: space-between;
      align-items: center;
      display: flex;
      padding: 0 128px;
    }

    ^ .foam-u2-ProgressView {
      margin: 0;
      width: 100%;

      /* Reset the default appearance */
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
    }

    ^ progress[value]::-webkit-progress-bar {
      background-color: white;
    }

    ^ progress[value]::-webkit-progress-value {
      background-color: /*%PRIMARY3%*/ #604aff;
      -webkit-transition: all 0.1s ease-in;
      transition: all 0.1s ease-in;
    }
    ^ .net-nanopay-sme-onboarding-ui-WizardView-sections {
      flex-grow: 1;
    }

    ^ .net-nanopay-sme-onboarding-ui-WizardView-navigation-bar {
      height: 72px;

      background-color: white;
      box-shadow: 0 1px 1px 0 #dae1e9;
      border: solid 1px #edf0f5;

      align-items: center !important;
    }
    ^ .foam-u2-view-RadioView-horizontal-radio {
      margin-top: 10px;
    }
    ^ .inner-card {
      padding: 15px 0px;
    }
    ^ .contents-grow {
      flex-grow: 1;
    }
  `,
  properties: [
    {
      class: 'Int',
      name: 'currentPage',
      expression: function(lastUpdate, currentIndex, sections) {
        var currentPage = 0;
        for ( var i = 0; i < currentIndex; i++ ) {
          if ( sections[i].createIsAvailableFor(this.data$).get() ) {
            currentPage++;
          }
        }
        return currentPage + 1;
      }
    },
    {
      class: 'Int',
      name: 'numPages',
      expression: function(lastUpdate, data, sections) {
        return sections
          .filter((s) => s.createIsAvailableFor(this.data$).get())
          .length;
      }
    },
    {
      name: 'progress',
      expression: function(currentPage, numPages) {
        if ( currentPage < 0 ) return 0;
        if ( currentPage > numPages ) return 100;
        return (currentPage / numPages) * 100;
      },
      view: { class: 'foam.u2.ProgressView' }
    },
    {
      name: 'sectionView',
      value: { class: 'net.nanopay.sme.onboarding.ui.WizardPageView' }
    },
    {
      name: 'submitted',
      type: 'Boolean'
    }
  ],
  messages: [
    { name: 'SUCCESS_SUBMIT_MESSAGE', message: 'Business profile submitted successfully' }
  ],
  reactions: [
    ['data', 'propertyChange', 'saveDraft']
  ],
  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start().addClass(this.myClass('header'))
          .start({ class: 'foam.u2.tag.Image', data: self.theme.largeLogo || self.theme.logo }).addClass(this.myClass('logo')).end()
          .startContext({ data: this })
            .start()
              .tag(this.SAVE_AND_EXIT, {
                buttonStyle: 'TERTIARY',
                size: 'LARGE'
              })
              .addClass(this.myClass('save-exit'))
            .end()
          .endContext()
        .end()
        .startContext({ data: this })
          .add(this.PROGRESS)
        .endContext()
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E()
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              }).addClass('contents-grow');
          })).addClass(this.myClass('wizard-body'))
          .startContext({ data: this })
            .start(self.Cols)
              .addClass(this.myClass('footer'))
              .start()
                .tag(this.PREV, {
                  buttonStyle: 'TERTIARY',
                  icon: '/images/ablii/gobackarrow-grey.svg',
                  size: 'LARGE'
                })
              .end()
              .start()
                .tag(this.NEXT, {
                  size: 'LARGE',
                  label$: self.currentIndex$.map((ci) => ci === 0 ? 'Get Started' : 'Continue')
                })
                .tag(this.SUBMIT, { size: 'LARGE' })
              .end()
            .end()
          .endContext()
        .end();
    }
  ],
  listeners: [
    {
      name: 'saveDraft',
      isMerged: true,
      mergeDelay: 2000,
      code: function() {
        if ( this.submitted ) return;
        var dao = this.__context__[foam.String.daoize(this.data.model_.name)];
        dao.put(this.data.copyFrom({ // To-do : this.data.clone() does not get info properly, investigate later.
          status: (this.data.status === net.nanopay.sme.onboarding.OnboardingStatus.DRAFT ? 'DRAFT' : 'SAVED'),
          sendInvitation: false
        }));
      }
    }
  ],
  actions: [
    {
      name: 'submit',
      label: 'Finish',
      isAvailable: function(data$errors_, nextIndex) {
        return ! data$errors_ && nextIndex === -1;
      },
      // TODO: Find a better place for this. It shouldnt be baked into WizardView.
      code: function(x) {
        this.submitted = true;
        var dao = x[foam.String.daoize(this.data.model_.name)];
        dao.
          put(this.data.copyFrom({ // To-do : this.data.clone() does not get info properly, investigate later.
            status: (this.data.signingOfficer ? 'SUBMITTED' : 'SAVED'),
            sendInvitation: true
          })).
          then(async () => {
            await x.userDAO.find(x.user.id).then(o => {
              x.user = o;
              x.user.onboarded = o.onboarded;
              x.user.countryOfBusinessRegistration = o.countryOfBusinessRegistration;
              x.user.businessRegistrationDate = o.businessRegistrationDate;
              x.user.address = o.address;
            });

            await x.userDAO.find(x.subject.realUser.id).then(agent => {
              x.subject.realUser = agent;
            });

            this.auth.cache = {};
            x.pushMenu('mainmenu.dashboard');
            x.ctrl.notify(this.SUCCESS_SUBMIT_MESSAGE, '', foam.log.LogLevel.INFO, true);
          }, function(err) {
            console.log('Error during submitting the onboarding info: ' + err);
            x.ctrl.notify('Business profile submission failed.  ' +
                          ( ( err && err.message ) ? err.message : 'Please try again later.' ),
                          '', foam.log.LogLevel.ERROR, true);
          });
      }
    },
    {
      name: 'saveAndExit',
      label: 'Save & Exit',
      code: function(x) {
        var dao = this.__context__[foam.String.daoize(this.data.model_.name)];
        dao.put(this.data.copyFrom({ // To-do : this.data.clone() does not get info properly, investigate later.
          status: (this.data.status === net.nanopay.sme.onboarding.OnboardingStatus.DRAFT ? 'DRAFT' : 'SAVED'),
          sendInvitation: true
          })).
          then(function() {
            x.pushMenu('mainmenu.dashboard');
            x.ctrl.notify('Progress saved.', '', foam.log.LogLevel.INFO, true);
          }, function() {
            x.ctrl.notify('Error saving progress, please try again shortly.', '', foam.log.LogLevel.ERROR, true);
          });
      }
    }
  ]
});
