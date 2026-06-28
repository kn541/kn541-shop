#!/usr/bin/env python3
"""WORK-042: formatPrice apply script. Run from repo root: python3 scripts/apply_work042.py"""
import re, os

def add_import(content):
    if "from '@/lib/formatPrice'" in content or 'from "@/lib/formatPrice"' in content:
        return content
    lines = content.split('\n')
    li = -1
    for i, line in enumerate(lines):
        if line.strip().startswith('import ') or line.strip().startswith("} from '") or line.strip().startswith('} from "'):
            li = i
    if li >= 0:
        lines.insert(li + 1, "import { formatPrice } from '@/lib/formatPrice'")
        return '\n'.join(lines)
    return content

def replace_patterns(content):
    skip = ['GWCP', '\uac1c}', '\uac1c)', '\ud45c\uc2dc', '\uac80\uc0c9', 'setAmountStr', 'amountStr']
    lines = content.split('\n')
    out = []
    for line in lines:
        if 'toLocaleString' not in line or '\uc6d0' not in line:
            out.append(line); continue
        if any(s in line for s in skip):
            out.append(line); continue
        line = re.sub(r'\{([^{}]+?)\.toLocaleString\([\'"]ko-KR[\'"]\)\}\uc6d0', lambda m: '{formatPrice(' + m.group(1) + ')}', line)
        line = re.sub(r'\$\{([^{}]+?)\.toLocaleString\([\'"]ko-KR[\'"]\)\}\uc6d0', lambda m: '${formatPrice(' + m.group(1) + ')}', line)
        line = re.sub(r'\{([^{}]+?)\.toLocaleString\(\)\}\uc6d0', lambda m: '{formatPrice(' + m.group(1) + ')}', line)
        line = re.sub(r'\$\{([^{}]+?)\.toLocaleString\(\)\}\uc6d0', lambda m: '${formatPrice(' + m.group(1) + ')}', line)
        out.append(line)
    return '\n'.join(out)

def fix_feestr(c):
    c = c.replace("const feeStr = shippingFee.toLocaleString('ko-KR')", 'const feeStr = formatPrice(shippingFee)')
    c = c.replace('${feeStr}\uc6d0', '${feeStr}')
    return c

def fix_wm(c):
    return c.replace("preview.cash_tax.toLocaleString('ko-KR')}\uc6d0", 'formatWon(preview.cash_tax)}')

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'ciseco-nextjs', 'src')
if not os.path.isdir(BASE): BASE = 'ciseco-nextjs/src'

for f in [
    'app/[locale]/(shop)/(other-pages)/_mypage/orders/page.tsx',
    'app/[locale]/(shop)/(other-pages)/_mypage/myshop/page.tsx',
    'app/[locale]/(accounts)/orders/[orderId]/page.tsx',
    'app/[locale]/(shop)/(other-pages)/_mypage/orders/[id]/page.tsx',
    'components/mypage/WithdrawModal.tsx',
    'components/ProductQuickView.tsx',
    'components/myshop/ProxyOrderWizard.tsx',
    'app/[locale]/(shop)/(other-pages)/cart/page.tsx',
    'app/[locale]/(shop)/(other-pages)/order-successful/page.tsx',
    'app/[locale]/(shop)/(other-pages)/products/[handle]/page.tsx',
    'app/[locale]/(accounts)/myshop/page.tsx',
    'app/[locale]/(shop)/(other-pages)/checkout/page.tsx',
]:
    p = os.path.join(BASE, f)
    if not os.path.exists(p): print(f'SKIP: {f}'); continue
    with open(p) as fh: orig = fh.read()
    c = add_import(orig)
    c = replace_patterns(c)
    if 'ProductQuickView' in f or 'products/[handle]' in f: c = fix_feestr(c)
    if 'WithdrawModal' in f: c = fix_wm(c)
    if c != orig:
        with open(p, 'w') as fh: fh.write(c)
        print(f'CHANGED: {f}')
    else: print(f'OK: {f}')
