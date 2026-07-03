// ===== SITE CONFIG =====
// Fill these in as the real destinations come online. Unset entries show an
// honest "coming soon" toast instead of pretending to work.
const SITE_CONFIG = {
  // e.g. 'https://formspree.io/f/xxxxxxx' or your own API endpoint
  formEndpoint: '',
  socials: {
    twitter: '',   // e.g. 'https://x.com/buzz3xyz'
    discord: '',
    github: '',
    telegram: ''
  }
};

// ===== TOAST =====
function showToast(message) {
  let toast = document.getElementById('buzzToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'buzzToast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function comingSoonMessage() {
  const lang = localStorage.getItem('buzz3-lang') || 'en';
  return lang === 'zh' ? '即将开放，敬请期待' :
         lang === 'ja' ? '近日公開予定です' : 'Coming soon — stay tuned!';
}

// ===== I18N SYSTEM =====
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.aiHub': 'AI Hub',
    'nav.members': 'Members',
    'nav.events': 'Events',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.connectWallet': 'Connect Wallet',
    
    // Hero
    'hero.badge': 'AI x Web3 Innovation Hub',
    'hero.title1': 'Building the',
    'hero.title2': 'Decentralized Future',
    'hero.subtitle': 'Where artificial intelligence meets blockchain innovation. Join the next generation of builders creating the infrastructure for Web3.',
    'hero.joinBtn': 'Join Community',
    'hero.exploreBtn': 'Explore More',
    'hero.members': 'Members',
    'hero.events': 'Events',
    'hero.projects': 'Projects',
    'hero.chains': 'Chains',
    
    // About
    'about.title': 'Empowering the Next Generation of Web3 Innovation',
    'about.desc1': 'Buzz3 is a leading AI x Web3 community dedicated to fostering innovation, education, and collaboration in the decentralized ecosystem.',
    'about.desc2': 'Since our founding, we\'ve grown into a global network spanning 50+ countries, hosting hackathons, workshops, and conferences.',
    'about.feature1.title': 'AI-Powered Governance',
    'about.feature1.desc': 'Intelligent DAO mechanisms with AI-assisted decision making',
    'about.feature2.title': 'Innovation Hub',
    'about.feature2.desc': 'Incubating cutting-edge AI x blockchain projects',
    'about.feature3.title': 'Global Network',
    'about.feature3.desc': 'Connected community across 50+ countries worldwide',
    'about.feature4.title': 'Education & Research',
    'about.feature4.desc': 'Workshops, courses, and cutting-edge research initiatives',
    
    // AI Features
    'ai.title': 'AI x Web3 Convergence',
    'ai.subtitle': 'Explore the cutting-edge intersection of artificial intelligence and blockchain technology',
    'ai.card1.title': 'AI Agent Frameworks',
    'ai.card1.desc': 'Build autonomous AI agents that interact with smart contracts, execute transactions, and manage decentralized protocols.',
    'ai.card1.tag1': 'Autonomous',
    'ai.card1.tag2': 'Smart Contracts',
    'ai.card2.title': 'Predictive DeFi',
    'ai.card2.desc': 'Machine learning models that predict market movements, optimize yield strategies, and automate portfolio management.',
    'ai.card2.tag1': 'ML Models',
    'ai.card2.tag2': 'Analytics',
    'ai.card3.title': 'ZK + AI Proofs',
    'ai.card3.desc': 'Zero-knowledge proofs enhanced with AI for privacy-preserving machine learning and verifiable computation.',
    'ai.card3.tag1': 'ZK Proofs',
    'ai.card3.tag2': 'Privacy',
    'ai.card3.tag3': 'Verification',
    
    // Members
    'members.title': 'Community Members',
    'members.subtitle': 'Meet the brilliant minds driving innovation in our Web3 community',
    'members.charlie.role': 'Lead Developer',
    'members.charlie.bio': 'Solidity expert with 8+ years in blockchain development.',
    'members.sarah.role': 'Research Lead',
    'members.sarah.bio': 'PhD in Cryptography. ZK proofs researcher.',
    'members.marcus.role': 'Community Manager',
    'members.marcus.bio': 'Building bridges between developers and users.',
    'members.elena.role': 'Smart Contract Auditor',
    'members.elena.bio': 'Security specialist. Audited 100+ smart contracts.',
    'members.viewAll': 'View All Members',
    
    // Events
    'events.title': 'Past Events',
    'events.subtitle': 'Highlights from our community gatherings and milestones',
    'events.event1.date': 'March 2026',
    'events.event1.title': 'AI x Web3 Summit 2026',
    'events.event1.desc': 'Our flagship annual conference bringing together 500+ developers for workshops, keynotes, and hackathons.',
    'events.event1.attendees': '500+ Attendees',
    'events.event2.date': 'November 2025',
    'events.event2.title': 'DeFi AI Hackathon',
    'events.event2.desc': '48-hour hackathon challenging teams to build AI-powered DeFi protocols. $100K in prizes.',
    'events.event2.attendees': '200+ Participants',
    'events.event2.location': 'Virtual Event',
    'events.event3.date': 'October 2024',
    'events.event3.title': 'Buzz3 Genesis Meetup',
    'events.event3.desc': 'Our founding event that brought together the initial 50 members.',
    'events.event3.attendees': '50 Founding Members',
    
    // Services
    'services.title': 'Web3 Consulting Services',
    'services.subtitle': 'Expert guidance to bring your AI x blockchain vision to life',
    'services.card1.title': 'Smart Contract Development & Audit',
    'services.card1.desc': 'End-to-end smart contract development with AI-powered security auditing.',
    'services.card2.title': 'AI-Enhanced DeFi Protocols',
    'services.card2.desc': 'Architect robust DeFi protocols with AI-driven yield optimization.',
    'services.card3.title': 'Tokenomics & AI Models',
    'services.card3.desc': 'Design sustainable token economies powered by AI modeling.',
    'services.card4.title': 'Blockchain & AI Integration',
    'services.card4.desc': 'Seamlessly integrate AI and blockchain technology into your systems.',
    'services.learnMore': 'Learn More',
    
    // Ecosystem
    'ecosystem.title': 'Supported Ecosystems',
    'ecosystem.subtitle': 'Building across the multi-chain landscape',

    // Partners
    'partners.title': 'Built on Open Infrastructure',
    'partners.subtitle': 'The Web3 and AI stack we build with',
    
    // CTA
    'cta.title': 'Ready to Build the Future?',
    'cta.subtitle': 'Join 2,500+ Web3 enthusiasts and start shaping the decentralized tomorrow',
    'cta.emailPlaceholder': 'Enter your email',
    'cta.joinBtn': 'Join Now',
    
    // Footer
    'footer.desc': 'Building the future of Web3 through community, education, and innovation. Join us in shaping the decentralized world.',
    'footer.community': 'Community',
    'footer.aboutUs': 'About Us',
    'footer.members': 'Members',
    'footer.events': 'Events',
    'footer.blog': 'Blog',
    'footer.services': 'Services',
    'footer.smartContracts': 'Smart Contracts',
    'footer.defiDesign': 'DeFi Design',
    'footer.tokenomics': 'Tokenomics',
    'footer.integration': 'Integration',
    'footer.resources': 'Resources',
    'footer.documentation': 'Documentation',
    'footer.tutorials': 'Tutorials',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    
    // Typing texts
    'typing.1': 'AI-Powered Innovation',
    'typing.2': 'Decentralized Future',
    'typing.3': 'Blockchain Excellence',
    'typing.4': 'Web3 Pioneer Network',
    'typing.5': 'Smart Contract Security'
  },
  
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.about': '关于',
    'nav.aiHub': 'AI 中心',
    'nav.members': '成员',
    'nav.events': '活动',
    'nav.services': '服务',
    'nav.contact': '联系我们',
    'nav.connectWallet': '连接钱包',
    
    // Hero
    'hero.badge': 'AI x Web3 创新中心',
    'hero.title1': '构建',
    'hero.title2': '去中心化未来',
    'hero.subtitle': '人工智能与区块链创新的交汇点。加入下一代建设者，共同创建 Web3 基础设施。',
    'hero.joinBtn': '加入社区',
    'hero.exploreBtn': '探索更多',
    'hero.members': '成员',
    'hero.events': '活动',
    'hero.projects': '项目',
    'hero.chains': '链',
    
    // About
    'about.title': '赋能下一代 Web3 创新',
    'about.desc1': 'Buzz3 是领先的 AI x Web3 社区，致力于在去中心化生态系统中促进创新、教育和协作。',
    'about.desc2': '自成立以来，我们已发展成为跨越 50+ 个国家的全球网络，举办黑客马拉松、研讨会和会议。',
    'about.feature1.title': 'AI 驱动的治理',
    'about.feature1.desc': '智能 DAO 机制，AI 辅助决策',
    'about.feature2.title': '创新中心',
    'about.feature2.desc': '孵化前沿 AI x 区块链项目',
    'about.feature3.title': '全球网络',
    'about.feature3.desc': '连接全球 50+ 个国家的社区',
    'about.feature4.title': '教育与研究',
    'about.feature4.desc': '研讨会、课程和前沿研究计划',
    
    // AI Features
    'ai.title': 'AI x Web3 融合',
    'ai.subtitle': '探索人工智能与区块链技术的前沿交汇',
    'ai.card1.title': 'AI 代理框架',
    'ai.card1.desc': '构建与智能合约交互、执行交易和管理去中心化协议的自主 AI 代理。',
    'ai.card1.tag1': '自主',
    'ai.card1.tag2': '智能合约',
    'ai.card2.title': '预测性 DeFi',
    'ai.card2.desc': '预测市场走势、优化收益策略和自动化投资组合管理的机器学习模型。',
    'ai.card2.tag1': 'ML 模型',
    'ai.card2.tag2': '分析',
    'ai.card3.title': 'ZK + AI 证明',
    'ai.card3.desc': '零知识证明与 AI 结合，实现隐私保护的机器学习和可验证计算。',
    'ai.card3.tag1': 'ZK 证明',
    'ai.card3.tag2': '隐私',
    'ai.card3.tag3': '验证',
    
    // Members
    'members.title': '社区成员',
    'members.subtitle': '认识推动我们 Web3 社区创新的杰出人才',
    'members.charlie.role': '首席开发者',
    'members.charlie.bio': 'Solidity 专家，8+ 年区块链开发经验。',
    'members.sarah.role': '研究主管',
    'members.sarah.bio': '密码学博士。ZK 证明研究员。',
    'members.marcus.role': '社区经理',
    'members.marcus.bio': '连接开发者和用户的桥梁。',
    'members.elena.role': '智能合约审计师',
    'members.elena.bio': '安全专家。已审计 100+ 智能合约。',
    'members.viewAll': '查看所有成员',
    
    // Events
    'events.title': '过往活动',
    'events.subtitle': '社区聚会和里程碑的精彩回顾',
    'events.event1.date': '2026 年 3 月',
    'events.event1.title': 'AI x Web3 峰会 2026',
    'events.event1.desc': '我们的旗舰年度会议，汇集 500+ 开发者参加研讨会、主题演讲和黑客马拉松。',
    'events.event1.attendees': '500+ 参与者',
    'events.event2.date': '2025 年 11 月',
    'events.event2.title': 'DeFi AI 黑客马拉松',
    'events.event2.desc': '48 小时黑客马拉松，挑战团队构建 AI 驱动的 DeFi 协议。10 万美元奖金。',
    'events.event2.attendees': '200+ 参与者',
    'events.event2.location': '线上活动',
    'events.event3.date': '2024 年 10 月',
    'events.event3.title': 'Buzz3 创世聚会',
    'events.event3.desc': '我们的创始活动，汇集了最初的 50 位成员。',
    'events.event3.attendees': '50 位创始成员',
    
    // Services
    'services.title': 'Web3 咨询服务',
    'services.subtitle': '专业指导，将您的 AI x 区块链愿景变为现实',
    'services.card1.title': '智能合约开发与审计',
    'services.card1.desc': '端到端智能合约开发，配备 AI 驱动的安全审计。',
    'services.card2.title': 'AI 增强 DeFi 协议',
    'services.card2.desc': '构建具有 AI 驱动收益优化的强大 DeFi 协议。',
    'services.card3.title': '代币经济学与 AI 模型',
    'services.card3.desc': '设计由 AI 建模驱动的可持续代币经济。',
    'services.card4.title': '区块链与 AI 集成',
    'services.card4.desc': '将 AI 和区块链技术无缝集成到您的系统中。',
    'services.learnMore': '了解更多',
    
    // Ecosystem
    'ecosystem.title': '支持的生态系统',
    'ecosystem.subtitle': '跨多链格局构建',

    // Partners
    'partners.title': '构建于开放基础设施',
    'partners.subtitle': '我们所使用的 Web3 与 AI 技术栈',
    
    // CTA
    'cta.title': '准备好构建未来了吗？',
    'cta.subtitle': '加入 2,500+ Web3 爱好者，开始塑造去中心化的明天',
    'cta.emailPlaceholder': '输入您的邮箱',
    'cta.joinBtn': '立即加入',
    
    // Footer
    'footer.desc': '通过社区、教育和创新构建 Web3 的未来。加入我们，共同塑造去中心化世界。',
    'footer.community': '社区',
    'footer.aboutUs': '关于我们',
    'footer.members': '成员',
    'footer.events': '活动',
    'footer.blog': '博客',
    'footer.services': '服务',
    'footer.smartContracts': '智能合约',
    'footer.defiDesign': 'DeFi 设计',
    'footer.tokenomics': '代币经济学',
    'footer.integration': '集成',
    'footer.resources': '资源',
    'footer.documentation': '文档',
    'footer.tutorials': '教程',
    'footer.contact': '联系我们',
    'footer.rights': '保留所有权利。',
    
    // Typing texts
    'typing.1': 'AI 驱动的创新',
    'typing.2': '去中心化未来',
    'typing.3': '区块链卓越',
    'typing.4': 'Web3 先锋网络',
    'typing.5': '智能合约安全'
  },
  
  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.about': '概要',
    'nav.aiHub': 'AI ハブ',
    'nav.members': 'メンバー',
    'nav.events': 'イベント',
    'nav.services': 'サービス',
    'nav.contact': 'お問い合わせ',
    'nav.connectWallet': 'ウォレット接続',
    
    // Hero
    'hero.badge': 'AI x Web3 イノベーションハブ',
    'hero.title1': '構築する',
    'hero.title2': '分散型の未来',
    'hero.subtitle': '人工知能とブロックチェーンイノベーションの交差点。Web3 インフラストラクチャを構築する次世代のビルダーに参加しましょう。',
    'hero.joinBtn': 'コミュニティに参加',
    'hero.exploreBtn': '詳しく見る',
    'hero.members': 'メンバー',
    'hero.events': 'イベント',
    'hero.projects': 'プロジェクト',
    'hero.chains': 'チェーン',
    
    // About
    'about.title': '次世代の Web3 イノベーションを支援',
    'about.desc1': 'Buzz3 は、分散型エコシステムにおけるイノベーション、教育、協力を促進するトップ AI x Web3 コミュニティです。',
    'about.desc2': '設立以来、50 以上の国にまたがるグローバルネットワークに成長し、ハッカソン、ワークショップ、カンファレンスを開催しています。',
    'about.feature1.title': 'AI 駆動のガバナンス',
    'about.feature1.desc': 'AI アシスト意思決定によるインテリジェントな DAO メカニズム',
    'about.feature2.title': 'イノベーションハブ',
    'about.feature2.desc': '最先端の AI x ブロックチェーンプロジェクトのインキュベーション',
    'about.feature3.title': 'グローバルネットワーク',
    'about.feature3.desc': '世界 50 以上の国をつなぐコミュニティ',
    'about.feature4.title': '教育と研究',
    'about.feature4.desc': 'ワークショップ、コース、最先端の研究イニシアチブ',
    
    // AI Features
    'ai.title': 'AI x Web3 の融合',
    'ai.subtitle': '人工知能とブロックチェーン技術の最先端の交差点を探る',
    'ai.card1.title': 'AI エージェントフレームワーク',
    'ai.card1.desc': 'スマートコントラクトと対話し、トランザクションを実行し、分散型プロトコルを管理する自律型 AI エージェントを構築。',
    'ai.card1.tag1': '自律型',
    'ai.card1.tag2': 'スマートコントラクト',
    'ai.card2.title': '予測型 DeFi',
    'ai.card2.desc': '市場動向を予測し、イールド戦略を最適化し、ポートフォリオ管理を自動化する機械学習モデル。',
    'ai.card2.tag1': 'ML モデル',
    'ai.card2.tag2': '分析',
    'ai.card3.title': 'ZK + AI 証明',
    'ai.card3.desc': 'プライバシーを保護する機械学習と検証可能な計算のために AI で強化されたゼロ知識証明。',
    'ai.card3.tag1': 'ZK 証明',
    'ai.card3.tag2': 'プライバシー',
    'ai.card3.tag3': '検証',
    
    // Members
    'members.title': 'コミュニティメンバー',
    'members.subtitle': '私たちの Web3 コミュニティのイノベーションを推進する brilliant minds をご紹介',
    'members.charlie.role': 'リード開発者',
    'members.charlie.bio': 'Solidity エキスパート。8 年以上のブロックチェーン開発経験。',
    'members.sarah.role': 'リサーチリード',
    'members.sarah.bio': '暗号学の博士号。ZK 証明の研究者。',
    'members.marcus.role': 'コミュニティマネージャー',
    'members.marcus.bio': '開発者とユーザーの架け橋。',
    'members.elena.role': 'スマートコントラクト監査士',
    'members.elena.bio': 'セキュリティスペシャリスト。100 以上のスマートコントラクトを監査。',
    'members.viewAll': '全メンバーを見る',
    
    // Events
    'events.title': '過去のイベント',
    'events.subtitle': 'コミュニティの集まりとマイルストーンのハイライト',
    'events.event1.date': '2026 年 3 月',
    'events.event1.title': 'AI x Web3 サミット 2026',
    'events.event1.desc': '500 以上の開発者を集める年次カンファレンス。ワークショップ、基調講演、ハッカソン。',
    'events.event1.attendees': '500 以上の参加者',
    'events.event2.date': '2025 年 11 月',
    'events.event2.title': 'DeFi AI ハッカソン',
    'events.event2.desc': 'AI 駆動の DeFi プロトコル構築に挑戦する 48 時間ハッカソン。賞金 10 万ドル。',
    'events.event2.attendees': '200 以上の参加者',
    'events.event2.location': 'バーチャルイベント',
    'events.event3.date': '2024 年 10 月',
    'events.event3.title': 'Buzz3 ジェネシスミートアップ',
    'events.event3.desc': '初期メンバー 50 人を集めた設立イベント。',
    'events.event3.attendees': '50 人の創設メンバー',
    
    // Services
    'services.title': 'Web3 コンサルティングサービス',
    'services.subtitle': 'AI x ブロックチェーンビジョンを実現する専門ガイダンス',
    'services.card1.title': 'スマートコントラクト開発と監査',
    'services.card1.desc': 'AI 駆動のセキュリティ監査を備えたエンドツーエンドのスマートコントラクト開発。',
    'services.card2.title': 'AI 強化 DeFi プロトコル',
    'services.card2.desc': 'AI 駆動のイールド最適化による堅牢な DeFi プロトコルの設計。',
    'services.card3.title': 'トークノミクスと AI モデル',
    'services.card3.desc': 'AI モデリングによる持続可能なトークン経済の設計。',
    'services.card4.title': 'ブロックチェーンと AI の統合',
    'services.card4.desc': 'AI とブロックチェーン技術をシステムにシームレスに統合。',
    'services.learnMore': '詳しく見る',
    
    // Ecosystem
    'ecosystem.title': '対応エコシステム',
    'ecosystem.subtitle': 'マルチチェーン全体にわたる構築',

    // Partners
    'partners.title': 'オープンなインフラの上に構築',
    'partners.subtitle': '私たちが活用する Web3 と AI の技術スタック',
    
    // CTA
    'cta.title': '未来を構築する準備はできましたか？',
    'cta.subtitle': '2,500 以上の Web3 エンスージアストに参加し、分散型の明日を形にしましょう',
    'cta.emailPlaceholder': 'メールアドレスを入力',
    'cta.joinBtn': '今すぐ参加',
    
    // Footer
    'footer.desc': 'コミュニティ、教育、イノベーションを通じて Web3 の未来を構築。分散型世界の構築に参加しましょう。',
    'footer.community': 'コミュニティ',
    'footer.aboutUs': '私たちについて',
    'footer.members': 'メンバー',
    'footer.events': 'イベント',
    'footer.blog': 'ブログ',
    'footer.services': 'サービス',
    'footer.smartContracts': 'スマートコントラクト',
    'footer.defiDesign': 'DeFi デザイン',
    'footer.tokenomics': 'トークノミクス',
    'footer.integration': '統合',
    'footer.resources': 'リソース',
    'footer.documentation': 'ドキュメント',
    'footer.tutorials': 'チュートリアル',
    'footer.contact': 'お問い合わせ',
    'footer.rights': '全著作権所有。',
    
    // Typing texts
    'typing.1': 'AI 駆動のイノベーション',
    'typing.2': '分散型の未来',
    'typing.3': 'ブロックチェーンの卓越性',
    'typing.4': 'Web3 パイオニアネットワーク',
    'typing.5': 'スマートコントラクトセキュリティ'
  }
};

