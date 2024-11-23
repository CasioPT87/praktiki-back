export const up = async (knex) => {
  await knex.schema.createTable('private_chat_request', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign keys for 'request' and 'asked', both reference the 'id' in the 'user' table
    table.integer('request').unsigned().notNullable(); // The user who is sending the request
    table.integer('asked').unsigned().notNullable(); // The user who is being asked

    // Set up foreign key constraints for 'request' and 'asked'
    table
      .foreign('request')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');
    table.foreign('asked').references('id').inTable('user').onDelete('CASCADE');

    // Timestamps for accepted and rejected
    table.timestamp('accepted').nullable(); // Timestamp for when the request is accepted (nullable)
    table.timestamp('rejected').nullable(); // Timestamp for when the request is rejected (nullable)

    // Standard timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('private_chat_request');
};
