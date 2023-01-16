import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { ConfigurationReader } from '../models/configuration-reader.model'

export class CognitoService {
  private readonly client: CognitoIdentityServiceProvider

  constructor (region: string) {
    this.client = new CognitoIdentityServiceProvider({ region })
  }

  async getAccessToken (email: string, password: string): Promise<string | undefined> {
    return await this.client.initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: ConfigurationReader.get('IdentityPoolId'),
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    }).promise()
      .then(result => result.AuthenticationResult?.AccessToken)
  }
}
