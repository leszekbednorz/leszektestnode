import { App } from './app.js'

jest.mock('./app.js')

describe('Main', () => {
  test('Should create and synth app', async () => {
    await expect(await import('./main.js')).resolves
    expect(App.prototype.build).toBeCalled()
    expect(App.prototype.synth).toBeCalled()
  })
})
