//
//  ServiceURL.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class ServiceURLs {
  public enum Host: String {
    case Localhost = "http://localhost:8080/service/"
    case CCDemo = "https://foam.demo.nanopay.net/service/"
    case CCStaging = "http://cc.staging.nanopay.net/service/"
    case CCProduction = "https://cc.prod.nanopay.net/service/"
  }

  static var hostRoute: Host = .Localhost

  public static func setHostRoute(url: Host) {
    hostRoute = url
  }
}
