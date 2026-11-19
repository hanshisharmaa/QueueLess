import type { ServiceCentre } from './types';

/**
 * Demo partner centres — well-known places in Meerut, Uttar Pradesh.
 * Queue figures are SIMULATED for this college project; these organisations are
 * not affiliated with QueueLess. Addresses and coordinates are approximate.
 */
type SeedCentre = Omit<ServiceCentre, 'created_at'> & { base_waiting: number };

// Real photographs from Wikimedia Commons, stored in public/images/centres
// (credits: PHOTO-CREDITS.md). Each file is named after its centre id.
const photo = (centreId: string) => `/images/centres/${centreId}.jpg`;

export const DEMO_CENTRES: SeedCentre[] = [
  // ---- Healthcare
  {
    id: 'm-001', name: 'Chhatrapati Shivaji Subharti Hospital', category: 'healthcare',
    description: 'Multi-speciality teaching hospital with OPD, diagnostics and emergency services.',
    address: 'Subharti Puram, NH-58, Delhi-Haridwar Bypass Road', city: 'Meerut', locality: 'Subharti Puram',
    latitude: 28.9596, longitude: 77.6381,
    image_url: photo('m-001'), avg_service_time: 15, is_open: true, opens_at: '08:00', closes_at: '20:00',
    queue_status: 'busy', currently_serving: 42, base_waiting: 9,
  },
  {
    id: 'm-002', name: 'LLRM Medical College & Hospital', category: 'healthcare',
    description: 'Government medical college hospital with general OPD, specialist clinics and pathology.',
    address: 'Garh Road', city: 'Meerut', locality: 'Garh Road',
    latitude: 28.9890, longitude: 77.7450,
    image_url: photo('m-002'), avg_service_time: 12, is_open: true, opens_at: '08:00', closes_at: '14:00',
    queue_status: 'busy', currently_serving: 67, base_waiting: 10,
  },
  {
    id: 'm-003', name: 'Anand Hospital', category: 'healthcare',
    description: 'Private multi-speciality hospital offering consultations, diagnostics and day care.',
    address: 'Garh Road, near Tejgarhi Chauraha', city: 'Meerut', locality: 'Tejgarhi',
    latitude: 28.9835, longitude: 77.7290,
    image_url: photo('m-003'), avg_service_time: 18, is_open: true, opens_at: '09:00', closes_at: '19:00',
    queue_status: 'moderate', currently_serving: 21, base_waiting: 5,
  },
  // ---- Banking
  {
    id: 'm-004', name: 'State Bank of India – Meerut Main Branch', category: 'banking',
    description: 'Cash counters, passbook updates, account services and loan enquiries.',
    address: 'Western Kutchery Road, near Baccha Park', city: 'Meerut', locality: 'Begum Bridge',
    latitude: 28.9850, longitude: 77.7040,
    image_url: photo('m-004'), avg_service_time: 10, is_open: true, opens_at: '10:00', closes_at: '16:00',
    queue_status: 'busy', currently_serving: 33, base_waiting: 8,
  },
  {
    id: 'm-005', name: 'Punjab National Bank – Abu Lane', category: 'banking',
    description: 'Deposits, withdrawals, KYC updates and new account opening.',
    address: 'Abu Lane, Meerut Cantt', city: 'Meerut', locality: 'Abu Lane',
    latitude: 28.9930, longitude: 77.7050,
    image_url: photo('m-005'), avg_service_time: 8, is_open: true, opens_at: '10:00', closes_at: '16:00',
    queue_status: 'moderate', currently_serving: 18, base_waiting: 4,
  },
  // ---- Government
  {
    id: 'm-006', name: 'Collectorate Meerut', category: 'government',
    description: 'District administration office for certificates, land records and public grievances.',
    address: 'Kutchery Road, Civil Lines', city: 'Meerut', locality: 'Civil Lines',
    latitude: 28.9905, longitude: 77.6990,
    image_url: photo('m-006'), avg_service_time: 15, is_open: true, opens_at: '10:00', closes_at: '17:00',
    queue_status: 'busy', currently_serving: 39, base_waiting: 8,
  },
  {
    id: 'm-007', name: 'Meerut Head Post Office', category: 'government',
    description: 'Speed post, parcels, savings accounts and Aadhaar update counter.',
    address: 'Meerut Cantt', city: 'Meerut', locality: 'Meerut Cantt',
    latitude: 28.9990, longitude: 77.6970,
    image_url: photo('m-007'), avg_service_time: 7, is_open: true, opens_at: '09:00', closes_at: '17:00',
    queue_status: 'moderate', currently_serving: 25, base_waiting: 5,
  },
  {
    id: 'm-008', name: 'RTO Office Meerut', category: 'government',
    description: 'Driving licence tests and renewals, vehicle registration and transfers.',
    address: 'Partapur', city: 'Meerut', locality: 'Partapur',
    latitude: 28.9420, longitude: 77.6850,
    image_url: photo('m-008'), avg_service_time: 12, is_open: false, opens_at: '10:00', closes_at: '17:00',
    queue_status: 'moderate', currently_serving: 0, base_waiting: 0,
  },
  // ---- Beauty
  {
    id: 'm-009', name: 'Lakmé Salon – Abu Lane', category: 'beauty',
    description: 'Haircuts, colouring, skin care and bridal makeup by trained stylists.',
    address: 'Abu Lane', city: 'Meerut', locality: 'Abu Lane',
    latitude: 28.9925, longitude: 77.7060,
    image_url: photo('m-009'), avg_service_time: 25, is_open: true, opens_at: '10:00', closes_at: '20:00',
    queue_status: 'low', currently_serving: 7, base_waiting: 2,
  },
  {
    id: 'm-010', name: 'Naturals Salon – Shastri Nagar', category: 'beauty',
    description: 'Unisex salon for hair, beard grooming and skin treatments.',
    address: 'Shastri Nagar', city: 'Meerut', locality: 'Shastri Nagar',
    latitude: 28.9785, longitude: 77.7120,
    image_url: photo('m-010'), avg_service_time: 20, is_open: true, opens_at: '10:00', closes_at: '21:00',
    queue_status: 'low', currently_serving: 11, base_waiting: 3,
  },
  // ---- Repair
  {
    id: 'm-011', name: 'Maruti Suzuki Service – Delhi Road', category: 'repair',
    description: 'Authorised car service: periodic maintenance, repairs and inspection.',
    address: 'Delhi Road', city: 'Meerut', locality: 'Delhi Road',
    latitude: 28.9700, longitude: 77.6800,
    image_url: photo('m-011'), avg_service_time: 35, is_open: true, opens_at: '09:00', closes_at: '18:00',
    queue_status: 'low', currently_serving: 6, base_waiting: 2,
  },
  {
    id: 'm-012', name: 'Samsung Service Centre – Begum Bridge', category: 'repair',
    description: 'Phone, TV and appliance repairs with genuine parts.',
    address: 'Begum Bridge Road', city: 'Meerut', locality: 'Begum Bridge',
    latitude: 28.9860, longitude: 77.7065,
    image_url: photo('m-012'), avg_service_time: 20, is_open: true, opens_at: '10:00', closes_at: '19:00',
    queue_status: 'moderate', currently_serving: 14, base_waiting: 4,
  },
  // ---- Dining
  {
    id: 'm-013', name: "Domino's Pizza – Abu Lane", category: 'dining',
    description: 'Dine-in table tokens during evening rush hours.',
    address: 'Abu Lane', city: 'Meerut', locality: 'Abu Lane',
    latitude: 28.9935, longitude: 77.7045,
    image_url: photo('m-013'), avg_service_time: 15, is_open: true, opens_at: '11:00', closes_at: '23:00',
    queue_status: 'moderate', currently_serving: 31, base_waiting: 5,
  },
];

