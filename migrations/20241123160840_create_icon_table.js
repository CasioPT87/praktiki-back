export const up = async (knex) => {
  await knex.schema.createTable('icon', (table) => {
    table.increments('id').primary(); // 'id' is the primary key
    table.string('path').notNullable(); // 'path' column, not nullable
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now()); // Creation timestamp
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now()); // Update timestamp
    table.datetime('deleted_at').nullable(); // Deletion timestamp (nullable)
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('icon');
};