let currentLang = 'en';
let typingTexts = [];

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem('buzz3-lang', lang);
  
  // Update all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
  
  // Update typing texts
  typingTexts = [
    translations[lang]['typing.1'],
    translations[lang]['typing.2'],
    translations[lang]['typing.3'],
    translations[lang]['typing.4'],
    translations[lang]['typing.5']
  ];
  
  // Update language button text
  const langMap = { en: 'EN', zh: '中', ja: '日' };
  document.getElementById('currentLang').textContent = langMap[lang] || 'EN';
  
  // Update active state in dropdown
  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Re-split hero title chars after i18n update
  splitHeroTitle();
}

// ===== THEME SYSTEM =====
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('buzz3-theme', theme);

  if (typeof updateParticleColors === 'function') {
    updateParticleColors(theme);
  }
}

function toggleTheme(event) {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  if (event && event.currentTarget && !prefersReducedMotion) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxDim = Math.max(window.innerWidth, window.innerHeight) * 2;
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    ripple.style.left = cx + 'px';
    ripple.style.top = cy + 'px';
    ripple.style.width = maxDim + 'px';
    ripple.style.height = maxDim + 'px';
    ripple.style.background = next === 'dark' ? '#030308' : '#F8FAFC';
    document.body.appendChild(ripple);
    requestAnimationFrame(() => ripple.classList.add('expanding'));
    setTimeout(() => {
      setTheme(next);
    }, 100);
    setTimeout(() => ripple.remove(), 700);
  } else {
    setTheme(next);
  }
}

