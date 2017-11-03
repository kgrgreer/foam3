//
//  ServiceURL.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class ServiceURLs {
  public enum ServiceHost: String {
    case Localhost = "http://localhost:8080/"
    case KennysMacBook = "http://192.168.20.54:8080/"
  }

  static var hostRoute: ServiceHost = .Localhost

  public static func setHostRoute(url: ServiceHost) {
    hostRoute = url
  }

  public enum ServiceURL: String {
    case Transaction = "transactionDAO"
    case Account = "accountDAO"
    case User = "userDAO"
    case Country = "countryDAO"
    case Region = "regionDAO"
    case SMS = "smsToken"
    case Email = "emailToken"

    func path() -> String {
      return "\(hostRoute.rawValue)\(self.rawValue)"
    }
  }
}
