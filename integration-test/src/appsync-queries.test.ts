import { ConfigurationReader } from './models/configuration-reader.model'
import * as seedData from '../seed-data.json'
import { CognitoService } from './services/cognito.service'
import { GraphqlService } from './services/graphql.service'

describe('AppSync', () => {
  let cognitoService: CognitoService
  let authenticationToken: string | undefined

  beforeEach(async () => {
    const [user] = seedData.users
    const { DEFAULT_PASSWORD: defaultPassword } = process.env
    cognitoService = new CognitoService(ConfigurationReader.get('RegionId'))
    authenticationToken = await cognitoService.getAccessToken(user.email, String(defaultPassword))
  })

  describe('Queries', () => {
    test('HelloWorldFromLambda', async () => {
      const service = new GraphqlService(String(authenticationToken))
      const expectedMessage = 'Hello, world!'

      const output = await service.request<
      { HelloWorldFromLambda: { message: string } },
      Record<string, unknown>
      >('query MyQuery { HelloWorldFromLambda { message }}', {})

      expect(output.HelloWorldFromLambda.message).toBe(expectedMessage)
    })
  })
})
