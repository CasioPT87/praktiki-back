/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await deleteSeed(knex);

  await knex('icon').insert([
    { id: 1, path: '/' },
    { id: 2, path: '/' },
    { id: 3, path: '/' },
  ]);

  await knex('language').insert([
    { id: 1, name: 'spanish', icon_id: 1 },
    { id: 2, name: 'english', icon_id: 2 },
  ]);

  await knex('language_combination').insert([
    { id: 1, language_1_id: 1, language_2_id: 2 },
  ]);

  await knex('country').insert([
    { id: 1, name: 'spain' },
    { id: 2, name: 'great britain' },
  ]);

  await knex('location').insert([
    {
      id: 1,
      name: 'madrid',
      x_coordinates: -3.7038,
      y_coordinates: 40.4168,
      country_id: 1,
    },
    {
      id: 2,
      name: 'london',
      x_coordinates: -0.1276,
      y_coordinates: 51.5074,
      country_id: 2,
    },
  ]);

  await knex('location_chat').insert([
    { id: 1, location_id: 1, language_combination_id: 1 },
    { id: 2, location_id: 2, language_combination_id: 1 },
  ]);
}

async function deleteSeed(knex) {
  await knex('location_chat').del();
  await knex('location').del();
  await knex('country').del();
  await knex('language_combination').del();
  await knex('language').del();
  await knex('icon').del();
}
