import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Input, message, Select, Space, Tag, Typography } from 'antd';
import { CopyOutlined, DownloadOutlined, LinkOutlined } from '@ant-design/icons';
import QRCode from 'qrcode';
import { TrackingAsset } from '../../types';
import { AssetStatus, AssetType } from '../../types/enums';

const { Text, Title } = Typography;

type SortMode = 'recommend' | 'products' | 'sales' | 'commission';

interface EntryOption {
  id: string;
  name: string;
  tone: string;
}

interface MerchantOption {
  id: string;
  entryId: string;
  name: string;
  city: string;
  productCount: number;
  monthlySales: number;
  score: number;
  tags: string[];
}

interface SpuOption {
  id: string;
  merchantId: string;
  name: string;
  price: number;
  commissionRate: number;
  monthlySales: number;
  status: '可推广' | '补货中';
  tags: string[];
}

export type ProductLinkAssetInput = Omit<TrackingAsset, 'id' | 'createdAt'>;

interface ProductLinkCreatorProps {
  disabled?: boolean;
  onCreateAsset: (asset: ProductLinkAssetInput) => Promise<TrackingAsset>;
}

export const PRODUCT_LINK_ENTRIES: EntryOption[] = [
  { id: 'gx-custom', name: '光选定制', tone: '#1677ff' },
  { id: 'oriental-aesthetics', name: '东方美学', tone: '#b45309' },
  { id: 'organic-vegan', name: '有机素食', tone: '#15803d' },
  { id: 'pet-planet', name: '宠物星球', tone: '#7c3aed' },
  { id: 'heritage', name: '光选非遗', tone: '#be123c' },
  { id: 'handmade', name: '匠心手作', tone: '#0f766e' },
  { id: 'reading-room', name: '静读间', tone: '#475569' },
  { id: 'designer-brand', name: '设计师品牌', tone: '#c026d3' },
];

const ENTRY_OPTIONS = PRODUCT_LINK_ENTRIES;

const CITIES = ['上海', '杭州', '成都', '广州', '深圳', '苏州', '厦门', '南京', '北京', '武汉', '西安', '重庆'];
const MERCHANT_PREFIXES = ['山禾', '云岚', '栖木', '青禾', '白屿', '未央', '澄光', '素间', '拾光', '知物', '半夏', '归里'];
const MERCHANT_SUFFIXES = ['生活馆', '旗舰店', '集合店', '工坊', '买手店', '研究所'];
const ENTRY_PRODUCTS: Record<string, string[]> = {
  'gx-custom': ['定制礼盒', '节日套装', '企业伴手礼', '香氛礼盒', '茶器组合', '生活套装'],
  'oriental-aesthetics': ['陶瓷香插', '新中式摆件', '宋风茶具', '丝巾礼盒', '花器套装', '宣纸灯'],
  'organic-vegan': ['植物蛋白', '有机麦片', '素食零食', '冷压果汁', '谷物能量棒', '纯素调味'],
  'pet-planet': ['宠物主粮', '冻干零食', '猫砂套装', '牵引胸背', '智能喂食器', '宠物窝垫'],
  heritage: ['非遗香囊', '手作团扇', '蓝染围巾', '漆器托盘', '竹编收纳', '剪纸礼盒'],
  handmade: ['手工皂', '皮具卡包', '木作托盘', '编织包', '手冲器具', '玻璃杯'],
  'reading-room': ['精选书单', '阅读灯', '书签礼盒', '手账本', '纸品套装', '桌面收纳'],
  'designer-brand': ['设计师包袋', '廓形外套', '银饰项链', '小众香水', '太阳镜', '针织单品'],
};

const formatNumber = (value: number) => value.toLocaleString('zh-CN');
const formatPrice = (value: number) => `¥${value.toLocaleString('zh-CN')}`;