// ===== WEBGL FLUID SHADER BACKGROUND =====
const canvas = document.getElementById('hero-canvas');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let shaderColors = {
  // Purple stays as ambient depth; the glow is brand honey gold.
  dark:  { base: [0.012, 0.012, 0.031], mid: [0.365, 0.17, 0.696], glow: [0.961, 0.62, 0.18] },
  // Light theme must stay near-white: saturated shader colors bury the
  // dark hero text (badge/subtitle become unreadable, worst on mobile).
  light: { base: [0.972, 0.976, 0.988], mid: [0.902, 0.886, 0.965], glow: [0.988, 0.925, 0.78] }
};
let currentShaderColors = shaderColors.dark.base.concat(shaderColors.dark.mid, shaderColors.dark.glow);
let targetShaderColors = currentShaderColors.slice();

// [-1, 1]: average 24h change across tracked coins, set by the ticker fetch.
// The hero shader reads it to modulate glow intensity and flow speed.
let marketEnergy = 0;

function updateParticleColors(theme) {
  const c = shaderColors[theme] || shaderColors.dark;
  targetShaderColors = c.base.concat(c.mid, c.glow);
}

const VERT_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_base;
uniform vec3 u_mid;
uniform vec3 u_glow;
uniform float u_energy;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 3.0;
  float t = u_time * 0.08;

  vec2 m = (u_mouse / u_resolution - 0.5) * 2.0;

  vec2 q = vec2(fbm(p + vec2(t, t * 0.7)), fbm(p + vec2(t * 0.5, t)));
  q += m * 0.08;

  vec2 r = vec2(
    fbm(p + q + vec2(1.7, 9.2) + t * 0.3),
    fbm(p + q + vec2(8.3, 2.8) + t * 0.2)
  );

  float n = fbm(p + r * 1.5);

  vec3 col = mix(u_base, u_mid, smoothstep(0.2, 0.6, n));
  col = mix(col, u_glow, smoothstep(0.45, 0.85, length(r)) * 0.6);

  // u_energy in [-1,1] tracks the live market's average 24h move:
  // green days glow warmer/brighter, red days cool down.
  float glowAmt = pow(max(n - 0.5, 0.0), 2.5) * (0.4 + 0.3 * u_energy);
  col += glowAmt * u_glow;

  float vignette = 1.0 - dot(uv - 0.5, uv - 0.5) * 0.7;
  col *= vignette;

  col *= 0.97 + 0.03 * sin(gl_FragCoord.y * 0.8);

  float alpha = 0.85;
  gl_FragColor = vec4(col, alpha);
}
`;

let glRenderer = null;

function initWebGLShader() {
  if (!canvas) return null;
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) return null;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT_SHADER);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG_SHADER);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;

  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const posLoc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const u = {
    resolution: gl.getUniformLocation(prog, 'u_resolution'),
    time: gl.getUniformLocation(prog, 'u_time'),
    mouse: gl.getUniformLocation(prog, 'u_mouse'),
    base: gl.getUniformLocation(prog, 'u_base'),
    mid: gl.getUniformLocation(prog, 'u_mid'),
    glow: gl.getUniformLocation(prog, 'u_glow'),
    energy: gl.getUniformLocation(prog, 'u_energy')
  };

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return { gl, prog, u, mouse: { x: 0, y: 0 } };
}

function resizeWebGL(gl) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth * dpr;
  const h = canvas.clientHeight * dpr;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }

if (canvas && !prefersReducedMotion) {
  glRenderer = initWebGLShader();

  if (glRenderer) {
    const { gl, u, mouse } = glRenderer;
    let canvasVisible = true;
    let animId = null;
    // Accumulated sim time: flow speed follows market energy without the
    // jump a plain elapsed*factor would cause when the factor changes.
    let simTime = 0;
    let lastNow = performance.now();
    let energySmooth = 0;

    function render() {
      if (!canvasVisible) { animId = null; return; }
      resizeWebGL(gl);

      const now = performance.now();
      energySmooth = lerp(energySmooth, marketEnergy, 0.01);
      simTime += (now - lastNow) / 1000 * (1 + 0.3 * energySmooth);
      lastNow = now;
      const t = simTime;

      for (let i = 0; i < 9; i++) {
        currentShaderColors[i] = lerp(currentShaderColors[i], targetShaderColors[i], 0.02);
      }

      gl.uniform2f(u.resolution, canvas.width, canvas.height);
      gl.uniform1f(u.time, t);
      gl.uniform1f(u.energy, energySmooth);
      gl.uniform2f(u.mouse, mouse.x, canvas.height - mouse.y);
      gl.uniform3f(u.base, currentShaderColors[0], currentShaderColors[1], currentShaderColors[2]);
      gl.uniform3f(u.mid, currentShaderColors[3], currentShaderColors[4], currentShaderColors[5]);
      gl.uniform3f(u.glow, currentShaderColors[6], currentShaderColors[7], currentShaderColors[8]);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(render);
    }

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        mouse.x = (e.clientX - rect.left) * dpr;
        mouse.y = (e.clientY - rect.top) * dpr;
      });
    }

    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        canvasVisible = entry.isIntersecting;
        if (canvasVisible && !animId) {
          lastNow = performance.now();
          render();
        }
      });
    }, { threshold: 0 });
    if (heroSection) canvasObserver.observe(heroSection);

    render();

  } else {
    // ===== FALLBACK: 2D PARTICLE SYSTEM =====
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseParticle = { x: 0, y: 0 };
    let particleColor = 'rgba(124, 58, 237,';
    let lineColor = 'rgba(124, 58, 237,';
    let mouseLineColor = 'rgba(245, 158, 11,';

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = `${particleColor} ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const maxCount = isMobile ? 30 : 80;
      const count = Math.min(maxCount, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    let canvasVisible = true;
    let animFrameId = null;

    function animateParticles() {
      if (!canvasVisible) { animFrameId = null; return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });

      for (let i = 0; i < particles.length; i++) {
        const dxM = particles[i].x - mouseParticle.x;
        const dyM = particles[i].y - mouseParticle.y;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        if (distM < 200) {
          ctx.strokeStyle = `${mouseLineColor} ${(1 - distM / 200) * 0.5})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouseParticle.x, mouseParticle.y);
          ctx.stroke();
        }
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.strokeStyle = `${lineColor} ${(1 - distance / 150) * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animFrameId = requestAnimationFrame(animateParticles);
    }

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouseParticle.x = e.clientX - rect.left;
        mouseParticle.y = e.clientY - rect.top;
      });
    }

    resizeCanvas();
    initParticles();
    animateParticles();

    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        canvasVisible = entry.isIntersecting;
        if (canvasVisible && !animFrameId) animateParticles();
      });
    }, { threshold: 0 });
    if (heroSection) canvasObserver.observe(heroSection);

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
  }
}

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger && navLinks) {
  function toggleMenu(force) {
    const isOpen = force !== undefined ? force : !hamburger.classList.contains('active');
    hamburger.classList.toggle('active', isOpen);
    navLinks.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  }

  hamburger.addEventListener('click', () => toggleMenu());

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

// ===== LANGUAGE SWITCHER =====
const langBtn = document.getElementById('langBtn');
const langDropdown = document.getElementById('langDropdown');

if (langBtn && langDropdown) {
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle('active');
  });

  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
      langDropdown.classList.remove('active');
    });
  });

  document.addEventListener('click', () => {
    langDropdown.classList.remove('active');
  });
}

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

