import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Divider,
  Drawer,
  Empty,
  Input,
  message,
  Progress,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  AuditOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  FireOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  StarFilled,
  TagsOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import PageBreadcrumb from '../../layout/PageBreadcrumb';
import * as mockApi from '../../services/mockApi';
import { AssetStatus, AssetType } from '../../types/enums';
import {
  CONTENT_ENTRIES,
  CatalogProduct,
  MERCHANT_CATALOG,
  MerchantProfile,
  formatCatalogCurrency,
  formatCatalogNumber,
  getAllProducts,
} from './catalogData';
import './styles.css';

const { Paragraph, Text, Title } = Typography;

const normalizeKeyword = (value: string) => value.trim().toLowerCase();

const getProductSearchText = (product: CatalogProduct) => [
  product.id,
  product.name,
  product.category,
  product.targetAudience,
  ...product.tags,
  ...product.sellingPoints,
].join(' ').toLowerCase();

const getMerchantSearchText = (merchant: MerchantProfile) => [
  merchant.id,
  merchant.name,
  merchant.entry,
  merchant.city,
  merchant.district,
  merchant.address,
  merchant.qualification,
  merchant.summary,
  ...merchant.certifications,
  ...merchant.merchantTags,
  ...merchant.strengths,
  ...merchant.products.map(getProductSearchText),
].join(' ').toLowerCase();

const getStockColor = (stockStatus: CatalogProduct['stockStatus']) => {
  if (stockStatus === '现货') return 'green';
  if (stockStatus === '预售') return 'gold';
  return 'orange';
};

const ORGANIC_REQUIRED_LABELS = ['容量', '容量规格', '尺寸', '营养价值', '烹饪方式', '送货与退货'];

const ENTRY_LINK_ID_BY_NAME: Record<string, string> = {
  光选定制: 'gx-custom',
  东方美学: 'oriental-aesthetics',
  有机素食: 'organic-vegan',
  宠物星球: 'pet-planet',
  光选非遗: 'heritage',
  匠心手作: 'handmade',
  静读间: 'reading-room',
  设计师品牌: 'designer-brand',
};

const isOrganicVeganProduct = (merchant: MerchantProfile, product: CatalogProduct) =>
  merchant.entry === '有机素食' || product.tags.some(tag => ['植物蛋白', '果蔬', '轻食'].includes(tag));

const getSpecValue = (product: CatalogProduct, label: string) =>
  product.specs.find(spec => spec.label === label)?.value;

const getProductSkus = (product: CatalogProduct) => {
  const stockBase = product.stockStatus === '现货' ? 280 : product.stockStatus === '预售' ? 80 : 24;
  const firstSpec = product.specs[0]?.value || '标准规格';

  return [
    {
      name: '标准款',
      option: firstSpec,
      price: product.price,
      stock: stockBase,
      available: Math.max(1, stockBase - 8),
    },
    {
      name: product.category.includes('礼') ? '礼赠款' : '组合款',
      option: product.tags.slice(0, 2).join(' / ') || '组合规格',
      price: Math.round(product.price * 1.18),
      stock: Math.max(12, Math.round(stockBase * 0.42)),
      available: Math.max(8, Math.round(stockBase * 0.38)),
    },
  ];
};

const getPurchaseLimit = (product: CatalogProduct) => {
  if (product.category.includes('企业')) return { min: 20, max: 200, option: '支持团购规格' };
  if (product.stockStatus === '少量库存') return { min: 1, max: 3, option: '限量库存' };
  if (product.stockStatus === '预售') return { min: 1, max: 5, option: '预售批次' };
  return { min: 1, max: 20, option: '常规购买' };
};

const getTrustSignals = (product: CatalogProduct, merchant: MerchantProfile) => ({
  favoriteCount: Math.round(product.monthlySales * 0.18),
  viewCount: Math.round(product.monthlySales * 6.4),
  heat: Math.min(99, Math.round(product.monthlySales / 220 + merchant.score * 10)),
  trustScore: Math.min(99, Math.round(merchant.score * 18 + merchant.fulfillmentRate * 0.1)),
});

const getMerchantRegisterType = (merchant: MerchantProfile) =>
  merchant.qualification === '工坊认证' ? '个人/工坊' : '公司';

