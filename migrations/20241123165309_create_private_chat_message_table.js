export const up = async (knex) => {
  await knex.schema.createTable('private_chat_message', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign key for 'user_id', referencing the 'id' in the 'user' table
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('user');

    // 'text' field to store the message content
    table.text('text').notNullable();

    // Foreign key for 'private_chat_id', referencing the 'id' in the 'private_chat' table
    table.integer('private_chat_id').unsigned().notNullable();
    table.foreign('private_chat_id').references('id').inTable('private_chat');

    // Standard timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('private_chat_message');
};
