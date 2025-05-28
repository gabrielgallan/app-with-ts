import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('transactions', (table) => {
        table.uuid('id').primary(),
        table.uuid('account_id').notNullable().references('id').inTable('accounts').onDelete('CASCADE'),
        table.float('amount').notNullable(),
        table.enum('type', ['debit', 'credit']).notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('transactions');
}

