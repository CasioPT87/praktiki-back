export const up = async (knex) => {
  await knex.schema.createTable('location_chat', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign key for 'location_id', referencing the 'id' in the 'location' table
    table.integer('location_id').unsigned().notNullable();
    table.foreign('location_id').references('id').inTable('location');

    // Foreign key for 'languages_id', referencing the 'id' in the 'language_combination' table
    table.integer('language_combination_id').unsigned().notNullable();
    table
      .foreign('language_combination_id')
      .references('id')
      .inTable('language_combination');

    // Standard timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('location_chat');
};
