export const up = async (knex) => {
  await knex.schema.createTable('user_session_online', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing
    table.integer('user_id').unsigned().notNullable(); // 'user_id' column, foreign key to user table
    table.timestamp('start').defaultTo(knex.fn.now()).notNullable(); // 'start' timestamp, cannot be null
    table.timestamp('end').notNullable(); // 'end' timestamp, cannot be null

    // Set up foreign key constraint
    table
      .foreign('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE'); // Cascade delete on user deletion

    // Additional constraints can be added if needed, e.g., a unique combination of user_id and session time
    table.index(['user_id']); // Index on user_id to improve query performance
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('user_session_online');
};
