export const up = function (knex) {
  return knex.schema.createTable('user_chosen_languages', function (table) {
    table.increments('id').primary();

    table
      .integer('user_id')
      .notNullable()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE');

    table
      .integer('language_1_id')
      .notNullable()
      .references('id')
      .inTable('language')
      .onDelete('RESTRICT');

    table
      .integer('language_2_id')
      .notNullable()
      .references('id')
      .inTable('language')
      .onDelete('RESTRICT');

    table.primary(['user_id']); // Ensures each user has only one row
  });
};

export const down = function (knex) {
  return knex.schema.dropTable('user_chosen_languages');
};
