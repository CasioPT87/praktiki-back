export const up = async (knex) => {
  await knex.schema.createTable('notification', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign key for 'user_id', referencing the 'id' in the 'user' table
    table.integer('user_id').unsigned().notNullable();
    table
      .foreign('user_id')
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');

    // 'text' field to store the notification message
    table.text('text').notNullable();

    // Boolean field to indicate whether the notification has been read
    table.boolean('read').defaultTo(false); // Default is false, meaning the notification is unread

    // Standard timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('notification');
};
