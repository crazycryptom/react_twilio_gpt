import { Card } from '@/components/ui'
import { message } from './ConversationList'

const ChatLog = ({ messages }: { messages: message[] }) => {
    return (
        <Card className="overflow-auto max-h-[550px]">
            <h4>Chat Log</h4>
            <br />
            {messages?.map((message, i) => (
                <div key={i} className="mb-2">
                    <Card bodyClass='p-4 !important'>
                        <div className="mb-2 flex justify-end">
                            <div className="p-1 rounded bg-indigo-600 max-w-[80%] text-slate-100">
                                Customer: {message.in}
                            </div>
                        </div>
                        <div className="flex justify-start">
                            <div className="p-1 rounded bg-cyan-300 max-w-[80%] text-black">
                                Agent: {message.out}
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </Card>
    )
}

export default ChatLog
