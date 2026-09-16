// ===== SITE CONFIG =====
// Fill these in as the real destinations come online. Unset entries show an
// honest "coming soon" toast instead of pretending to work.
const SITE_CONFIG = {
  // ---- Contact form ---------------------------------------------------------
  // Where the "Contact Us" modal posts to. Leave empty and the form says so
  // plainly rather than faking a successful send. See 联系表单配置指南.md.
  //   Formspree   https://formspree.io/f/xxxxxxxx
  //   Web3Forms   https://api.web3forms.com/submit/<ACCESS_KEY>
  //   Your own    any endpoint that takes POST + JSON and answers 2xx
  formEndpoint: '',

  // Optional. Sent as `subject`, which both Formspree and Web3Forms read to
  // label the notification email. Other endpoints ignore unknown fields.
  formSubject: '',

  // Optional. Cloudflare Turnstile site key. Fill it in and the widget is
  // rendered inside the modal and its token posted as `turnstileToken`; your
  // endpoint then verifies it server-side. Free, no Google account, and no
  // cross-site tracking — unlike reCAPTCHA. Leave empty for the layered
  // client-side defences only.
  turnstileSiteKey: '',

  socials: {
    twitter: '',   // e.g. 'https://x.com/buzz3xyz'
    discord: '',
    github: '',
    // Telegram invite link — the QR card renders itself from this value.
    // Leave empty and the card shows an honest "not configured" state
    // instead of a code that points nowhere.
    //
    // Use the canonical t.me invite, not a link shortener. The invite Bro
    // supplied arrived as a QR whose payload was https://hlnks.co/81861e1e
    // (hovercode.com), which 302s here. Routing our own visitors through a
    // third party's redirector would hand them the click analytics and add a
    // dependency that can expire — so the destination is stored directly.
    telegram: 'https://t.me/+qmTlC70FaEdjMDFl'
  }
};

// ===== CONTACT FORM SPAM GUARD =====
// Layered, cheapest check first. Everything here is a *deterrent*, not a
// guarantee: a determined human can pass all of it. Its job is to make the
// automated 99% not worth the sender's time, while never blocking a real
// enquiry. Turnstile (above) is the layer that actually proves humanity.
const SPAM_GUARD = {
  // Nobody reads a 4-field form, types a message and submits faster than this.
  // Autofill shortens it, but not below ~1s, so 3.5s keeps real users safe.
  minFillMs: 3500,
  // One browser may send once per minute, five times an hour.
  cooldownMs: 60 * 1000,
  maxPerHour: 5,
  // Link-spam payloads carry a dozen URLs; a real enquiry rarely pastes >5.
  maxLinks: 5,
  // Phrases that essentially never appear in a genuine enquiry to this site.
  blocklist: [
    'seo services', 'guest post', 'guest posting', 'buy backlink', 'link building',
    'crypto pump', 'pump signal', 'casino', 'viagra', 'loan offer',
    'bitcoin doubler', 'investment opportunity of a lifetime'
  ]
};

const SPAM_LOG_KEY = 'buzz3-contact-log';

