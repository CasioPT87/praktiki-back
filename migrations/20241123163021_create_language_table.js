export const up = async (knex) => {
  await knex.schema.createTable('language', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing
    table.string('name').notNullable(); // 'name' column, stores the language name, non-nullable
    table.integer('icon_id').unsigned().notNullable(); // 'icon_id' column, foreign key to 'icon' table

    // Set up foreign key constraint
    table.foreign('icon_id').references('id').inTable('icon'); // Cascade delete on icon deletion

    // Timestamp columns
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('language');
};
