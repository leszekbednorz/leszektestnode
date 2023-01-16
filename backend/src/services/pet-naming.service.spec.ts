import { PetNamingService } from './pet-naming.service'

describe('PetNameService', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(2)
  })

  test('one name is returned', () => {
    const service = new PetNamingService()
    expect(service.createName()).toBe('Carmilla')
  })

  test('calculate', () => {
    const service = new PetNamingService()
    expect(service.calculate(10, 2)).toBe(12)
  })
})