function readSpamLog() {
  try {
    const raw = JSON.parse(localStorage.getItem(SPAM_LOG_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(n => typeof n === 'number') : [];
  } catch (e) {
    return [];
  }
}

function writeSpamLog(list) {
  try {
    localStorage.setItem(SPAM_LOG_KEY, JSON.stringify(list.slice(-20)));
  } catch (e) {
    /* private mode / quota — the rate limit simply won't persist */
  }
}

function countLinks(text) {
  return (text.match(/https?:\/\//gi) || []).length + (text.match(/\bwww\./gi) || []).length;
}

/**
 * @returns {null|'rate'|'reject'} null = let it through; 'rate' = tell the user
 * to slow down; 'reject' = generic failure, deliberately indistinguishable from
 * a network error so a bot can't tell which rule it tripped.
 */
function spamCheck(opts) {
  const now = Date.now();
  const recent = readSpamLog().filter(t => now - t < 3600 * 1000);

  if (recent.length) {
    const last = Math.max.apply(null, recent);
    if (now - last < SPAM_GUARD.cooldownMs || recent.length >= SPAM_GUARD.maxPerHour) {
      return 'rate';
    }
  }

  if (opts.elapsedMs < SPAM_GUARD.minFillMs) return 'reject';

  const body = (opts.message || '').toLowerCase();
  if (countLinks(body) > SPAM_GUARD.maxLinks) return 'reject';
  if (SPAM_GUARD.blocklist.some(w => body.indexOf(w) !== -1)) return 'reject';

  return null;
}

// Turnstile is loaded lazily and only when a site key exists, so an unconfigured
// site ships zero third-party requests. If the script fails to load we still let
// the submission through without a token and leave the decision to the endpoint.
function initTurnstile(container) {
  if (!SITE_CONFIG.turnstileSiteKey || !container) return;
  container.hidden = false;

  const render = () => {
    if (!window.turnstile) return;
    window.turnstile.render(container, {
      sitekey: SITE_CONFIG.turnstileSiteKey,
      theme: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    });
  };

  if (window.turnstile) {
    render();
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async = true;
  s.defer = true;
  s.onload = render;
  document.head.appendChild(s);
}

function turnstileToken() {
  try {
    return window.turnstile && typeof window.turnstile.getResponse === 'function'
      ? window.turnstile.getResponse() || ''
      : '';
  } catch (e) {
    return '';
  }
}

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
    'wallet.connecting': 'Connecting…',
    'wallet.notFound': 'No Wallet Found',
    'wallet.rejected': 'Request Cancelled',
    'wallet.failed': 'Connection Failed',
    'wallet.timeout': 'Wallet Not Responding',
    'wallet.copied': 'Address Copied',
    'wallet.copyHint': 'Click to copy address',
    
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
    // Roles and bios must stay in sync with the member cards in index.html.
    // That markup is only a fallback: setLanguage() overwrites every
    // [data-i18n] node on load, so whatever is written here is what visitors
    // actually read. Editing index.html alone changes nothing on the page.
    'members.charlie-li.role': 'Strategic Lead',
    'members.charlie-li.bio': 'Leads the design and delivery of Web3 solutions, bridging technical architecture with product strategy and business requirements.',
    'members.linyang.role': 'Research Lead',
    'members.linyang.bio': 'Leads research and strategic initiatives across Web3 and AI, with a focus on emerging technologies, market trends, and practical product applications.',
    'members.duchao.role': 'AI Lead',
    'members.duchao.bio': 'Leads AI-related technology and product development, with extensive experience across the Web3 ecosystem.',
    'members.naito-y.role': 'Community Manager',
    'members.naito-y.bio': 'Builds and manages relationships between developers, users, and the broader Web3 ecosystem. Focuses on community growth and developer engagement.',
    'members.viewAll': 'View All Members',
    
    // Events
    'events.title': 'Past Events',
    'events.subtitle': 'Highlights from our community gatherings and milestones',
    'events.event1.date': 'July 2026',
    'events.event1.title': 'Summer of Ethereum 2026 · Tokyo',
    'events.event1.desc': 'An afternoon of Ethereum ecosystem talks and workshops in Marunouchi, co-hosted with ETHPanda, LXDAO, JLinkAI and imToken.',
    'events.event1.attendees': '5 Co-hosts',
    'events.event1.location': 'Tokyo Innovation Base',
    'events.event1.photoAlt': 'Summer of Ethereum 2026 Tokyo — event poster with a Tokyo skyline illustration',
    'events.event2.date': 'March 2026',
    'events.event2.title': 'AI x Web3 Summit 2026',
    'events.event2.desc': 'Our flagship annual conference bringing together 500+ developers for workshops, keynotes, and hackathons.',
    'events.event2.attendees': '500+ Attendees',
    'events.event2.location': 'San Francisco',
    'events.event2.photoAlt': 'AI x Web3 Summit 2026 — attendees at the keynote',
    'events.event3.date': 'November 2025',
    'events.event3.title': 'DeFi AI Hackathon',
    'events.event3.desc': '48-hour hackathon challenging teams to build AI-powered DeFi protocols. $100K in prizes.',
    'events.event3.attendees': '200+ Participants',
    'events.event3.location': 'Virtual Event',
    'events.event3.photoAlt': 'DeFi AI Hackathon — teams presenting their prototypes',
    'events.event4.date': 'October 2024',
    'events.event4.title': 'Buzz3 Genesis Meetup',
    'events.event4.desc': 'Our founding event that brought together the initial 50 members.',
    'events.event4.attendees': '50 Founding Members',
    'events.event4.location': 'Tokyo, Japan',
    'events.event4.photoAlt': 'Buzz3 Genesis Meetup — the founding members in Tokyo',

    // Photo lightbox
    'lightbox.label': 'Event photo',
    'lightbox.close': 'Close photo',
    
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
    'typing.5': 'Smart Contract Security',

    // Contact modal
    'contact.openBtn': 'Contact Us',
    'contact.eyebrow': 'Get in touch',
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Tell us what you\'re building — we usually reply within 2 business days.',
    'contact.name': 'Name',
    'contact.namePh': 'Your name',
    'contact.email': 'Email',
    'contact.emailPh': 'you@example.com',
    'contact.org': 'Company / Project',
    'contact.orgPh': 'Optional',
    'contact.topic': 'Topic',
    'contact.topic.general': 'General enquiry',
    'contact.topic.partnership': 'Partnership',
    'contact.topic.consulting': 'Consulting / Development',
    'contact.topic.media': 'Media / Speaking',
    'contact.topic.other': 'Other',
    'contact.message': 'Message',
    'contact.messagePh': 'A few lines about your project or question…',
    'contact.privacy': 'We only use your details to reply. No newsletters, no sharing.',
    'contact.submit': 'Send message',
    'contact.sending': 'Sending…',
    'contact.successTitle': 'Message sent',
    'contact.successDesc': 'Thanks for reaching out — we\'ll get back to you shortly.',
    'contact.errRequired': 'This field is required',
    'contact.errEmail': 'Please enter a valid email address',
    'contact.errSend': 'Could not send — please try again later.',
    'contact.errRate': 'You just sent a message. Please wait a moment before sending another.',
    'contact.errNoEndpoint': 'The contact form is not connected to a backend yet.',

    // Telegram QR card
    'tg.title': 'Join us on Telegram',
    'tg.sub': 'Scan the QR code to join the community',
    'tg.note': 'Point your camera at the code',
    'tg.copy': 'Copy link',
    'tg.copied': 'Link copied',
    'tg.open': 'Open in Telegram',
    'tg.unset': 'Telegram link not configured yet'
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
    'wallet.connecting': '连接中…',
    'wallet.notFound': '未检测到钱包',
    'wallet.rejected': '已取消请求',
    'wallet.failed': '连接失败',
    'wallet.timeout': '钱包无响应',
    'wallet.copied': '地址已复制',
    'wallet.copyHint': '点击复制地址',
    
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
    'members.charlie-li.role': '战略负责人',
    'members.charlie-li.bio': '主导 Web3 解决方案的设计与交付，衔接技术架构、产品策略与业务需求。',
    'members.linyang.role': '研究主管',
    'members.linyang.bio': '主导 Web3 与 AI 领域的研究与战略项目，聚焦新兴技术、市场趋势与实际产品落地。',
    'members.duchao.role': 'AI 负责人',
    'members.duchao.bio': '主导 AI 相关技术与产品研发，在 Web3 生态拥有丰富经验。',
    'members.naito-y.role': '社区经理',
    'members.naito-y.bio': '建立并维护开发者、用户与更广泛 Web3 生态之间的联系，专注社区增长与开发者互动。',
    'members.viewAll': '查看所有成员',
    
    // Events
    'events.title': '过往活动',
    'events.subtitle': '社区聚会和里程碑的精彩回顾',
    'events.event1.date': '2026 年 7 月',
    'events.event1.title': '以太坊之夏 2026 · 东京站',
    'events.event1.desc': '在丸之内举办的以太坊生态分享与工作坊，由 ETHPanda、LXDAO、JLinkAI、imToken 联合主办。',
    'events.event1.attendees': '5 家联合主办',
    'events.event1.location': '东京创新基地',
    'events.event1.photoAlt': '以太坊之夏 2026 东京站 —— 含东京天际线插画的活动海报',
    'events.event2.date': '2026 年 3 月',
    'events.event2.title': 'AI x Web3 峰会 2026',
    'events.event2.desc': '我们的旗舰年度会议，汇集 500+ 开发者参加研讨会、主题演讲和黑客马拉松。',
    'events.event2.attendees': '500+ 参与者',
    'events.event2.location': '旧金山',
    'events.event2.photoAlt': 'AI x Web3 峰会 2026 —— 主题演讲现场',
    'events.event3.date': '2025 年 11 月',
    'events.event3.title': 'DeFi AI 黑客马拉松',
    'events.event3.desc': '48 小时黑客马拉松，挑战团队构建 AI 驱动的 DeFi 协议。10 万美元奖金。',
    'events.event3.attendees': '200+ 参与者',
    'events.event3.location': '线上活动',
    'events.event3.photoAlt': 'DeFi AI 黑客马拉松 —— 团队在展示他们的作品',
    'events.event4.date': '2024 年 10 月',
    'events.event4.title': 'Buzz3 创世聚会',
    'events.event4.desc': '我们的创始活动，汇集了最初的 50 位成员。',
    'events.event4.attendees': '50 位创始成员',
    'events.event4.location': '日本 · 东京',
    'events.event4.photoAlt': 'Buzz3 创世聚会 —— 创始成员在东京',

    // Photo lightbox
    'lightbox.label': '活动照片',
    'lightbox.close': '关闭照片',
    
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
    'typing.5': '智能合约安全',

    // Contact modal
    'contact.openBtn': '联系我们',
    'contact.eyebrow': '欢迎联络',
    'contact.title': '联系我们',
    'contact.subtitle': '告诉我们你在做什么 —— 我们通常会在两个工作日内回复。',
    'contact.name': '姓名',
    'contact.namePh': '你的称呼',
    'contact.email': '邮箱',
    'contact.emailPh': 'you@example.com',
    'contact.org': '公司 / 项目',
    'contact.orgPh': '选填',
    'contact.topic': '咨询类型',
    'contact.topic.general': '一般咨询',
    'contact.topic.partnership': '合作洽谈',
    'contact.topic.consulting': '咨询 / 开发',
    'contact.topic.media': '媒体 / 演讲',
    'contact.topic.other': '其他',
    'contact.message': '留言',
    'contact.messagePh': '简单描述一下你的项目或问题…',
    'contact.privacy': '你的信息仅用于回复，不会用于推送或对外提供。',
    'contact.submit': '发送',
    'contact.sending': '发送中…',
    'contact.successTitle': '已发送',
    'contact.successDesc': '感谢联系，我们会尽快回复你。',
    'contact.errRequired': '此项为必填',
    'contact.errEmail': '请输入有效的邮箱地址',
    'contact.errSend': '发送失败，请稍后再试。',
    'contact.errRate': '你刚刚已经发送过一条消息，请稍等一会儿再发。',
    'contact.errNoEndpoint': '联系表单尚未接入后端。',

    // Telegram QR card
    'tg.title': '加入我们的 Telegram',
    'tg.sub': '扫码加入社群',
    'tg.note': '用相机扫描二维码',
    'tg.copy': '复制链接',
    'tg.copied': '链接已复制',
    'tg.open': '在 Telegram 中打开',
    'tg.unset': 'Telegram 链接尚未配置'
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
    'wallet.connecting': '接続中…',
    'wallet.notFound': 'ウォレット未検出',
    'wallet.rejected': 'リクエストをキャンセルしました',
    'wallet.failed': '接続に失敗しました',
    'wallet.timeout': 'ウォレットが応答しません',
    'wallet.copied': 'アドレスをコピーしました',
    'wallet.copyHint': 'クリックしてアドレスをコピー',
    
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
    'members.subtitle': '私たちの Web3 コミュニティでイノベーションを推進するメンバーをご紹介',
    'members.charlie-li.role': 'ストラテジックリード',
    'members.charlie-li.bio': 'Web3 ソリューションの設計と提供を主導し、技術アーキテクチャとプロダクト戦略・ビジネス要件をつなぎます。',
    'members.linyang.role': 'リサーチリード',
    'members.linyang.bio': 'Web3 と AI 領域のリサーチおよび戦略的取り組みを主導。新興技術、市場トレンド、実用的なプロダクト応用に注力しています。',
    'members.duchao.role': 'AI リード',
    'members.duchao.bio': 'AI 関連の技術およびプロダクト開発を主導。Web3 エコシステムにおける豊富な経験を持ちます。',
    'members.naito-y.role': 'コミュニティマネージャー',
    'members.naito-y.bio': '開発者、ユーザー、そしてより広い Web3 エコシステムとの関係を構築・運営。コミュニティの成長と開発者エンゲージメントに注力しています。',
    'members.viewAll': '全メンバーを見る',
    
    // Events
    'events.title': '過去のイベント',
    'events.subtitle': 'コミュニティの集まりとマイルストーンのハイライト',
    'events.event1.date': '2026 年 7 月',
    'events.event1.title': 'イーサリアムの夏 2026 · 東京',
    'events.event1.desc': '丸の内で開催されたイーサリアム・エコシステムのトークとワークショップ。ETHPanda、LXDAO、JLinkAI、imToken との共催。',
    'events.event1.attendees': '5 社共催',
    'events.event1.location': 'Tokyo Innovation Base',
    'events.event1.photoAlt': 'イーサリアムの夏 2026 東京 — 東京の街並みのイラスト入りイベントポスター',
    'events.event2.date': '2026 年 3 月',
    'events.event2.title': 'AI x Web3 サミット 2026',
    'events.event2.desc': '500 以上の開発者を集める年次カンファレンス。ワークショップ、基調講演、ハッカソン。',
    'events.event2.attendees': '500 以上の参加者',
    'events.event2.location': 'サンフランシスコ',
    'events.event2.photoAlt': 'AI x Web3 サミット 2026 — 基調講演の会場',
    'events.event3.date': '2025 年 11 月',
    'events.event3.title': 'DeFi AI ハッカソン',
    'events.event3.desc': 'AI 駆動の DeFi プロトコル構築に挑戦する 48 時間ハッカソン。賞金 10 万ドル。',
    'events.event3.attendees': '200 以上の参加者',
    'events.event3.location': 'バーチャルイベント',
    'events.event3.photoAlt': 'DeFi AI ハッカソン — 作品を発表するチーム',
    'events.event4.date': '2024 年 10 月',
    'events.event4.title': 'Buzz3 ジェネシスミートアップ',
    'events.event4.desc': '初期メンバー 50 人を集めた設立イベント。',
    'events.event4.attendees': '50 人の創設メンバー',
    'events.event4.location': '日本・東京',
    'events.event4.photoAlt': 'Buzz3 ジェネシスミートアップ — 東京の創設メンバー',

    // Photo lightbox
    'lightbox.label': 'イベント写真',
    'lightbox.close': '写真を閉じる',
    
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
    'typing.5': 'スマートコントラクトセキュリティ',

    // Contact modal
    'contact.openBtn': 'お問い合わせ',
    'contact.eyebrow': 'お気軽にご連絡ください',
    'contact.title': 'お問い合わせ',
    'contact.subtitle': '取り組み内容をお聞かせください。通常 2 営業日以内にご返信します。',
    'contact.name': 'お名前',
    'contact.namePh': 'お名前を入力',
    'contact.email': 'メールアドレス',
    'contact.emailPh': 'you@example.com',
    'contact.org': '会社 / プロジェクト',
    'contact.orgPh': '任意',
    'contact.topic': 'お問い合わせ種別',
    'contact.topic.general': '一般的なお問い合わせ',
    'contact.topic.partnership': 'パートナーシップ',
    'contact.topic.consulting': 'コンサルティング / 開発',
    'contact.topic.media': 'メディア / 登壇',
    'contact.topic.other': 'その他',
    'contact.message': 'メッセージ',
    'contact.messagePh': 'プロジェクトやご質問について簡単にご記入ください…',
    'contact.privacy': 'ご入力いただいた情報は返信のみに使用します。',
    'contact.submit': '送信する',
    'contact.sending': '送信中…',
    'contact.successTitle': '送信しました',
    'contact.successDesc': 'お問い合わせありがとうございます。折り返しご連絡いたします。',
    'contact.errRequired': '必須項目です',
    'contact.errEmail': '有効なメールアドレスを入力してください',
    'contact.errSend': '送信に失敗しました。後でもう一度お試しください。',
    'contact.errRate': '先ほど送信済みです。少し時間をおいてからもう一度お試しください。',
    'contact.errNoEndpoint': 'お問い合わせフォームは未接続です。',

    // Telegram QR card
    'tg.title': 'Telegram に参加',
    'tg.sub': 'QR コードを読み取ってコミュニティに参加',
    'tg.note': 'カメラでコードを読み取ってください',
    'tg.copy': 'リンクをコピー',
    'tg.copied': 'コピーしました',
    'tg.open': 'Telegram で開く',
    'tg.unset': 'Telegram リンクが未設定です'
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
  
  // Attribute-level i18n. textContent alone can't translate alt text, aria
  // labels or placeholders, and the event photos need a translated alt.
  [['data-i18n-placeholder', 'placeholder'],
   ['data-i18n-alt', 'alt'],
   ['data-i18n-aria-label', 'aria-label'],
   ['data-i18n-title', 'title']].forEach(([attr, prop]) => {
    document.querySelectorAll('[' + attr + ']').forEach(el => {
      const key = el.getAttribute(attr);
      if (translations[lang] && translations[lang][key]) {
        el.setAttribute(prop, translations[lang][key]);
      }
    });
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

  // QR alt text + "not configured" copy are injected by JS, not data-i18n
  if (typeof refreshTelegramCard === 'function') refreshTelegramCard();
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
// Two marks exist (one per theme), so bind to every instance — only the
// visible one can receive events, but both need the listeners.
document.querySelectorAll('.footer-logo-img').forEach(beeLogo => {
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
});

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

  // The button is hidden on purpose (<html data-wallet="off">) because this is
  // a static site with no dApp to connect to. Bail out before wiring anything:
  // a hidden button must not run an eth_accounts probe on every page load or
  // hold listeners. Flip the attribute to "on" and everything below resumes.
  if (document.documentElement.getAttribute('data-wallet') === 'off') return;

  const textEl = btn.querySelector('.wallet-text');
  if (!textEl) return;

  // A wallet popup can sit open for ever if the extension is wedged or the
  // user walks away. Without a ceiling the button stays on "Connecting…"
  // indefinitely -- and since the click handler bails out while that state is
  // set, the button is then permanently dead until the page is reloaded.
  const REQUEST_TIMEOUT_MS = 60000;
  const NOTICE_MS = 3200;

  let address = '';
  let noticeTimer = null;

  function provider() {
    const eth = window.ethereum;
    if (!eth) return null;
    // Wallets that all inject into window.ethereum announce themselves here
    // (the legacy multi-provider convention). Prefer MetaMask when present,
    // otherwise take the first one rather than assuming the plain object.
    if (Array.isArray(eth.providers) && eth.providers.length) {
      return eth.providers.find(p => p && p.isMetaMask) || eth.providers[0];
    }
    return eth;
  }

  function shortAddr(a) {
    return a.slice(0, 6) + '...' + a.slice(-4);
  }

  function setText(key, fallback) {
    textEl.removeAttribute('data-i18n');
    textEl.textContent = t(key) || fallback;
  }

  function setDefault() {
    clearTimeout(noticeTimer);
    address = '';
    btn.dataset.state = 'default';
    btn.removeAttribute('data-i18n-title');
    btn.removeAttribute('title');
    textEl.setAttribute('data-i18n', 'nav.connectWallet');
    textEl.textContent = t('nav.connectWallet') || 'Connect Wallet';
  }

  function setConnected(addr) {
    clearTimeout(noticeTimer);
    address = addr;
    btn.dataset.state = 'connected';
    // routed through data-i18n-title so a language switch retranslates it for
    // free, instead of leaving a stale tooltip behind
    btn.setAttribute('data-i18n-title', 'wallet.copyHint');
    btn.title = t('wallet.copyHint') || '';
    textEl.removeAttribute('data-i18n');
    textEl.innerHTML = '<span class="wallet-address"></span>';
    textEl.querySelector('.wallet-address').textContent = shortAddr(addr);
  }

  // Show a transient message, then settle back to the real state. Clearing the
  // pending timer first stops rapid clicks from stacking resets.
  function notice(key, fallback) {
    clearTimeout(noticeTimer);
    setText(key, fallback);
    btn.dataset.state = address ? 'connected' : 'default';
    noticeTimer = setTimeout(() => {
      if (address) setConnected(address); else setDefault();
    }, NOTICE_MS);
  }

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ]);
  }

  // Once connected the button becomes "copy my address". Without this it is a
  // control that stops responding the moment it succeeds, which reads as the
  // very bug we are fixing.
  function copyAddress() {
    const done = () => notice('wallet.copied', 'Address Copied');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(address).then(done).catch(done);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = address;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* clipboard blocked */ }
    ta.remove();
    done();
  }

  // Restore an already-authorised session without prompting.
  const eth = provider();
  if (eth) {
    eth.request({ method: 'eth_accounts' })
      .then(accounts => { if (accounts && accounts.length) setConnected(accounts[0]); })
      .catch(() => {});

    eth.on?.('accountsChanged', accounts => {
      if (accounts && accounts.length) setConnected(accounts[0]);
      else setDefault();
    });

    // A wallet that locks or is uninstalled mid-session fires this, not
    // accountsChanged -- without it the navbar keeps showing a dead address.
    eth.on?.('disconnect', () => setDefault());
  }

  btn.addEventListener('click', async () => {
    if (btn.dataset.state === 'loading') return;

    if (btn.dataset.state === 'connected') {
      copyAddress();
      return;
    }

    const eth = provider();
    if (!eth) {
      notice('wallet.notFound', 'No Wallet Found');
      return;
    }

    btn.dataset.state = 'loading';
    setText('wallet.connecting', 'Connecting…');

    try {
      const accounts = await withTimeout(
        eth.request({ method: 'eth_requestAccounts' }), REQUEST_TIMEOUT_MS
      );
      if (accounts && accounts.length) setConnected(accounts[0]);
      else setDefault();
    } catch (err) {
      // 4001 = the user dismissed the wallet popup. That is a normal choice,
      // not a failure, so it gets its own wording rather than looking broken.
      const code = err && (err.code || (err.data && err.data.originalError && err.data.originalError.code));
      if (String(code) === '4001') notice('wallet.rejected', 'Request Cancelled');
      else if (err && err.message === 'timeout') notice('wallet.timeout', 'Wallet Not Responding');
      else notice('wallet.failed', 'Connection Failed');
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
        // Read the dash length back from CSS instead of hard-coding it, so
        // resizing the ring in stylesheet-land doesn't silently break the
        // sweep. 157.08 is the historical 2*pi*25 fallback.
        const circumference = parseFloat(getComputedStyle(el).strokeDasharray) || 157.08;
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

// ===== TELEGRAM QR CARD =====
function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] !== undefined ? dict[key] : translations.en[key];
}

function telegramUrl() {
  return (SITE_CONFIG.socials.telegram || '').trim();
}

// Renders the QR straight from SITE_CONFIG.socials.telegram, so the code can
// never drift out of sync with the link. Falls back to an honest "not
// configured" state rather than showing a QR that points nowhere.
function refreshTelegramCard() {
  const card = document.getElementById('tgCard');
  const qrEl = document.getElementById('tgQr');
  if (!card || !qrEl) return;

  const url = telegramUrl();

  // wire every Telegram link on the page
  document.querySelectorAll('[data-telegram-link]').forEach(el => {
    if (url) {
      el.setAttribute('href', url);
      el.removeAttribute('aria-disabled');
    } else {
      el.setAttribute('href', '#');
      el.setAttribute('aria-disabled', 'true');
    }
  });

  const note = document.getElementById('tgQrNote');
  if (note) note.textContent = url ? t('tg.note') : t('tg.unset');

  if (!url || typeof qrcode !== 'function') {
    card.dataset.state = 'unset';
    qrEl.innerHTML = '';
    qrEl.textContent = t('tg.unset');
    return;
  }

  try {
    // ECC level 'H' (30% codeword recovery) is required because a Telegram
    // badge is overlaid on the centre of the code — the badge destroys modules
    // there, and only H has enough redundancy to reconstruct them. At 'M'
    // (15%) the same overlay makes the code unscannable. Verified by decoding
    // the rendered SVG from a screenshot.
    const qr = qrcode(0, 'H');
    qr.addData(url);
    qr.make();
    qrEl.innerHTML = qr.createSvgTag({
      cellSize: 4,
      margin: 2,
      scalable: true,
      title: t('tg.title'),
      alt: t('tg.sub')
    });
    card.dataset.state = 'ready';
  } catch (err) {
    card.dataset.state = 'unset';
    qrEl.innerHTML = '';
    qrEl.textContent = t('tg.unset');
  }
}

function initTelegramQR() {
  const card = document.getElementById('tgCard');
  if (!card) return;

  refreshTelegramCard();

  const copyBtn = document.getElementById('tgCopyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const url = telegramUrl();
      if (!url) {
        showToast(t('tg.unset'));
        return;
      }
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(url);
        } else {
          const ta = document.createElement('textarea');
          ta.value = url;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        const original = copyBtn.textContent;
        copyBtn.textContent = t('tg.copied');
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = original;
          copyBtn.classList.remove('copied');
        }, 1800);
      } catch (err) {
        showToast(t('tg.unset'));
      }
    });
  }

  // clicking the code itself opens the link
  const qrEl = document.getElementById('tgQr');
  if (qrEl) {
    qrEl.style.cursor = 'pointer';
    qrEl.addEventListener('click', () => {
      const url = telegramUrl();
      if (url) window.open(url, '_blank', 'noopener');
    });
  }
}

