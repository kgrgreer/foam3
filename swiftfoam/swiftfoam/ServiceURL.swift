//
//  ServiceURL.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

enum ServiceHost: String {
  case Localhost = "http://localhost:8080/"
}

public enum ServiceURL: String {
  case Transaction = "transactionDAO"
  case Account = "accountDAO"
  case User = "userDAO"
  case Country = "countryDAO"
  case Region = "regionDAO"
  case SMS = "smsToken"

  func path() -> String {
    return "\(ServiceHost.Localhost.rawValue)\(self.rawValue)"
  }
}
