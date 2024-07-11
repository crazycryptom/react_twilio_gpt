import reducer from './store'
import { injectReducer } from '@/store'
import OrdersTable from './components/OrdersTable'
import OrdersTableTools from './components/OrdersTableTools'
import OrderDeleteConfirmation from './components/OrderDeleteConfirmation'
import { Card } from '@/components/ui'

injectReducer('salesOrderList', reducer)

const ChatLogList = ({ className }: { className: string }) => {
    return (
        <Card  className={className} bodyClass="h-full">
            <div className="lg:flex items-center justify-between mb-4">
                <h4 className="mb-4 lg:mb-0">Chat List</h4>
                <OrdersTableTools />
            </div>
            <OrdersTable />
            <OrderDeleteConfirmation />
        </Card>
    )
}

export default ChatLogList
