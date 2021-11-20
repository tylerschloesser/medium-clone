import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import { nanoid } from 'nanoid'
import {
  enumType,
  extendType,
  list,
  makeSchema,
  nonNull,
  objectType,
  queryType,
  stringArg,
} from 'nexus'
import path from 'path'
import { Context } from './context'

const Post = objectType({
  name: 'Post',
  definition(t) {
    t.id('id')
    t.string('title')
    t.string('body')
    t.string('author')
    t.string('image')
  },
})

interface Post {
  id: string
  title: string
  body: string
  author?: string
  image?: string
}

// https://source.unsplash.com/random/200x150

const PostFilter = enumType({
  name: 'PostFilter',
  members: ['Home', 'Mine'],
})

const Query = queryType({
  definition(t) {
    t.string('hello', {
      args: { name: stringArg() },
      resolve: (_parent, { name }) => `Hello ${name || 'World'}!`,
    })
    t.field('posts', {
      type: list(Post),
      args: { filter: PostFilter },
      resolve: (_parent, { filter }, context) => {
        if (filter === 'Home') {
          return context.prisma.post.findMany({ take: 10 })
        }
        if (filter === 'Mine') {
          return context.prisma.post.findMany({
            take: 10,
            where: {
              ownerId: { equals: 'tyler' },
            },
          })
        }
        throw Error(`Invalid filter: ${filter}`)
      },
    })
    t.field('post', {
      type: Post,
      args: { id: nonNull(stringArg()) },
      resolve: async (_parent, args, context) => {
        const post = await context.prisma.post.findUnique({
          where: { id: args.id },
        })
        if (!post) {
          throw Error(`Invalid post ID: ${args.id}`)
        }
        return post
      },
    })
  },
})

const PostMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('update', {
      type: 'Post',
      args: {
        id: stringArg(),
        title: nonNull(stringArg()),
        body: nonNull(stringArg()),
        image: stringArg(),
      },
      async resolve(_root, args, context) {
        let post = {
          ...args,
          author: 'Tyler Schloesser',
          ownerId: 'tyler',
        }
        if (!post.id) {
          const postId = nanoid()
          const data = {
            ...post,
            id: postId,
          }
          return context.prisma.post.create({ data })
        } else {
          const data = {
            ...post,
            id: post.id,
          }
          return await context.prisma.post.update({
            where: { id: data.id },
            data,
          })
        }
      },
    })
  },
})

async function main() {
  const schema = makeSchema({
    types: [Query, PostMutation],
    outputs: {
      schema: path.join(__dirname, '/generated/schema.graphql'),
      typegen: path.join(__dirname, '/generated/typings.ts'),
    },
    contextType: {
      module: path.join(__dirname, './context.ts'),
      export: 'Context',
    },
  })

  const prisma = new PrismaClient()
  const context: Context = { prisma }

  const app = express()
  app.use(cors())
  app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      context,
      graphiql: true,
    }),
  )
  app.listen(4000, () => {
    console.log('graphql server listening')
  })
}

main()