const getProductChecks = (product: CatalogProduct, merchant: MerchantProfile) => {
  const skus = getProductSkus(product);
  const isOrganic = isOrganicVeganProduct(merchant, product);
  const organicMissing = ORGANIC_REQUIRED_LABELS.filter(label => !getSpecValue(product, label));
  const checks = [
    {
      label: '商品是什么',
      detail: `${product.category} / ${product.tags.slice(0, 3).join('、')}`,
      ok: Boolean(product.name && product.category && product.sellingPoints.length > 0),
    },
    {
      label: '规格与详情',
      detail: `${product.specs.length} 个详情字段`,
      ok: product.specs.length >= 3,
    },
    {
      label: '价格、SKU 与库存',
      detail: `${skus.length} 个 SKU，${product.stockStatus}`,
      ok: product.price > 0 && skus.some(sku => sku.available > 0),
    },
    {
      label: '上架与审核',
      detail: 'active / reviewed / 未删除',
      ok: true,
    },
    {
      label: '商家基础资质',
      detail: `${merchant.certifications.length}/4 项材料`,
      ok: merchant.certifications.length >= 4,
    },
    {
      label: '发货退货与保障',
      detail: merchant.servicePolicies.slice(0, 2).join('；'),
      ok: merchant.servicePolicies.length > 0,
    },
  ];

  if (isOrganic) {
    checks.push({
      label: '有机/素食必填项',
      detail: organicMissing.length === 0 ? '容量、营养、烹饪、送货与退货齐全' : `缺 ${organicMissing.join('、')}`,
      ok: organicMissing.length === 0,
    });
  }

  return checks;
};

const getReadinessPercent = (checks: ReturnType<typeof getProductChecks>) =>
  Math.round((checks.filter(check => check.ok).length / checks.length) * 100);

