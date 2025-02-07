import { type SchemaTypeDefinition } from 'sanity'
import { allProducts } from './product'
import { order } from './order'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [allProducts, order],
}
