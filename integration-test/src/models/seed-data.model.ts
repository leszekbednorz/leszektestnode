import { SeedOrganization } from './seed-organization.model'
import { SeedUser } from './seed-user.model'

export interface SeedData {
  users: SeedUser[]
  organizations: SeedOrganization[]
}