export const DEMO_SERVICES: { centre_id: string; name: string; duration_minutes: number }[] = [
  ['m-001', 'OPD Consultation', 15], ['m-001', 'Diagnostics & Lab', 20], ['m-001', 'Pharmacy', 5],
  ['m-002', 'General OPD', 12], ['m-002', 'Specialist Clinic', 20], ['m-002', 'Pathology', 10],
  ['m-003', 'Doctor Consultation', 18], ['m-003', 'X-Ray / Ultrasound', 25],
  ['m-004', 'Cash Deposit / Withdrawal', 8], ['m-004', 'Passbook Update', 5], ['m-004', 'Loan Enquiry', 25],
  ['m-005', 'Cash Counter', 8], ['m-005', 'KYC Update', 10], ['m-005', 'Account Opening', 20],
  ['m-006', 'Income / Caste Certificate', 15], ['m-006', 'Land Records', 20], ['m-006', 'Grievance Desk', 10],
  ['m-007', 'Speed Post & Parcels', 5], ['m-007', 'Savings Account', 10], ['m-007', 'Aadhaar Update', 15],
  ['m-008', 'Licence Test', 15], ['m-008', 'Licence Renewal', 10], ['m-008', 'Vehicle Registration', 18],
  ['m-009', 'Haircut & Styling', 30], ['m-009', 'Hair Colouring', 60], ['m-009', 'Facial', 45],
  ['m-010', 'Haircut', 20], ['m-010', 'Beard Grooming', 15], ['m-010', 'Skin Treatment', 40],
  ['m-011', 'Periodic Service', 60], ['m-011', 'Oil Change', 30], ['m-011', 'Inspection', 40],
  ['m-012', 'Phone Repair', 30], ['m-012', 'TV / Appliance Booking', 15],
  ['m-013', 'Table for 2', 15], ['m-013', 'Table for 4+', 25],
].map(([centre_id, name, duration_minutes]) => ({
  centre_id: centre_id as string, name: name as string, duration_minutes: duration_minutes as number,
}));
