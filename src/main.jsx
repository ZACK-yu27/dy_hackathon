import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const screens = {
  home: {
    src: '/ui/home.png',
    alt: '旅拆拆首页'
  },
  create: {
    src: '/ui/create.png',
    alt: '新建旅行项目'
  },
  detail: {
    src: '/ui/detail.png',
    alt: '上海错峰避坑之旅项目详情'
  },
  risk: {
    src: '/ui/risk.png',
    alt: '避雷详情'
  },
  explore: {
    src: '/ui/explore.png',
    alt: '探索页'
  },
  mine: {
    src: '/ui/mine.png',
    alt: '我的页'
  }
};

function App() {
  const [screen, setScreen] = useState('home');
  const [toast, setToast] = useState('');

  const flash = (message) => {
    setToast(message);
    window.clearTimeout(window.__journeyToast);
    window.__journeyToast = window.setTimeout(() => setToast(''), 1400);
  };

  return (
    <main className="demo-stage">
      {screen === 'home' && (
        <ReferenceScreen screen="home">
          <Hotspot label="打开上海项目" rect={[5, 21, 90, 41]} onClick={() => setScreen('detail')} />
          <Hotspot label="创建项目" rect={[83, 81, 13, 9]} onClick={() => setScreen('create')} />
          <Hotspot label="首页" rect={[8, 92, 26, 7]} onClick={() => setScreen('home')} />
          <Hotspot label="探索" rect={[37, 92, 26, 7]} onClick={() => setScreen('explore')} />
          <Hotspot label="我的" rect={[66, 92, 26, 7]} onClick={() => setScreen('mine')} />
        </ReferenceScreen>
      )}

      {screen === 'create' && (
        <ReferenceScreen screen="create">
          <Hotspot label="关闭创建项目" rect={[87, 37, 8, 6]} onClick={() => setScreen('home')} />
          <Hotspot label="取消" rect={[7, 86, 31, 7]} onClick={() => setScreen('home')} />
          <Hotspot label="创建并解析" rect={[42, 86, 52, 7]} onClick={() => setScreen('detail')} />
        </ReferenceScreen>
      )}

      {screen === 'detail' && (
        <ReferenceScreen screen="detail">
          <Hotspot label="返回首页" rect={[4, 6, 8, 6]} onClick={() => setScreen('home')} />
          <Hotspot label="打开避雷详情" rect={[48, 43, 30, 7]} onClick={() => setScreen('risk')} />
          <Hotspot label="模块避雷详情" rect={[48, 69, 31, 7]} onClick={() => setScreen('risk')} />
          <Hotspot label="预览路线" rect={[4, 91, 23, 8]} onClick={() => flash('预览路线')} />
          <Hotspot label="智能优化" rect={[28, 91, 23, 8]} onClick={() => flash('已生成优化建议')} />
          <Hotspot label="导出攻略" rect={[52, 91, 23, 8]} onClick={() => flash('已生成导出预览')} />
          <Hotspot label="更多设置" rect={[76, 91, 20, 8]} onClick={() => flash('更多设置')} />
        </ReferenceScreen>
      )}

      {screen === 'risk' && (
        <ReferenceScreen screen="risk">
          <Hotspot label="关闭避雷详情" rect={[84, 36, 8, 6]} onClick={() => setScreen('detail')} />
          <Hotspot label="知道了" rect={[10, 85, 80, 6]} onClick={() => setScreen('detail')} />
          <Hotspot label="查看同类避雷" rect={[27, 92, 46, 5]} onClick={() => flash('已筛选同类避雷')} />
        </ReferenceScreen>
      )}

      {screen === 'explore' && (
        <ReferenceScreen screen="explore">
          <Hotspot label="复制上海模板" rect={[32, 35, 18, 5]} onClick={() => flash('已复制到我的旅行项目')} />
          <Hotspot label="复制底部模板" rect={[25, 87, 12, 5]} onClick={() => flash('已复制模板')} />
          <Hotspot label="首页" rect={[8, 94, 26, 6]} onClick={() => setScreen('home')} />
          <Hotspot label="探索" rect={[37, 94, 26, 6]} onClick={() => setScreen('explore')} />
          <Hotspot label="我的" rect={[66, 94, 26, 6]} onClick={() => setScreen('mine')} />
        </ReferenceScreen>
      )}

      {screen === 'mine' && (
        <ReferenceScreen screen="mine">
          <Hotspot label="打开我的上海项目" rect={[6, 31, 45, 14]} onClick={() => setScreen('detail')} />
          <Hotspot label="继续拼路线" rect={[72, 54, 20, 6]} onClick={() => setScreen('detail')} />
          <Hotspot label="首页" rect={[8, 94, 26, 6]} onClick={() => setScreen('home')} />
          <Hotspot label="探索" rect={[37, 94, 26, 6]} onClick={() => setScreen('explore')} />
          <Hotspot label="我的" rect={[66, 94, 26, 6]} onClick={() => setScreen('mine')} />
        </ReferenceScreen>
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function ReferenceScreen({ screen, children }) {
  const item = screens[screen];

  return (
    <section className="reference-screen" aria-label={item.alt}>
      <img src={item.src} alt={item.alt} draggable="false" />
      {children}
    </section>
  );
}

function Hotspot({ rect, label, onClick }) {
  const [left, top, width, height] = rect;

  return (
    <button
      className="hotspot"
      aria-label={label}
      onClick={onClick}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`
      }}
    />
  );
}

createRoot(document.getElementById('root')).render(<App />);
