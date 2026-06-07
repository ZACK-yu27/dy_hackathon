import detailCardRiskIcon from '../../assets/icons/figma-deep/detail-card-risk.svg'
import detailCardSightIcon from '../../assets/icons/figma-deep/detail-card-sight.svg'
import detailFoodIcon from '../../assets/icons/figma-deep/detail-lib-food.svg'
import detailHotelIcon from '../../assets/icons/figma-deep/detail-lib-hotel.svg'
import detailTransportIcon from '../../assets/icons/figma-deep/detail-lib-transport.svg'
import type { CanvasRouteNode, RouteItem, TravelModule } from './types'

export const ROUTE_STORAGE_KEY = 'travel-unpack-route-items'
export const CANVAS_NODES_STORAGE_KEY = 'travel-unpack-canvas-nodes'
export const CANVAS_TRANSFORM_STORAGE_KEY = 'travel-unpack-canvas-transform'
export const CUSTOM_MODULES_STORAGE_KEY = 'travel-unpack-custom-modules'
export const CANVAS_NODE_WIDTH = 214
export const CANVAS_NODE_HEIGHT = 126
export const CANVAS_NODE_GAP = 24

export const moduleTypeOrder = ['scenic', 'transport', 'food', 'hotel'] as const

export const moduleTypeLabels = {
  scenic: '景点',
  transport: '交通',
  food: '餐饮',
  hotel: '住宿',
} as const

export const moduleVisuals = {
  scenic: {
    icon: detailCardSightIcon,
    color: '#3488E5',
    tagColor: '#ECECE6',
  },
  transport: {
    icon: detailTransportIcon,
    color: '#49B3A0',
    tagColor: '#DFF3EE',
  },
  food: {
    icon: detailFoodIcon,
    color: '#73BA8B',
    tagColor: '#E7F0DA',
  },
  hotel: {
    icon: detailHotelIcon,
    color: '#8B909C',
    tagColor: '#EEF0F4',
  },
} as const

export const travelModules: TravelModule[] = [
  {
    id: 'bund-night',
    type: 'scenic',
    title: '外滩夜景',
    subtitle: '经典拍照点',
    time: '08:30-09:30',
    tag: '景点',
    icon: detailCardSightIcon,
    riskTags: ['晚高峰人多'],
    color: '#3488E5',
    tagColor: '#ECECE6',
  },
  {
    id: 'yuyuan',
    type: 'scenic',
    title: '豫园',
    subtitle: '园林与老街',
    time: '09:30-10:20',
    tag: '景点',
    icon: detailCardSightIcon,
    riskTags: ['节假日排队'],
    color: '#3488E5',
    tagColor: '#ECECE6',
  },
  {
    id: 'nanjing-road',
    type: 'scenic',
    title: '南京东路',
    subtitle: '步行街区',
    time: '10:20-11:00',
    tag: '景点',
    icon: detailCardSightIcon,
    riskTags: ['人流密集'],
    color: '#3488E5',
    tagColor: '#ECECE6',
  },
  {
    id: 'metro-line-2',
    type: 'transport',
    title: '地铁 2 号线',
    subtitle: '人民广场换乘',
    time: '09:30-10:00',
    tag: '交通',
    icon: detailTransportIcon,
    riskTags: ['换乘耗时'],
    color: '#49B3A0',
    tagColor: '#DFF3EE',
  },
  {
    id: 'bus-20',
    type: 'transport',
    title: '公交 20 路',
    subtitle: '地面慢行',
    time: '11:00-11:35',
    tag: '交通',
    icon: detailTransportIcon,
    riskTags: ['等车时间长'],
    color: '#49B3A0',
    tagColor: '#DFF3EE',
  },
  {
    id: 'local-snack',
    type: 'food',
    title: '本地小吃店',
    subtitle: '午餐候选',
    time: '10:00-11:00',
    tag: '餐饮',
    icon: detailFoodIcon,
    riskTags: ['饭点排队'],
    color: '#73BA8B',
    tagColor: '#E7F0DA',
  },
  {
    id: 'old-restaurant',
    type: 'food',
    title: '老字号餐馆',
    subtitle: '晚餐候选',
    time: '17:30-18:40',
    tag: '餐饮',
    icon: detailFoodIcon,
    riskTags: ['预约紧张'],
    color: '#73BA8B',
    tagColor: '#E7F0DA',
  },
  {
    id: 'bund-hotel',
    type: 'hotel',
    title: '外滩附近酒店',
    subtitle: '步行可达',
    time: '20:30 入住',
    tag: '住宿',
    icon: detailHotelIcon,
    riskTags: ['价格偏高'],
    color: '#8B909C',
    tagColor: '#EEF0F4',
  },
  {
    id: 'crowd-risk',
    type: 'risk',
    title: '晚高峰避雷',
    subtitle: '调整游览时间',
    time: '18:00 前避开',
    tag: '避雷',
    icon: detailCardRiskIcon,
    riskTags: ['中高风险'],
    color: '#E05A4E',
    tagColor: '#FFE7E0',
  },
]

export const defaultRouteItems: RouteItem[] = [
  { id: 'route-bund-night', moduleId: 'bund-night' },
  { id: 'route-metro-line-2', moduleId: 'metro-line-2' },
  { id: 'route-local-snack', moduleId: 'local-snack' },
]

export const defaultCanvasNodes: CanvasRouteNode[] = [
  { id: 'canvas-bund-night', moduleId: 'bund-night', x: 520, y: 360, order: 0 },
  { id: 'canvas-metro-line-2', moduleId: 'metro-line-2', x: 520, y: 510, order: 1 },
  { id: 'canvas-local-snack', moduleId: 'local-snack', x: 520, y: 660, order: 2 },
]