// ===== CONTACT MODAL =====
function initContactModal() {
  const modal = document.getElementById('contactModal');
  if (!modal) return;

  const panel = modal.querySelector('.modal-panel');
  const form = document.getElementById('contactForm');
  const success = document.getElementById('contactSuccess');
  const submitBtn = form ? form.querySelector('.modal-submit') : null;
  let lastFocused = null;
  let closeTimer = null;
  // Stamped on every open. The gap between this and the submit is the cheapest
  // bot signal there is: a script posts the form milliseconds after it appears.
  let openedAt = 0;

  if (form) initTurnstile(form.querySelector('#cfTurnstile'));

  function focusables() {
    return Array.from(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null);
  }

  function openModal() {
    clearTimeout(closeTimer);
    lastFocused = document.activeElement;
    openedAt = Date.now();
    modal.hidden = false;
    // force a reflow so the open transition actually runs
    void modal.offsetWidth;
    modal.classList.add('is-open');
    document.body.classList.add('modal-open');

    const first = form && form.querySelector('input:not([type="hidden"]):not([tabindex="-1"])');
    if (first) setTimeout(() => first.focus(), 120);
    else panel.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    closeTimer = setTimeout(() => {
      modal.hidden = true;
      if (form && success) {
        form.hidden = false;
        success.hidden = true;
      }
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }, 300);
  }

  document.querySelectorAll('[data-contact-open]').forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  modal.querySelectorAll('[data-contact-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', e => {
    if (modal.hidden) return;
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key === 'Tab') {
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  if (!form) return;

  function setError(input, message) {
    input.classList.add('invalid');
    const slot = form.querySelector('[data-error-for="' + input.id + '"]');
    if (slot) slot.textContent = message;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    input.classList.remove('invalid');
    const slot = form.querySelector('[data-error-for="' + input.id + '"]');
    if (slot) slot.textContent = '';
    input.removeAttribute('aria-invalid');
  }

  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => clearError(el));
  });

  function validate() {
    let ok = true;
    let firstBad = null;
    const name = form.querySelector('#cfName');
    const email = form.querySelector('#cfEmail');
    const message = form.querySelector('#cfMessage');

    [name, message].forEach(el => {
      clearError(el);
      if (!el.value.trim()) {
        setError(el, t('contact.errRequired'));
        ok = false;
        firstBad = firstBad || el;
      }
    });

    clearError(email);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!email.value.trim()) {
      setError(email, t('contact.errRequired'));
      ok = false;
      firstBad = firstBad || email;
    } else if (!emailOk) {
      setError(email, t('contact.errEmail'));
      ok = false;
      firstBad = firstBad || email;
    }

    if (firstBad) firstBad.focus();
    return ok;
  }

  function setBusy(busy) {
    if (!submitBtn) return;
    if (busy) {
      submitBtn.dataset.idleLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = t('contact.sending');
    } else {
      submitBtn.disabled = false;
      if (submitBtn.dataset.idleLabel) submitBtn.textContent = submitBtn.dataset.idleLabel;
    }
  }

  function showSuccess() {
    form.reset();
    form.hidden = true;
    if (success) success.hidden = false;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // ---- layer 1: honeypot -------------------------------------------------
    // Hidden from humans, irresistible to form-filling bots. Answered with a
    // fake success on purpose: the sender learns nothing, so it keeps posting
    // into a void instead of probing for a way through.
    const trap = form.querySelector('#cfWebsite');
    if (trap && trap.value) {
      showSuccess();
      return;
    }

    if (!validate()) return;

    const message = form.querySelector('#cfMessage').value.trim();

    // A missing endpoint is a configuration error, not a spam verdict, so it is
    // reported as itself — otherwise every attempt during setup would show the
    // generic "could not send" and hide the real reason.
    if (!SITE_CONFIG.formEndpoint) {
      showToast(t('contact.errNoEndpoint'));
      return;
    }

    // ---- layers 2-4: fill timing, link count, blocklist ---------------------
    const verdict = spamCheck({ elapsedMs: Date.now() - openedAt, message });
    if (verdict === 'rate') {
      showToast(t('contact.errRate'));
      return;
    }
    if (verdict === 'reject') {
      // Deliberately the same copy as a network failure: a bot cannot tell
      // which rule it tripped, and a real person who simply typed very fast can
      // just hit send again — by then the fill-time check has been satisfied.
      showToast(t('contact.errSend'));
      return;
    }

    const payload = {
      name: form.querySelector('#cfName').value.trim(),
      email: form.querySelector('#cfEmail').value.trim(),
      organization: form.querySelector('#cfOrg').value.trim(),
      topic: form.querySelector('#cfTopic').value,
      message: message,
      lang: currentLang,
      page: location.href
    };
    // Formspree and Web3Forms both read `subject` to label the notification
    // email; other endpoints ignore the extra field.
    if (SITE_CONFIG.formSubject) payload.subject = SITE_CONFIG.formSubject;
    // Omitted entirely when Turnstile isn't configured, so an endpoint that
    // validates the token fails loudly rather than on an empty string.
    const token = turnstileToken();
    if (token) payload.turnstileToken = token;

    setBusy(true);

    try {
      const resp = await fetch(SITE_CONFIG.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
    } catch (err) {
      setBusy(false);
      showToast(t('contact.errSend'));
      return;
    }

    setBusy(false);

    // Recorded only after a confirmed send, so a failed attempt doesn't burn
    // the user's rate-limit budget.
    const log = readSpamLog().filter(x => Date.now() - x < 3600 * 1000);
    log.push(Date.now());
    writeSpamLog(log);

    // Turnstile tokens are single-use; clear it so the next open starts clean.
    if (window.turnstile && typeof window.turnstile.reset === 'function') {
      try { window.turnstile.reset(); } catch (err) { /* not rendered */ }
    }

    showSuccess();
  });
}

