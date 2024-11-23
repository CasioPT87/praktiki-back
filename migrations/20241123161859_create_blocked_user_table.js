export const up = async (knex) => {
  await knex.schema.createTable('blocked_user', (table) => {
    table.increments('id').primary(); // 'id' is the primary key
    table.integer('user_id').unsigned().notNullable(); // 'user_id' column, foreign key to user table
    table.integer('blocked_user').unsigned().notNullable(); // 'blocked_user' column, foreign key to user table
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now()); // Creation timestamp
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now()); // Update timestamp
    table.datetime('deleted_at').nullable(); // Deletion timestamp (nullable)

    // Set up foreign key relationships
    table
      .foreign('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table
      .foreign('blocked_user')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');

    // Ensure both user_id and blocked_user can't reference the same user (you can't block yourself)
    table.unique(['user_id', 'blocked_user']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('blocked_user');
};
