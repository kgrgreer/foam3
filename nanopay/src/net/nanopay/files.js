FOAM_FILES([
  { name: 'net/nanopay/auth/ui/SignInView' },
  { name: 'net/nanopay/client/Client' },
  { name: 'net/nanopay/dao/crypto/EncryptedObject' },

  // fx
  { name: 'net/nanopay/fx/model/ExchangeRate' },
  { name: 'net/nanopay/fx/model/ExchangeRateQuote' },
  { name: 'net/nanopay/fx/ExchangeRateInterface' },
  { name: 'net/nanopay/fx/client/ClientExchangeRateService' },
  { name: 'net/nanopay/fx/client/Client' },

  //model
  { name: 'net/nanopay/model/Account' },
  { name: 'net/nanopay/model/AccountInfo' },
  { name: 'net/nanopay/model/AccountLimit' },
  { name: 'net/nanopay/model/Bank' },
  { name: 'net/nanopay/model/BankAccountInfo' },
  { name: 'net/nanopay/model/BusinessSector' },
  { name: 'net/nanopay/model/BusinessType' },
  { name: 'net/nanopay/model/PadAccount' },
  { name: 'net/nanopay/model/Phone' },
  { name: 'net/nanopay/model/User' },
  { name: 'net/nanopay/model/UserAccountInfo' },

  // retail
  { name: 'net/nanopay/retail/client/Client' },
  { name: 'net/nanopay/retail/model/Device' },
  { name: 'net/nanopay/retail/model/DeviceStatus' },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceForm' },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceNameForm' },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceTypeForm' },
  { name: 'net/nanopay/retail/ui/devices/form/DeviceSerialForm' },
  { name: 'net/nanopay/retail/ui/devices/form/DevicePasswordForm' },
  { name: 'net/nanopay/retail/ui/devices/DeviceCTACard' },
  { name: 'net/nanopay/retail/ui/devices/DevicesView' },

  // tx
  { name: 'net/nanopay/tx/model/Transaction' },
  { name: 'net/nanopay/tx/model/TransactionPurpose' },
  { name: 'net/nanopay/tx/TransactionService' },
  { name: 'net/nanopay/tx/client/ClientTransactionService' },
  { name: 'net/nanopay/tx/client/Client' },

  // ui
  { name: 'net/nanopay/ui/wizard/WizardView' },
  { name: 'net/nanopay/ui/wizard/WizardOverview' },
  { name: 'net/nanopay/ui/wizard/WizardSubView' },
  { name: 'net/nanopay/ui/NotificationActionCard' },
  { name: 'net/nanopay/ui/ContentCard' }
]);