// ===== TYPING EFFECT =====
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingDelay = 100;

function typeText() {
  if (typingTexts.length === 0) return;
  
  const currentText = typingTexts[textIndex];
  const typingElement = document.getElementById('typingText');

  if (!typingElement) return;

  if (isDeleting) {
    typingElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    typingDelay = 50;
  } else {
    typingElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    typingDelay = 100;
  }

  if (!isDeleting && charIndex === currentText.length) {
    typingDelay = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % typingTexts.length;
    typingDelay = 500;
  }

  setTimeout(typeText, typingDelay);
}

// ===== COUNTER ANIMATION =====
function animateCounter(element, target) {
  const duration = 2000;
  const start = performance.now();

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function frame(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(progress);
    const value = Math.floor(target * eased);
    element.textContent = value.toLocaleString() + '+';

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      element.textContent = target.toLocaleString() + '+';
      element.classList.add('counter-done');
      setTimeout(() => element.classList.remove('counter-done'), 600);
    }
  }

  requestAnimationFrame(frame);
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');

      if (entry.target.classList.contains('stat-number')) {
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    }
  });
}, observerOptions);

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stat-number').forEach(el => {
  observer.observe(el);
});

// ===== NEURAL NETWORK VISUALIZATION =====
function createNeuralNetwork() {
  const container = document.getElementById('neuralVisual');
  if (!container) return;

  const nodes = [
    { x: 50, y: 50, size: 'center' },
    { x: 20, y: 20 }, { x: 80, y: 20 },
    { x: 15, y: 50 }, { x: 85, y: 50 },
    { x: 20, y: 80 }, { x: 80, y: 80 },
    { x: 35, y: 15 }, { x: 65, y: 15 },
    { x: 35, y: 85 }, { x: 65, y: 85 },
    { x: 10, y: 35 }, { x: 90, y: 35 },
    { x: 10, y: 65 }, { x: 90, y: 65 }
  ];

  nodes.forEach((node, i) => {
    const el = document.createElement('div');
    el.className = `neural-node ${node.size || ''}`;
    el.style.left = `${node.x}%`;
    el.style.top = `${node.y}%`;
    el.style.transform = 'translate(-50%, -50%)';
    if (node.size === 'center') {
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1.5" style="width:36px;height:36px"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>`;
    }
    container.appendChild(el);
  });

  const centerNode = nodes[0];
  for (let i = 1; i < nodes.length; i++) {
    const line = document.createElement('div');
    line.className = 'neural-line';
    
    const dx = nodes[i].x - centerNode.x;
    const dy = nodes[i].y - centerNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    line.style.width = `${length}%`;
    line.style.left = `${centerNode.x}%`;
    line.style.top = `${centerNode.y}%`;
    line.style.transform = `rotate(${angle}deg)`;
    
    container.appendChild(line);
  }
}

