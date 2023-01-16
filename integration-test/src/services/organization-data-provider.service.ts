import { AttributeMap, AttributeValue } from 'aws-sdk/clients/dynamodb'
import { DataProvider } from '../models/data-provider.model'
import { SeedData } from '../models/seed-data.model'

export class OrganizationDataProvider implements DataProvider {
  public extract (data: SeedData): AttributeMap[] {
    return data.organizations.map(({ name, organizationId, suspended }) => {
      const keyValue: AttributeValue = { S: `ORG#${organizationId}` }
      return {
        pk: keyValue,
        sk: keyValue,
        name: { S: name },
        suspended: { BOOL: suspended ?? false },
        type: { S: 'Organization' }
      }
    })
  }
}
