//
//  ServiceURL.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class ServiceURLs {
  public enum Host: String {
    case Localhost = "http://localhost:8080/"
    case KennysMacBook = "http://192.168.20.54:8080/"
    case CCDemo = "https://foam.demo.nanopay.net/"
  }

  static var hostRoute: Host = .Localhost

  public static func setHostRoute(url: Host) {
    hostRoute = url
  }

  public enum URL: String {
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
