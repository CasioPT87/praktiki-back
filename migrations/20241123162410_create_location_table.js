export const up = async (knex) => {
  await knex.schema.createTable('location', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing
    table.string('name').notNullable(); // 'name' column, not nullable
    table.float('x_coordinates').nullable(); // 'x_coordinates' column, stores D (latitude/longitude or similar)
    table.float('y_coordinates').nullable(); // 'y_coordinates' column, stores Y (latitude/longitude or similar)

    // 'country_id' is a foreign key referencing the 'id' column in the 'country' table
    table.integer('country_id').unsigned().notNullable();
    table.foreign('country_id').references('id').inTable('country'); // Cascade delete

    // Timestamp columns
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' column with default current timestamp
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' column with default current timestamp
    table.timestamp('deleted_at').nullable(); // 'deleted_at' column for soft deletion, can be null

    // Add any constraints you may want
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('location');
};
