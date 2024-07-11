import {
    HiOutlineDesktopComputer,
    HiOutlineHome,
    HiOutlineChartSquareBar,
    HiOutlinePhoneOutgoing,
    HiOutlineUserCircle,
    HiOutlineCurrencyDollar,
    HiOutlineChatAlt,
} from 'react-icons/hi'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <HiOutlineHome />,
    project: <HiOutlineChartSquareBar />,
    dashboard: <HiOutlineDesktopComputer />,
    call: <HiOutlinePhoneOutgoing />,
    agent: <HiOutlineChatAlt />,
    profile: <HiOutlineUserCircle />,
    payment: <HiOutlineCurrencyDollar  />,
}

export default navigationIcon
