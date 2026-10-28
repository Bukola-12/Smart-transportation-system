export interface CampusLocationCategory {
  category: string;
  locations: string[];
}

export const CAMPUS_LOCATIONS_CATEGORIZED: CampusLocationCategory[] = [
  {
    category: 'Parks & Campus Gates',
    locations: [
      'Campus Gate Car Park',
      'SUB Car Park',
      'New Market Car Park',
      'Road 1 Main Gate',
      'Maintenance Gate',
    ],
  },
  {
    category: 'Hostels & Halls of Residence',
    locations: [
      'Moremi Hall (Female)',
      'Angola Hall (Male)',
      'Mozambique Hall (Female)',
      'Fajuyi Hall (Male)',
      'Awolowo Hall (Male)',
      'ETF Hall',
      'Alumni Hall (Female)',
      'Akintola Hall (Female)',
      'Postgraduate (PG) Hall',
      'Senior Staff Quarters',
    ],
  },
  {
    category: 'Faculties & Academic Buildings',
    locations: [
      'Faculty of Technology (Spider Building)',
      'Faculty of Science (White House)',
      'Faculty of Arts',
      'Faculty of Administration',
      'Faculty of Social Sciences',
      'Faculty of Law',
      'Faculty of Education',
      'Faculty of Agriculture',
      'Faculty of Pharmacy',
      'College of Health Sciences (CHS)',
      'Central Science Laboratory (CSL)',
      'Computer Centre / ICT Hall',
      'BOOC (Bafuto Lecture Theatre)',
      'Pit Theatre',
      'Oduduwa Hall',
    ],
  },
  {
    category: 'Libraries & Administrative Centres',
    locations: [
      'Hezekiah Oluwasanmi Library (Main Library)',
      'Senate Building',
      'Student Union Building (SUB)',
      'University Health Centre (Medical Centre)',
      'Sports Complex / Main Bowl',
      'Cooperative Building',
      'Religious Centre (Chapel / Mosque)',
    ],
  },
  {
    category: 'Markets & Commercial Hubs',
    locations: [
      'New Market',
      'SUB Commercial Area & Buttery',
      'Central Cafeteria',
      'Academic Area Buttery',
    ],
  },
];

export const ALL_CAMPUS_LOCATIONS: string[] = CAMPUS_LOCATIONS_CATEGORIZED.flatMap(
  (cat) => cat.locations
);

export const POPULAR_DESTINATIONS: string[] = [
  'Hezekiah Oluwasanmi Library (Main Library)',
  'Moremi Hall (Female)',
  'Awolowo Hall (Male)',
  'Faculty of Science (White House)',
  'Faculty of Technology (Spider Building)',
  'Senate Building',
  'University Health Centre (Medical Centre)',
  'New Market',
];

export const POPULAR_PICKUPS: string[] = [
  'SUB Car Park',
  'Campus Gate Car Park',
  'Moremi Hall',
  'Awolowo Hall',
  'Hezekiah Oluwasanmi Library (Main Library)',
  'New Market Car Park',
];
