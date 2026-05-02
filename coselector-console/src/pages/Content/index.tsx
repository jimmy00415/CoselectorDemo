import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Divider,
  Drawer,
  Empty,
  Input,
  Progress,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  BankOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  FireOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShopOutlined,
  StarFilled,
  TagsOutlined,
} from '@ant-design/icons';
import PageBreadcrumb from '../../layout/PageBreadcrumb';
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

  const totalProducts = getAllProducts().length;
  const averageCommission = Math.round(
    MERCHANT_CATALOG.reduce((sum, merchant) => sum + merchant.averageCommissionRate, 0) / MERCHANT_CATALOG.length
  );
  const totalMonthlySales = MERCHANT_CATALOG.reduce((sum, merchant) => sum + merchant.monthlySales, 0);
  const qualifiedMerchants = MERCHANT_CATALOG.filter(merchant => merchant.certifications.length >= 3).length;

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
            浏览商家资质、地点、服务政策、商品详情与推荐要点。
          </Paragraph>
        </div>
        <Button icon={<ExportOutlined />} onClick={handleExport} disabled={filteredMerchants.length === 0}>
          导出商家
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
          <span>平均佣金</span>
          <strong>{averageCommission}%</strong>
        </div>
        <div className="content-stat-tile">
          <span>月销量</span>
          <strong>{formatCatalogNumber(totalMonthlySales)}</strong>
        </div>
        <div className="content-stat-tile">
          <span>资质完整</span>
          <strong>{qualifiedMerchants}/{MERCHANT_CATALOG.length}</strong>
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

          <section className="merchant-intel-grid">
            <div className="intel-section">
              <div className="section-title-row">
                <SafetyCertificateOutlined />
                <Text strong>资质与可信信息</Text>
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
                <Text strong>地点与履约</Text>
              </div>
              <div className="address-block">
                <Text>{selectedMerchant.city}{selectedMerchant.district}</Text>
                <Text type="secondary">{selectedMerchant.address}</Text>
              </div>
              <div className="fulfillment-row">
                <span>响应 {selectedMerchant.responseTime}</span>
                <span>履约 {selectedMerchant.fulfillmentRate}%</span>
              </div>
            </div>

            <div className="intel-section">
              <div className="section-title-row">
                <FireOutlined />
                <Text strong>推荐优势</Text>
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
              <div className="panel-heading">
                <div>
                  <Text strong>{selectedProduct.name}</Text>
                  <Text type="secondary">{selectedProduct.id}</Text>
                </div>
                <Button type="primary" onClick={() => handleOpenProduct(selectedProduct)}>
                  查看详情
                </Button>
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
