import express from 'express'
import { queryType, stringArg, makeSchema } from 'nexus'
import { graphqlHTTP } from 'express-graphql'

const Query = queryType({
  definition(t) {
    t.string('hello', {
      args: { name: stringArg() },
      resolve: (parent, { name }) => `Hello ${name || 'World'}!`,
    })
  },
})

const schema = makeSchema({
  types: [Query],
  outputs: {
    schema: __dirname + '/generated/schema.graphql',
    typegen: __dirname + '/generated/typings.ts',
  },
})

const app = express()
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}))
app.listen(4000, () => {
  console.log('graphql server listening')
})