const buildMerchants = (): MerchantOption[] =>
  ENTRY_OPTIONS.flatMap((entry, entryIndex) =>
    Array.from({ length: 126 }, (_, itemIndex) => {
      const city = CITIES[(itemIndex + entryIndex) % CITIES.length];
      const prefix = MERCHANT_PREFIXES[(itemIndex * 3 + entryIndex) % MERCHANT_PREFIXES.length];
      const suffix = MERCHANT_SUFFIXES[(itemIndex + entryIndex * 2) % MERCHANT_SUFFIXES.length];
      const productCount = 42 + ((itemIndex * 17 + entryIndex * 11) % 148);
      const monthlySales = 680 + ((itemIndex * 281 + entryIndex * 443) % 28600);
      const score = Number((4.2 + ((itemIndex * 7 + entryIndex) % 8) / 10).toFixed(1));

      return {
        id: `${entry.id}-merchant-${String(itemIndex + 1).padStart(3, '0')}`,
        entryId: entry.id,
        name: `${prefix}${entry.name}${suffix}`,
        city,
        productCount,
        monthlySales,
        score,
        tags: [entry.name, city, score >= 4.7 ? '高评分' : '稳定供给'],
      };
    })
  );

const MERCHANTS = buildMerchants();

const buildSpus = (merchant: MerchantOption): SpuOption[] => {
  const productNames = ENTRY_PRODUCTS[merchant.entryId] || ['精选商品'];
  const merchantIndex = Number(merchant.id.slice(-3));

  return Array.from({ length: merchant.productCount }, (_, itemIndex) => {
    const baseName = productNames[(itemIndex + merchantIndex) % productNames.length];
    const series = ['基础款', '进阶款', '礼赠款', '限定款'][itemIndex % 4];
    const price = 69 + ((itemIndex * 37 + merchantIndex * 19) % 1680);
    const commissionRate = 6 + ((itemIndex * 5 + merchantIndex) % 18);
    const monthlySales = 36 + ((itemIndex * 73 + merchant.monthlySales) % 7600);

    return {
      id: `SPU-${merchant.id.slice(0, 3).toUpperCase()}-${merchantIndex}-${String(itemIndex + 1).padStart(4, '0')}`,
      merchantId: merchant.id,
      name: `${merchant.name.replace(/(旗舰店|集合店|生活馆|工坊|买手店|研究所)$/u, '')}${baseName}${series}`,
      price,
      commissionRate,
      monthlySales,
      status: itemIndex % 17 === 0 ? '补货中' : '可推广',
      tags: [baseName, series, commissionRate >= 18 ? '高佣金' : '常规'],
    };
  });
};

const sortMerchants = (items: MerchantOption[], mode: SortMode) => {
  const sorted = [...items];
  if (mode === 'products') return sorted.sort((a, b) => b.productCount - a.productCount);
  if (mode === 'sales') return sorted.sort((a, b) => b.monthlySales - a.monthlySales);
  return sorted.sort((a, b) => b.score - a.score || b.monthlySales - a.monthlySales);
};

const sortSpus = (items: SpuOption[], mode: SortMode) => {
  const sorted = [...items];
  if (mode === 'sales') return sorted.sort((a, b) => b.monthlySales - a.monthlySales);
  if (mode === 'commission') return sorted.sort((a, b) => b.commissionRate - a.commissionRate);
  return sorted.sort((a, b) => b.monthlySales - a.monthlySales || b.commissionRate - a.commissionRate);
};

