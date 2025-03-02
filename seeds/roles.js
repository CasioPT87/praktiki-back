/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await deleteSeed(knex);

  await knex('role').insert([{ id: 1, value: 10, name: 'user' }]);
}

async function deleteSeed(knex) {
  await knex('role').del();
}
