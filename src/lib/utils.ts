import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value);
}

export function numberToChinese(n: number): string {
  if (n === 0) return '零圆';
  const unit = ['', '拾', '佰', '仟'];
  const group = ['', '万', '亿', '兆'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  
  let s = '';
  let integerPart = Math.floor(n);
  
  if (integerPart >= 1e16) return '数值过大';

  let groupIdx = 0;
  while (integerPart > 0) {
    let section = integerPart % 10000;
    let sectionStr = '';
    let zero = false;
    
    for (let i = 0; i < 4; i++) {
      let d = section % 10;
      if (d === 0) {
        if (sectionStr !== '' && !zero) {
          zero = true;
          sectionStr = digit[0] + sectionStr;
        }
      } else {
        zero = false;
        sectionStr = digit[d] + unit[i] + sectionStr;
      }
      section = Math.floor(section / 10);
    }
    
    if (sectionStr !== '') {
      s = sectionStr + group[groupIdx] + s;
    }
    integerPart = Math.floor(integerPart / 10000);
    groupIdx++;
  }
  
  return s + '圆整';
}
