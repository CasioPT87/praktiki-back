export const up = async (knex) => {
  await knex.schema.createTable('private_chat', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign keys for user_id_1 and user_id_2, both reference the 'id' in the 'user' table
    table.integer('user_id_1').unsigned().notNullable(); // First user in the private chat
    table.integer('user_id_2').unsigned().notNullable(); // Second user in the private chat

    // Set up foreign key constraints for user_id_1 and user_id_2
    table.foreign('user_id_1').references('id').inTable('user');
    table.foreign('user_id_2').references('id').inTable('user');

    // Timestamp columns
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('private_chat');
};
