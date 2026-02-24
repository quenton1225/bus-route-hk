/**
 * 规范化公司代码（城巴和新巴视为同一公司）
 */
function normalizeCompany(company: string): string {
  const upper = company.toUpperCase();
  if (upper === 'CTB' || upper === 'NWFB') return 'CTB';
  return upper;
}

/**
 * 检查路线公司是否匹配目标公司
 * @param routeCompany 路线的公司代码
 * @param targetCompany 目标公司代码或代码数组
 */
function matchCompany(routeCompany: string, targetCompany: string | string[]): boolean {
  const normalized = normalizeCompany(routeCompany);
  if (Array.isArray(targetCompany)) {
    return targetCompany.some(tc => normalizeCompany(tc) === normalized);
  }
  return normalizeCompany(targetCompany) === normalized;
}

/**
 * 根据路线号和公司判断它属于哪个过滤器类型
 * @param routeNumber 路线号，例如 "A21", "1A", "902"
 * @param company 公司代码，例如 "KMB", "CTB", "NWFB"
 * @returns 过滤器ID，如果不匹配则返回 undefined
 */
export function getRouteFilterType(routeNumber: string, company: string = ''): string | undefined {
  const upper = routeNumber.toUpperCase();
  const co = company.toUpperCase();
  
  // 特殊路线（优先匹配多字符前缀）
  if (/^NA\d/.test(upper)) return 'NA*';
  if (/^HK\d+[A-Z]?$/.test(upper)) return 'HK*';
  
  // 单字符特殊前缀
  if (/^A\d/.test(upper)) return 'A*';
  if (/^B\d/.test(upper)) return 'B*';
  if (/^E\d/.test(upper)) return 'E*';
  if (/^W\d/.test(upper)) return 'W*';
  if (/^H\d+[A-Z]?$/.test(upper)) return 'H*';
  if (/^N(?!A)\d/.test(upper)) return 'N*';
  
  // 过海路线（三位数字）
  if (/^9\d{2}[A-Z]?$/.test(upper)) return 'X9*';
  if (/^[13]\d{2}[A-Z]?$/.test(upper)) return 'X1*';
  if (/^6\d{2}[A-Z]?$/.test(upper)) return 'X6*';
  
  // 如果没有公司信息，无法匹配区域路线
  if (!co) return undefined;
  
  // === 九龙区域路线 ===
  
  // 九龙市区路线（1-29）
  if (/^[1-9][A-Z]*$/.test(upper) && matchCompany(co, 'KMB')) return 'KL_1-29';
  if (/^[12]\d[A-Z]*$/.test(upper) && matchCompany(co, 'KMB')) return 'KL_1-29';
  if (/^(20|22)[A-Z]*$/.test(upper) && matchCompany(co, 'CTB')) return 'KL_1-29';
  
  // 葵青、荃湾区路线（30-49）
  if (/^[34]\d[A-Z]*$/.test(upper) && matchCompany(co, 'KMB')) return 'KL_30-49';
  
  // 屯门、元朗区路线（50-69）
  if (/^5\d[A-Z]*$/.test(upper) && matchCompany(co, ['KMB', 'CTB'])) return 'KL_50-69';
  if (/^6\d[A-Z]*$/.test(upper) && matchCompany(co, 'KMB')) return 'KL_50-69';
  
  // 北区、大埔区路线（70-79）
  if (/^7\d[A-Z]*$/.test(upper) && matchCompany(co, 'KMB')) return 'KL_70-79';
  if (/^78[A-Z]$/.test(upper) && matchCompany(co, 'CTB')) return 'KL_70-79';
  if (/^79[A-Z]*$/.test(upper) && matchCompany(co, 'CTB')) return 'KL_70-79';
  
  // 沙田区路线（80-89）
  if (/^8\d[A-Z]*$/.test(upper) && matchCompany(co, 'KMB')) return 'KL_80-89';
  
  // 西贡区路线（90-99）
  if (/^9\d[A-Z]*$/.test(upper) && matchCompany(co, 'KMB')) return 'KL_90-99';
  
  // === 港岛区域路线（城巴/新巴） ===
  
  if (!matchCompany(co, 'CTB')) return undefined;
  
  // 港岛东区走廊特快（7xx）
  if (/^7\d{2}[A-Z]*$/.test(upper)) return 'HK_EXP';
  
  // 鸭脷洲（90-99）
  if (/^9\d[A-Z]*$/.test(upper)) return 'HK_APL';
  
  // 柴湾、小西湾、杏花邨（8, 80-89，排除85A）
  if (upper === '85A') return undefined;
  if (/^8[A-Z]*$/.test(upper)) return 'HK_CW';
  if (/^8\d[A-Z]*$/.test(upper)) return 'HK_CW';
  
  // 田湾、香港仔、石排湾、黄竹坑、深湾（7, 70-79，排除78X和79X）
  if (/^78[A-Z]$/.test(upper) || /^79[A-Z]+$/.test(upper)) return undefined;
  if (/^7[A-Z]*$/.test(upper)) return 'HK_AB';
  if (/^7\d[A-Z]*$/.test(upper)) return 'HK_AB';
  
  // 浅水湾、赤柱、马坑（6, 60-69）
  if (/^6[A-Z]*$/.test(upper)) return 'HK_RSB';
  if (/^6\d[A-Z]*$/.test(upper)) return 'HK_RSB';
  
  // 华富、数码港（4, 40-49）
  if (/^4[A-Z]*$/.test(upper)) return 'HK_WF';
  if (/^4\d[A-Z]*$/.test(upper)) return 'HK_WF';
  
  // 薄扶林、置富（3, 30-39）
  if (/^3[A-Z]*$/.test(upper)) return 'HK_PFL';
  if (/^3\d[A-Z]*$/.test(upper)) return 'HK_PFL';
  
  // 港岛北岸路线（1, 2, 9, 10-19, 21, 23-29）
  if (/^[129][A-Z]*$/.test(upper)) return 'HK_NORTH';
  if (/^1\d[A-Z]*$/.test(upper)) return 'HK_NORTH';
  if (/^2[13-9][A-Z]*$/.test(upper)) return 'HK_NORTH';
  
  return undefined;
}