// ===== FLOATING CONTACT BUTTON =====
function initFabContact() {
  const fab = document.getElementById('fabContact');
  const hero = document.getElementById('home');
  const footer = document.querySelector('.footer');
  if (!fab) return;

  let pastHero = false;
  let footerVisible = false;
  let ticking = false;

  function sync() {
    fab.classList.toggle('visible', pastHero && !footerVisible);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        pastHero = window.scrollY > (hero ? hero.offsetHeight * 0.6 : 400);
        sync();
      });
      ticking = true;
    }
  }, { passive: true });

  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      footerVisible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0 }).observe(footer);
  }
}

// ===== MEMBER AVATARS =====
// Every .member-avatar ships with a photo *and* an initials fallback. The photo
// stays transparent until we know it actually decoded, so a renamed or missing
// team/*.jpg leaves the initials showing instead of a broken-image glyph.
function initMemberAvatars() {
  document.querySelectorAll('.member-avatar').forEach(wrap => {
    const img = wrap.querySelector('.member-avatar-img');
    if (!img) return;

    const show = () => wrap.classList.add('is-loaded');
    const hide = () => wrap.classList.remove('is-loaded');

    // A cached image can already be finished before this runs, in which case no
    // load event will ever fire — so check the current state before subscribing.
    if (img.complete) {
      (img.naturalWidth > 0 ? show : hide)();
      return;
    }
    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', hide, { once: true });
  });
}

