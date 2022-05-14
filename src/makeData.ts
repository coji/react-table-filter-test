import { faker } from '@faker-js/faker'

faker.seed(1)
const newPerson = () => {
  return {
    category: faker.commerce.department(),
    company: faker.company.companyName(),
    dept: faker.company.bsNoun(),
    name: faker.name.firstName() + ' ' + faker.name.lastName(),
    email: faker.internet.email(),
    note: faker.lorem.words(),
  }
}

export default function makeData(len: number) {
  return Array(len)
    .fill(null)
    .map(() => newPerson())
}
