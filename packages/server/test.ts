import cors from 'cors'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { list, makeSchema, objectType, queryType, stringArg } from 'nexus'

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.id('id')
    t.string('title')
    t.string('author')
  },
})

const TEST_POSTS = [
  {
    title: 'The quick brow fox',
    author: 'Tyler Schloesser',
  },
  {
    title: 'My Struggle',
    author: 'Bill Clinton',
  },
].map((p, i) => ({ id: `test-${i}`, ...p }))

const Query = queryType({
  definition(t) {
    t.string('hello', {
      args: { name: stringArg() },
      resolve: (_parent, { name }) => `Hello ${name || 'World'}!`,
    })
    t.field('posts', {
      type: list(Post),
      resolve: () => TEST_POSTS,
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