// ===== EVENT PHOTO LIGHTBOX =====
// One shared dialog for every [data-photo-open] trigger. Click handling is
// delegated, so adding more event photos needs no change here.
function initPhotoLightbox() {
  const box = document.getElementById('photoLightbox');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if (!box || !img) return;

  const closeBtn = box.querySelector('.lightbox-close');
  let lastFocused = null;
  let hideTimer = null;

  // The caption is read back off the card rather than stored in the markup:
  // the title and date are already translated by data-i18n, so deriving from
  // them keeps one source of truth instead of a third copy of the same words.
  function captionFor(trigger) {
    const card = trigger.closest('.timeline-content');
    if (!card) return '';
    return ['.timeline-title', '.timeline-date']
      .map(sel => {
        const el = card.querySelector(sel);
        return el ? el.textContent.trim() : '';
      })
      .filter(Boolean)
      .join(' \u00b7 ');
  }

  function open(trigger) {
    const thumb = trigger.querySelector('img');
    if (!thumb) return;
    clearTimeout(hideTimer);
    lastFocused = document.activeElement;

    img.src = thumb.currentSrc || thumb.src;
    img.alt = thumb.alt || '';
    cap.textContent = captionFor(trigger);
    box.hidden = false;
    void box.offsetWidth; // force a reflow so the transition actually runs
    box.classList.add('is-open');
    document.body.classList.add('lightbox-open');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    box.classList.remove('is-open');
    document.body.classList.remove('lightbox-open');
    hideTimer = setTimeout(() => {
      box.hidden = true;
      // release the decoded bitmap once the dialog is out of sight
      img.removeAttribute('src');
    }, 220);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener('click', e => {
    const t = e.target;
    if (!t || !t.closest) return;

    const trigger = t.closest('[data-photo-open]');
    if (trigger) {
      e.preventDefault();
      open(trigger);
      return;
    }
    if (!box.hidden && t.closest('[data-lightbox-close]')) {
      e.preventDefault();
      close();
    }
  });

  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      // the close button is the only focusable node in here; without this,
      // Tab would walk into the page behind the overlay
      e.preventDefault();
      if (closeBtn) closeBtn.focus();
    }
  });
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
  initTelegramQR();
  initContactModal();
  initFabContact();
  initMemberAvatars();
  initPhotoLightbox();

  if (!prefersReducedMotion) {
    setTimeout(typeText, 300);
  } else {
    const typingEl = document.getElementById('typingText');
    if (typingEl && typingTexts.length > 0) {
      typingEl.textContent = typingTexts[0];
    }
  }
});