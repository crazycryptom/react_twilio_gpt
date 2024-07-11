import { useEffect, useState } from 'react'
import Loading from '@/components/shared/Loading'
import { motion } from 'framer-motion'
import { getTotalList, useAppDispatch, useAppSelector } from '../store'
import ChatLog from './ChatLog'
import ConversationReport from './ConversationReport'
import useQuery from '@/utils/hooks/useQuery'
import { Container } from '@/components/shared'
import Statistic from './Statistic'
import Categories from './Categories'
import ChatLogList from '../../OrderList/ChatLogList'

const DashboardBody = () => {
    const dispatch = useAppDispatch()
   
    const [isLoading, setIsLoading] = useState(false)
    const query = useQuery()
    const id = query.get('id')

    const totalList = useAppSelector((state) => state.Dashboard.data.totalList)
    const selectedChat = totalList.filter((list) => list._id === id)

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = () => {
        setIsLoading(true)
        dispatch(getTotalList())
        setIsLoading(false)
    }

    const chartData = {
        series: [
            {
                name: 'sale',
                data: [24, 33, 29, 36, 34, 45, 40, 47],
            },
            {
                name: 'profit',
                data: [20, 26, 23, 24, 22, 29, 27, 36],
            },
        ],
        categories: [
            'Januanry',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
        ],
    }
    
    return (
        <Container className="h-full">
            <div className="mb-4">
                <h3 className="mb-2">Chat Overview</h3>
                <p>View your agent chat logs & summary</p>
            </div>
            <Loading loading={isLoading}>
                <motion.div
                    transition={{ duration: 1, type: 'tween' }}
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                >
                    <Statistic />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                        <ConversationReport
                            data={chartData}
                            className="col-span-2"
                        />
                        <Categories />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4 h-full">
                        <ChatLogList className="col-span-2" />
                        <ChatLog messages={selectedChat[0]?.messages} />
                    </div>
                </motion.div>
            </Loading>
        </Container>
    )
}

export default DashboardBody
