This is the template for product development, based on the
[Ship Every Merge specification](https://docs.google.com/document/d/1Hurb-cm5GWilIyOv6C2skjVaNrydJFTHUZefRy9w9Rk/edit?ts=5fae4f26#).

## Create project
* [Setup access to GitHub packages](https://github.com/trilogy-group/eng-base-ts/blob/main/doc/github-packages.md)
* Create a new product using the [getting started guide](https://github.com/trilogy-group/ship-every-merge/blob/main/docs/getting-started.md).

## Guidance
* Check quality with `npm run analyze`, `npm run test` and after deployment `npm run integration-test`
* Build with `npm run build`
* Deploy with `npm run deploy`
* Dependencies are to be placed in the applicable module, and as we bundle for release, should be dev dependencies (`npm install --save-dev`)

## Deployment
The command `npm run deploy` will trigger the publishing mechanism. In the backend workspace, it means the execution of the `cdk`
framework, that requires the definition of the following environment variable:

- `AWS_PROFILE` - the profile (Access Key ID, Secret Access Key, and default Region) for the deployment. Articles can
  be easily found on Amazon
  [in this regard](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

This is a command-line example for publishing all stacks, prefixed by the text `mysamplestack`:  
`AWS_PROFILE=myprofile npm run deploy -- -c prefix=mysamplestack --all`

The first time you deploy you'll need to setup your Cognito password:  
`aws cognito-idp admin-set-user-password --user-pool-id us-east-1_J8WVpJ1Pj --username cmcroot --password '...' --permanent`

## Integration tests
For executing integration tests against an AWS stack from your local environment:
1. Deploy your stack using `npm run deploy`
2. Seed data using `AWS_PROFILE=<profile> DEFAULT_PASSWORD=<password> npm run seed-data`
3. Execute the tests using `AWS_PROFILE=<profile> DEFAULT_PASSWORD=<same password from the previous step> npm run integration-test`

## Counting lines of code
Please check the [specific documentation](./LOC.md).
