FOAM_FILES([
  { name: 'net/nanopay/dao/crypto/EncryptedObject' },
  { name: 'net/nanopay/model/Account' },
  { name: 'net/nanopay/model/AccountLimit' },
  { name: 'net/nanopay/model/Branch' },
  { name: 'net/nanopay/model/BankAccount' },
  { name: 'net/nanopay/model/Currency' },
  { name: 'net/nanopay/model/BusinessSector' },
  { name: 'net/nanopay/model/BusinessType' },
  { name: 'net/nanopay/model/PadAccount' },
  { name: 'net/nanopay/model/DateAndPlaceOfBirth' },
  { name: 'net/nanopay/model/Identification' },
  { name: 'net/nanopay/ui/wizard/WizardView', flags: ['web'] },
  { name: 'net/nanopay/auth/token/TokenService', flags: ['web'] },
  { name: 'net/nanopay/auth/token/AbstractTokenService', flags: ['web'] },
  { name: 'net/nanopay/auth/sms/AuthyTokenService', flags: ['web'] },
  { name: 'net/nanopay/auth/ui/BusinessRegistrationView', flags: ['web'] },
  { name: 'net/nanopay/auth/ui/SignInView' , flags: ['web']},
  { name: 'net/nanopay/auth/ui/UserRegistrationView', flags: ['web'] },
  { name: 'net/nanopay/ui/wizard/WizardOverview', flags: ['web'] },
  { name: 'net/nanopay/ui/wizard/WizardSubView', flags: ['web'] },
  { name: 'net/nanopay/ui/NotificationActionCard', flags: ['web'] },
  { name: 'net/nanopay/ui/ContentCard', flags: ['web'] },
  { name: 'net/nanopay/ui/RadioView', flags: ['web'] },
  { name: 'net/nanopay/ui/ToggleSwitch', flags: ['web'] },
  { name: 'net/nanopay/ui/LoadingSpinner', flags: ['web'] },
  { name: 'net/nanopay/ui/PostalCodeFormat', flags: ['web'] },
  { name: 'net/nanopay/ui/NotificationMessage', flags: ['web'] },

  // fx
  { name: 'net/nanopay/fx/model/ExchangeRate' },
  { name: 'net/nanopay/fx/model/ExchangeRateQuote' },
  { name: 'net/nanopay/fx/ExchangeRateInterface' },
  { name: 'net/nanopay/fx/client/ClientExchangeRateService' },
  { name: 'net/nanopay/fx/client/Client' },

  // retail
  { name: 'net/nanopay/retail/model/DeviceType' },
  { name: 'net/nanopay/retail/model/DeviceStatus' },
  { name: 'net/nanopay/retail/model/Device' },

  { name: 'net/nanopay/retail/ui/devices/DeviceCTACard', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/DevicesView', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceForm', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceNameForm', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceTypeForm', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceSerialForm', flags: ['web'] },
  { name: 'net/nanopay/retail/ui/devices/form/DevicePasswordForm', flags: ['web'] },

  // tx
  { name: 'net/nanopay/tx/model/TransactionPurpose' },
  { name: 'net/nanopay/tx/model/TransactionLimitTimeFrame' },
  { name: 'net/nanopay/tx/model/TransactionLimitType' },
  { name: 'net/nanopay/tx/model/TransactionLimit' },
  { name: 'net/nanopay/tx/model/Transaction' },
  { name: 'net/nanopay/tx/model/Fee' },
  { name: 'net/nanopay/tx/model/FixedFee' },
  { name: 'net/nanopay/tx/model/PercentageFee' },
  { name: 'net/nanopay/model/Broker' },

  { name: 'net/nanopay/tx/ui/TransactionsView', flags: ['web'] },

  { name: 'net/nanopay/util/ChallengeGenerator' },

  // cico
  { name: 'net/nanopay/cico/model/BaseServiceProvider' },
  { name: 'net/nanopay/cico/model/ServiceProvider' },
  { name: 'net/nanopay/cico/model/TransactionStatus' },
  { name: 'net/nanopay/cico/model/TransactionType' },
  { name: 'net/nanopay/cico/model/Transaction' },
  { name: 'net/nanopay/cico/ui/bankAccount/BankAccountsView', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/bankAccount/BankCTACard', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/bankAccount/form/BankCashoutForm', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/bankAccount/form/BankDoneForm', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/bankAccount/form/BankForm', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/bankAccount/form/BankInfoForm', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/bankAccount/form/BankVerificationForm', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/CicoView', flags: ['web'] },
  { name: 'net/nanopay/cico/spi/alterna/AlternaFormat' },

  // invoice
  { name: 'net/nanopay/invoice/model/Invoice'},
  { name: 'net/nanopay/invoice/model/RecurringInvoice'},
  { name: 'net/nanopay/invoice/ui/ExpensesView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SalesView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/InvoiceDashboardView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/PayableSummaryView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/ReceivableSummaryView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/MentionsView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SummaryCard', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/shared/ActionInterfaceButton', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/shared/SingleItemView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/shared/SingleSubscriptionView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/BillDetailView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/InvoiceDetailView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/ExpensesDetailView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SalesDetailView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SubscriptionView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SubscriptionEditView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SubscriptionDetailView', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/SubscriptionInvoiceView', flags: ['web'] },

  // settings
  { name: 'net/nanopay/settings/SettingsNavigator', flags: ['web'] },
  { name: 'net/nanopay/settings/autoCashout/AutoCashoutSettingsView', flags: ['web'] },
  { name: 'net/nanopay/settings/business/BusinessSettingsView', flags: ['web'] },
  { name: 'net/nanopay/settings/business/EditBusinessView', flags: ['web'] },
  { name: 'net/nanopay/settings/business/IntegrationView', flags: ['web'] },
  { name: 'net/nanopay/settings/personal/PersonalSettingsView', flags: ['web'] },
  

  // style
  { name: 'net/nanopay/invoice/ui/styles/InvoiceStyles', flags: ['web'] },
  { name: 'net/nanopay/ui/modal/ModalStyling', flags: ['web'] },
  { name: 'net/nanopay/ui/modal/ExportModal', flags: ['web'] },
  { name: 'net/nanopay/ui/styles/AppStyles', flags: ['web'] },

  // modal
  { name: 'net/nanopay/invoice/ui/modal/ApproveModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/DisputeModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/PayNowModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/ScheduleModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/RecordPaymentModal', flags: ['web'] },
  { name: 'net/nanopay/invoice/ui/modal/SingleResolutionModal', flags: ['web'] },
  { name: 'net/nanopay/ui/modal/EmailModal', flags: ['web'] },
  { name: 'net/nanopay/ui/modal/ModalHeader', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/ci/ConfirmCashInModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/co/ConfirmCashOutModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/ci/CashInModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/co/CashOutModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/ci/CashInSuccessModal', flags: ['web'] },
  { name: 'net/nanopay/cico/ui/co/CashOutSuccessModal', flags: ['web'] },

  //misc
  { name: 'net/nanopay/TempMenu' },

  //util
  { name: 'net/nanopay/util/CurrencyFormatter' },
  { name: 'net/nanopay/util/Iso20022' },

  //ui
  { name: 'net/nanopay/ui/forgotPassword/EmailView', flags: ['web'] },
  { name: 'net/nanopay/ui/forgotPassword/ResendView', flags: ['web'] },
  { name: 'net/nanopay/ui/forgotPassword/ResetView', flags: ['web'] },
  { name: 'net/nanopay/ui/forgotPassword/SuccessView', flags: ['web'] },
  { name: 'net/nanopay/ui/topNavigation/BusinessLogoView', flags: ['web'] },
  { name: 'net/nanopay/ui/topNavigation/NoMenuTopNav', flags: ['web'] },
  { name: 'net/nanopay/ui/topNavigation/SubMenuBar', flags: ['web'] },
  { name: 'net/nanopay/ui/topNavigation/TopNav', flags: ['web'] },
  { name: 'net/nanopay/ui/topNavigation/UserTopNavView', flags: ['web'] },
  { name: 'net/nanopay/ui/FooterView', flags: ['web'] },
  { name: 'net/nanopay/ui/ActionButton', flags: ['web'] },
  { name: 'net/nanopay/ui/Placeholder', flags: ['web'] },
  { name: 'net/nanopay/ui/TransferView', flags: ['web'] },
  { name: 'net/nanopay/ui/ActionView', flags: ['web'] },
  { name: 'net/nanopay/ui/Controller', flags: ['web'] },
  { name: 'net/nanopay/model/Relationships'},

  { name: 'net/nanopay/settings/business/experiment', flags: ['web'] }

  
]);
