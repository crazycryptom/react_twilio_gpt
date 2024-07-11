import Card from '@/components/ui/Card'
import { NumericFormat } from 'react-number-format'
import GrowShrinkTag from '@/components/shared/GrowShrinkTag'
import { getTotalList, useAppDispatch, useAppSelector } from '../store'
import dayjs from 'dayjs'
import { useEffect } from 'react'

type StatisticCardProps = {
    data?: {
        value: number
        growShrink: number
    }
    label: string
    valuePrefix?: string
}

type StatisticProps = {
    data?: {
        totalCustomers?: {
            value: number
            growShrink: number
        }
        totalMessages?: {
            value: number
            growShrink: number
        }
        purchases?: {
            value: number
            growShrink: number
        }
    }
}

const StatisticCard = ({
    data = { value: 0, growShrink: 0 },
    label,
    valuePrefix,
}: StatisticCardProps) => {
    return (
        <Card>
            <h6 className="font-semibold mb-4 text-sm">{label}</h6>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold">
                        <NumericFormat
                            thousandSeparator
                            displayType="text"
                            value={data.value}
                            prefix={valuePrefix}
                        />
                    </h3>
                </div>
                <GrowShrinkTag value={data.growShrink} suffix="%" />
            </div>
        </Card>
    )
}

const Statistic = ({ data = {} }: StatisticProps) => {
    const dispatch = useAppDispatch()

    const totalCustomers = useAppSelector(
        (state) => state.Dashboard.data.totalList.length,
    )

    const totalMessages = useAppSelector((state) => {
        const totalList = state.Dashboard.data.totalList
        const total = totalList.reduce((acc, list) => {
            return acc + list.messages.length
        }, 0)
        return total
    })

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <StatisticCard
                data={{ value: totalCustomers, growShrink: 10 }}
                label="Total Customers"
            />
            <StatisticCard
                data={{ value: totalMessages, growShrink: 10 }}
                label="Total Messages"
            />
        </div>
    )
}

export default Statistic
