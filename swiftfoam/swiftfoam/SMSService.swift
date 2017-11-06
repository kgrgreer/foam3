//
//  SMSService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-25.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class SMSService: TokenGenService {
  public static let instance: SMSService = SMSService()

  init() {
    super.init(withURL: ServiceURLs.ServiceURL.SMS, withSession: true)
  }
}
