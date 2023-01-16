import { AttributeMap } from 'aws-sdk/clients/dynamodb'
import { DataProvider } from '../models/data-provider.model'
import { SeedData } from '../models/seed-data.model'

export class MembershipDataProvider implements DataProvider {
  public extract (data: SeedData): AttributeMap[] {
    return data.organizations.flatMap(({ organizationId, members }) => {
      const orgMembership: AttributeMap[] = []
      const membersLength = members?.length ?? 0
      if (membersLength > 0) {
        const orgKey = { S: `ORG#${organizationId}` }
        members?.forEach((email) => {
          const userKey = { S: `USR#${email}` }
          orgMembership.push({
            pk: orgKey,
            sk: userKey,
            gsi1pk: userKey,
            gsi1sk: orgKey,
            organizationId: { S: organizationId },
            type: { S: 'OrganizationUserMembership' },
            userId: { S: email }
          })
        })
      }
      return orgMembership
    })
  }
}