const sanitizeDownloadName = (value: string) => value.replace(/[\\/:*?"<>|]/g, '-');

const buildRecommendationLink = (merchant: MerchantProfile, product: CatalogProduct) => {
  const entryId = ENTRY_LINK_ID_BY_NAME[merchant.entry] || encodeURIComponent(merchant.entry);
  const token = `gx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `https://go.coselector.cn/spu/${product.id}?entry=${entryId}&merchant=${merchant.id}&ref=${token}`;
};

const buildMediaPackContent = (merchant: MerchantProfile, product: CatalogProduct) => [
  `# ${product.name} 媒体素材包`,
  '',
  `商品ID：${product.id}`,
  `绑定商家：${merchant.name}`,
  `入口：${merchant.entry}`,
  `分类：${product.category}`,
  `价格：${formatCatalogCurrency(product.price)}`,
  `佣金：${product.commissionRate}%`,
  '',
  '## 素材位',
  '- 主图：待商品详情接口补充',
  '- 轮播图：待商品详情接口补充',
  '- 视频：待商品详情接口补充',
  '',
  '## 商品卖点',
  ...product.sellingPoints.map(point => `- ${point}`),
  '',
  '## 推荐角度',
  ...product.recommendationAngles.map(angle => `- ${angle}`),
  '',
  '## 商品详情字段',
  ...product.specs.map(spec => `- ${spec.label}：${spec.value}`),
  '',
  '## 服务与风险提示',
  ...merchant.servicePolicies.map(policy => `- ${policy}`),
  ...product.complianceNotes.map(note => `- ${note}`),
].join('\n');

const ContentPage: React.FC = () => {
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId: string }>();
  const [searchText, setSearchText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState('全部入口');
  const [selectedCity, setSelectedCity] = useState<string | undefined>();
  const [selectedQualification, setSelectedQualification] = useState<string | undefined>();
  const [selectedMerchantId, setSelectedMerchantId] = useState(MERCHANT_CATALOG[0].id);
  const [selectedProductId, setSelectedProductId] = useState(MERCHANT_CATALOG[0].products[0].id);
  const [detailProduct, setDetailProduct] = useState<CatalogProduct | null>(null);
  const [creatingLinkProductId, setCreatingLinkProductId] = useState<string | null>(null);

  const cityOptions = useMemo(
    () => Array.from(new Set(MERCHANT_CATALOG.map(merchant => merchant.city)))
      .map(city => ({ label: city, value: city })),
    []
  );

  const qualificationOptions = useMemo(
    () => Array.from(new Set(MERCHANT_CATALOG.map(merchant => merchant.qualification)))
      .map(qualification => ({ label: qualification, value: qualification })),
    []
  );

  const filteredMerchants = useMemo(() => {
    const keyword = normalizeKeyword(searchText);

    return MERCHANT_CATALOG.filter(merchant => {
      if (selectedEntry !== '全部入口' && merchant.entry !== selectedEntry) return false;
      if (selectedCity && merchant.city !== selectedCity) return false;
      if (selectedQualification && merchant.qualification !== selectedQualification) return false;
      if (!keyword) return true;
      return getMerchantSearchText(merchant).includes(keyword);
    });
  }, [searchText, selectedCity, selectedEntry, selectedQualification]);

  const selectedMerchant = useMemo(() => {
    return filteredMerchants.find(merchant => merchant.id === selectedMerchantId)
      || MERCHANT_CATALOG.find(merchant => merchant.id === selectedMerchantId)
      || filteredMerchants[0]
      || MERCHANT_CATALOG[0];
  }, [filteredMerchants, selectedMerchantId]);

  const selectedProduct = selectedMerchant.products.find(product => product.id === selectedProductId)
    || selectedMerchant.products[0];

  const allProducts = getAllProducts();
  const totalProducts = allProducts.length;
  const completeProducts = allProducts.filter(product => product.specs.length >= 3 && product.sellingPoints.length > 0).length;
  const averageCommission = Math.round(
    MERCHANT_CATALOG.reduce((sum, merchant) => sum + merchant.averageCommissionRate, 0) / MERCHANT_CATALOG.length
  );
  const totalMonthlySales = MERCHANT_CATALOG.reduce((sum, merchant) => sum + merchant.monthlySales, 0);
  const qualifiedMerchants = MERCHANT_CATALOG.filter(merchant => merchant.certifications.length >= 4).length;
  const selectedProductChecks = getProductChecks(selectedProduct, selectedMerchant);
  const selectedReadiness = getReadinessPercent(selectedProductChecks);
  const selectedSkus = getProductSkus(selectedProduct);
  const selectedPurchaseLimit = getPurchaseLimit(selectedProduct);
  const selectedTrustSignals = getTrustSignals(selectedProduct, selectedMerchant);
  const selectedIsOrganic = isOrganicVeganProduct(selectedMerchant, selectedProduct);
  const detailProductChecks = detailProduct ? getProductChecks(detailProduct, selectedMerchant) : [];
  const detailProductSkus = detailProduct ? getProductSkus(detailProduct) : [];
  const detailPurchaseLimit = detailProduct ? getPurchaseLimit(detailProduct) : undefined;
  const detailTrustSignals = detailProduct ? getTrustSignals(detailProduct, selectedMerchant) : undefined;
  const detailIsOrganic = detailProduct ? isOrganicVeganProduct(selectedMerchant, detailProduct) : false;

  useEffect(() => {
    if (!contentId) return;

    const merchantMatch = MERCHANT_CATALOG.find(merchant => merchant.id === contentId);
    if (merchantMatch) {
      setSelectedMerchantId(merchantMatch.id);
      setSelectedProductId(merchantMatch.products[0].id);
      return;
    }

    const productMerchant = MERCHANT_CATALOG.find(merchant =>
      merchant.products.some(product => product.id === contentId)
    );
    const productMatch = productMerchant?.products.find(product => product.id === contentId);

    if (productMerchant && productMatch) {
      setSelectedMerchantId(productMerchant.id);
      setSelectedProductId(productMatch.id);
      setDetailProduct(productMatch);
    }
  }, [contentId]);

  useEffect(() => {
    if (filteredMerchants.length === 0) return;
    if (!filteredMerchants.some(merchant => merchant.id === selectedMerchantId)) {
      setSelectedMerchantId(filteredMerchants[0].id);
      setSelectedProductId(filteredMerchants[0].products[0].id);
    }
  }, [filteredMerchants, selectedMerchantId]);

  useEffect(() => {
    if (!selectedMerchant.products.some(product => product.id === selectedProductId)) {
      setSelectedProductId(selectedMerchant.products[0].id);
    }
  }, [selectedMerchant, selectedProductId]);

  const handleSelectMerchant = (merchant: MerchantProfile) => {
    setSelectedMerchantId(merchant.id);
    setSelectedProductId(merchant.products[0].id);
    navigate(`/content/${merchant.id}`);
  };

  const handleOpenProduct = (product: CatalogProduct) => {
    setSelectedProductId(product.id);
    setDetailProduct(product);
  };

  const handleDownloadMediaPack = (product: CatalogProduct, merchant = selectedMerchant) => {
    const blob = new Blob([buildMediaPackContent(merchant, product)], { type: 'text/markdown;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${product.id}-${sanitizeDownloadName(product.name)}-media-kit.md`;
    link.click();
    window.URL.revokeObjectURL(url);
    message.success('媒体素材包已下载');
  };

  const handleGenerateRecommendationLink = async (product: CatalogProduct, merchant = selectedMerchant) => {
    const recommendationLink = buildRecommendationLink(merchant, product);
    setCreatingLinkProductId(product.id);
    try {
      await mockApi.createAsset({
        type: AssetType.SHORT_LINK,
        name: product.name,
        assetValue: recommendationLink,
        channelTag: merchant.entry,
        status: AssetStatus.ACTIVE,
        clickCount: 0,
        conversionCount: 0,
        boundContentIds: [product.id],
      });
      try {
        await navigator.clipboard.writeText(recommendationLink);
        message.success('商品推荐链接已生成，已同步到商品链接列表并复制');
      } catch (clipboardError) {
        message.success('商品推荐链接已生成，已同步到商品链接列表');
      }
    } catch (error) {
      message.error('商品推荐链接生成失败');
    } finally {
      setCreatingLinkProductId(null);
    }
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedEntry('全部入口');
    setSelectedCity(undefined);
    setSelectedQualification(undefined);
  };

  const handleExport = () => {
    const csv = [
      ['商家', '入口', '城市', '资质', '商品数', '月销量', '平均佣金', '地址'],
      ...filteredMerchants.map(merchant => [
        merchant.name,
        merchant.entry,
        merchant.city,
        merchant.qualification,
        merchant.productCount,
        merchant.monthlySales,
        `${merchant.averageCommissionRate}%`,
        merchant.address,
      ]),
    ].map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `merchant-catalog-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="content-page merchant-content-page">
      <PageBreadcrumb />

      <div className="content-workbench-header">
        <div>
          <Title level={2}>商品内容</Title>
          <Paragraph type="secondary">
            给内容运营和共选者一页看清：商品是什么、是否可推荐、商家资料是否清楚、交付售后是否可靠。
          </Paragraph>
        </div>
        <Button
          type="primary"
          size="large"
          className="merchant-export-button"
          icon={<ExportOutlined />}
          onClick={handleExport}
          disabled={filteredMerchants.length === 0}
        >
          导出商家信息
        </Button>
      </div>

      <section className="content-catalog-stats" aria-label="商品内容概览">
        <div className="content-stat-tile">
          <span>收录商家</span>
          <strong>{MERCHANT_CATALOG.length}</strong>
        </div>
        <div className="content-stat-tile">
          <span>可浏览 SPU</span>
          <strong>{totalProducts}</strong>
        </div>
        <div className="content-stat-tile">
          <span>信息完整 SPU</span>
          <strong>{completeProducts}/{totalProducts}</strong>
        </div>
        <div className="content-stat-tile">
          <span>月销量</span>
          <strong>{formatCatalogNumber(totalMonthlySales)}</strong>
        </div>
        <div className="content-stat-tile">
          <span>资质完整</span>
          <strong>{qualifiedMerchants}/{MERCHANT_CATALOG.length}</strong>
        </div>
        <div className="content-stat-tile">
          <span>平均佣金</span>
          <strong>{averageCommission}%</strong>
        </div>
      </section>

      <section className="content-filter-strip" aria-label="筛选商家和商品">
        <Input
          className="content-search-input"
          prefix={<SearchOutlined />}
          allowClear
          placeholder="搜索商家、商品、资质、城市或推荐场景"
          value={searchText}
          onChange={event => setSearchText(event.target.value)}
        />
        <Select
          value={selectedEntry}
          onChange={setSelectedEntry}
          options={CONTENT_ENTRIES.map(entry => ({ label: entry, value: entry }))}
        />
        <Select
          placeholder="城市"
          allowClear
          value={selectedCity}
          onChange={setSelectedCity}
          options={cityOptions}
        />
        <Select
          placeholder="资质"
          allowClear
          value={selectedQualification}
          onChange={setSelectedQualification}
          options={qualificationOptions}
        />
        <Button onClick={handleResetFilters}>重置</Button>
      </section>

      <div className="content-catalog-layout">
        <aside className="merchant-list-panel" aria-label="商家列表">
          <div className="panel-heading compact">
            <div>
              <Text strong>商家</Text>
              <Text type="secondary">{filteredMerchants.length} 个结果</Text>
            </div>
          </div>

          <div className="merchant-list-scroll">
            {filteredMerchants.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配商家" />
            ) : (
              filteredMerchants.map(merchant => (
                <button
                  key={merchant.id}
                  type="button"
                  className={`merchant-list-card ${merchant.id === selectedMerchant.id ? 'selected' : ''}`}
                  onClick={() => handleSelectMerchant(merchant)}
                >
                  <span className="merchant-avatar">{merchant.name.slice(0, 2)}</span>
                  <span className="merchant-list-body">
                    <span className="merchant-list-title">{merchant.name}</span>
                    <span className="merchant-list-meta">
                      {merchant.entry} · {merchant.city}{merchant.district}
                    </span>
                    <span className="merchant-list-tags">
                      <Tag color="blue">{merchant.qualification}</Tag>
                      <Tag>{merchant.productCount} SPU</Tag>
                    </span>
                  </span>
                  <span className="merchant-score">
                    <StarFilled /> {merchant.score.toFixed(1)}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="merchant-detail-workspace">
          <section className="merchant-profile-band">
            <div className="merchant-profile-main">
              <div className="merchant-profile-title-row">
                <div>
                  <Space size="small" wrap>
                    <Tag color="blue">{selectedMerchant.entry}</Tag>
                    <Tag color="green">{selectedMerchant.qualification}</Tag>
                    <Tag>{selectedMerchant.foundedYear} 年成立</Tag>
                  </Space>
                  <Title level={3}>{selectedMerchant.name}</Title>
                </div>
                <div className="merchant-profile-score">
                  <StarFilled />
                  <strong>{selectedMerchant.score.toFixed(1)}</strong>
                </div>
              </div>
              <Paragraph>{selectedMerchant.summary}</Paragraph>
              <div className="merchant-tag-row">
                {selectedMerchant.merchantTags.map(tag => <Tag key={tag}>{tag}</Tag>)}
              </div>
            </div>

            <div className="merchant-profile-metrics">
              <div>
                <span>月销量</span>
                <strong>{formatCatalogNumber(selectedMerchant.monthlySales)}</strong>
              </div>
              <div>
                <span>平均佣金</span>
                <strong>{selectedMerchant.averageCommissionRate}%</strong>
              </div>
              <div>
                <span>履约率</span>
                <strong>{selectedMerchant.fulfillmentRate}%</strong>
              </div>
              <div>
                <span>复购率</span>
                <strong>{selectedMerchant.repeatRate}%</strong>
              </div>
            </div>
          </section>

          <section className="product-workspace-grid">
            <div className="product-list-panel">
              <div className="panel-heading">
                <div>
                  <Text strong>商品</Text>
                  <Text type="secondary">{selectedMerchant.products.length} 个重点 SPU</Text>
                </div>
              </div>

              <div className="product-card-grid">
                {selectedMerchant.products.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    className={`product-card ${product.id === selectedProduct.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    <span className="product-thumb" style={{ background: product.heroTone }}>
                      <TagsOutlined />
                    </span>
                    <span className="product-card-body">
                      <span className="product-card-title">{product.name}</span>
                      <span className="product-card-meta">
                        {formatCatalogCurrency(product.price)} · 佣金 {product.commissionRate}%
                      </span>
                      <span className="product-card-tags">
                        <Tag color={getStockColor(product.stockStatus)}>{product.stockStatus}</Tag>
                        <Tag>{product.category}</Tag>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <aside className="product-detail-panel">
              <div className="panel-heading product-detail-heading">
                <div>
                  <Text strong>{selectedProduct.name}</Text>
                  <Text type="secondary">{selectedProduct.id}</Text>
                </div>
              </div>

              <div className="product-action-row">
                <Button onClick={() => handleOpenProduct(selectedProduct)}>
                  查看详情
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => handleDownloadMediaPack(selectedProduct)}>
                  下载媒体素材
                </Button>
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  loading={creatingLinkProductId === selectedProduct.id}
                  onClick={() => handleGenerateRecommendationLink(selectedProduct)}
                >
                  生成推荐链接
                </Button>
              </div>

              <div className="readiness-card">
                <div className="readiness-header">
                  <div>
                    <Text strong>推荐前检查</Text>
                    <Text type="secondary">状态、信息、资质和保障一次看清</Text>
                  </div>
                  <Progress type="circle" percent={selectedReadiness} size={58} />
                </div>
                <div className="checklist-grid">
                  {selectedProductChecks.map(check => (
                    <div key={check.label} className={check.ok ? 'check-item ok' : 'check-item warn'}>
                      {check.ok ? <CheckSquareOutlined /> : <InfoCircleOutlined />}
                      <span>
                        <strong>{check.label}</strong>
                        <small>{check.detail}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="product-status-row">
                <Tag color="green">已上架 active</Tag>
                <Tag color="green">已审核 reviewed</Tag>
                <Tag>未删除</Tag>
                {selectedIsOrganic && <Tag color="lime">organic_vegan</Tag>}
              </div>

              <div className="product-highlight-strip">
                <div>
                  <span>售价</span>
                  <strong>{formatCatalogCurrency(selectedProduct.price)}</strong>
                </div>
                <div>
                  <span>佣金</span>
                  <strong>{selectedProduct.commissionRate}%</strong>
                </div>
                <div>
                  <span>月销</span>
                  <strong>{formatCatalogNumber(selectedProduct.monthlySales)}</strong>
                </div>
              </div>

              <div className="sku-limit-card">
                <div className="section-title-row">
                  <ShoppingCartOutlined />
                  <Text strong>SKU、库存与购买限制</Text>
                </div>
                <div className="sku-list">
                  {selectedSkus.map(sku => (
                    <div key={sku.name}>
                      <span>
                        <strong>{sku.name}</strong>
                        <small>{sku.option}</small>
                      </span>
                      <span>{formatCatalogCurrency(sku.price)}</span>
                      <span>可售 {sku.available}</span>
                    </div>
                  ))}
                </div>
                <div className="purchase-limit-row">
                  <span>最小购买 {selectedPurchaseLimit.min}</span>
                  <span>最大购买 {selectedPurchaseLimit.max}</span>
                  <span>{selectedPurchaseLimit.option}</span>
                </div>
              </div>

              <div className="trust-signal-grid">
                <div>
                  <HeartOutlined />
                  <span>收藏</span>
                  <strong>{formatCatalogNumber(selectedTrustSignals.favoriteCount)}</strong>
                </div>
                <div>
                  <ReadOutlined />
                  <span>浏览</span>
                  <strong>{formatCatalogNumber(selectedTrustSignals.viewCount)}</strong>
                </div>
                <div>
                  <ThunderboltOutlined />
                  <span>热度</span>
                  <strong>{selectedTrustSignals.heat}</strong>
                </div>
                <div>
                  <AuditOutlined />
                  <span>信任</span>
                  <strong>{selectedTrustSignals.trustScore}</strong>
                </div>
              </div>

              <div className="product-identity-card">
                <div className="section-title-row">
                  <TagsOutlined />
                  <Text strong>商品身份</Text>
                </div>
                <div className="identity-grid">
                  <div>
                    <span>分类</span>
                    <strong>{selectedMerchant.entry} / {selectedProduct.category}</strong>
                  </div>
                  <div>
                    <span>品牌</span>
                    <strong>待商品详情接口补充</strong>
                  </div>
                  <div>
                    <span>商品类型</span>
                    <strong>{selectedIsOrganic ? 'organic_vegan' : '普通商品'}</strong>
                  </div>
                  <div>
                    <span>媒体素材</span>
                    <strong>主图、轮播图、视频素材位</strong>
                  </div>
                </div>
                <Text type="secondary">{selectedProduct.sellingPoints[0]}</Text>
              </div>

              <div className="target-audience-box">
                <Text type="secondary">目标人群</Text>
                <Text>{selectedProduct.targetAudience}</Text>
              </div>

              <div className="selling-point-list">
                {selectedProduct.sellingPoints.map(point => (
                  <div key={point}>
                    <CheckCircleOutlined />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="recommendation-angle-box">
                <Text strong>推荐角度</Text>
                <div>
                  {selectedProduct.recommendationAngles.map(angle => <Tag key={angle}>{angle}</Tag>)}
                </div>
              </div>
            </aside>
          </section>

          <section className="merchant-intel-grid">
            <div className="intel-section">
              <div className="section-title-row">
                <SafetyCertificateOutlined />
                <Text strong>商家基础资料与资质材料</Text>
              </div>
              <div className="merchant-basics-grid">
                <div>
                  <span>注册类型</span>
                  <strong>{getMerchantRegisterType(selectedMerchant)}</strong>
                </div>
                <div>
                  <span>联系方式</span>
                  <strong>待商家详情接口补充</strong>
                </div>
                <div>
                  <span>商家地址</span>
                  <strong>{selectedMerchant.city}{selectedMerchant.district}</strong>
                </div>
                <div>
                  <span>注册步骤</span>
                  <strong>多步表单已完成</strong>
                </div>
              </div>
              <div className="qualification-list">
                {selectedMerchant.certifications.map(item => (
                  <span key={item}><CheckCircleOutlined /> {item}</span>
                ))}
              </div>
              <div className="license-line">
                <Text type="secondary">统一社会信用代码</Text>
                <Text code>{selectedMerchant.licenseNo}</Text>
              </div>
            </div>

            <div className="intel-section">
              <div className="section-title-row">
                <EnvironmentOutlined />
                <Text strong>地点、发货与履约</Text>
              </div>
              <div className="address-block">
                <Text>{selectedMerchant.city}{selectedMerchant.district}</Text>
                <Text type="secondary">{selectedMerchant.address}</Text>
              </div>
              <div className="fulfillment-row">
                <span>响应 {selectedMerchant.responseTime}</span>
                <span>履约 {selectedMerchant.fulfillmentRate}%</span>
                <span>复购 {selectedMerchant.repeatRate}%</span>
              </div>
            </div>

            <div className="intel-section">
              <div className="section-title-row">
                <FireOutlined />
                <Text strong>标签匹配与推荐依据</Text>
              </div>
              <div className="drawer-tag-row">
                {[...selectedMerchant.merchantTags, ...selectedProduct.tags].map(tag => <Tag key={tag}>{tag}</Tag>)}
              </div>
              <ul className="clean-list">
                {selectedMerchant.strengths.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="intel-section">
              <div className="section-title-row">
                <ReadOutlined />
                <Text strong>适合人群</Text>
              </div>
              <div className="audience-chip-grid">
                {selectedMerchant.audience.map(item => <span key={item}>{item}</span>)}
              </div>
              <Divider />
              <ul className="clean-list muted">
                {selectedMerchant.riskNotes.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <div>
              <div className="section-title-row">
                <ShopOutlined />
                <Text strong>服务政策</Text>
              </div>
              <div className="policy-list">
                {selectedMerchant.servicePolicies.map(item => <span key={item}>{item}</span>)}
              </div>
            </div>
            <Tooltip title="履约率基于样例数据，用于前端原型展示">
              <div className="policy-progress">
                <Text type="secondary">履约稳定度</Text>
                <Progress percent={selectedMerchant.fulfillmentRate} size="small" />
              </div>
            </Tooltip>
          </section>
        </main>
      </div>

      <Drawer
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        size="large"
        title="商品详情"
      >
        {detailProduct && (
          <div className="product-drawer-content">
            <div className="drawer-product-hero" style={{ background: detailProduct.heroTone }}>
              <BankOutlined />
              <div>
                <Title level={4}>{detailProduct.name}</Title>
                <Text>{detailProduct.category} · {detailProduct.id}</Text>
              </div>
            </div>

            <div className="drawer-action-row">
              <Button icon={<DownloadOutlined />} onClick={() => handleDownloadMediaPack(detailProduct)}>
                下载媒体素材
              </Button>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                loading={creatingLinkProductId === detailProduct.id}
                onClick={() => handleGenerateRecommendationLink(detailProduct)}
              >
                生成推荐链接
              </Button>
            </div>

            <section className="drawer-section-block">
              <Text strong>商品是什么</Text>
              <div className="identity-grid">
                <div>
                  <span>分类路径</span>
                  <strong>{selectedMerchant.entry} / {detailProduct.category}</strong>
                </div>
                <div>
                  <span>品牌信息</span>
                  <strong>待商品详情接口补充</strong>
                </div>
                <div>
                  <span>商品类型</span>
                  <strong>{detailIsOrganic ? 'organic_vegan' : '普通商品'}</strong>
                </div>
                <div>
                  <span>媒体素材</span>
                  <strong>主图、轮播图、图片、视频素材位</strong>
                </div>
              </div>
              <Text type="secondary">{detailProduct.sellingPoints[0]}</Text>
            </section>

            <div className="product-highlight-strip drawer-version">
              <div>
                <span>售价</span>
                <strong>{formatCatalogCurrency(detailProduct.price)}</strong>
              </div>
              <div>
                <span>佣金</span>
                <strong>{detailProduct.commissionRate}%</strong>
              </div>
              <div>
                <span>月销</span>
                <strong>{formatCatalogNumber(detailProduct.monthlySales)}</strong>
              </div>
            </div>

            <section className="drawer-section-block">
              <div className="drawer-section-heading">
                <Text strong>是否可以推荐</Text>
                <Progress percent={getReadinessPercent(detailProductChecks)} size="small" />
              </div>
              <div className="product-status-row drawer-status-row">
                <Tag color="green">已上架 active</Tag>
                <Tag color="green">已审核 reviewed</Tag>
                <Tag>未删除</Tag>
                {detailIsOrganic && <Tag color="lime">organic_vegan</Tag>}
              </div>
              <div className="checklist-grid drawer-checklist">
                {detailProductChecks.map(check => (
                  <div key={check.label} className={check.ok ? 'check-item ok' : 'check-item warn'}>
                    {check.ok ? <CheckSquareOutlined /> : <InfoCircleOutlined />}
                    <span>
                      <strong>{check.label}</strong>
                      <small>{check.detail}</small>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="drawer-section-block">
              <Text strong>SKU、价格、库存和购买限制</Text>
              <div className="sku-list drawer-sku-list">
                {detailProductSkus.map(sku => (
                  <div key={sku.name}>
                    <span>
                      <strong>{sku.name}</strong>
                      <small>{sku.option}</small>
                    </span>
                    <span>{formatCatalogCurrency(sku.price)}</span>
                    <span>库存 {sku.stock}</span>
                    <span>可售 {sku.available}</span>
                  </div>
                ))}
              </div>
              {detailPurchaseLimit && (
                <div className="purchase-limit-row">
                  <span>最小购买 {detailPurchaseLimit.min}</span>
                  <span>最大购买 {detailPurchaseLimit.max}</span>
                  <span>{detailPurchaseLimit.option}</span>
                </div>
              )}
            </section>

            {detailTrustSignals && (
              <section className="drawer-section-block">
                <Text strong>热度、信任度和标签</Text>
                <div className="trust-signal-grid drawer-trust-grid">
                  <div>
                    <HeartOutlined />
                    <span>收藏</span>
                    <strong>{formatCatalogNumber(detailTrustSignals.favoriteCount)}</strong>
                  </div>
                  <div>
                    <ReadOutlined />
                    <span>浏览</span>
                    <strong>{formatCatalogNumber(detailTrustSignals.viewCount)}</strong>
                  </div>
                  <div>
                    <ThunderboltOutlined />
                    <span>热度</span>
                    <strong>{detailTrustSignals.heat}</strong>
                  </div>
                  <div>
                    <AuditOutlined />
                    <span>信任</span>
                    <strong>{detailTrustSignals.trustScore}</strong>
                  </div>
                </div>
                <div className="drawer-tag-row">
                  {[...detailProduct.tags, ...detailProduct.recommendationAngles].map(tag => <Tag key={tag}>{tag}</Tag>)}
                </div>
              </section>
            )}

            {detailIsOrganic && (
              <section className="drawer-section-block organic-info-block">
                <Text strong>有机/素食类必看信息</Text>
                <div className="spec-grid">
                  {ORGANIC_REQUIRED_LABELS.map(label => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{getSpecValue(detailProduct, label) || '待补充'}</strong>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="drawer-section-block">
              <Text strong>商品信息</Text>
              <div className="spec-grid">
                {detailProduct.specs.map(spec => (
                  <div key={spec.label}>
                    <span>{spec.label}</span>
                    <strong>{spec.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="drawer-section-block">
              <Text strong>推荐卖点</Text>
              <ul className="clean-list">
                {detailProduct.sellingPoints.map(point => <li key={point}>{point}</li>)}
              </ul>
            </section>

            <section className="drawer-section-block">
              <Text strong>推荐角度</Text>
              <div className="drawer-tag-row">
                {detailProduct.recommendationAngles.map(angle => <Tag key={angle}>{angle}</Tag>)}
              </div>
            </section>

            <section className="drawer-section-block">
              <Text strong>合规提醒</Text>
              <ul className="clean-list muted">
                {detailProduct.complianceNotes.map(note => <li key={note}>{note}</li>)}
              </ul>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ContentPage;
