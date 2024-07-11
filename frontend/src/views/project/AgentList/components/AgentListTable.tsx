import Table from '@/components/ui/Table'
import {
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineChat,
    HiOutlineBookOpen,
} from 'react-icons/hi'
import {
    AgentInformation,
    setSelectedAgent,
    toggleDeleteConfirmation,
 toggleNewDialog, useAppDispatch } from '../store'
import { useNavigate } from 'react-router-dom'
import { Tooltip } from '@/components/ui'

const { Tr, Th, Td, THead, TBody } = Table

export type TableDataProps = {
    agents: AgentInformation[]
}

const AgentListTable = ({ agents }: TableDataProps) => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const handleChat = (agentId: string) => {
        dispatch(toggleNewDialog(true))
        dispatch(setSelectedAgent(agentId))
    }

    const handleDelete = (agentId: string) => {
        dispatch(toggleDeleteConfirmation(true))
        dispatch(setSelectedAgent(agentId))
    }

    const handleTrainForm = (agentId: string) => {
        navigate(`/home/project/train-agent?id=${agentId}`)
    }

    const handleEditAgent = (i: number) => {
        navigate(`/home/project/agent-new?index=${i}`)
    }

    return (
        <div>
            <Table>
                <THead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Organization Name</Th>
                        <Th>Description</Th>
                        <Th>Action</Th>
                    </Tr>
                </THead>
                <TBody>
                    {agents && agents.length > 0 && (
                        <>
                            {agents.map((agent, i) => (
                                <Tr key={i}>
                                    <Td>{agent.name}</Td>
                                    <Td>{agent.organizationName}</Td>
                                    <Td>{agent.description}</Td>
                                    <Td>
                                        <div className="flex text-lg">
                                            <Tooltip title="Chat with agent">
                                                <span
                                                    className="cursor-pointer p-2 hover:text-cyan-500"
                                                    onClick={() =>
                                                        handleChat(agent._id)
                                                    }
                                                >
                                                    <HiOutlineChat />
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Train agent">
                                                <span
                                                    className="cursor-pointer p-2 hover:text-blue-500"
                                                    onClick={() =>
                                                        handleTrainForm(
                                                            agent._id,
                                                        )
                                                    }
                                                >
                                                    <HiOutlineBookOpen />
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Edit agent">
                                                <span
                                                    className="cursor-pointer p-2 hover:text-yellow-500"
                                                    onClick={() =>
                                                        handleEditAgent(i)
                                                    }
                                                >
                                                    <HiOutlinePencil />
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Delete agent">
                                                <span
                                                    className="cursor-pointer p-2 hover:text-red-500"
                                                    onClick={() =>
                                                        handleDelete(agent._id)
                                                    }
                                                >
                                                    <HiOutlineTrash />
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </>
                    )}
                </TBody>
            </Table>
        </div>
    )
}

export default AgentListTable
