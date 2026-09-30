// Seeds 8 more realistic Rwandan-named members into the LOCAL backend
// (http://localhost:8000) via its authenticated API.
//
// How to run:
//   1. Open http://localhost:5173 in your browser (the app doesn't need to be
//      logged in for this, since the script carries its own token).
//   2. Open DevTools (F12) -> Console tab.
//   3. Paste this whole file's contents and press Enter.
//   4. Watch the console for progress / any per-member errors.
//
// This can't be run from Claude's own tools because the sandbox/browser it
// has access to cannot reach your machine's "localhost" — only a script
// running in *your* browser can reach http://localhost:8000.

(async () => {
  const API = 'http://localhost:8000/api/v1';
  const TOKEN = '2|2VOhzwn6YRAIC96WCWAqGTXtirg9Yz5xKV7ZwTHYd4c31486';

  async function get(path) {
    const res = await fetch(`${API}${path}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${TOKEN}` },
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${JSON.stringify(body)}`);
    return body?.data ?? body;
  }

  async function post(path, payload) {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`POST ${path} failed for ${payload.first_name} ${payload.last_name}: ${res.status} ${JSON.stringify(body)}`);
    return body?.data ?? body;
  }

  function ids(list, count) {
    return list.slice(0, count).map((x) => x.id);
  }

  console.log('Fetching lookup data from the local backend…');
  const [talents, gifts, occupations, provinces] = await Promise.all([
    get('/members/talents'),
    get('/members/spiritual-gifts'),
    get('/members/occupations'),
    get('/provinces'),
  ]);

  const province = provinces[0];
  const districts = await get(`/${province.id}/districts`);
  const district = districts[0];
  const sectors = await get(`/${district.id}/sectors`);
  const sector = sectors[0];
  const cellules = await get(`/${sector.id}/cellules`);
  const cellule = cellules[0];
  const villages = await get(`/${cellule.id}/villages`);
  const village = villages[0];

  console.log('Using geography:', province.name, '>', district.name, '>', sector.name, '>', cellule.name, '>', village.name);

  const geo = {
    province_id: province.id,
    district_id: district.id,
    sector_id: sector.id,
    cellule_id: cellule.id,
    village_id: village.id,
  };

  // sex_id / marital_status_id / cell_id are hardcoded seed values shared by
  // every environment (see src/data/constants.ts): 1=MALE, 2=FEMALE for sex;
  // 1=SINGLE, 2=MARRIED, 3=ENGAGED, 4=WIDOWED, 5=DIVORCED for marital status;
  // cell_id 1-9 are Kanombe, Kicukiro, Gikondo, Rebero, Kimironko, Nyamirambo,
  // Gisozi, Muhima, Kibagabaga.
  const members = [
    {
      first_name: 'Jean Bosco', last_name: 'Habimana', sex_id: 1, marital_status_id: 2,
      date_birthday: '1985-03-14', fathers_name: 'Vianney Habimana', mothers_name: 'Immaculee Mukamana',
      national_id: '1198503140012345', employed: true, date_salvation: '2005-06-12',
      date_baptism: '2006-04-09', member_since: '2010-01-15', mobile_tel: '0788123456',
      email: 'jbhabimana@example.com', cell_id: 1,
    },
    {
      first_name: 'Marie Claire', last_name: 'Uwase', sex_id: 2, marital_status_id: 2,
      date_birthday: '1988-07-22', fathers_name: 'Ferdinand Nzeyimana', mothers_name: 'Beatrice Uwimana',
      national_id: '1198807220023456', employed: true, date_salvation: '2004-03-21',
      date_baptism: '2005-05-01', member_since: '2011-09-10', mobile_tel: '0788234567',
      email: 'mc.uwase@example.com', cell_id: 2,
    },
    {
      first_name: 'Emmanuel', last_name: 'Nshimiyimana', sex_id: 1, marital_status_id: 1,
      date_birthday: '1996-11-02', fathers_name: 'Theogene Nshimiyimana', mothers_name: 'Devota Mukashema',
      national_id: '1199611020034567', employed: false, date_salvation: '2012-08-19',
      date_baptism: '2013-04-20', member_since: '2015-02-01', mobile_tel: '0788345678',
      email: 'e.nshimiyimana@example.com', cell_id: 3,
    },
    {
      first_name: 'Alice', last_name: 'Mukamana', sex_id: 2, marital_status_id: 1,
      date_birthday: '1999-05-18', fathers_name: 'Celestin Bizimana', mothers_name: 'Jeanne Nyiramana',
      national_id: '1199905180045678', employed: false, date_salvation: '2014-01-05',
      date_baptism: '2014-12-14', member_since: '2016-06-01', mobile_tel: '0788456789',
      email: 'alice.mukamana@example.com', cell_id: 4,
    },
    {
      first_name: 'Eric', last_name: 'Ndayisaba', sex_id: 1, marital_status_id: 3,
      date_birthday: '1992-09-09', fathers_name: 'Anastase Ndayisaba', mothers_name: 'Odette Mukandayisenga',
      national_id: '1199209090056789', employed: true, date_salvation: '2008-10-10',
      date_baptism: '2009-06-07', member_since: '2013-03-17', mobile_tel: '0788567890',
      email: 'eric.ndayisaba@example.com', cell_id: 5,
    },
    {
      first_name: 'Solange', last_name: 'Iradukunda', sex_id: 2, marital_status_id: 4,
      date_birthday: '1975-12-01', fathers_name: 'Damascene Iradukunda', mothers_name: 'Verdiane Mukamugema',
      national_id: '1197512010067890', employed: false, date_salvation: '1998-02-14',
      date_baptism: '1998-12-25', member_since: '2000-01-01', mobile_tel: '0788678901',
      email: 'solange.iradukunda@example.com', cell_id: 6,
    },
    {
      first_name: 'Patrick', last_name: 'Niyonzima', sex_id: 1, marital_status_id: 5,
      date_birthday: '1980-04-25', fathers_name: 'Boniface Niyonzima', mothers_name: 'Scholastique Uwamahoro',
      national_id: '1198004250078901', employed: true, date_salvation: '2001-07-07',
      date_baptism: '2002-05-19', member_since: '2005-11-11', mobile_tel: '0788789012',
      email: 'patrick.niyonzima@example.com', cell_id: 7,
    },
    {
      first_name: 'Grace', last_name: 'Umutoni', sex_id: 2, marital_status_id: 2,
      date_birthday: '1990-01-30', fathers_name: 'Alexis Habyarimana', mothers_name: 'Chantal Umuhoza',
      national_id: '1199001300089012', employed: true, date_salvation: '2006-09-09',
      date_baptism: '2007-04-08', member_since: '2009-08-08', mobile_tel: '0788890123',
      email: 'grace.umutoni@example.com', cell_id: 8,
    },
  ];

  console.log(`Creating ${members.length} members…`);
  const created = [];
  for (const m of members) {
    const payload = {
      ...m,
      ...geo,
      talent: ids(talents, 2),
      spiritual_gift: ids(gifts, 2),
      occupation: ids(occupations, 1),
    };
    try {
      const result = await post('/members', payload);
      console.log('Created:', result.id, result.first_name, result.last_name);
      created.push(result);
    } catch (err) {
      console.error(err.message);
    }
  }

  console.log(`Done. ${created.length}/${members.length} members created.`);
  console.log(created.map((m) => ({ id: m.id, name: `${m.first_name} ${m.last_name}` })));
})();