createNeuralNetwork();

// ===== FORM SUBMISSION =====
async function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input');
  const btn = form.querySelector('button[type="submit"]');

  if (!input.value || !input.checkValidity()) {
    input.classList.add('invalid');
    setTimeout(() => input.classList.remove('invalid'), 400);
    input.focus();
    return;
  }

  // No backend wired up yet: say so instead of faking a success.
  if (!SITE_CONFIG.formEndpoint) {
    showToast(comingSoonMessage());
    return;
  }

  if (btn) btn.disabled = true;
  try {
    const resp = await fetch(SITE_CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: input.value })
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
  } catch (err) {
    if (btn) btn.disabled = false;
    input.classList.add('invalid');
    setTimeout(() => input.classList.remove('invalid'), 400);
    const lang = localStorage.getItem('buzz3-lang') || 'en';
    showToast(lang === 'zh' ? '提交失败，请稍后再试' :
              lang === 'ja' ? '送信に失敗しました。後でもう一度お試しください' :
              'Submission failed — please try again later');
    return;
  }
  if (btn) btn.disabled = false;

  if (btn && !prefersReducedMotion) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓';
    btn.classList.add('cta-form-btn-success');
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#D97706', '#7C3AED'];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle-burst';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      p.style.background = colors[i % colors.length];
      p.style.boxShadow = '0 0 8px ' + colors[i % colors.length];
      document.body.appendChild(p);
      const angle = (i / 20) * Math.PI * 2;
      const dist = 60 + Math.random() * 60;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      p.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
      ], { duration: 600, easing: 'cubic-bezier(0.16,1,0.3,1)' });
      setTimeout(() => p.remove(), 650);
    }
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('cta-form-btn-success');
    }, 2000);
  }

  input.value = '';
  const thankYouMsg = {
    en: 'Thanks for joining!',
    zh: '感谢您的加入！',
    ja: '参加ありがとうございます！'
  };
  input.placeholder = thankYouMsg[currentLang] || thankYouMsg.en;
  input.disabled = true;

  setTimeout(() => {
    const placeholderKey = 'cta.emailPlaceholder';
    input.placeholder = translations[currentLang][placeholderKey] || translations.en[placeholderKey];
    input.disabled = false;
  }, 3000);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const href = this.getAttribute('href');
    // Bare "#" = placeholder destination. querySelector('#') would throw,
    // and silently jumping to top pretends the link works.
    if (href === '#') {
      if (this.classList.contains('nav-logo')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showToast(comingSoonMessage());
      }
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ===== PARALLAX EFFECT ON HERO =====
if (!prefersReducedMotion) {
  const heroContent = document.querySelector('.hero-content');
  let parallaxTicking = false;
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
      requestAnimationFrame(() => {
        const scroll = window.pageYOffset;
        if (heroContent && scroll < window.innerHeight) {
          heroContent.style.transform = `translateY(${scroll * 0.3}px)`;
          heroContent.style.opacity = 1 - (scroll / window.innerHeight);
        }
        parallaxTicking = false;
      });
      parallaxTicking = true;
    }
  });
}

