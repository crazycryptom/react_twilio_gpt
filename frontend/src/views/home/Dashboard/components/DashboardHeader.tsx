import DatePicker from '@/components/ui/DatePicker'
import {
    setStartDate,
    setEndDate,
    getDashboardData,
    useAppSelector,
} from '../store'
import { useAppDispatch } from '@/store'

import dayjs from 'dayjs'

const dateFormat = 'MMM DD, YYYY'

const { DatePickerRange } = DatePicker

const DashboardHeader = () => {
    const dispatch = useAppDispatch()

    const startDate = useAppSelector(
        (state) => state.Dashboard.data.startDate
    )
    const endDate = useAppSelector((state) => state.Dashboard.data.endDate)

    const handleDateChange = (value: [Date | null, Date | null]) => {
        dispatch(setStartDate(dayjs(value[0]).unix()))
        dispatch(setEndDate(dayjs(value[1]).unix()))
    }

    const onFilter = () => {
        dispatch(getDashboardData())
    }

    return (
        <div className="lg:flex items-center justify-between mb-4 gap-3">
            <div className="mb-4 lg:mb-0">
                <h3>Sales Overview</h3>
                <p>View your current sales & summary</p>
            </div>
        </div>
    )
}

export default DashboardHeader
