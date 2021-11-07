import cors from 'cors'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { makeSchema, queryType, stringArg } from 'nexus'

const Query = queryType({
  definition(t) {
    t.string('hello', {
      args: { name: stringArg() },
      resolve: (_parent, { name }) => `Hello ${name || 'World'}!`,
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
app.use(cors())
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  }),
)
app.listen(4000, () => {
  console.log('graphql server listening')
})
