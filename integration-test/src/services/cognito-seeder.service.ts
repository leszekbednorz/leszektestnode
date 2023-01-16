import { AWSError, CognitoIdentityServiceProvider } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request'

import { Definitions } from '../models/definitions.model'
import { SeedData } from '../models/seed-data.model'
import { SeedUser } from '../models/seed-user.model'
import { SeederConfig } from '../models/seeder-config.model'

export class CognitoSeederService {
  private readonly messageAction = 'SUPPRESS'
  private readonly authFlow = 'ADMIN_NO_SRP_AUTH'
  private readonly challengeName = 'NEW_PASSWORD_REQUIRED'
  private readonly client: CognitoIdentityServiceProvider

  constructor (
    private readonly seederConfig: SeederConfig,
    private readonly defaultPassword: string,
    region: string
  ) {
    this.client = new CognitoIdentityServiceProvider({ region })
  }

  public async verifyUserPool (): Promise<
  PromiseResult<
  CognitoIdentityServiceProvider.DescribeUserPoolResponse,
  AWSError
  >
  > {
    return await this.client
      .describeUserPool({
        UserPoolId: this.seederConfig.userPoolId
      })
      .promise()
  }

  public async truncate (): Promise<void> {
    await this.truncateUsers()
    await this.truncateGroups()
  }

  public async seedCognito (seedData: SeedData): Promise<void> {
    const groupExistsExceptionCode = 'GroupExistsException'
    await this.client
      .createGroup({
        UserPoolId: this.seederConfig.userPoolId,
        GroupName: Definitions.adminGroupName
      })
      .promise()
      .catch(error => {
        if (error.code !== groupExistsExceptionCode) {
          throw error
        }
      })

    await Promise.all(
      seedData.users.map(async (user) => {
        await this.createUserInCognito(user)
        await this.confirmUserInCognito(user)
        if (user.isAdmin === true) {
          await this.makeUserAdmin(user)
        }
      })
    )
  }

  private async createUserInCognito (user: SeedUser): Promise<void> {
    const createUserResponse = await this.client
      .adminCreateUser({
        UserPoolId: this.seederConfig.userPoolId,
        Username: user.email,
        MessageAction: this.messageAction,
        TemporaryPassword: this.defaultPassword
      })
      .promise()

    const createdUser = createUserResponse.User
    if (createdUser == null) {
      console.error(createUserResponse.$response.error)
      throw new Error(`Error creating User ${user.email}`)
    }
  }

  private async confirmUserInCognito (user: SeedUser): Promise<void> {
    const initAuth = await this.client
      .adminInitiateAuth({
        UserPoolId: this.seederConfig.userPoolId,
        ClientId: this.seederConfig.identityPoolId,
        AuthFlow: this.authFlow,
        AuthParameters: {
          USERNAME: user.email,
          PASSWORD: this.defaultPassword
        }
      })
      .promise()

    await this.client
      .adminRespondToAuthChallenge({
        UserPoolId: this.seederConfig.userPoolId,
        ClientId: this.seederConfig.identityPoolId,
        ChallengeName: this.challengeName,
        ChallengeResponses: {
          USERNAME: user.email,
          NEW_PASSWORD: this.defaultPassword
        },
        Session: initAuth.Session
      })
      .promise()
  }

  private async makeUserAdmin (user: SeedUser): Promise<void> {
    await this.client
      .adminAddUserToGroup({
        UserPoolId: this.seederConfig.userPoolId,
        Username: user.email,
        GroupName: Definitions.adminGroupName
      })
      .promise()
  }

  private async truncateUsers (): Promise<void> {
    let nextKey: string | undefined
    do {
      const {
        Users: users,
        PaginationToken: paginationToken
      } = await this.client
        .listUsers({
          UserPoolId: this.seederConfig.userPoolId,
          Filter: '',
          PaginationToken: nextKey
        })
        .promise()
      nextKey = paginationToken

      if (users != null) {
        await Promise.all(
          users?.map(async (user) => {
            await this.client
              .adminDeleteUser({
                UserPoolId: this.seederConfig.userPoolId,
                Username: user.Username ?? ''
              })
              .promise()
          })
        )
      }
    } while (nextKey != null)
  }

  private async truncateGroups (): Promise<void> {
    let nextKey: string | undefined
    do {
      const { Groups: groups, NextToken: nextToken } = await this.client
        .listGroups({
          UserPoolId: this.seederConfig.userPoolId,
          NextToken: nextKey
        })
        .promise()
      nextKey = nextToken

      if (groups != null) {
        await Promise.all(
          groups
            ?.filter((group) => {
              return group.GroupName !== Definitions.adminGroupName
            })
            .map(async (group) => {
              await this.client
                .deleteGroup({
                  UserPoolId: this.seederConfig.userPoolId,
                  GroupName: group.GroupName ?? ''
                })
                .promise()
            })
        )
      }
    } while (nextKey !== undefined)
  }
}
