import { knex } from '../database'
import fastify, { FastifyInstance } from 'fastify'
import crypto from 'node:crypto'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
    app.get('/accounts', async () => {
      const accounts = await knex('accounts').select('*')

      return {accounts}
    })

    app.get('/accounts/:id', async (request) => {
        const paramsSchema = z.object({
            id: z.string().uuid()
        })

        const { id } = paramsSchema.parse(request.params)
        const account = await knex('accounts').where({id})

        return {account}
    })

    app.post('/accounts', async (request, reply) => {
        const bodySchema = z.object({
            name: z.string(),
            pass: z.string()
        })

        const { name, pass } = bodySchema.parse(request.body)

        try {
            await knex('accounts').insert({
                id: crypto.randomUUID(),
                name,
                pass,
                balance: 0.0
            })
        } catch {
            reply.status(403).send('Error creating account!')
        }
        reply.status(201).send('Account created!')

    })

    app.patch('/accounts/:id', async (request, reply) => {
        const paramsSchema = z.object({
            id: z.string()
        })
        const bodySchema = z.object({
            pass: z.string(),
            amount: z.number(),
            type: z.enum(['debit', 'credit'])
        })

        const { id } = paramsSchema.parse(request.params)
        const { pass, amount, type } = bodySchema.parse(request.body)

        try {
            const user = await knex('accounts').where({ id }).first()
            if (user?.pass===pass) {
                let balance = type === "credit" ? user.balance + amount : user.balance - amount
                
                    await knex('accounts').where({ pass }).update({ balance })
                    await knex('transactions').insert({
                        id: crypto.randomUUID(),
                        account_id: id,
                        amount,
                        type
                })

                

                return reply.status(200).send('Account updated!')
            } else {
                return reply.status(404).send('Incorrect password!')
            }
        } catch {
            reply.status(404).send('Account not found!')
        }
    })

    app.delete('/accounts', async (request, reply) => {
        const bodySchema = z.object({
            name: z.string(),
            pass: z.string()
        })

        const { name, pass } = bodySchema.parse(request.body)

        try {
            const account = await knex('accounts').where({ name, pass }).first()
                if (!account) {
                    return reply.status(404).send('Account not found!')
                }

            await knex('transactions').where('account_id', account?.id).del()
            await knex('accounts').where({name, pass}).first().del()

            return reply.status(200).send('Account deleted!')
        } catch (err){
            return reply.status(404).send(err)
        }
        
    })

    app.get('/transactions/:id', async (request) => {
        const paramsSchema = z.object({
            id: z.string()
        })

        const { id } = paramsSchema.parse(request.params)

        const transactions = await knex('transactions').where('account_id', id)

        return { transactions }
    })

    app.get('/transactions', async (request, reply) => {
        try {
            const transactions = await knex('transactions').select('*')
            return { transactions }
        } catch {
            return reply.status(404).send('Connection error')
        }
    })

}