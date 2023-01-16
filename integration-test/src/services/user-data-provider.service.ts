import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb'

import { DataProvider } from '../models/data-provider.model'
import { SeedData } from '../models/seed-data.model'

export class UserDataProvider implements DataProvider {
  public extract (data: SeedData): AttributeMap[] {
    return data.users.map(
      ({ email, lastName, firstName, initials, avatarColor, suspended }) => {
        const keyValue: AttributeValue = { S: `USR#${email}` }
        return {
          pk: keyValue,
          sk: keyValue,
          email: { S: email },
          firstName: { S: firstName },
          lastName: { S: lastName },
          initials: { S: initials },
          avatarColor: { S: avatarColor },
          suspended: { BOOL: suspended === true },
          type: { S: 'User' }
        }
      }
    )
  }
}
