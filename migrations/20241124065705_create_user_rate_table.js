export const up = async (knex) => {
  await knex.schema.createTable('user_rate', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign key for 'user_id', referencing the 'id' in the 'user' table
    table.integer('target_user_id').unsigned().notNullable();
    table.foreign('target_user_id').references('id').inTable('user');

    // Foreign key for 'user_id', referencing the 'id' in the 'user' table
    table.integer('voter_user_id').unsigned().notNullable();
    table.foreign('voter_user_id').references('id').inTable('user');

    table.float('rate').unsigned().notNullable().defaultTo(0);

    // Standard timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('user_rate');
};
