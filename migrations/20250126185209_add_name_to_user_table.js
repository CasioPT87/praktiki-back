export const up = async (knex) => {
  return knex.schema.table('user', function (table) {
    table.string('name').notNullable(); // Add the 'name' column as a non-nullable string
  });
};

export const down = async (knex) => {
  return knex.schema.table('user', function (table) {
    table.dropColumn('name'); // Rollback: Remove the 'name' column
  });
};
