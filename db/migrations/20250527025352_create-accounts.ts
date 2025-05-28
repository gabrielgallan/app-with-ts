import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('accounts', (table) => {
        table.uuid('id').primary(),
        table.text('name').notNullable(),
        table.text('pass').notNullable(),
        table.float('balance').notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('accounts')
}

