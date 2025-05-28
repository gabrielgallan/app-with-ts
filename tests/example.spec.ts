import { expect, test, beforeAll, afterAll, describe } from 'vitest'
import { execSync } from 'node:child_process'
import { knex } from '../src/database'
import request from 'supertest'
import { app } from '../src/app'

describe('Users Routes', () => {
        beforeAll(async () => {
        await app.ready()
        execSync('npm run knex migrate:latest')
    })

        afterAll(async () => {
        await app.close()
    })

    const user = {
        name: 'Fernando',
        pass: 'fern4040'
    }

    const { name, pass } = user

    let accountId: any

    test('User can create a new account', async () => {
        //Fazer uma simulação de requisição HTTP rodando em um server do node
        const response = await request(app.server)
                                .post('/accounts')
                                .send(user)

        expect(response.statusCode).toEqual(201)

        const account = await knex('accounts').where({name, pass}).first()
        expect(account).toBeDefined
        accountId = account?.id
    })

    test('User can create a new transaction', async () => {
        const response = await request(app.server)
                               .patch(`/accounts/${accountId}`)
                               .send({
                                    pass,
                                    amount: 1000,
                                    type: "debit"
                               })

        expect(response.statusCode).toEqual(200)
    })

    test('User can delete account and his transactions', async () => {
        const reponse = await request(app.server)
                             .delete('/accounts')
                             .send(user)

        expect(reponse.statusCode).toEqual(200)
    })
})


