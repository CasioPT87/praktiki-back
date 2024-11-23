export const up = async (knex) => {
  await knex.schema.createTable('event', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign key for 'location_chat_id', referencing the 'id' in the 'location_chat' table
    table.integer('location_chat_id').unsigned().notNullable();
    table.foreign('location_chat_id').references('id').inTable('location_chat');

    // 'date' field to store the event date and time
    table.timestamp('date').notNullable();

    // Foreign key for 'creator_user_id', referencing the 'id' in the 'user' table
    table.integer('creator_user_id').unsigned().notNullable();
    table.foreign('creator_user_id').references('id').inTable('user');

    // 'link' field with a max length of 1000 characters
    table.string('link', 1000).nullable();

    // 'title' field with a max length of 200 characters
    table.string('title', 200).notNullable();

    // 'description' field with a max length of 2000 characters
    table.string('description', 2000).nullable();

    // Standard timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('event');
};
