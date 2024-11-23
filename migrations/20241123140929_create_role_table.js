export const up = async (knex) => {
  await knex.schema.createTable('role', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // 'value' field that can be an integer in the range -100 to 100
    table.integer('value').notNullable();

    // 'name' field to store the role name
    table.string('name').notNullable();

    // Standard timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('role');
};
