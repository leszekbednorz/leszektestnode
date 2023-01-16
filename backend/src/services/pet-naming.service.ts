/**
 * A simple example service
 */
export class PetNamingService {
  namePool = [
    'Alan',
    'Bob',
    'Carmilla',
    'Daniella',
    'Edward',
    'Fred',
    'Georgia'
  ]

  createName (): string {
    const randomIndex = Math.floor(Math.random()) % this.namePool.length
    return this.namePool[randomIndex]
  }

  calculate (val1: number, val2: number): number {
    return val1 + val2
  }
}
