import { useEffect } from 'react'
import reducer from './store'
import Container from '@/components/shared/Container'
import { injectReducer } from '@/store'
import AddButton from './components/AddButton'
import { getAgents, useAppDispatch, useAppSelector } from './store'
import NewDialog from './components/NewDialog'
import AgentListTable from './components/AgentListTable'
import AgentDeleteConfirmation from './components/AgentDeleteConfirmation'
import { Card } from '@/components/ui'

injectReducer('agentList', reducer)

const AgentList = () => {
    const dispatch = useAppDispatch()

    const agents = useAppSelector((state) => state.agentList.data.agents)

    useEffect(() => {
        fetchData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = () => {
        dispatch(getAgents())
    }

    return (
        <Container className="h-full">
            <div className="mb-4">
                <h3 className="mb-2">Agents</h3>
                <p>View & train your agents</p>
            </div>
            <Card bodyClass="h-full">
                <div className="flex justify-end mb-5">
                    {agents && agents.length < 1 && <AddButton />}
                    {/* <AddButton /> */}
                </div>
                <AgentListTable agents={agents} />
                <AgentDeleteConfirmation />
                <NewDialog />
            </Card>
        </Container>
    )
}

export default AgentList
