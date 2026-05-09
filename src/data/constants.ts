export const SEX_OPTIONS = ['Male', 'Female'];

export const MARITAL_OPTIONS = ['Single', 'Married', 'Widowed', 'Divorced'];

export const EDUCATION_OPTIONS = [
  'Primary', 'Secondary', 'Certificate', 'Diploma',
  'Bachelor\'s Degree', 'Master\'s Degree', 'Doctorate', 'Other',
];

export const MINISTRY_OPTIONS = [
  'General Congregation',
  'Youth Department',
  'Mothers\' Department',
  'Fathers\' Department',
  'Children\'s Ministry',
  'Worship & Arts',
  'Evangelism',
  'Prayer Team',
  'Media & Technology',
  'Ushers & Hospitality',
  'Pastor',
];

export const TALENT_OPTIONS = [
  'Preaching / Teaching',
  'Worship & Music',
  'Prayer & Intercession',
  'Evangelism',
  'Hospitality',
  'Administration',
  'Media & Technology',
  'Counselling',
  'Children\'s Ministry',
  'Youth Leadership',
  'Other',
];

export const RESPONSIBILITY_OPTIONS = [
  'Member',
  'Cell Leader',
  'Zone Leader',
  'Department Leader',
  'Worship Leader',
  'Choir Member',
  'Usher',
  'Prayer Team Lead',
  'Media Technician',
  'Evangelist',
  'Deacon',
  'Elder',
  'Pastor',
  'Senior Pastor',
];

export const OCCUPATION_OPTIONS = [
  'Student',
  'Teacher / Educator',
  'Healthcare Worker',
  'Engineer',
  'Business / Entrepreneur',
  'Government / Civil Servant',
  'Farmer / Agriculture',
  'Artist / Creative',
  'Driver / Transport',
  'Pastor / Minister',
  'NGO / Non-profit',
  'Unemployed',
  'Retired',
  'Other',
];

export const GEOGRAPHY: Record<string, Record<string, Record<string, string[]>>> = {
  Kigali: {
    Gasabo: {
      'Zone A': ['Kimironko Cell', 'Remera Cell', 'Gisozi Cell'],
      'Zone B': ['Kacyiru Cell', 'Kagugu Cell', 'Kibagabaga Cell'],
    },
    Kicukiro: {
      'Zone C': ['Niboye Cell', 'Gatenga Cell', 'Kagarama Cell'],
      'Zone D': ['Kicukiro Cell', 'Masaka Cell', 'Kanombe Cell'],
    },
    Nyarugenge: {
      'Zone E': ['Nyamirambo Cell', 'Gitega Cell', 'Muhima Cell'],
      'Zone F': ['Rwezamenyo Cell', 'Mageragere Cell', 'Kimisagara Cell'],
    },
  },
  Northern: {
    Musanze: {
      'Zone G': ['Muhoza Cell', 'Cyuve Cell', 'Kinigi Cell'],
      'Zone H': ['Busogo Cell', 'Shingiro Cell', 'Nkotsi Cell'],
    },
    Burera: {
      'Zone I': ['Butaro Cell', 'Cyanika Cell', 'Gahunga Cell'],
    },
  },
  Southern: {
    Huye: {
      'Zone J': ['Ngoma Cell', 'Tumba Cell', 'Mbazi Cell'],
      'Zone K': ['Ruhashya Cell', 'Karama Cell', 'Maraba Cell'],
    },
    Nyanza: {
      'Zone L': ['Busoro Cell', 'Cyabakamyi Cell', 'Kigoma Cell'],
    },
  },
  Eastern: {
    Rwamagana: {
      'Zone M': ['Munyaga Cell', 'Faro Cell', 'Nzige Cell'],
    },
    Kayonza: {
      'Zone N': ['Mukarange Cell', 'Kabarondo Cell', 'Murundi Cell'],
    },
  },
  Western: {
    Rubavu: {
      'Zone O': ['Gisenyi Cell', 'Rugerero Cell', 'Nyundo Cell'],
    },
    Karongi: {
      'Zone P': ['Bwishyura Cell', 'Rugabano Cell', 'Mubuga Cell'],
    },
  },
};

export const SAMPLE_MEMBERS = [
  {
    id: 'EV-2024-001',
    firstName: 'Marie', lastName: 'Uwimana',
    sex: 'Female', marital: 'Married', dob: '1985-03-12',
    salvation: '2005-06-01', baptism: '2005-08-14', memberSince: '2006-01-15',
    ministry: 'Mothers\' Department', responsibility: 'Department Leader',
    district: 'Kigali', sector: 'Gasabo', zone: 'Zone A', cell: 'Kimironko Cell',
    mobile: '+250 788 001 001', email: 'marie.uwimana@example.rw',
    occupation: 'Teacher / Educator', employed: 'Yes',
  },
  {
    id: 'EV-2024-002',
    firstName: 'Jean', lastName: 'Nkurunziza',
    sex: 'Male', marital: 'Single', dob: '1998-07-22',
    salvation: '2018-03-10', baptism: '2018-05-20', memberSince: '2018-06-01',
    ministry: 'Youth Department', responsibility: 'Cell Leader',
    district: 'Kigali', sector: 'Kicukiro', zone: 'Zone C', cell: 'Niboye Cell',
    mobile: '+250 788 002 002', email: 'jean.nkurunziza@example.rw',
    occupation: 'Student', employed: 'No',
  },
  {
    id: 'EV-2024-003',
    firstName: 'Claudette', lastName: 'Mukamana',
    sex: 'Female', marital: 'Married', dob: '1975-11-30',
    salvation: '1997-12-25', baptism: '1998-01-10', memberSince: '1999-03-01',
    ministry: 'Worship & Arts', responsibility: 'Worship Leader',
    district: 'Kigali', sector: 'Nyarugenge', zone: 'Zone E', cell: 'Nyamirambo Cell',
    mobile: '+250 788 003 003', email: '',
    occupation: 'Artist / Creative', employed: 'Yes',
  },
  {
    id: 'EV-2024-004',
    firstName: 'Emmanuel', lastName: 'Habimana',
    sex: 'Male', marital: 'Married', dob: '1970-04-15',
    salvation: '1995-04-10', baptism: '1995-06-01', memberSince: '1997-01-01',
    ministry: 'Fathers\' Department', responsibility: 'Elder',
    district: 'Northern', sector: 'Musanze', zone: 'Zone G', cell: 'Muhoza Cell',
    mobile: '+250 788 004 004', email: '',
    occupation: 'Business / Entrepreneur', employed: 'Yes',
  },
  {
    id: 'EV-2024-005',
    firstName: 'Vestine', lastName: 'Ingabire',
    sex: 'Female', marital: 'Single', dob: '2001-09-05',
    salvation: '2020-01-12', baptism: '', memberSince: '2020-02-01',
    ministry: 'Youth Department', responsibility: 'Choir Member',
    district: 'Kigali', sector: 'Gasabo', zone: 'Zone B', cell: 'Kacyiru Cell',
    mobile: '+250 788 005 005', email: '',
    occupation: 'Student', employed: 'No',
  },
];
