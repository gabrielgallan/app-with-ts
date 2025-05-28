import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        accounts: {
            id: string,
            name: string,
            pass: string,
            balance: float
        },
        transactions: {
            id: string,
            account_id: string,
            amount: float,
            type: string
        }
    }
}