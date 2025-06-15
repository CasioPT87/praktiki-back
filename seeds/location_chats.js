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
    { id: 3, name: 'republic of ireland' },
  ]);

  const locations = [
    // ... (Your previous 51 entries for Spain)
    {
      id: 1,
      name: 'Vitoria-Gasteiz',
      x_coordinates: -2.6716,
      y_coordinates: 42.8466,
      country_id: 1,
    },
    {
      id: 2,
      name: 'Albacete',
      x_coordinates: -1.8557,
      y_coordinates: 38.9942,
      country_id: 1,
    },
    {
      id: 3,
      name: 'Alicante',
      x_coordinates: -0.4815,
      y_coordinates: 38.3452,
      country_id: 1,
    },
    {
      id: 4,
      name: 'Almería',
      x_coordinates: -2.4682,
      y_coordinates: 36.8381,
      country_id: 1,
    },
    {
      id: 5,
      name: 'Ávila',
      x_coordinates: -4.6983,
      y_coordinates: 40.6542,
      country_id: 1,
    },
    {
      id: 6,
      name: 'Badajoz',
      x_coordinates: -6.9744,
      y_coordinates: 38.8782,
      country_id: 1,
    },
    {
      id: 7,
      name: 'Palma de Mallorca',
      x_coordinates: 2.6502,
      y_coordinates: 39.5694,
      country_id: 1,
    },
    {
      id: 8,
      name: 'Barcelona',
      x_coordinates: 2.1769,
      y_coordinates: 41.3828,
      country_id: 1,
    },
    {
      id: 9,
      name: 'Bilbao',
      x_coordinates: -2.9349,
      y_coordinates: 43.263,
      country_id: 1,
    },
    {
      id: 10,
      name: 'Burgos',
      x_coordinates: -3.675,
      y_coordinates: 42.3439,
      country_id: 1,
    },
    {
      id: 11,
      name: 'Cáceres',
      x_coordinates: -6.3712,
      y_coordinates: 39.4792,
      country_id: 1,
    },
    {
      id: 12,
      name: 'Cádiz',
      x_coordinates: -6.2929,
      y_coordinates: 36.5303,
      country_id: 1,
    },
    {
      id: 13,
      name: 'Santander',
      x_coordinates: -3.8041,
      y_coordinates: 43.4623,
      country_id: 1,
    },
    {
      id: 14,
      name: 'Castellón de la Plana',
      x_coordinates: -0.0338,
      y_coordinates: 39.9877,
      country_id: 1,
    },
    {
      id: 15,
      name: 'Ciudad Real',
      x_coordinates: -3.9213,
      y_coordinates: 38.9866,
      country_id: 1,
    },
    {
      id: 16,
      name: 'Córdoba',
      x_coordinates: -4.7797,
      y_coordinates: 37.8829,
      country_id: 1,
    },
    {
      id: 17,
      name: 'A Coruña',
      x_coordinates: -8.4063,
      y_coordinates: 43.3623,
      country_id: 1,
    },
    {
      id: 18,
      name: 'Cuenca',
      x_coordinates: -2.1368,
      y_coordinates: 40.07,
      country_id: 1,
    },
    {
      id: 19,
      name: 'Girona',
      x_coordinates: 2.8213,
      y_coordinates: 41.9831,
      country_id: 1,
    },
    {
      id: 20,
      name: 'Granada',
      x_coordinates: -3.6022,
      y_coordinates: 37.1882,
      country_id: 1,
    },
    {
      id: 21,
      name: 'Guadalajara',
      x_coordinates: -3.1667,
      y_coordinates: 40.63,
      country_id: 1,
    },
    {
      id: 22,
      name: 'San Sebastián',
      x_coordinates: -1.9812,
      y_coordinates: 43.3216,
      country_id: 1,
    },
    {
      id: 23,
      name: 'Huelva',
      x_coordinates: -6.9447,
      y_coordinates: 37.26,
      country_id: 1,
    },
    {
      id: 24,
      name: 'Huesca',
      x_coordinates: -0.4087,
      y_coordinates: 42.1408,
      country_id: 1,
    },
    {
      id: 25,
      name: 'Jaén',
      x_coordinates: -3.791,
      y_coordinates: 37.7699,
      country_id: 1,
    },
    {
      id: 26,
      name: 'León',
      x_coordinates: -5.567,
      y_coordinates: 42.6,
      country_id: 1,
    },
    {
      id: 27,
      name: 'Lleida',
      x_coordinates: 0.62,
      y_coordinates: 41.6167,
      country_id: 1,
    },
    {
      id: 28,
      name: 'Logroño',
      x_coordinates: -2.4497,
      y_coordinates: 42.4639,
      country_id: 1,
    },
    {
      id: 29,
      name: 'Lugo',
      x_coordinates: -7.5567,
      y_coordinates: 43.0117,
      country_id: 1,
    },
    {
      id: 30,
      name: 'Madrid',
      x_coordinates: -3.7038,
      y_coordinates: 40.4168,
      country_id: 1,
    },
    {
      id: 31,
      name: 'Málaga',
      x_coordinates: -4.4203,
      y_coordinates: 36.7213,
      country_id: 1,
    },
    {
      id: 32,
      name: 'Murcia',
      x_coordinates: -1.13,
      y_coordinates: 37.9922,
      country_id: 1,
    },
    {
      id: 33,
      name: 'Pamplona',
      x_coordinates: -1.6432,
      y_coordinates: 42.8125,
      country_id: 1,
    },
    {
      id: 34,
      name: 'Ourense',
      x_coordinates: -7.8647,
      y_coordinates: 42.3367,
      country_id: 1,
    },
    {
      id: 35,
      name: 'Oviedo',
      x_coordinates: -5.843,
      y_coordinates: 43.36,
      country_id: 1,
    },
    {
      id: 36,
      name: 'Palencia',
      x_coordinates: -4.5258,
      y_coordinates: 42.01,
      country_id: 1,
    },
    {
      id: 37,
      name: 'Pontevedra',
      x_coordinates: -8.6472,
      y_coordinates: 42.4336,
      country_id: 1,
    },
    {
      id: 38,
      name: 'Salamanca',
      x_coordinates: -5.6639,
      y_coordinates: 40.9631,
      country_id: 1,
    },
    {
      id: 39,
      name: 'Santa Cruz de Tenerife',
      x_coordinates: -16.2518,
      y_coordinates: 28.4682,
      country_id: 1,
    },
    {
      id: 40,
      name: 'Segovia',
      x_coordinates: -4.12,
      y_coordinates: 40.95,
      country_id: 1,
    },
    {
      id: 41,
      name: 'Sevilla',
      x_coordinates: -5.994,
      y_coordinates: 37.3886,
      country_id: 1,
    },
    {
      id: 42,
      name: 'Soria',
      x_coordinates: -2.4764,
      y_coordinates: 41.7667,
      country_id: 1,
    },
    {
      id: 43,
      name: 'Tarragona',
      x_coordinates: 1.25,
      y_coordinates: 41.1189,
      country_id: 1,
    },
    {
      id: 44,
      name: 'Teruel',
      x_coordinates: -1.1,
      y_coordinates: 42.3,
      country_id: 1,
    },
    {
      id: 45,
      name: 'Toledo',
      x_coordinates: -4.0266,
      y_coordinates: 39.8628,
      country_id: 1,
    },
    {
      id: 46,
      name: 'Valencia',
      x_coordinates: -0.3763,
      y_coordinates: 39.4699,
      country_id: 1,
    },
    {
      id: 47,
      name: 'Valladolid',
      x_coordinates: -4.72,
      y_coordinates: 41.652,
      country_id: 1,
    },
    {
      id: 48,
      name: 'Zamora',
      x_coordinates: -5.75,
      y_coordinates: 41.5,
      country_id: 1,
    },
    {
      id: 49,
      name: 'Zaragoza',
      x_coordinates: -0.88,
      y_coordinates: 41.6488,
      country_id: 1,
    },
    {
      id: 50,
      name: 'Ceuta',
      x_coordinates: -5.3167,
      y_coordinates: 35.8883,
      country_id: 1,
    },
    {
      id: 51,
      name: 'Melilla',
      x_coordinates: -2.937,
      y_coordinates: 35.2929,
      country_id: 1,
    },

    // UK Counties/Areas (starting from id 52, country_id: 2)
    {
      id: 52,
      name: 'London',
      x_coordinates: -0.1276,
      y_coordinates: 51.5074,
      country_id: 2,
    }, // Greater London
    {
      id: 53,
      name: 'Birmingham',
      x_coordinates: -1.9026,
      y_coordinates: 52.4862,
      country_id: 2,
    }, // West Midlands
    {
      id: 54,
      name: 'Manchester',
      x_coordinates: -2.2426,
      y_coordinates: 53.4808,
      country_id: 2,
    }, // Greater Manchester
    {
      id: 55,
      name: 'Liverpool',
      x_coordinates: -2.9833,
      y_coordinates: 53.4,
      country_id: 2,
    }, // Merseyside
    {
      id: 56,
      name: 'Leeds',
      x_coordinates: -1.5491,
      y_coordinates: 53.8008,
      country_id: 2,
    }, // West Yorkshire
    {
      id: 57,
      name: 'Bristol',
      x_coordinates: -2.59,
      y_coordinates: 51.4543,
      country_id: 2,
    }, // City of Bristol
    {
      id: 58,
      name: 'Edinburgh',
      x_coordinates: -3.1883,
      y_coordinates: 55.9533,
      country_id: 2,
    }, // City of Edinburgh (Scotland)
    {
      id: 59,
      name: 'Glasgow',
      x_coordinates: -4.2518,
      y_coordinates: 55.861,
      country_id: 2,
    }, // Glasgow City (Scotland)
    {
      id: 60,
      name: 'Cardiff',
      x_coordinates: -3.1791,
      y_coordinates: 51.4816,
      country_id: 2,
    }, // Cardiff (Wales)
    {
      id: 61,
      name: 'Belfast',
      x_coordinates: -5.9264,
      y_coordinates: 54.6079,
      country_id: 2,
    }, // Belfast (Northern Ireland)
    {
      id: 62,
      name: 'Newcastle upon Tyne',
      x_coordinates: -1.6113,
      y_coordinates: 54.9783,
      country_id: 2,
    }, // Tyne and Wear
    {
      id: 63,
      name: 'Sheffield',
      x_coordinates: -1.4701,
      y_coordinates: 53.3811,
      country_id: 2,
    }, // South Yorkshire
    {
      id: 64,
      name: 'Nottingham',
      x_coordinates: -1.15,
      y_coordinates: 52.95,
      country_id: 2,
    }, // Nottinghamshire
    {
      id: 65,
      name: 'Leicester',
      x_coordinates: -1.1394,
      y_coordinates: 52.6369,
      country_id: 2,
    }, // Leicestershire
    {
      id: 66,
      name: 'Southampton',
      x_coordinates: -1.4043,
      y_coordinates: 50.9097,
      country_id: 2,
    }, // Hampshire
    {
      id: 67,
      name: 'Derby',
      x_coordinates: -1.4678,
      y_coordinates: 52.9234,
      country_id: 2,
    }, // Derbyshire
    {
      id: 68,
      name: 'Plymouth',
      x_coordinates: -4.1422,
      y_coordinates: 50.3714,
      country_id: 2,
    }, // Devon
    {
      id: 69,
      name: 'Norwich',
      x_coordinates: 1.2974,
      y_coordinates: 52.6288,
      country_id: 2,
    }, // Norfolk
    {
      id: 70,
      name: 'Cambridge',
      x_coordinates: 0.1218,
      y_coordinates: 52.2053,
      country_id: 2,
    }, // Cambridgeshire
    {
      id: 71,
      name: 'Oxford',
      x_coordinates: -1.2577,
      y_coordinates: 51.752,
      country_id: 2,
    }, // Oxfordshire
    {
      id: 72,
      name: 'Brighton',
      x_coordinates: -0.1368,
      y_coordinates: 50.8225,
      country_id: 2,
    }, // East Sussex (Brighton and Hove UA)
    {
      id: 73,
      name: 'Canterbury',
      x_coordinates: 1.078,
      y_coordinates: 51.2799,
      country_id: 2,
    }, // Kent
    {
      id: 74,
      name: 'Chelmsford',
      x_coordinates: 0.4798,
      y_coordinates: 51.7361,
      country_id: 2,
    }, // Essex
    {
      id: 75,
      name: 'Gloucester',
      x_coordinates: -2.2475,
      y_coordinates: 51.8648,
      country_id: 2,
    }, // Gloucestershire
    {
      id: 76,
      name: 'Winchester',
      x_coordinates: -1.319,
      y_coordinates: 51.0632,
      country_id: 2,
    }, // Hampshire (historical county town, Southampton listed as main city)
    {
      id: 77,
      name: 'Exeter',
      x_coordinates: -3.5333,
      y_coordinates: 50.7167,
      country_id: 2,
    }, // Devon
    {
      id: 78,
      name: 'Truro',
      x_coordinates: -5.051,
      y_coordinates: 50.2599,
      country_id: 2,
    }, // Cornwall
    {
      id: 79,
      name: 'Dorchester',
      x_coordinates: -2.4333,
      y_coordinates: 50.7167,
      country_id: 2,
    }, // Dorset
    {
      id: 80,
      name: 'Durham',
      x_coordinates: -1.5733,
      y_coordinates: 54.7761,
      country_id: 2,
    }, // County Durham
    {
      id: 81,
      name: 'Lancaster',
      x_coordinates: -2.801,
      y_coordinates: 54.047,
      country_id: 2,
    }, // Lancashire
    {
      id: 82,
      name: 'Lincoln',
      x_coordinates: -0.5376,
      y_coordinates: 53.2307,
      country_id: 2,
    }, // Lincolnshire
    {
      id: 83,
      name: 'Northampton',
      x_coordinates: -0.897,
      y_coordinates: 52.2329,
      country_id: 2,
    }, // Northamptonshire
    {
      id: 84,
      name: 'Carlisle',
      x_coordinates: -2.9348,
      y_coordinates: 54.8912,
      country_id: 2,
    }, // Cumbria
    {
      id: 85,
      name: 'York',
      x_coordinates: -1.0815,
      y_coordinates: 53.9593,
      country_id: 2,
    }, // North Yorkshire
    {
      id: 86,
      name: 'Shrewsbury',
      x_coordinates: -2.753,
      y_coordinates: 52.7107,
      country_id: 2,
    }, // Shropshire
    {
      id: 87,
      name: 'Stafford',
      x_coordinates: -2.1158,
      y_coordinates: 52.8093,
      country_id: 2,
    }, // Staffordshire
    {
      id: 88,
      name: 'Ipswich',
      x_coordinates: 1.1555,
      y_coordinates: 52.0592,
      country_id: 2,
    }, // Suffolk
    {
      id: 89,
      name: 'Guildford',
      x_coordinates: -0.5709,
      y_coordinates: 51.2362,
      country_id: 2,
    }, // Surrey
    {
      id: 90,
      name: 'Warwick',
      x_coordinates: -1.5833,
      y_coordinates: 52.2833,
      country_id: 2,
    }, // Warwickshire
    {
      id: 91,
      name: 'Worcester',
      x_coordinates: -2.22,
      y_coordinates: 52.192,
      country_id: 2,
    }, // Worcestershire
    {
      id: 92,
      name: 'Aylesbury',
      x_coordinates: -0.8126,
      y_coordinates: 51.8153,
      country_id: 2,
    }, // Buckinghamshire
    {
      id: 93,
      name: 'Hertford',
      x_coordinates: -0.0792,
      y_coordinates: 51.795,
      country_id: 2,
    }, // Hertfordshire
    {
      id: 94,
      name: 'Maidstone',
      x_coordinates: 0.5283,
      y_coordinates: 51.2721,
      country_id: 2,
    }, // Kent (another key town)
    {
      id: 95,
      name: 'Lewes',
      x_coordinates: 0.005,
      y_coordinates: 50.8732,
      country_id: 2,
    }, // East Sussex
    {
      id: 96,
      name: 'Chichester',
      x_coordinates: -0.7792,
      y_coordinates: 50.8365,
      country_id: 2,
    }, // West Sussex
    {
      id: 97,
      name: 'Newport',
      x_coordinates: -3.0069,
      y_coordinates: 51.5878,
      country_id: 2,
    }, // Isle of Wight (and Wales)
    {
      id: 98,
      name: 'Stoke-on-Trent',
      x_coordinates: -2.1794,
      y_coordinates: 53.0027,
      country_id: 2,
    }, // Staffordshire (unitary authority)
    {
      id: 99,
      name: 'Poole',
      x_coordinates: -1.989,
      y_coordinates: 50.7169,
      country_id: 2,
    }, // Dorset (unitary authority)
    {
      id: 100,
      name: 'Southend-on-Sea',
      x_coordinates: 0.715,
      y_coordinates: 51.542,
      country_id: 2,
    }, // Essex (unitary authority)
    {
      id: 101,
      name: 'Peterborough',
      x_coordinates: -0.2508,
      y_coordinates: 52.5739,
      country_id: 2,
    }, // Cambridgeshire (unitary authority)
    {
      id: 102,
      name: 'Swindon',
      x_coordinates: -1.7722,
      y_coordinates: 51.5685,
      country_id: 2,
    }, // Wiltshire (unitary authority)
    {
      id: 103,
      name: 'Telford',
      x_coordinates: -2.0736,
      y_coordinates: 52.68,
      country_id: 2,
    }, // Shropshire (unitary authority)
    {
      id: 104,
      name: 'Blackpool',
      x_coordinates: -3.0503,
      y_coordinates: 53.8142,
      country_id: 2,
    }, // Lancashire (unitary authority)
    {
      id: 105,
      name: 'Middlesbrough',
      x_coordinates: -1.2343,
      y_coordinates: 54.5779,
      country_id: 2,
    }, // North Yorkshire (unitary authority)
    {
      id: 106,
      name: 'Aberdeen',
      x_coordinates: -2.0991,
      y_coordinates: 57.1497,
      country_id: 2,
    }, // Aberdeen City (Scotland)
    {
      id: 107,
      name: 'Dundee',
      x_coordinates: -2.9707,
      y_coordinates: 56.462,
      country_id: 2,
    }, // Dundee City (Scotland)
    {
      id: 108,
      name: 'Inverness',
      x_coordinates: -4.2247,
      y_coordinates: 57.4778,
      country_id: 2,
    }, // Highland (Scotland)
    {
      id: 109,
      name: 'Perth',
      x_coordinates: -3.437,
      y_coordinates: 56.397,
      country_id: 2,
    }, // Perth and Kinross (Scotland)
    {
      id: 110,
      name: 'Swansea',
      x_coordinates: -3.9436,
      y_coordinates: 51.6214,
      country_id: 2,
    }, // Swansea (Wales)
    {
      id: 111,
      name: 'Newry',
      x_coordinates: -6.349,
      y_coordinates: 54.176,
      country_id: 2,
    }, // Newry, Mourne and Down (Northern Ireland)
    {
      id: 112,
      name: 'Derry / Londonderry',
      x_coordinates: -7.3074,
      y_coordinates: 54.9958,
      country_id: 2,
    }, // Derry City and Strabane (Northern Ireland)

    // Republic of Ireland Counties (starting from id 113, country_id: 3)
    {
      id: 113,
      name: 'Dublin',
      x_coordinates: -6.2603,
      y_coordinates: 53.3498,
      country_id: 3,
    }, // County Dublin
    {
      id: 114,
      name: 'Cork',
      x_coordinates: -8.47,
      y_coordinates: 51.8969,
      country_id: 3,
    }, // County Cork
    {
      id: 115,
      name: 'Galway',
      x_coordinates: -9.0568,
      y_coordinates: 53.2734,
      country_id: 3,
    }, // County Galway
    {
      id: 116,
      name: 'Limerick',
      x_coordinates: -8.6262,
      y_coordinates: 52.668,
      country_id: 3,
    }, // County Limerick
    {
      id: 117,
      name: 'Waterford',
      x_coordinates: -7.11,
      y_coordinates: 52.2472,
      country_id: 3,
    }, // County Waterford
    {
      id: 118,
      name: 'Kilkenny',
      x_coordinates: -7.2585,
      y_coordinates: 52.6517,
      country_id: 3,
    }, // County Kilkenny
    {
      id: 119,
      name: 'Kildare',
      x_coordinates: -6.6575,
      y_coordinates: 53.1557,
      country_id: 3,
    }, // County Kildare
    {
      id: 120,
      name: 'Clonmel',
      x_coordinates: -7.7026,
      y_coordinates: 52.3556,
      country_id: 3,
    }, // County Tipperary (South Tipperary is Clonmel, North is Nenagh)
    {
      id: 121,
      name: 'Ennis',
      x_coordinates: -8.9852,
      y_coordinates: 52.8465,
      country_id: 3,
    }, // County Clare
    {
      id: 122,
      name: 'Tralee',
      x_coordinates: -9.7026,
      y_coordinates: 52.2709,
      country_id: 3,
    }, // County Kerry
    {
      id: 123,
      name: 'Wexford',
      x_coordinates: -6.4678,
      y_coordinates: 52.3389,
      country_id: 3,
    }, // County Wexford
    {
      id: 124,
      name: 'Drogheda',
      x_coordinates: -6.3506,
      y_coordinates: 53.7144,
      country_id: 3,
    }, // County Louth (Dundalk is also a major town)
    {
      id: 125,
      name: 'Dundalk',
      x_coordinates: -6.398,
      y_coordinates: 53.9933,
      country_id: 3,
    }, // County Louth
    {
      id: 126,
      name: 'Athlone',
      x_coordinates: -7.94,
      y_coordinates: 53.4243,
      country_id: 3,
    }, // County Westmeath
    {
      id: 127,
      name: 'Carlow',
      x_coordinates: -6.938,
      y_coordinates: 52.8367,
      country_id: 3,
    }, // County Carlow
    {
      id: 128,
      name: 'Port Laoise',
      x_coordinates: -7.3,
      y_coordinates: 53.0333,
      country_id: 3,
    }, // County Laois
    {
      id: 129,
      name: 'Longford',
      x_coordinates: -7.7983,
      y_coordinates: 53.7297,
      country_id: 3,
    }, // County Longford
    {
      id: 130,
      name: 'Castlebar',
      x_coordinates: -9.2974,
      y_coordinates: 53.8569,
      country_id: 3,
    }, // County Mayo
    {
      id: 131,
      name: 'Sligo',
      x_coordinates: -8.4761,
      y_coordinates: 54.276,
      country_id: 3,
    }, // County Sligo
    {
      id: 132,
      name: 'Roscommon',
      x_coordinates: -8.1925,
      y_coordinates: 53.6261,
      country_id: 3,
    }, // County Roscommon
    {
      id: 133,
      name: 'Letterkenny',
      x_coordinates: -7.7456,
      y_coordinates: 54.95,
      country_id: 3,
    }, // County Donegal
    {
      id: 134,
      name: 'Monaghan',
      x_coordinates: -6.9696,
      y_coordinates: 54.2494,
      country_id: 3,
    }, // County Monaghan
    {
      id: 135,
      name: 'Cavan',
      x_coordinates: -7.375,
      y_coordinates: 53.9926,
      country_id: 3,
    }, // County Cavan
    {
      id: 136,
      name: 'Mullingar',
      x_coordinates: -7.34,
      y_coordinates: 53.525,
      country_id: 3,
    }, // County Westmeath (another main town)
    {
      id: 137,
      name: 'Tullamore',
      x_coordinates: -7.4924,
      y_coordinates: 53.275,
      country_id: 3,
    }, // County Offaly
    {
      id: 138,
      name: 'Wicklow',
      x_coordinates: -6.0468,
      y_coordinates: 52.9808,
      country_id: 3,
    }, // County Wicklow
  ];

  await knex('location').insert(locations);

  await knex('location_chat').insert([
    { id: 1, location_id: 1, language_combination_id: 1 },
    { id: 2, location_id: 2, language_combination_id: 1 },
    { id: 3, location_id: 3, language_combination_id: 1 },
    { id: 4, location_id: 4, language_combination_id: 1 },
    { id: 5, location_id: 5, language_combination_id: 1 },
    { id: 6, location_id: 6, language_combination_id: 1 },
    { id: 7, location_id: 7, language_combination_id: 1 },
    { id: 8, location_id: 8, language_combination_id: 1 },
    { id: 9, location_id: 9, language_combination_id: 1 },
    { id: 10, location_id: 10, language_combination_id: 1 },
    { id: 11, location_id: 11, language_combination_id: 1 },
    { id: 12, location_id: 12, language_combination_id: 1 },
    { id: 13, location_id: 13, language_combination_id: 1 },
    { id: 14, location_id: 14, language_combination_id: 1 },
    { id: 15, location_id: 15, language_combination_id: 1 },
    { id: 16, location_id: 16, language_combination_id: 1 },
    { id: 17, location_id: 17, language_combination_id: 1 },
    { id: 18, location_id: 18, language_combination_id: 1 },
    { id: 19, location_id: 19, language_combination_id: 1 },
    { id: 20, location_id: 20, language_combination_id: 1 },
    { id: 21, location_id: 21, language_combination_id: 1 },
    { id: 22, location_id: 22, language_combination_id: 1 },
    { id: 23, location_id: 23, language_combination_id: 1 },
    { id: 24, location_id: 24, language_combination_id: 1 },
    { id: 25, location_id: 25, language_combination_id: 1 },
    { id: 26, location_id: 26, language_combination_id: 1 },
    { id: 27, location_id: 27, language_combination_id: 1 },
    { id: 28, location_id: 28, language_combination_id: 1 },
    { id: 29, location_id: 29, language_combination_id: 1 },
    { id: 30, location_id: 30, language_combination_id: 1 },
    { id: 31, location_id: 31, language_combination_id: 1 },
    { id: 32, location_id: 32, language_combination_id: 1 },
    { id: 33, location_id: 33, language_combination_id: 1 },
    { id: 34, location_id: 34, language_combination_id: 1 },
    { id: 35, location_id: 35, language_combination_id: 1 },
    { id: 36, location_id: 36, language_combination_id: 1 },
    { id: 37, location_id: 37, language_combination_id: 1 },
    { id: 38, location_id: 38, language_combination_id: 1 },
    { id: 39, location_id: 39, language_combination_id: 1 },
    { id: 40, location_id: 40, language_combination_id: 1 },
    { id: 41, location_id: 41, language_combination_id: 1 },
    { id: 42, location_id: 42, language_combination_id: 1 },
    { id: 43, location_id: 43, language_combination_id: 1 },
    { id: 44, location_id: 44, language_combination_id: 1 },
    { id: 45, location_id: 45, language_combination_id: 1 },
    { id: 46, location_id: 46, language_combination_id: 1 },
    { id: 47, location_id: 47, language_combination_id: 1 },
    { id: 48, location_id: 48, language_combination_id: 1 },
    { id: 49, location_id: 49, language_combination_id: 1 },
    { id: 50, location_id: 50, language_combination_id: 1 },
    { id: 51, location_id: 51, language_combination_id: 1 },
    { id: 52, location_id: 52, language_combination_id: 1 },
    { id: 53, location_id: 53, language_combination_id: 1 },
    { id: 54, location_id: 54, language_combination_id: 1 },
    { id: 55, location_id: 55, language_combination_id: 1 },
    { id: 56, location_id: 56, language_combination_id: 1 },
    { id: 57, location_id: 57, language_combination_id: 1 },
    { id: 58, location_id: 58, language_combination_id: 1 },
    { id: 59, location_id: 59, language_combination_id: 1 },
    { id: 60, location_id: 60, language_combination_id: 1 },
    { id: 61, location_id: 61, language_combination_id: 1 },
    { id: 62, location_id: 62, language_combination_id: 1 },
    { id: 63, location_id: 63, language_combination_id: 1 },
    { id: 64, location_id: 64, language_combination_id: 1 },
    { id: 65, location_id: 65, language_combination_id: 1 },
    { id: 66, location_id: 66, language_combination_id: 1 },
    { id: 67, location_id: 67, language_combination_id: 1 },
    { id: 68, location_id: 68, language_combination_id: 1 },
    { id: 69, location_id: 69, language_combination_id: 1 },
    { id: 70, location_id: 70, language_combination_id: 1 },
    { id: 71, location_id: 71, language_combination_id: 1 },
    { id: 72, location_id: 72, language_combination_id: 1 },
    { id: 73, location_id: 73, language_combination_id: 1 },
    { id: 74, location_id: 74, language_combination_id: 1 },
    { id: 75, location_id: 75, language_combination_id: 1 },
    { id: 76, location_id: 76, language_combination_id: 1 },
    { id: 77, location_id: 77, language_combination_id: 1 },
    { id: 78, location_id: 78, language_combination_id: 1 },
    { id: 79, location_id: 79, language_combination_id: 1 },
    { id: 80, location_id: 80, language_combination_id: 1 },
    { id: 81, location_id: 81, language_combination_id: 1 },
    { id: 82, location_id: 82, language_combination_id: 1 },
    { id: 83, location_id: 83, language_combination_id: 1 },
    { id: 84, location_id: 84, language_combination_id: 1 },
    { id: 85, location_id: 85, language_combination_id: 1 },
    { id: 86, location_id: 86, language_combination_id: 1 },
    { id: 87, location_id: 87, language_combination_id: 1 },
    { id: 88, location_id: 88, language_combination_id: 1 },
    { id: 89, location_id: 89, language_combination_id: 1 },
    { id: 90, location_id: 90, language_combination_id: 1 },
    { id: 91, location_id: 91, language_combination_id: 1 },
    { id: 92, location_id: 92, language_combination_id: 1 },
    { id: 93, location_id: 93, language_combination_id: 1 },
    { id: 94, location_id: 94, language_combination_id: 1 },
    { id: 95, location_id: 95, language_combination_id: 1 },
    { id: 96, location_id: 96, language_combination_id: 1 },
    { id: 97, location_id: 97, language_combination_id: 1 },
    { id: 98, location_id: 98, language_combination_id: 1 },
    { id: 99, location_id: 99, language_combination_id: 1 },
    { id: 100, location_id: 100, language_combination_id: 1 },
    { id: 101, location_id: 101, language_combination_id: 1 },
    { id: 102, location_id: 102, language_combination_id: 1 },
    { id: 103, location_id: 103, language_combination_id: 1 },
    { id: 104, location_id: 104, language_combination_id: 1 },
    { id: 105, location_id: 105, language_combination_id: 1 },
    { id: 106, location_id: 106, language_combination_id: 1 },
    { id: 107, location_id: 107, language_combination_id: 1 },
    { id: 108, location_id: 108, language_combination_id: 1 },
    { id: 109, location_id: 109, language_combination_id: 1 },
    { id: 110, location_id: 110, language_combination_id: 1 },
    { id: 111, location_id: 111, language_combination_id: 1 },
    { id: 112, location_id: 112, language_combination_id: 1 },
    { id: 113, location_id: 113, language_combination_id: 1 },
    { id: 114, location_id: 114, language_combination_id: 1 },
    { id: 115, location_id: 115, language_combination_id: 1 },
    { id: 116, location_id: 116, language_combination_id: 1 },
    { id: 117, location_id: 117, language_combination_id: 1 },
    { id: 118, location_id: 118, language_combination_id: 1 },
    { id: 119, location_id: 119, language_combination_id: 1 },
    { id: 120, location_id: 120, language_combination_id: 1 },
    { id: 121, location_id: 121, language_combination_id: 1 },
    { id: 122, location_id: 122, language_combination_id: 1 },
    { id: 123, location_id: 123, language_combination_id: 1 },
    { id: 124, location_id: 124, language_combination_id: 1 },
    { id: 125, location_id: 125, language_combination_id: 1 },
    { id: 126, location_id: 126, language_combination_id: 1 },
    { id: 127, location_id: 127, language_combination_id: 1 },
    { id: 128, location_id: 128, language_combination_id: 1 },
    { id: 129, location_id: 129, language_combination_id: 1 },
    { id: 130, location_id: 130, language_combination_id: 1 },
    { id: 131, location_id: 131, language_combination_id: 1 },
    { id: 132, location_id: 132, language_combination_id: 1 },
    { id: 133, location_id: 133, language_combination_id: 1 },
    { id: 134, location_id: 134, language_combination_id: 1 },
    { id: 135, location_id: 135, language_combination_id: 1 },
    { id: 136, location_id: 136, language_combination_id: 1 },
    { id: 137, location_id: 137, language_combination_id: 1 },
    { id: 138, location_id: 138, language_combination_id: 1 },
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
