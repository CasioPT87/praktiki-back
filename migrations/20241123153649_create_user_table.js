/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('user', (table) => {
    table.increments('id').primary(); // Primary key

    table.integer('role_id').unsigned().notNullable();
    table.foreign('role_id').references('id').inTable('role'); // Cascade delete

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now()); // Creation timestamp
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now()); // Update timestamp
    table.datetime('deleted_at').nullable(); // Deletion timestamp (nullable)
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('user'); // Rollback: drop the 'user' table
}
