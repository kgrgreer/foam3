FOAM_FILES([
  { name: 'net/nanopay/auth/ui/SignInView' },
  { name: 'net/nanopay/dao/crypto/EncryptedObject' },
  { name: 'net/nanopay/model/Account' },
  { name: 'net/nanopay/model/AccountInfo' },
  { name: 'net/nanopay/model/AccountLimit' },
  { name: 'net/nanopay/model/Bank' },
  { name: 'net/nanopay/model/BankAccountInfo' },
  { name: 'net/nanopay/model/Currency' },  
  { name: 'net/nanopay/model/BusinessSector' },
  { name: 'net/nanopay/model/BusinessType' },
  { name: 'net/nanopay/model/PadAccount' },
  { name: 'net/nanopay/model/Phone' },
  { name: 'net/nanopay/model/User' },
  { name: 'net/nanopay/model/UserAccountInfo' },
  { name: 'net/nanopay/ui/wizard/WizardView' },
  { name: 'net/nanopay/ui/wizard/WizardOverview' },
  { name: 'net/nanopay/ui/wizard/WizardSubView' },
  { name: 'net/nanopay/ui/NotificationActionCard' },
  { name: 'net/nanopay/ui/ContentCard' },
  { name: 'net/nanopay/ui/RadioView' },
  { name: 'net/nanopay/ui/ToggleSwitch' },

  // cico
  { name: 'net/nanopay/cico/model/ServiceProvider' },
  { name: 'net/nanopay/cico/client/Client' },

  // fx
  { name: 'net/nanopay/fx/model/ExchangeRate' },
  { name: 'net/nanopay/fx/model/ExchangeRateQuote' },
  { name: 'net/nanopay/fx/ExchangeRateInterface' },
  { name: 'net/nanopay/fx/client/ClientExchangeRateService' },
  { name: 'net/nanopay/fx/client/Client' },

  // retail
  { name: 'net/nanopay/retail/client/Client' },
  { name: 'net/nanopay/retail/model/DeviceStatus' },
  { name: 'net/nanopay/retail/model/Device' },
  { name: 'net/nanopay/retail/ui/DeviceCTACard' },
  { name: 'net/nanopay/retail/ui/BankCTACard' },
  { name: 'net/nanopay/retail/ui/devices/DevicesView' },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceForm' },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceNameForm' },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceTypeForm' },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceSerialForm' },
  { name: 'net/nanopay/retail/ui/devices/form/DevicePasswordForm' },

  // tx
  { name: 'net/nanopay/tx/model/TransactionPurpose' },
  { name: 'net/nanopay/tx/model/TransactionLimitTimeFrame' },
  { name: 'net/nanopay/tx/model/TransactionLimitType' },
  { name: 'net/nanopay/tx/model/TransactionLimit' }, 
  { name: 'net/nanopay/tx/model/Transaction' },  
  { name: 'net/nanopay/tx/model/Fee' },
  { name: 'net/nanopay/tx/model/FixedFee' },
  { name: 'net/nanopay/tx/model/PercentageFee' },
  { name: 'net/nanopay/tx/client/Client' },
  { name: 'net/nanopay/model/Broker' },  

  { name: 'net/nanopay/util/ChallengeGenerator' },

  // invoice 
  { name: 'net/nanopay/invoice/model/Invoice'}, 
  { name: 'net/nanopay/invoice/model/RecurringInvoice'},   
  { name: 'net/nanopay/invoice/ui/ExpensesView' },
  { name: 'net/nanopay/invoice/ui/SalesView' },
  { name: 'net/nanopay/invoice/ui/InvoiceDashboardView' },
  { name: 'net/nanopay/invoice/ui/PayableSummaryView' },
  { name: 'net/nanopay/invoice/ui/ReceivableSummaryView' },
  { name: 'net/nanopay/invoice/ui/MentionsView' },
  { name: 'net/nanopay/invoice/ui/SummaryCard'}, 
  { name: 'net/nanopay/invoice/ui/shared/ActionInterfaceButton'}, 
  { name: 'net/nanopay/invoice/ui/shared/SingleItemView'}, 
  { name: 'net/nanopay/invoice/ui/shared/SingleSubscriptionView'},   
  { name: 'net/nanopay/invoice/ui/BillDetailView'}, 
  { name: 'net/nanopay/invoice/ui/InvoiceDetailView'}, 
  { name: 'net/nanopay/invoice/ui/ExpensesDetailView'}, 
  { name: 'net/nanopay/invoice/ui/SalesDetailView'}, 
  { name: 'net/nanopay/invoice/ui/SubscriptionView'},
  { name: 'net/nanopay/invoice/ui/SubscriptionEditView'},  
  { name: 'net/nanopay/invoice/ui/SubscriptionDetailView'},
  { name: 'net/nanopay/invoice/ui/SubscriptionInvoiceView'},
  
  //cico
  { name: 'net/nanopay/bank/ui/CicoView'},  
  
  // style
  { name: 'net/nanopay/invoice/ui/styles/InvoiceStyles'}, 
  { name: 'net/nanopay/ui/modal/ModalStyling' }, 
  { name: 'net/nanopay/ui/styles/AppStyles' },    
  
  // modal
  { name: 'net/nanopay/invoice/ui/modal/ApproveModal' },
  { name: 'net/nanopay/invoice/ui/modal/DisputeModal' },
  { name: 'net/nanopay/invoice/ui/modal/PayNowModal' },
  { name: 'net/nanopay/invoice/ui/modal/ScheduleModal' },
  { name: 'net/nanopay/invoice/ui/modal/RecordPaymentModal' },
  { name: 'net/nanopay/invoice/ui/modal/SingleResolutionModal' },
  { name: 'net/nanopay/ui/modal/EmailModal' },
  { name: 'net/nanopay/ui/modal/ModalHeader' },
  { name: 'net/nanopay/bank/ui/ci/ConfirmCashInModal'},
  { name: 'net/nanopay/bank/ui/co/ConfirmCashOutModal'},  
  { name: 'net/nanopay/bank/ui/ci/CashInModal'},  
  { name: 'net/nanopay/bank/ui/co/CashOutModal'},
  { name: 'net/nanopay/bank/ui/ci/CashInSuccessModal'},
  { name: 'net/nanopay/bank/ui/co/CashOutSuccessModal'},
  
  //misc 
  { name: 'net/nanopay/TempMenu' },
  
  //util
  { name: 'net/nanopay/util/CurrencyFormatter' },

  //ui
  { name: 'net/nanopay/ui/topNavigation/TopNav' },
  { name: 'net/nanopay/ui/topNavigation/BusinessLogoView' },
  { name: 'net/nanopay/ui/topNavigation/UserTopNavView' },
  { name: 'net/nanopay/ui/FooterView' },  
  { name: 'net/nanopay/ui/ActionButton' },  
  { name: 'net/nanopay/ui/Placeholder' },    
  { name: 'net/nanopay/ui/TransferView' },
  { name: 'net/nanopay/ui/ActionView' },
  { name: 'net/nanopay/ui/Controller' },
  { name: 'net/nanopay/model/Relationships' }
]);
