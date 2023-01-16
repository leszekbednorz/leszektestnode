import * as configuration from '@app/backend/build/outputs-flat.json'

export const ConfigurationReader = {
  get (keyName: string): string {
    if (!(keyName in configuration)) {
      throw new Error(`Configuration does not contain ${keyName}`)
    }
    return configuration[keyName as keyof typeof configuration]
  }
}
