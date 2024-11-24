export const up = async (knex) => {
  await knex.schema.createTable('event_comment', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign key for 'location_chat_id', referencing the 'id' in the 'location_chat' table
    table.integer('location_chat_id').unsigned().notNullable();
    table
      .foreign('location_chat_id')
      .references('id')
      .inTable('location_chat')
      .onDelete('CASCADE');

    // 'text' field to store the comment content
    table.text('text').notNullable();

    // Foreign key for 'user_id', referencing the 'id' in the 'user' table
    table.integer('user_id').unsigned().notNullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');

    // Standard timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('event_comment');
};
