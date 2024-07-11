import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE
} from '@/constants/navigation.constant'
import { ADMIN, USER } from '@/constants/roles.constant'
import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '',
        title: '',
        translateKey: 'nav.home',
        icon: '',
        type: NAV_ITEM_TYPE_TITLE,
        authority: [],
        subMenu: [
            {
                key: 'home.dashboard',
                path: `home/dashboard`,
                title: 'Dashboard',
                translateKey: 'nav.home.dashboard',
                icon: 'dashboard',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'home.project',
                path: '',
                title: 'Project',
                translateKey: 'nav.home.project',
                icon: 'project',
                type: NAV_ITEM_TYPE_COLLAPSE,
                authority: [ADMIN, USER],
                subMenu: [
                    {
                        key: 'project.call-setting',
                        path: `home/project/call-setting`,
                        title: 'Call settings',
                        translateKey: 'nav.home.project.call-setting',
                        icon: 'call',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    {
                        key: 'project.agent-list',
                        path: `home/project/agent-list`,
                        title: 'Agents',
                        translateKey: 'nav.home.project.agent-list',
                        icon: 'agent',
                        type: NAV_ITEM_TYPE_ITEM,
                        authority: [ADMIN, USER],
                        subMenu: [],
                    },
                    
                ],
            },
            {
                key: 'home.profile',
                path: 'home/profile',
                title: 'Profile',
                translateKey: 'nav.home.profile',
                icon: 'profile',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
            {
                key: 'home.payment',
                path: 'home/payment',
                title: 'Payment',
                translateKey: 'nav.home.payment',
                icon: 'payment',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [ADMIN, USER],
                subMenu: [],
            },
        ],
    },
    
   
]

export default navigationConfig
