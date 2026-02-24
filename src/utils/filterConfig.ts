export interface FilterOption {
  id: string;
  label: string;
  description: string;
  defaultColor: string;
}

export const FILTER_OPTIONS: FilterOption[] = [
  // 特殊路线
  { id: 'A*', label: '机场巴士路线', description: 'Airport (A)', defaultColor: '#007AFF' },
  { id: 'B*', label: '过境口岸接驳路线', description: 'Border (B)', defaultColor: '#FF3B30' },
  { id: 'E*', label: '北大屿山对外路线', description: 'External (E)', defaultColor: '#FF9500' },
  { id: 'H*', label: '观光城巴路线', description: 'Heritage (H)', defaultColor: '#5856D6' },
  { id: 'HK*', label: '九巴游香港', description: 'HK Tour (HK)', defaultColor: '#AF52DE' },
  { id: 'N*', label: '通宵路线', description: 'Overnight (N)', defaultColor: '#5AC8FA' },
  { id: 'NA*', label: '深宵机场巴士路线', description: 'Overnight Airport (NA)', defaultColor: '#30B0C7' },
  { id: 'W*', label: '接驳高铁特快路线', description: 'West Kowloon (W)', defaultColor: '#64D2FF' },
  
  // 过海路线
  { id: 'X9*', label: '西隧过海巴士路线', description: 'WHC Tunnel (9xx)', defaultColor: '#8E8E93' },
  { id: 'X1*', label: '红隧过海巴士路线', description: 'CHT Tunnel (1xx/3xx)', defaultColor: '#FF6482' },
  { id: 'X6*', label: '东隧过海巴士路线', description: 'EHC Tunnel (6xx)', defaultColor: '#BF5AF2' },
  
  // 九龙区域
  { id: 'KL_1-29', label: '九龙市区路线', description: '1-29', defaultColor: '#E31C23' },
  { id: 'KL_30-49', label: '葵青、荃湾区路线', description: '30-49', defaultColor: '#34C759' },
  { id: 'KL_50-69', label: '屯门、元朗区路线', description: '50-69', defaultColor: '#FF9500' },
  { id: 'KL_70-79', label: '北区、大埔区路线', description: '70-79', defaultColor: '#5AC8FA' },
  { id: 'KL_80-89', label: '沙田区路线', description: '80-89', defaultColor: '#AF52DE' },
  { id: 'KL_90-99', label: '西贡区路线', description: '90-99', defaultColor: '#FFCC00' },
  
  // 港岛区域
  { id: 'HK_NORTH', label: '港岛北岸路线', description: '1, 2, 9, 10-19, 21, 23-29', defaultColor: '#FFD100' },
  { id: 'HK_PFL', label: '薄扶林、置富路线', description: '3, 30-39', defaultColor: '#00A550' },
  { id: 'HK_WF', label: '华富、数码港路线', description: '4, 40-49', defaultColor: '#007AFF' },
  { id: 'HK_RSB', label: '浅水湾、赤柱路线', description: '6, 60-69', defaultColor: '#FF6482' },
  { id: 'HK_AB', label: '田湾、香港仔路线', description: '7, 70-77', defaultColor: '#BF5AF2' },
  { id: 'HK_CW', label: '柴湾、小西湾路线', description: '8, 80-89', defaultColor: '#32ADE6' },
  { id: 'HK_APL', label: '鸭脷洲路线', description: '90-99', defaultColor: '#5856D6' },
  { id: 'HK_EXP', label: '东区走廊特快及原新巴九龙新界专线', description: '7xx', defaultColor: '#FF2D55' },
];
