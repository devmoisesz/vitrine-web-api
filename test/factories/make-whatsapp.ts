import { faker } from '@faker-js/faker'

export function makeWhatsapp(): string {
  const ddd = faker.number.int({ min: 11, max: 99 }).toString()

  const numero = `9${faker.string.numeric(8)}`

  return `${ddd}${numero}`
}