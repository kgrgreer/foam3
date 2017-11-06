//
//  EmailService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-30.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class EmailService: TokenGenService {
  public static let instance: EmailService = EmailService()

  init() {
    super.init(withURL: ServiceURLs.ServiceURL.Email, withSession: true)
  }
}

