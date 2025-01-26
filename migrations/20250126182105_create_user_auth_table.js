export const up = async (knex) => {
  await knex.schema.createTable('user_auth', (table) => {
    table.increments('id').primary(); // 'id' is the primary key
    table.integer('user_id').unsigned().notNullable(); // 'user_id' column, foreign key to user table
    table.string('password', 60).nullable();
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now()); // Creation timestamp
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now()); // Update timestamp
    table.datetime('deleted_at').nullable(); // Deletion timestamp (nullable)

    table.foreign('user_id').references('id').inTable('user');
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('user_auth');
};