// ===== BEE LOGO INTERACTION =====
const beeLogo = document.querySelector('.footer-logo-img');
if (beeLogo) {
  let clickCount = 0;
  
  beeLogo.addEventListener('click', (e) => {
    e.preventDefault();
    clickCount++;
    
    // Create honey drop particles
    const rect = beeLogo.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#D97706'];
    const emojis = ['🐝', '🍯', '✨', '💛', '⚡'];
    
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        font-size: ${16 + Math.random() * 12}px;
        pointer-events: none;
        z-index: 99999;
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      document.body.appendChild(particle);
      
      const angle = (i / 8) * Math.PI * 2;
      const distance = 80 + Math.random() * 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 50;
      
      requestAnimationFrame(() => {
        particle.style.transform = `translate(${tx}px, ${ty}px) scale(0) rotate(${Math.random() * 360}deg)`;
        particle.style.opacity = '0';
      });
      
      setTimeout(() => particle.remove(), 800);
    }
    
    // Special effect on 5th click
    if (clickCount % 5 === 0) {
      beeLogo.style.transform = 'scale(1.3) rotate(360deg)';
      setTimeout(() => {
        beeLogo.style.transform = '';
      }, 600);
    }
  });
  
  // Mouse parallax effect on bee logo
  beeLogo.addEventListener('mousemove', (e) => {
    const rect = beeLogo.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 10;
    const y = (e.clientY - rect.top - rect.height / 2) / 10;
    beeLogo.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
  });
  
  beeLogo.addEventListener('mouseleave', () => {
    beeLogo.style.transform = '';
  });
}

