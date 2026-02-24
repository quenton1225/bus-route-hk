export interface FilterOption {
  id: string;
  label: string;
  description: string;
  defaultColor: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  { id: 'A*', label: '机场巴士路线', description: 'Airport (A)', defaultColor: '#007AFF' },
  { id: 'B*', label: '过境口岸接驳路线', description: 'Border (B)', defaultColor: '#FF3B30' },
  { id: 'E*', label: '北大屿山对外路线', description: 'External (E)', defaultColor: '#FF9500' },
  { id: 'H*', label: '观光城巴路线', description: 'Heritage (H)', defaultColor: '#5856D6' },
  { id: 'HK*', label: '九巴游香港', description: 'HK Tour (HK)', defaultColor: '#AF52DE' },
  { id: 'K*', label: '港铁巴士路线', description: 'KCR Feeder (K)', defaultColor: '#34C759' },
  { id: 'N*', label: '通宵路线', description: 'Overnight (N)', defaultColor: '#5AC8FA' },
  { id: 'NA*', label: '深宵机场巴士路线', description: 'Overnight Airport (NA)', defaultColor: '#30B0C7' },
  { id: 'NB*', label: '深宵过境口岸接驳路线', description: 'Overnight Border (NB)', defaultColor: '#32ADE6' },
  { id: 'P*', label: '九巴星級尊線', description: 'Premium (P)', defaultColor: '#FFCC00' },
  { id: 'SP*', label: '启德体育园特别路线', description: 'Sports Park (SP)', defaultColor: '#FF2D55' },
  { id: 'W*', label: '接驳高铁特快路线', description: 'West Kowloon (W)', defaultColor: '#64D2FF' },
  { id: 'X9*', label: '西隧过海巴士路线', description: 'WHC Tunnel (9xx)', defaultColor: '#8E8E93' },
  { id: 'X1*', label: '红隧过海巴士路线', description: 'CHT Tunnel (1xx/3xx)', defaultColor: '#FF6482' },
  { id: 'X6*', label: '东隧过海巴士路线', description: 'EHC Tunnel (6xx)', defaultColor: '#BF5AF2' },
];
