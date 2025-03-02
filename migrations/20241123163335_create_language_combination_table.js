export const up = async (knex) => {
  await knex.schema.createTable('language_combination', (table) => {
    table.increments('id').primary(); // 'id' is the primary key, auto-incrementing

    // Foreign keys for language_1 and language_2, both reference the 'id' in the 'language' table
    table.integer('language_1_id').unsigned().notNullable(); // First language
    table.integer('language_2_id').unsigned().notNullable(); // Second language

    // Set up foreign key constraints for both language_1 and language_2
    table
      .foreign('language_1_id')
      .references('id')
      .inTable('language')
      .onDelete('CASCADE');
    table
      .foreign('language_2_id')
      .references('id')
      .inTable('language')
      .onDelete('CASCADE');

    // Timestamp columns
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable(); // 'created_at' with current timestamp by default
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable(); // 'updated_at' with current timestamp by default
    table.timestamp('deleted_at').nullable(); // 'deleted_at' for soft deletion, nullable

    // Additional constraints
    table.index(['language_1_id', 'language_2_id']); // Optional: index on language combinations for faster lookup
  });
};

export const down = async (knex) => {
  await knex.schema.dropTableIfExists('language_combination');
};