// ===== HERO TITLE CHAR ANIMATION =====
function splitHeroTitle() {
  const lines = document.querySelectorAll('.hero-title .glitch, .hero-title .gradient-text');
  lines.forEach(line => {
    const text = line.textContent.trim();
    if (!text) return;

    if (line.classList.contains('glitch')) {
      line.setAttribute('data-text', text);
    }

    // Wrap each word in a nowrap container so lines only break between
    // words — bare inline-block chars would let words split mid-word.
    let charIndex = 0;
    line.innerHTML = text.split(' ').map(word =>
      '<span class="word">' + [...word].map(c =>
        `<span class="char" style="--i:${charIndex++}">${c}</span>`
      ).join('') + '</span>'
    ).join(' ');
  });
}

// ===== MAGNETIC BUTTONS =====
function initMagneticButtons() {
  if (prefersReducedMotion) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;

  const buttons = document.querySelectorAll('.btn-primary, .btn-outline, .btn-wallet');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const strength = 0.3;
      btn.style.setProperty('--magnetic-x', `${x * strength}px`);
      btn.style.setProperty('--magnetic-y', `${y * strength}px`);
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.setProperty('--magnetic-x', '0px');
      btn.style.setProperty('--magnetic-y', '0px');
    });
  });
}

// ===== CARD EFFECTS (Spotlight + 3D Tilt) =====
function initCardEffects() {
  if (prefersReducedMotion) return;

  const cards = document.querySelectorAll('.feature-card, .ai-card, .service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);

      const cx = x / rect.width - 0.5;
      const cy = y / rect.height - 0.5;
      const maxTilt = 8;
      card.style.setProperty('--tilt-x', `${-cy * maxTilt}deg`);
      card.style.setProperty('--tilt-y', `${cx * maxTilt}deg`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

// ===== INITIALIZATION =====

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScrollY = 0;
  let ticking = false;

  function update() {
    const scrollY = window.scrollY;
    if (scrollY > lastScrollY && scrollY > 200) {
      navbar.classList.add('hide-on-scroll');
      navbar.classList.remove('show-on-scroll');
    } else {
      navbar.classList.add('show-on-scroll');
      navbar.classList.remove('hide-on-scroll');
    }
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

function initWalletConnect() {
  const btn = document.getElementById('walletBtn');
  if (!btn) return;

  const textEl = btn.querySelector('.wallet-text');
  if (!textEl) return;

  function t(en, zh, ja) {
    const lang = localStorage.getItem('buzz3-lang') || 'en';
    return lang === 'zh' ? zh : lang === 'ja' ? ja : en;
  }

  function shortAddr(addr) {
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }

  function setConnected(addr) {
    textEl.removeAttribute('data-i18n');
    textEl.innerHTML = '<span class="wallet-address"></span>';
    textEl.querySelector('.wallet-address').textContent = shortAddr(addr);
    btn.dataset.state = 'connected';
  }

  function setDefault() {
    btn.dataset.state = 'default';
    textEl.setAttribute('data-i18n', 'nav.connectWallet');
    textEl.textContent = t('Connect Wallet', '连接钱包', 'ウォレット接続');
  }

  // Restore an already-authorized session without prompting.
  if (window.ethereum) {
    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => { if (accounts && accounts.length) setConnected(accounts[0]); })
      .catch(() => {});

    window.ethereum.on?.('accountsChanged', accounts => {
      if (accounts && accounts.length) setConnected(accounts[0]);
      else setDefault();
    });
  }

  btn.addEventListener('click', async () => {
    if (btn.dataset.state === 'connected' || btn.dataset.state === 'loading') return;

    if (!window.ethereum) {
      textEl.removeAttribute('data-i18n');
      textEl.textContent = t('No Wallet Found', '未检测到钱包', 'ウォレット未検出');
      setTimeout(setDefault, 2500);
      return;
    }

    btn.dataset.state = 'loading';
    textEl.removeAttribute('data-i18n');
    textEl.textContent = t('Connecting...', '连接中...', '接続中...');

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length) {
        setConnected(accounts[0]);
      } else {
        setDefault();
      }
    } catch (err) {
      // 4001 = user rejected the request
      setDefault();
    }
  });
}

async function initTickerAPI() {
  const track = document.getElementById('tickerTrack');
  const section = track?.closest('.ticker-section');
  if (!track || !section) return;

  const coinIds = {
    eth: 'ethereum',
    btc: 'bitcoin',
    sol: 'solana',
    avax: 'avalanche-2',
    matic: 'matic-network',
    bnb: 'binancecoin'
  };

  const prevPrices = {};
  let retryCount = 0;
  const maxRetries = 3;

  async function fetchPrices() {
    try {
      const ids = Object.values(coinIds).join(',');
      const resp = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + ids +
                               '&vs_currencies=usd&include_24hr_change=true');
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const data = await resp.json();

      section.dataset.state = 'live';
      retryCount = 0;

      // Feed average 24h momentum into the hero shader (±5% = full range)
      const changes = Object.values(coinIds)
        .map(id => data[id] && data[id].usd_24h_change)
        .filter(c => typeof c === 'number');
      if (changes.length) {
        const avg = changes.reduce((s, c) => s + c, 0) / changes.length;
        marketEnergy = Math.max(-1, Math.min(1, avg / 5));
      }

      Object.entries(coinIds).forEach(([key, id]) => {
        const coinData = data[id];
        if (!coinData) return;

        const price = coinData.usd;
        const change = coinData.usd_24h_change || 0;
        const isUp = change >= 0;
        const priceStr = '$' + price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: price < 1 ? 4 : 2
        });

        track.querySelectorAll('[data-coin="' + key + '"]').forEach(item => {
          const valEl = item.querySelector('.value');
          const changeEl = item.querySelector('.change');
          if (valEl) {
            const oldPrice = prevPrices[key];
            if (oldPrice !== undefined && oldPrice !== price) {
              valEl.classList.remove('flash-up', 'flash-down');
              void valEl.offsetWidth;
              valEl.classList.add(price > oldPrice ? 'flash-up' : 'flash-down');
            }
            valEl.textContent = priceStr;
          }
          if (changeEl) {
            changeEl.textContent = (isUp ? '+' : '') + change.toFixed(1) + '%';
            changeEl.className = 'change ' + (isUp ? 'up' : 'down');
          }
          prevPrices[key] = price;
        });
      });
    } catch (e) {
      retryCount++;
      if (retryCount >= maxRetries) {
        section.dataset.state = 'error';
      }
    }
  }

  await fetchPrices();
  setInterval(fetchPrices, 30000);
}

