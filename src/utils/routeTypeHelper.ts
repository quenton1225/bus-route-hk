/**
 * 根据路线号判断它属于哪个过滤器类型
 * @param routeNumber 路线号，例如 "A21", "NA29", "E23"
 * @returns 过滤器ID，如果不匹配则返回 undefined
 */
export function getRouteFilterType(routeNumber: string): string | undefined {
  const upper = routeNumber.toUpperCase();
  
  // 优先匹配多字符前缀
  if (/^NA\d/.test(upper)) return 'NA*';
  if (/^NB\d/.test(upper)) return 'NB*';
  if (/^HK\d+[A-Z]?$/.test(upper)) return 'HK*';
  if (/^SP\d+[A-Z]?$/.test(upper)) return 'SP*';
  
  // 单字符前缀
  if (/^A\d/.test(upper)) return 'A*';
  if (/^B\d/.test(upper)) return 'B*';
  if (/^E\d/.test(upper)) return 'E*';
  if (/^W\d/.test(upper)) return 'W*';
  
  // H线（排除HK）
  if (/^H\d+[A-Z]?$/.test(upper)) return 'H*';
  
  // K线
  if (/^K\d+[A-Z]?$/.test(upper)) return 'K*';
  
  // N线（排除NA、NB）
  if (/^N(?!A|B)\d/.test(upper)) return 'N*';
  
  // P线
  if (/^P\d+[A-Z]?$/.test(upper)) return 'P*';
  
  // 过海路线
  if (/^9\d{2}[A-Z]?$/.test(upper)) return 'X9*';
  if (/^[13]\d{2}[A-Z]?$/.test(upper)) return 'X1*';
  if (/^6\d{2}[A-Z]?$/.test(upper)) return 'X6*';
  
  return undefined;
}