const ProductLinkCreator: React.FC<ProductLinkCreatorProps> = ({ disabled = false, onCreateAsset }) => {
  const [selectedEntryId, setSelectedEntryId] = useState(ENTRY_OPTIONS[0].id);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [selectedSpuId, setSelectedSpuId] = useState('');
  const [merchantSearch, setMerchantSearch] = useState('');
  const [spuSearch, setSpuSearch] = useState('');
  const [merchantSort, setMerchantSort] = useState<SortMode>('recommend');
  const [spuSort, setSpuSort] = useState<SortMode>('recommend');
  const [creating, setCreating] = useState(false);
  const [generatedAsset, setGeneratedAsset] = useState<TrackingAsset | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const selectedEntry = ENTRY_OPTIONS.find(entry => entry.id === selectedEntryId) || ENTRY_OPTIONS[0];

  const filteredMerchants = useMemo(() => {
    const keyword = merchantSearch.trim().toLowerCase();
    const merchants = MERCHANTS.filter(merchant => {
      if (merchant.entryId !== selectedEntryId) return false;
      if (!keyword) return true;
      return [merchant.name, merchant.city, merchant.id, ...merchant.tags]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });

    return sortMerchants(merchants, merchantSort);
  }, [merchantSearch, merchantSort, selectedEntryId]);

  useEffect(() => {
    setSelectedMerchantId(filteredMerchants[0]?.id || '');
    setSelectedSpuId('');
    setGeneratedAsset(null);
    setQrCodeUrl('');
  }, [filteredMerchants]);

  const selectedMerchant = filteredMerchants.find(merchant => merchant.id === selectedMerchantId) || filteredMerchants[0];

  const filteredSpus = useMemo(() => {
    if (!selectedMerchant) return [];

    const keyword = spuSearch.trim().toLowerCase();
    const spus = buildSpus(selectedMerchant).filter(spu => {
      if (!keyword) return true;
      return [spu.name, spu.id, spu.status, ...spu.tags]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });

    return sortSpus(spus, spuSort);
  }, [selectedMerchant, spuSearch, spuSort]);

  useEffect(() => {
    setSelectedSpuId(filteredSpus[0]?.id || '');
    setGeneratedAsset(null);
    setQrCodeUrl('');
  }, [filteredSpus]);

  const selectedSpu = filteredSpus.find(spu => spu.id === selectedSpuId) || filteredSpus[0];

  const handleEntryChange = (entryId: string) => {
    setSelectedEntryId(entryId);
    setMerchantSearch('');
    setSpuSearch('');
  };

  const handleGenerate = async () => {
    if (!selectedMerchant || !selectedSpu) return;

    const token = `gx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const assetValue = `https://go.coselector.cn/spu/${selectedSpu.id}?entry=${selectedEntry.id}&merchant=${selectedMerchant.id}&ref=${token}`;

    setCreating(true);
    try {
      const newAsset = await onCreateAsset({
        type: AssetType.SHORT_LINK,
        name: `${selectedSpu.name}`,
        assetValue,
        channelTag: selectedEntry.name,
        status: AssetStatus.ACTIVE,
        clickCount: 0,
        conversionCount: 0,
        boundContentIds: [selectedSpu.id],
      });
      const qrUrl = await QRCode.toDataURL(assetValue, { width: 260, margin: 2 });
      setGeneratedAsset(newAsset);
      setQrCodeUrl(qrUrl);
      message.success('商品链接已生成');
    } catch (error) {
      message.error('商品链接生成失败');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedAsset) return;
    await navigator.clipboard.writeText(generatedAsset.assetValue);
    message.success('链接已复制');
  };

  const handleDownloadQr = () => {
    if (!qrCodeUrl || !generatedAsset) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${generatedAsset.id}.png`;
    link.click();
  };

  return (
    <section className="product-link-creator">
      <div className="product-link-creator-header">
        <div>
          <Title level={3}>创建商品链接</Title>
          <Text type="secondary">入口、商家与 SPU 共同决定唯一归因链接。</Text>
        </div>
        <Tag color="blue">唯一归因</Tag>
      </div>

      <div className="product-link-creator-grid">
        <div className="creator-panel entry-selector-panel">
          <div className="creator-panel-heading">
            <Text strong>八大入口</Text>
            <Text type="secondary">{ENTRY_OPTIONS.length} 个入口</Text>
          </div>
          <div className="entry-selector-grid">
            {ENTRY_OPTIONS.map(entry => (
              <button
                key={entry.id}
                type="button"
                className={`entry-option ${entry.id === selectedEntryId ? 'selected' : ''}`}
                style={{ '--entry-tone': entry.tone } as React.CSSProperties}
                onClick={() => handleEntryChange(entry.id)}
              >
                <span>{entry.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="creator-panel merchant-selector-panel">
          <div className="creator-panel-heading">
            <Text strong>选择商家</Text>
            <Text type="secondary">{formatNumber(filteredMerchants.length)} 个结果</Text>
          </div>
          <Space.Compact className="creator-search-row">
            <Input.Search
              allowClear
              placeholder="搜索商家、城市、标签"
              value={merchantSearch}
              onChange={event => setMerchantSearch(event.target.value)}
            />
            <Select
              value={merchantSort}
              onChange={setMerchantSort}
              options={[
                { value: 'recommend', label: '推荐' },
                { value: 'sales', label: '销量' },
                { value: 'products', label: 'SPU 数' },
              ]}
            />
          </Space.Compact>
          <div className="selector-list merchant-list">
            {filteredMerchants.map(merchant => (
              <button
                type="button"
                key={merchant.id}
                className={`selector-row ${merchant.id === selectedMerchantId ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedMerchantId(merchant.id);
                  setSelectedSpuId('');
                  setGeneratedAsset(null);
                  setQrCodeUrl('');
                }}
              >
                <span className="selector-row-main">
                  <Text strong>{merchant.name}</Text>
                  <Text type="secondary">{merchant.city} · {formatNumber(merchant.productCount)} 个 SPU</Text>
                </span>
                <span className="selector-row-meta">
                  <Text>{merchant.score.toFixed(1)}</Text>
                  <Text type="secondary">月销 {formatNumber(merchant.monthlySales)}</Text>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="creator-panel spu-selector-panel">
          <div className="creator-panel-heading">
            <Text strong>选择 SPU</Text>
            <Text type="secondary">{selectedMerchant ? formatNumber(filteredSpus.length) : 0} 个结果</Text>
          </div>
          <Space.Compact className="creator-search-row">
            <Input.Search
              allowClear
              placeholder="搜索 SPU、编号、标签"
              value={spuSearch}
              onChange={event => setSpuSearch(event.target.value)}
              disabled={!selectedMerchant}
            />
            <Select
              value={spuSort}
              onChange={setSpuSort}
              options={[
                { value: 'recommend', label: '推荐' },
                { value: 'sales', label: '销量' },
                { value: 'commission', label: '佣金' },
              ]}
              disabled={!selectedMerchant}
            />
          </Space.Compact>
          <div className="selector-list spu-list">
            {filteredSpus.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无 SPU" />
            ) : (
              filteredSpus.map(spu => (
                <button
                  type="button"
                  key={spu.id}
                  className={`selector-row spu-row ${spu.id === selectedSpuId ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedSpuId(spu.id);
                    setGeneratedAsset(null);
                    setQrCodeUrl('');
                  }}
                >
                  <span className="selector-row-main">
                    <Text strong>{spu.name}</Text>
                    <Text type="secondary">{spu.id} · {formatPrice(spu.price)}</Text>
                  </span>
                  <span className="selector-row-meta">
                    <Tag color={spu.status === '可推广' ? 'green' : 'gold'}>{spu.status}</Tag>
                    <Text type="secondary">佣金 {spu.commissionRate}%</Text>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        <aside className="creator-panel result-panel">
          <div className="creator-panel-heading">
            <Text strong>链接与二维码</Text>
            <Text type="secondary">{selectedSpu ? '已选 SPU' : '待选择'}</Text>
          </div>

          <div className="selection-summary">
            <div>
              <Text type="secondary">入口</Text>
              <Text strong>{selectedEntry.name}</Text>
            </div>
            <div>
              <Text type="secondary">商家</Text>
              <Text strong>{selectedMerchant?.name || '-'}</Text>
            </div>
            <div>
              <Text type="secondary">SPU</Text>
              <Text strong>{selectedSpu?.name || '-'}</Text>
            </div>
          </div>

          <Button
            type="primary"
            block
            icon={<LinkOutlined />}
            loading={creating}
            disabled={disabled || !selectedMerchant || !selectedSpu}
            onClick={handleGenerate}
          >
            生成商品链接
          </Button>

          {generatedAsset && (
            <div className="generated-output">
              <div className="generated-link-box">
                <Text type="secondary">商品链接</Text>
                <Input.TextArea value={generatedAsset.assetValue} autoSize readOnly />
                <Button icon={<CopyOutlined />} onClick={handleCopyLink}>复制链接</Button>
              </div>

              {qrCodeUrl && (
                <div className="generated-qr-box">
                  <img src={qrCodeUrl} alt="商品链接二维码" />
                  <Button icon={<DownloadOutlined />} onClick={handleDownloadQr}>下载二维码</Button>
                </div>
              )}
            </div>
          )}

          {disabled && (
            <Text type="secondary">当前角色没有创建权限。</Text>
          )}
        </aside>
      </div>
    </section>
  );
};

export default ProductLinkCreator;