function initTickerPause() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  let userPaused = false;

  track.addEventListener('mouseenter', () => track.classList.add('paused'));
  track.addEventListener('mouseleave', () => {
    if (!userPaused) track.classList.remove('paused');
  });

  // WCAG 2.2.2: explicit pause control, reachable without hover
  const pauseBtn = document.getElementById('tickerPause');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      track.classList.toggle('paused', userPaused);
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
      pauseBtn.setAttribute('aria-label', userPaused ? 'Resume ticker' : 'Pause ticker');
    });
  }
}

// ===== AI STORY (sticky scroll narrative) =====
function initAiStory() {
  const cards = document.querySelectorAll('.ai-story .ai-card');
  const current = document.getElementById('aiStoryCurrent');
  const bar = document.getElementById('aiStoryBar');
  const visual = document.getElementById('aiStoryVisual');
  const titleEl = document.getElementById('aiStoryTitle');
  if (!cards.length || !current) return;

  function setActive(index) {
    cards.forEach((card, i) => card.classList.toggle('story-active', i === index));
    current.textContent = String(index + 1).padStart(2, '0');
    if (bar) bar.style.transform = 'scaleX(' + ((index + 1) / cards.length) + ')';
    const icon = cards[index].querySelector('.ai-card-icon');
    if (visual && icon) visual.innerHTML = icon.innerHTML;
    const heading = cards[index].querySelector('h3');
    if (titleEl && heading) titleEl.textContent = heading.textContent;
  }

  setActive(0);

  // A card becomes the active "step" when it crosses the viewport middle band
  const storyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(Array.prototype.indexOf.call(cards, entry.target));
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  cards.forEach(card => storyObserver.observe(card));
}

function initKonamiCode() {
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === sequence[pos]) {
      pos++;
      if (pos === sequence.length) {
        document.body.classList.toggle('konami');
        pos = 0;
      }
    } else {
      pos = key === sequence[0] ? 1 : 0;
    }
  });
}

function initStatRings() {
  const rings = document.querySelectorAll('.ring-progress');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.ringTarget || '0.5');
        const circumference = 157.08;
        const offset = circumference * (1 - target);
        requestAnimationFrame(() => {
          el.style.strokeDashoffset = offset;
        });
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  rings.forEach(r => observer.observe(r));
}

function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? window.scrollY / h : 0;
        bar.style.transform = 'scaleX(' + pct + ')';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function initTimelinePoints() {
  const items = document.querySelectorAll('.timeline-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('passed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  items.forEach(item => obs.observe(item));
}

function initSocialBrandTags() {
  const map = {
    Twitter: 'twitter', X: 'twitter',
    Discord: 'discord',
    GitHub: 'github',
    Telegram: 'telegram'
  };
  document.querySelectorAll('a[aria-label]').forEach(a => {
    const brand = map[a.getAttribute('aria-label')];
    if (!brand) return;
    a.dataset.brand = brand;
    const url = SITE_CONFIG.socials[brand];
    if (url) {
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
    }
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const linkMap = {};
  navLinks.forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.startsWith('#')) linkMap[href.substring(1)] = a;
  });

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const link = linkMap[entry.target.id];
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.3, rootMargin: '-10% 0px -40% 0px' });

  sections.forEach(s => spyObserver.observe(s));
}

function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  const hero = document.getElementById('home');
  if (!btn || !hero) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const heroBottom = hero.offsetHeight;
        btn.classList.toggle('visible', window.scrollY > heroBottom);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function initParallax() {
  if (prefersReducedMotion) return;
  if (window.matchMedia('(max-width: 768px)').matches) return;
  const sections = document.querySelectorAll('.section');
  if (!sections.length) return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const viewportCenter = window.innerHeight / 2;
        sections.forEach(s => {
          const rect = s.getBoundingClientRect();
          const sectionCenter = rect.top + rect.height / 2;
          const offset = (sectionCenter - viewportCenter) * 0.04;
          s.style.setProperty('--parallax-y', `${offset}px`);
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('buzz3-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  setTheme(initialTheme);

  if (!savedTheme && window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    });
  }

  const savedLang = localStorage.getItem('buzz3-lang') || 'en';
  setLanguage(savedLang);

  initMagneticButtons();
  initCardEffects();
  initNavbarScroll();
  initWalletConnect();
  initTickerPause();
  initAiStory();
  initKonamiCode();
  initStatRings();
  initTickerAPI();
  initScrollProgress();
  initTimelinePoints();
  initSocialBrandTags();
  initScrollSpy();
  initBackToTop();
  initParallax();

  if (!prefersReducedMotion) {
    setTimeout(typeText, 300);
  } else {
    const typingEl = document.getElementById('typingText');
    if (typingEl && typingTexts.length > 0) {
      typingEl.textContent = typingTexts[0];
    }
  }
});